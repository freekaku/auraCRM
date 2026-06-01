import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

interface Lead {
  _id?: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  industry: string;
  country: string;
  source: string;
  status: string;
  expectedRevenue: number;
  owner?: { _id: string; name: string } | any;
}

interface LeadFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Lead>) => void;
  lead?: Lead | null;
  owners?: Array<{ _id: string; name: string }>;
}

const INITIAL_STATE = {
  name: '',
  company: '',
  email: '',
  phone: '',
  industry: '',
  country: '',
  source: '',
  status: 'New',
  expectedRevenue: 0,
  ownerId: '',
};

export const LeadFormModal: React.FC<LeadFormModalProps> = React.memo(({
  open,
  onClose,
  onSubmit,
  lead,
  owners,
}) => {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        industry: lead.industry,
        country: lead.country,
        source: lead.source,
        status: lead.status,
        expectedRevenue: lead.expectedRevenue,
        ownerId: lead.owner?._id || lead.owner || '',
      });
    } else {
      setFormData(INITIAL_STATE);
    }
    setErrors({});
  }, [lead, open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Lead Name is required';
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.industry.trim()) newErrors.industry = 'Industry is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.source.trim()) newErrors.source = 'Lead Source is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, pb: 1, color: '#2B2D42' }}>
        {lead ? 'Edit Sales Lead' : 'Create New Sales Lead'}
      </DialogTitle>
      
      <DialogContent dividers sx={{ py: 3 }}>
        <Grid container spacing={2}>
          {/* Lead Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Lead Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>

          {/* Company */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Company Name"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              error={!!errors.company}
              helperText={errors.company}
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>

          {/* Phone */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={!!errors.phone}
              helperText={errors.phone}
            />
          </Grid>

          {/* Industry */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Industry"
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              error={!!errors.industry}
              helperText={errors.industry}
              placeholder="e.g. Technology, Retail, Finance"
            />
          </Grid>

          {/* Country */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Country"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              error={!!errors.country}
              helperText={errors.country}
            />
          </Grid>

          {/* Source */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Lead Source"
              value={formData.source}
              onChange={(e) => handleChange('source', e.target.value)}
              error={!!errors.source}
              helperText={errors.source}
              placeholder="e.g. Website, Referral, Cold Outreach"
            />
          </Grid>

          {/* Expected Revenue */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Expected Deal Value ($)"
              type="number"
              value={formData.expectedRevenue}
              onChange={(e) => handleChange('expectedRevenue', Number(e.target.value))}
            />
          </Grid>

          {/* Status */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="lead-status-label">Lead Status</InputLabel>
              <Select
                labelId="lead-status-label"
                value={formData.status}
                label="Lead Status"
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <MenuItem value="New">New</MenuItem>
                <MenuItem value="Contacted">Contacted</MenuItem>
                <MenuItem value="Qualified">Qualified</MenuItem>
                <MenuItem value="Proposal">Proposal</MenuItem>
                <MenuItem value="Won">Won</MenuItem>
                <MenuItem value="Lost">Lost</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Owner Selection */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="lead-owner-label">Assigned Representative</InputLabel>
              <Select
                labelId="lead-owner-label"
                value={formData.ownerId}
                label="Assigned Representative"
                onChange={(e) => handleChange('ownerId', e.target.value)}
              >
                <MenuItem value=""><em>None (Assign to Me)</em></MenuItem>
                {owners?.map((owner) => (
                  <MenuItem key={owner._id} value={owner._id}>{owner.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {lead ? 'Save Changes' : 'Create Lead'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});
