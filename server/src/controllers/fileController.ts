import { Response } from 'express';
import File from '../models/File';
import Activity from '../models/Activity';
import Lead from '../models/Lead';
import { AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

// Upload File
export const uploadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { leadId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      res.status(400).json({ error: 'Invalid Lead ID structure.' });
      return;
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      res.status(404).json({ error: 'Lead not found.' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file provided. Supported types are PDF, DOCX, PNG, JPG.' });
      return;
    }

    // Determine type
    const ext = path.extname(req.file.originalname).toLowerCase();
    let fileType = 'Unknown';
    if (ext === '.pdf') fileType = 'PDF';
    else if (ext === '.docx') fileType = 'DOCX';
    else if (ext === '.png') fileType = 'PNG';
    else if (ext === '.jpg' || ext === '.jpeg') fileType = 'JPG';

    const newFile = new File({
      leadId: lead._id,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`, // Serves as the key/relative url
      fileType: fileType,
      fileSize: req.file.size,
      uploadedBy: req.user?._id,
    });

    await newFile.save();
    await newFile.populate('uploadedBy', 'name email role');

    // Create activity timeline log
    const activity = new Activity({
      leadId: lead._id,
      type: 'File Uploaded',
      description: `Document "${req.file.originalname}" (${fileType}) was uploaded by ${req.user?.name}.`,
      performedBy: req.user?._id,
    });
    await activity.save();

    res.status(201).json({
      message: 'File uploaded successfully.',
      file: newFile,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'An error occurred while uploading file.' });
  }
};

// Download File
export const downloadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      res.status(400).json({ error: 'Invalid File ID structure.' });
      return;
    }

    const fileRecord = await File.findById(fileId);
    if (!fileRecord) {
      res.status(404).json({ error: 'File record not found.' });
      return;
    }

    const fileNameOnDisk = path.basename(fileRecord.fileUrl);
    const absoluteFilePath = path.join(process.cwd(), 'uploads', fileNameOnDisk);

    if (!fs.existsSync(absoluteFilePath)) {
      res.status(404).json({ error: 'Physical file not found on server storage.' });
      return;
    }

    // Set header and download
    res.download(absoluteFilePath, fileRecord.fileName);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'An error occurred during file download.' });
  }
};

// Delete File
export const deleteFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      res.status(400).json({ error: 'Invalid File ID structure.' });
      return;
    }

    const fileRecord = await File.findById(fileId);
    if (!fileRecord) {
      res.status(404).json({ error: 'File record not found.' });
      return;
    }

    const fileNameOnDisk = path.basename(fileRecord.fileUrl);
    const absoluteFilePath = path.join(process.cwd(), 'uploads', fileNameOnDisk);

    // Physical delete if exists
    if (fs.existsSync(absoluteFilePath)) {
      fs.unlinkSync(absoluteFilePath);
    }

    await File.findByIdAndDelete(fileId);

    // Create activity timeline log
    const activity = new Activity({
      leadId: fileRecord.leadId,
      type: 'File Deleted',
      description: `Document "${fileRecord.fileName}" was deleted by ${req.user?.name}.`,
      performedBy: req.user?._id,
    });
    await activity.save();

    res.json({
      message: 'File deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'An error occurred while deleting file.' });
  }
};

