import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography } from '@mui/material';
import api from '../../services/api';
import { LeadFilter } from './LeadFilter.tsx';
import { LeadTable } from './LeadTable.tsx';
import { LeadFormModal } from './LeadFormModal.tsx';
import { LeadDetailModal } from './LeadDetailModal.tsx';
import { useUIStore } from '../../store/uiStore';
import { useSearchParams } from 'react-router-dom';

interface Lead {
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
  owner: { _id: string; name: string };
  createdAt: string;
}

const INITIAL_FILTERS = {
  status: '',
  industry: '',
  source: '',
  owner: '',
  country: '',
  startDate: '',
  endDate: '',
};

export const LeadsPage: React.FC = () => {
  const { showNotification } = useUIStore();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search, Sort, Filter, Page states
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal open states
  const [formOpen, setFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLeadId, setDetailLeadId] = useState<string | null>(null);

  // Synchronize router parameters for activeDetail views (e.g. from Dashboard click!)
  useEffect(() => {
    const activeId = searchParams.get('activeLeadId');
    if (activeId) {
      setDetailLeadId(activeId);
      setDetailOpen(true);
    }
  }, [searchParams]);

  // Fetch paginated leads list
  const { data } = useQuery({
    queryKey: ['leads', page, rowsPerPage, search, sort, filters],
    queryFn: async () => {
      const params = {
        page: page + 1, // backend is 1-indexed!
        limit: rowsPerPage,
        search,
        sort,
        ...filters,
      };
      const res = await api.get('/leads', { params });
      return res.data;
    },
  });

  // Create/Update mutations
  const saveLeadMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (selectedLead) {
        return api.put(`/leads/${selectedLead._id}`, formData);
      } else {
        return api.post('/leads', formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setFormOpen(false);
      setSelectedLead(null);
      showNotification(
        selectedLead ? 'Lead updated successfully' : 'Lead created successfully',
        'success'
      );
    },
    onError: (err: any) => {
      showNotification(err.response?.data?.error || 'Failed to save lead', 'error');
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      showNotification('Lead deleted successfully', 'success');
    },
    onError: () => {
      showNotification('Failed to delete lead', 'error');
    },
  });

  const handleResetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setPage(0);
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    setSelectedLead(null);
    setFormOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setFormOpen(true);
  }, []);

  const handleViewLeadDetails = useCallback((id: string) => {
    setDetailLeadId(id);
    setDetailOpen(true);
    // Keep URL parameter in sync
    setSearchParams({ activeLeadId: id });
  }, [setSearchParams]);

  const handleCloseDetailModal = useCallback(() => {
    setDetailOpen(false);
    setDetailLeadId(null);
    // Remove query parameter
    searchParams.delete('activeLeadId');
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  const handleDeleteLead = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this lead? This will erase notes, documents and histories.')) {
      deleteLeadMutation.mutate(id);
    }
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Page Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, mb: 1, color: '#2B2D42' }}>
          CRM Leads Pipeline
        </Typography>
        <Typography variant="body2" sx={{ color: '#7A7F9A' }}>
          Track sales execution pipelines, update stages, add notes, upload proposals, and use AI support.
        </Typography>
      </Box>

      {/* Dynamic Filters */}
      <LeadFilter
        filters={filters}
        setFilters={(f) => {
          setFilters(f);
          setPage(0); // reset page on filter!
        }}
        filterOptions={data?.filterOptions}
        onReset={handleResetFilters}
      />

      {/* Leads Listing */}
      <LeadTable
        leads={data?.leads || []}
        totalItems={data?.pagination?.totalItems || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setPage(0);
        }}
        search={search}
        onSearchChange={(s) => {
          setSearch(s);
          setPage(0);
        }}
        sort={sort}
        onSortChange={setSort}
        onView={handleViewLeadDetails}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteLead}
        onCreateClick={handleOpenCreateModal}
      />

      {/* Lead Create/Edit Dialog */}
      <LeadFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={(formData) => saveLeadMutation.mutate(formData)}
        lead={selectedLead}
        owners={data?.filterOptions?.owners}
      />

      {/* Lead Details Drawer Dialog */}
      <LeadDetailModal
        open={detailOpen}
        leadId={detailLeadId}
        onClose={handleCloseDetailModal}
      />
    </Box>
  );
};

