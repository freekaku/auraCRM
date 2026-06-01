import { Response } from 'express';
import Lead from '../models/Lead';
import Activity from '../models/Activity';
import Note from '../models/Note';
import File from '../models/File';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

// Create a Lead
export const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, company, email, phone, industry, country, source, status, expectedRevenue, ownerId } = req.body;

    if (!name || !company || !email || !phone || !industry || !country || !source) {
      res.status(400).json({ error: 'All primary lead fields are required.' });
      return;
    }

    const leadOwner = ownerId || req.user?._id;
    if (!leadOwner) {
      res.status(400).json({ error: 'Lead owner is required.' });
      return;
    }

    const newLead = new Lead({
      name,
      company,
      email,
      phone,
      industry,
      country,
      source,
      status: status || 'New',
      expectedRevenue: Number(expectedRevenue) || 0,
      owner: leadOwner,
    });

    await newLead.save();

    // Create activity log
    const newActivity = new Activity({
      leadId: newLead._id,
      type: 'Lead Created',
      description: `Lead for ${name} from ${company} was added to the pipeline.`,
      performedBy: req.user?._id,
    });
    await newActivity.save();

    res.status(201).json({
      message: 'Lead created successfully.',
      lead: newLead,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'An error occurred while creating lead.' });
  }
};

// List Leads with Filters, Search, Pagination, and Sorting
export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sort = '-createdAt',
      status,
      industry,
      source,
      owner,
      country,
      startDate,
      endDate,
    } = req.query;

    const queryConditions: any = {};

    // 1. Search across Name, Company, Email
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      queryConditions.$or = [
        { name: searchRegex },
        { company: searchRegex },
        { email: searchRegex },
      ];
    }

    // 2. Advanced Multi-Filters (work simultaneously)
    if (status) queryConditions.status = status;
    if (industry) queryConditions.industry = industry;
    if (source) queryConditions.source = source;
    if (owner) queryConditions.owner = new mongoose.Types.ObjectId(owner as string);
    if (country) queryConditions.country = country;

    // Date range filter
    if (startDate || endDate) {
      queryConditions.createdAt = {};
      if (startDate) queryConditions.createdAt.$gte = new Date(startDate as string);
      if (endDate) {
        // Set end of the specified day
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        queryConditions.createdAt.$lte = end;
      }
    }

    const skipIndex = (Number(page) - 1) * Number(limit);

    // Dynamic sort
    const leads = await Lead.find(queryConditions)
      .populate('owner', 'name email role')
      .sort(sort as string)
      .skip(skipIndex)
      .limit(Number(limit));

    const totalLeads = await Lead.countDocuments(queryConditions);

    // Get unique list of fields for advanced filters autocomplete/dropdowns on frontend
    const filterOptions = {
      statuses: await Lead.distinct('status'),
      industries: await Lead.distinct('industry'),
      sources: await Lead.distinct('source'),
      countries: await Lead.distinct('country'),
      owners: await User.find({}, 'name role'),
    };

    res.json({
      leads,
      pagination: {
        totalItems: totalLeads,
        totalPages: Math.ceil(totalLeads / Number(limit)),
        currentPage: Number(page),
        itemsPerPage: Number(limit),
      },
      filterOptions,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'An error occurred while fetching leads.' });
  }
};

// Get Single Lead Details with its timeline, files and notes
export const getLeadById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid Lead ID structure.' });
      return;
    }

    const lead = await Lead.findById(id).populate('owner', 'name email role');
    if (!lead) {
      res.status(404).json({ error: 'Lead not found.' });
      return;
    }

    // Get activities (chronological order)
    const activities = await Activity.find({ leadId: lead._id })
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 }); // Newest first for timeline presentation!

    // Get notes (chronological order)
    const notes = await Note.find({ leadId: lead._id })
      .populate('author', 'name email role')
      .sort({ createdAt: -1 });

    // Get files
    const files = await File.find({ leadId: lead._id })
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      lead,
      activities,
      notes,
      files,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'An error occurred while fetching lead details.' });
  }
};

// Update Lead
export const updateLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid Lead ID structure.' });
      return;
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      res.status(404).json({ error: 'Lead not found.' });
      return;
    }

    const oldStatus = lead.status;
    const oldOwner = lead.owner.toString();
    const oldRevenue = lead.expectedRevenue;

    // Update lead
    const updatedLead = await Lead.findByIdAndUpdate(id, updateData, { new: true })
      .populate('owner', 'name email role');

    if (!updatedLead) {
      res.status(404).json({ error: 'Lead not found after update.' });
      return;
    }

    // Detect interesting updates to create specialized activities
    const activitiesToSave = [];

    if (updateData.status && updateData.status !== oldStatus) {
      activitiesToSave.push(new Activity({
        leadId: lead._id,
        type: 'Status Changed',
        description: `Lead status updated from "${oldStatus}" to "${updateData.status}".`,
        performedBy: req.user?._id,
      }));
    }

    if (updateData.ownerId && updateData.ownerId !== oldOwner) {
      const newOwnerUser = await User.findById(updateData.ownerId);
      activitiesToSave.push(new Activity({
        leadId: lead._id,
        type: 'Owner Changed',
        description: `Owner assigned to ${newOwnerUser ? newOwnerUser.name : 'another representative'}.`,
        performedBy: req.user?._id,
      }));
    }

    // General update log if no specific one triggered
    if (activitiesToSave.length === 0) {
      activitiesToSave.push(new Activity({
        leadId: lead._id,
        type: 'Lead Updated',
        description: `Lead details were modified.`,
        performedBy: req.user?._id,
      }));
    }

    for (const activity of activitiesToSave) {
      await activity.save();
    }

    res.json({
      message: 'Lead updated successfully.',
      lead: updatedLead,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'An error occurred while updating lead.' });
  }
};

// Delete Lead (Cascades)
export const deleteLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid Lead ID structure.' });
      return;
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      res.status(404).json({ error: 'Lead not found.' });
      return;
    }

    // Cascade delete associated documents
    await Lead.findByIdAndDelete(id);
    await Activity.deleteMany({ leadId: id });
    await Note.deleteMany({ leadId: id });
    await File.deleteMany({ leadId: id });

    res.json({
      message: 'Lead and all associated notes, activities, and files were successfully deleted.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'An error occurred while deleting lead.' });
  }
};

// Fetch Dashboard KPI and Charts Metrics
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 1. KPI Counts
    const totalLeads = await Lead.countDocuments();
    const qualifiedLeads = await Lead.countDocuments({ status: 'Qualified' });
    const wonLeads = await Lead.countDocuments({ status: 'Won' });
    const lostLeads = await Lead.countDocuments({ status: 'Lost' });

    // 2. Expected Revenue (sum)
    const revenueSumResult = await Lead.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$expectedRevenue' } } },
    ]);
    const totalExpectedRevenue = revenueSumResult.length > 0 ? revenueSumResult[0].totalRevenue : 0;

    // 3. Leads by Industry
    const industryStats = await Lead.aggregate([
      { $group: { _id: '$industry', count: { $sum: 1 }, revenue: { $sum: '$expectedRevenue' } } },
      { $project: { industry: '$_id', count: 1, revenue: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    // 4. Leads by Status
    const statusStats = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$expectedRevenue' } } },
      { $project: { status: '$_id', count: 1, revenue: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    // 5. Recent Lead additions
    const recentLeads = await Lead.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      kpis: {
        totalLeads,
        qualifiedLeads,
        wonLeads,
        lostLeads,
        totalExpectedRevenue,
      },
      industryStats,
      statusStats,
      recentLeads,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'An error occurred while generating dashboard analysis.' });
  }
};

