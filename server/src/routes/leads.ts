import { Router } from 'express';
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  getDashboardStats,
} from '../controllers/leadController';
import { addNote, editNote, deleteNote } from '../controllers/noteController';
import { uploadFile, downloadFile, deleteFile } from '../controllers/fileController';
import { generateLeadAnalysis } from '../controllers/aiController';
import { authenticateJWT } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Apply JWT authentication globally to all CRM routes!
router.use(authenticateJWT);

// Dashboard stats route (MUST go before specific :id routes to prevent it matching 'stats' as an ID!)
router.get('/stats', getDashboardStats);

// Lead CRUD routes
router.post('/', createLead);
router.get('/', getLeads);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

// Notes routes
router.post('/:leadId/notes', addNote);
router.put('/notes/:noteId', editNote);
router.delete('/notes/:noteId', deleteNote);

// Files routes
router.post('/:leadId/files', upload.single('file'), uploadFile);
router.get('/files/:fileId/download', downloadFile);
router.delete('/files/:fileId', deleteFile);

// AI Intelligence route
router.get('/:id/ai-summary', generateLeadAnalysis);

export default router;

