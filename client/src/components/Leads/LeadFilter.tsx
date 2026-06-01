import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Divider,
} from '@mui/material';
import { FilterList as FilterIcon, RestartAlt as ResetIcon } from '@mui/icons-material';

interface FilterOptions {
  statuses: string[];
  industries: string[];
  sources: string[];
  countries: string[];
  owners: Array<{ _id: string; name: string }>;
}

interface LeadFilterProps {
  filters: {
    status: string;
    industry: string;
    source: string;
    owner: string;
    country: string;
    startDate: string;
    endDate: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  filterOptions?: FilterOptions;
  onReset: () => void;
}

export const LeadFilter: React.FC<LeadFilterProps> = React.memo(({
  filters,
  setFilters,
  filterOptions,
  onReset,
}) => {
  const handleChange = (field: string, value: any) => {
    setFilters((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Box sx={{ p: 3, border: '1px solid #E8EBF3', borderRadius: 3, bgcolor: '#FFFFFF', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <FilterIcon sx={{ color: '#4F5DFF' }} />
        <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, color: '#2B2D42' }}>
          Advanced CRM Pipeline Filters
        </Typography>
      </Box>
      <Divider sx={{ mb: 3, borderColor: '#E8EBF3' }} />

      <Grid container spacing={2}>
        {/* Lead Status */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="filter-status-label">Lead Status</InputLabel>
            <Select
              labelId="filter-status-label"
              value={filters.status}
              label="Lead Status"
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <MenuItem value=""><em>All Statuses</em></MenuItem>
              {filterOptions?.statuses.map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Industry */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="filter-industry-label">Industry</InputLabel>
            <Select
              labelId="filter-industry-label"
              value={filters.industry}
              label="Industry"
              onChange={(e) => handleChange('industry', e.target.value)}
            >
              <MenuItem value=""><em>All Industries</em></MenuItem>
              {filterOptions?.industries.map((ind) => (
                <MenuItem key={ind} value={ind}>{ind}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Country */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="filter-country-label">Country</InputLabel>
            <Select
              labelId="filter-country-label"
              value={filters.country}
              label="Country"
              onChange={(e) => handleChange('country', e.target.value)}
            >
              <MenuItem value=""><em>All Countries</em></MenuItem>
              {filterOptions?.countries.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Owner */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="filter-owner-label">Assigned Rep</InputLabel>
            <Select
              labelId="filter-owner-label"
              value={filters.owner}
              label="Assigned Rep"
              onChange={(e) => handleChange('owner', e.target.value)}
            >
              <MenuItem value=""><em>All Reps</em></MenuItem>
              {filterOptions?.owners.map((owner) => (
                <MenuItem key={owner._id} value={owner._id}>{owner.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Start Date */}
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Created Since"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />
        </Grid>

        {/* End Date */}
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Created Until"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
        </Grid>
      </Grid>

      {/* Action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<ResetIcon />}
          onClick={onReset}
          sx={{ fontWeight: 600, border: '1px solid #E8EBF3', color: '#7A7F9A' }}
        >
          Reset Filters
        </Button>
      </Box>
    </Box>
  );
});
