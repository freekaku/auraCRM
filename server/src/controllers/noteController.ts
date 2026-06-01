import { Response } from 'express';
import Note from '../models/Note';
import Activity from '../models/Activity';
import Lead from '../models/Lead';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

// Add Note
export const addNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { leadId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      res.status(400).json({ error: 'Invalid Lead ID structure.' });
      return;
    }

    if (!content || content.trim() === '') {
      res.status(400).json({ error: 'Note content cannot be empty.' });
      return;
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      res.status(404).json({ error: 'Lead not found.' });
      return;
    }

    const newNote = new Note({
      leadId: lead._id,
      content,
      author: req.user?._id,
    });

    await newNote.save();

    // Populate author before returning
    await newNote.populate('author', 'name email role');

    // Create activity timeline log
    const activity = new Activity({
      leadId: lead._id,
      type: 'Note Added',
      description: `A sales note was added by ${req.user?.name}.`,
      performedBy: req.user?._id,
    });
    await activity.save();

    res.status(201).json({
      message: 'Note added successfully.',
      note: newNote,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'An error occurred while adding note.' });
  }
};

// Edit Note
export const editNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      res.status(400).json({ error: 'Invalid Note ID structure.' });
      return;
    }

    if (!content || content.trim() === '') {
      res.status(400).json({ error: 'Note content cannot be empty.' });
      return;
    }

    const note = await Note.findById(noteId);
    if (!note) {
      res.status(404).json({ error: 'Note not found.' });
      return;
    }

    // Verify authorship
    if (note.author.toString() !== req.user?._id.toString()) {
      res.status(403).json({ error: 'Forbidden. You can only edit notes you created.' });
      return;
    }

    note.content = content;
    await note.save();
    await note.populate('author', 'name email role');

    // Add activity log
    const activity = new Activity({
      leadId: note.leadId,
      type: 'Note Edited',
      description: `A sales note was edited by ${req.user?.name}.`,
      performedBy: req.user?._id,
    });
    await activity.save();

    res.json({
      message: 'Note updated successfully.',
      note,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'An error occurred while updating note.' });
  }
};

// Delete Note
export const deleteNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      res.status(400).json({ error: 'Invalid Note ID structure.' });
      return;
    }

    const note = await Note.findById(noteId);
    if (!note) {
      res.status(404).json({ error: 'Note not found.' });
      return;
    }

    // Verify authorship
    if (note.author.toString() !== req.user?._id.toString()) {
      res.status(403).json({ error: 'Forbidden. You can only delete notes you created.' });
      return;
    }

    await Note.findByIdAndDelete(noteId);

    // Add activity log
    const activity = new Activity({
      leadId: note.leadId,
      type: 'Note Deleted',
      description: `A sales note was removed by ${req.user?.name}.`,
      performedBy: req.user?._id,
    });
    await activity.save();

    res.json({
      message: 'Note deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'An error occurred while deleting note.' });
  }
};

