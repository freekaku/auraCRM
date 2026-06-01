import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Grid,
  Divider,
  CircularProgress,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Avatar,
  Paper,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Timeline as TimelineIcon,
  Note as NoteIcon,
  Description as DocIcon,
  SmartToy as AIIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  CloudUpload as UploadIcon,
  GetApp as DownloadIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

interface LeadDetailModalProps {
  open: boolean;
  leadId: string | null;
  onClose: () => void;
}

interface Note {
  _id: string;
  content: string;
  author: { _id: string; name: string; role: string };
  createdAt: string;
}

interface Activity {
  _id: string;
  type: string;
  description: string;
  performedBy: { _id: string; name: string };
  createdAt: string;
}

interface File {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: { _id: string; name: string };
  createdAt: string;
}

interface LeadData {
  lead: {
    _id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    industry: string;
    country: string;
    source: string;
    status: string;
    expectedRevenue: number;
    owner: { name: string; email: string };
    createdAt: string;
  };
  notes: Note[];
  activities: Activity[];
  files: File[];
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = React.memo(({
  open,
  leadId,
  onClose,
}) => {
  const { showNotification } = useUIStore();
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);

  // Notes state
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');

  // AI analysis state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState<{ summary: string; email: { subject: string; body: string }; engine: string } | null>(null);

  // Fetch lead deep details
  const { data, isLoading, error } = useQuery<LeadData>({
    queryKey: ['leadDetails', leadId],
    queryFn: async () => {
      const res = await api.get(`/leads/${leadId}`);
      return res.data;
    },
    enabled: !!leadId && open,
  });

  // Note mutations
  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post(`/leads/${leadId}/notes`, { content });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadDetails', leadId] });
      setNoteContent('');
      showNotification('Note added successfully', 'success');
    },
    onError: (err: any) => {
      showNotification(err.response?.data?.error || 'Failed to add note', 'error');
    }
  });

  const editNoteMutation = useMutation({
    mutationFn: async ({ noteId, content }: { noteId: string; content: string }) => {
      const res = await api.put(`/leads/notes/${noteId}`, { content });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadDetails', leadId] });
      setEditingNoteId(null);
      setEditingNoteContent('');
      showNotification('Note updated successfully', 'success');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      await api.delete(`/leads/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadDetails', leadId] });
      showNotification('Note deleted', 'info');
    },
  });

  // File mutations
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await api.delete(`/leads/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadDetails', leadId] });
      showNotification('Document removed', 'info');
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      showNotification(`Uploading ${file.name}...`, 'info');
      await api.post(`/leads/${leadId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      queryClient.invalidateQueries({ queryKey: ['leadDetails', leadId] });
      showNotification('Document uploaded successfully', 'success');
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'File upload failed', 'error');
    }
  };

  const handleDownloadFile = (fileId: string, name: string) => {
    showNotification(`Downloading ${name}...`, 'info');
    // Direct trigger standard browser download endpoint
    window.open(`/api/leads/files/${fileId}/download`, '_blank');
  };

  // Fetch AI Insights
  const fetchAIInsights = async () => {
    setAiLoading(true);
    setAiData(null);
    try {
      const res = await api.get(`/leads/${leadId}/ai-summary`);
      setAiData(res.data);
      showNotification('AI Insights generated successfully!', 'success');
    } catch (err) {
      showNotification('Failed to generate AI Insights', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyEmail = () => {
    if (!aiData) return;
    const fullEmailText = `Subject: ${aiData.email.subject}\n\n${aiData.email.body}`;
    navigator.clipboard.writeText(fullEmailText);
    showNotification('Follow-up draft copied to clipboard!', 'success');
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      {isLoading ? (
        <Box sx={{ display: 'flex', py: 10, justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : error || !data ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" variant="h6">Failed to retrieve lead details.</Typography>
          <Button onClick={onClose} sx={{ mt: 2 }} variant="outlined">Close</Button>
        </Box>
      ) : (
        <>
          {/* Header */}
          <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E8EBF3' }}>
            <Box>
              <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#2B2D42' }}>
                {data.lead.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#7A7F9A' }}>
                Company: {data.lead.company} | Pipeline Status:{' '}
                <Chip label={data.lead.status} size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 'bold' }} />
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <Divider />

          {/* Navigation Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: '#E8EBF3', bgcolor: '#F7F8FC' }}>
            <Tabs value={activeTab} onChange={(_e, val) => setActiveTab(val)} variant="fullWidth" sx={{ '& .MuiTab-root': { color: '#7A7F9A', fontWeight: 500 }, '& .Mui-selected': { color: '#4F5DFF !important' }, '& .MuiTabs-indicator': { backgroundColor: '#4F5DFF' } }}>
              <Tab icon={<InfoIcon fontSize="small" />} iconPosition="start" label="Overview" />
              <Tab icon={<TimelineIcon fontSize="small" />} iconPosition="start" label="Activity" />
              <Tab icon={<NoteIcon fontSize="small" />} iconPosition="start" label={`Notes (${data.notes.length})`} />
              <Tab icon={<DocIcon fontSize="small" />} iconPosition="start" label={`Documents (${data.files.length})`} />
              <Tab icon={<AIIcon fontSize="small" />} iconPosition="start" label="AI Advisor" />
            </Tabs>
          </Box>

          <DialogContent sx={{ p: 3, minHeight: 380, maxHeight: 500 }}>
            {/* 1. OVERVIEW TAB */}
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Primary Information</Typography>
                    <Paper sx={{ p: 2, bgcolor: '#F7F8FC', border: '1px solid #E8EBF3' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Email Address</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.lead.email}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.lead.phone}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Industry Sector</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.lead.industry}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Country</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.lead.country}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Pipeline & Deal Information</Typography>
                    <Paper sx={{ p: 2, bgcolor: '#F7F8FC', border: '1px solid #E8EBF3' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Projected Deal Value</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                          ${data.lead.expectedRevenue.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Origin / Source</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.lead.source}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">CRM Account Owner</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.lead.owner?.name || 'Unassigned'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Date Added to CRM</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {new Date(data.lead.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* 2. ACTIVITY TIMELINE TAB */}
            {activeTab === 1 && (
              <Box sx={{ py: 1 }}>
                {data.activities.length === 0 ? (
                  <Typography color="text.secondary" align="center">No timeline records logged.</Typography>
                ) : (
                  <List sx={{ position: 'relative', pl: 3 }}>
                    {/* Vertical connector line style */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 20,
                        top: 24,
                        bottom: 24,
                        width: 2,
                        bgcolor: 'divider',
                        zIndex: 0,
                      }}
                    />
                    {data.activities.map((activity, index) => (
                      <ListItem
                        key={activity._id}
                        sx={{
                          pl: 3,
                          pb: index === data.activities.length - 1 ? 0 : 3.5,
                          alignItems: 'flex-start',
                          zIndex: 1,
                        }}
                      >
                        {/* Dot indicator */}
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 11,
                            top: 4,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            bgcolor: 'background.paper',
                            border: '3px solid',
                            borderColor: activity.type.includes('Won') ? 'success.main' : 'primary.main',
                            zIndex: 2,
                          }}
                        />
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {activity.type}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(activity.createdAt).toLocaleString()}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {activity.description} — by <strong>{activity.performedBy?.name || 'System'}</strong>
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}

            {/* 3. NOTES TAB */}
            {activeTab === 2 && (
              <Box>
                {/* Note creation input */}
                <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a sales call update, meeting note..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      if (!noteContent.trim()) return;
                      addNoteMutation.mutate(noteContent);
                    }}
                  >
                    Add
                  </Button>
                </Box>

                {/* List of notes */}
                {data.notes.length === 0 ? (
                  <Typography color="text.secondary" align="center" sx={{ py: 3 }}>No client notes found.</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {data.notes.map((note) => (
                        <Paper key={note._id} sx={{ p: 2, bgcolor: '#F7F8FC', border: '1px solid #E8EBF3' }}>
                        {editingNoteId === note._id ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              size="small"
                              value={editingNoteContent}
                              onChange={(e) => setEditingNoteContent(e.target.value)}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                              <Button size="small" color="inherit" onClick={() => setEditingNoteId(null)}>Cancel</Button>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => editNoteMutation.mutate({ noteId: note._id, content: editingNoteContent })}
                              >
                                Save
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 24, height: 24, fontSize: 11, bgcolor: '#4F5DFF' }}>{note.author?.name.charAt(0)}</Avatar>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2B2D42' }}>
                                  {note.author?.name || 'Representative'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ({new Date(note.createdAt).toLocaleString()})
                                </Typography>
                              </Box>
                              
                              {/* Only author can edit/delete */}
                              {note.author?._id === currentUser?.id && (
                                <Box>
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setEditingNoteId(note._id);
                                      setEditingNoteContent(note.content);
                                    }}
                                  >
                                    <EditIcon fontSize="inherit" />
                                  </IconButton>
                                  <IconButton size="small" color="error" onClick={() => deleteNoteMutation.mutate(note._id)}>
                                    <DeleteIcon fontSize="inherit" />
                                  </IconButton>
                                </Box>
                              )}
                            </Box>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                              {note.content}
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {/* 4. DOCUMENTS TAB */}
            {activeTab === 3 && (
              <Box>
                {/* Upload zone */}
                <Box
                  sx={{
                    border: '2px dashed #E8EBF3',
                    borderRadius: 3,
                    p: 4,
                    textAlign: 'center',
                    mb: 3,
                    bgcolor: '#F7F8FC',
                    '&:hover': {
                      borderColor: '#4F5DFF',
                      bgcolor: 'rgba(79, 93, 255, 0.02)',
                    },
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    hidden
                    onChange={handleFileUpload}
                    accept=".pdf,.docx,.png,.jpg,.jpeg"
                  />
                  <UploadIcon sx={{ fontSize: 40, color: '#7A7F9A', mb: 1.5 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2B2D42' }}>Click to Upload Document</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    Supported: PDF, DOCX, PNG, JPG (Max 10MB)
                  </Typography>
                </Box>

                {/* Uploaded List */}
                {data.files.length === 0 ? (
                  <Typography sx={{ color: '#7A7F9A', align: 'center' }}>No documents uploaded.</Typography>
                ) : (
                  <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {data.files.map((file) => (
                      <Paper
                        key={file._id}
                        sx={{
                          p: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          bgcolor: '#F7F8FC',
                          border: '1px solid #E8EBF3',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <DocIcon color="primary" />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{file.fileName}</Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Uploaded by: {file.uploadedBy?.name} | Size: {(file.fileSize / 1024).toFixed(1)} KB | Date:{' '}
                              {new Date(file.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <IconButton onClick={() => handleDownloadFile(file._id, file.fileName)} color="primary">
                            <DownloadIcon />
                          </IconButton>
                          <IconButton onClick={() => deleteFileMutation.mutate(file._id)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))}
                  </List>
                )}
              </Box>
            )}

            {/* 5. AI ASSISTANT TAB */}
            {activeTab === 4 && (
              <Box>
                {!aiData && !aiLoading && (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <AIIcon sx={{ fontSize: 60, color: '#4F5DFF', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, mb: 1, color: '#2B2D42' }}>
                      AuraCRM Sales Intelligence Engine
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#7A7F9A', maxWidth: 460, mx: 'auto', mb: 3 }}>
                      Synthesize entire client interactions, notes history, and status pipelines. Get a tactical executive summary and high-converting follow-up email drafts instantly.
                    </Typography>
                    <Button variant="contained" size="large" onClick={fetchAIInsights}>
                      Generate AI Tactical Analysis
                    </Button>
                  </Box>
                )}

                {aiLoading && (
                  <Box sx={{ py: 8, textAlign: 'center' }}>
                    <Typography variant="subtitle2" sx={{ color: '#4F5DFF', mb: 2, fontWeight: 'bold' }}>
                      ⚙️ Synthesizing notes, pipeline stats and context...
                    </Typography>
                    <LinearProgress sx={{ maxWidth: 300, mx: 'auto', borderRadius: 2, '& .MuiLinearProgress-bar': { backgroundColor: '#4F5DFF' }, backgroundColor: '#E8EBF3' }} />
                  </Box>
                )}

                {aiData && !aiLoading && (
                  <Grid container spacing={3}>
                    {/* Summary */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#2B2D42' }}>
                        AI Lead Synthesized Assessment ({aiData.engine})
                      </Typography>
                      <Paper sx={{ p: 2.5, minHeight: 320, overflow: 'auto', bgcolor: '#F7F8FC', border: '1px solid #E8EBF3' }}>
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: 'pre-wrap',
                            fontFamily: '"Inter", sans-serif',
                            '& h3, & h4': { fontFamily: '"Outfit", sans-serif', fontWeight: 700, mt: 1, mb: 1 },
                            '& ul': { pl: 2, my: 1 },
                          }}
                          component="div"
                        >
                          {/* Basic mock parsing for headers / list bullets in markdown format */}
                          {aiData.summary.split('\n').map((line, i) => {
                            if (line.startsWith('### ')) {
                              return <Typography key={i} variant="h6" sx={{ color: 'primary.light', mt: 2, mb: 1 }}>{line.replace('### ', '')}</Typography>;
                            }
                            if (line.startsWith('#### ')) {
                              return <Typography key={i} variant="subtitle2" sx={{ color: 'secondary.light', mt: 1.5, mb: 0.5, fontWeight: 'bold' }}>{line.replace('#### ', '')}</Typography>;
                            }
                            if (line.startsWith('- ') || line.startsWith('* ')) {
                              return <Typography key={i} variant="body2" sx={{ pl: 2, display: 'list-item' }}>{line.substring(2)}</Typography>;
                            }
                            if (line.match(/^\d+\./)) {
                              return <Typography key={i} variant="body2" sx={{ pl: 2, display: 'list-item', listStyleType: 'decimal' }}>{line.replace(/^\d+\.\s*/, '')}</Typography>;
                            }
                            return <Typography key={i} variant="body2" sx={{ mb: 1 }}>{line}</Typography>;
                          })}
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* Email */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2B2D42' }}>
                          Tailored Sales Outreach Draft
                        </Typography>
                        <Button size="small" startIcon={<CopyIcon />} onClick={handleCopyEmail}>
                          Copy Draft
                        </Button>
                      </Box>
                      <Paper sx={{ p: 2.5, minHeight: 320, bgcolor: '#F7F8FC', border: '1px solid #E8EBF3' }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" display="block">Subject:</Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5 }}>{aiData.email.subject}</Typography>
                        </Box>
                        <Divider sx={{ my: 1.5 }} />
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {aiData.email.body}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sx={{ textAlign: 'center' }}>
                      <Button variant="outlined" onClick={fetchAIInsights}>
                        Regenerate Assessment
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </Box>
            )}
          </DialogContent>

          <Divider />

          {/* Dialog Actions */}
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={onClose} variant="contained">Close</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
});

