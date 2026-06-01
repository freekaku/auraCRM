import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel,
  TableSortLabel,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ViewColumn as ColumnIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';

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

interface LeadTableProps {
  leads: Lead[];
  totalItems: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRows: number) => void;
  search: string;
  onSearchChange: (val: string) => void;
  sort: string;
  onSortChange: (newSort: string) => void;
  onView: (id: string) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onCreateClick: () => void;
}

interface ColumnConfig {
  id: keyof Lead | 'actions' | 'createdAt';
  label: string;
  visible: boolean;
  sortable: boolean;
}

export const LeadTable: React.FC<LeadTableProps> = React.memo(({
  leads,
  totalItems,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  search,
  onSearchChange,
  sort,
  onSortChange,
  onView,
  onEdit,
  onDelete,
  onCreateClick,
}) => {
  // Columns state
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { id: 'name', label: 'Lead Name', visible: true, sortable: true },
    { id: 'company', label: 'Company', visible: true, sortable: true },
    { id: 'email', label: 'Email Address', visible: true, sortable: true },
    { id: 'phone', label: 'Phone', visible: false, sortable: false },
    { id: 'industry', label: 'Industry', visible: true, sortable: true },
    { id: 'country', label: 'Country', visible: false, sortable: true },
    { id: 'expectedRevenue', label: 'Value ($)', visible: true, sortable: true },
    { id: 'source', label: 'Source', visible: false, sortable: true },
    { id: 'status', label: 'Status', visible: true, sortable: true },
    { id: 'owner', label: 'Owner', visible: true, sortable: false },
    { id: 'createdAt', label: 'Created Date', visible: true, sortable: true },
    { id: 'actions', label: 'Actions', visible: true, sortable: false },
  ]);

  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);

  const handleColumnToggleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setColumnMenuAnchor(event.currentTarget);
  };

  const handleColumnToggleClose = () => {
    setColumnMenuAnchor(null);
  };

  const toggleColumnVisibility = (columnId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId && col.id !== 'name' && col.id !== 'actions'
          ? { ...col, visible: !col.visible }
          : col
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'info';
      case 'Contacted': return 'warning';
      case 'Qualified': return 'secondary';
      case 'Proposal': return 'primary';
      case 'Won': return 'success';
      default: return 'error';
    }
  };

  const handleRequestSort = (property: string) => {
    const isAsc = sort === property;
    const nextSort = isAsc ? `-${property}` : property;
    onSortChange(nextSort);
  };

  const renderSortLabel = (col: ColumnConfig) => {
    if (!col.sortable) return col.label;

    const isActive = sort.replace('-', '') === col.id;
    const direction = sort.startsWith('-') ? 'desc' : 'asc';

    return (
      <TableSortLabel
        active={isActive}
        direction={isActive ? direction : 'asc'}
        onClick={() => handleRequestSort(col.id)}
      >
        {col.label}
      </TableSortLabel>
    );
  };

  return (
    <Box>
      {/* Search & Actions Bar */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Search Input */}
        <TextField
          size="small"
          placeholder="Search name, company, email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: '100%', sm: 300 } }}
        />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
          {/* Column Visibility Control */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<ColumnIcon />}
            onClick={handleColumnToggleClick}
            sx={{ fontWeight: 600, border: '1px solid #E8EBF3', color: '#7A7F9A' }}
          >
            Columns
          </Button>
          <Menu
            anchorEl={columnMenuAnchor}
            open={Boolean(columnMenuAnchor)}
            onClose={handleColumnToggleClose}
            PaperProps={{ sx: { p: 1, minWidth: 200 } }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 2, py: 0.5, fontWeight: 'bold' }}>
              Show/Hide Columns
            </Typography>
            {columns.map((col) => {
              if (col.id === 'name' || col.id === 'actions') return null;
              return (
                <MenuItem key={col.id} dense>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={col.visible}
                        onChange={() => toggleColumnVisibility(col.id)}
                      />
                    }
                    label={col.label}
                  />
                </MenuItem>
              );
            })}
          </Menu>

          {/* Create Lead Button */}
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={onCreateClick}
            sx={{ fontWeight: 600 }}
          >
            Add Lead
          </Button>
        </Box>
      </Box>

      {/* Leads Table Container */}
      <TableContainer sx={{ border: '1px solid #E8EBF3', borderRadius: 2, bgcolor: '#FFFFFF' }}>
        <Table>
          <TableHead>
            <TableRow>
              {columns
                .filter((col) => col.visible)
                .map((col) => (
                  <TableCell key={col.id}>{renderSortLabel(col)}</TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.filter((c) => c.visible).length} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No leads found in pipeline matching the query.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  {columns.map((col) => {
                    if (!col.visible) return null;

                    switch (col.id) {
                      case 'name':
                        return (
                          <TableCell key={col.id} sx={{ fontWeight: 600 }}>
                            {lead.name}
                          </TableCell>
                        );
                      case 'company':
                        return <TableCell key={col.id}>{lead.company}</TableCell>;
                      case 'email':
                        return <TableCell key={col.id}>{lead.email}</TableCell>;
                      case 'phone':
                        return <TableCell key={col.id}>{lead.phone}</TableCell>;
                      case 'industry':
                        return <TableCell key={col.id}>{lead.industry}</TableCell>;
                      case 'country':
                        return <TableCell key={col.id}>{lead.country}</TableCell>;
                      case 'expectedRevenue':
                        return (
                          <TableCell key={col.id} sx={{ fontWeight: 'bold' }}>
                            ${lead.expectedRevenue.toLocaleString()}
                          </TableCell>
                        );
                      case 'source':
                        return <TableCell key={col.id}>{lead.source}</TableCell>;
                      case 'status':
                        return (
                          <TableCell key={col.id}>
                            <Chip
                              label={lead.status}
                              color={getStatusColor(lead.status)}
                              size="small"
                              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                            />
                          </TableCell>
                        );
                      case 'owner':
                        return <TableCell key={col.id}>{lead.owner?.name || 'Unassigned'}</TableCell>;
                      case 'createdAt':
                        return (
                          <TableCell key={col.id} color="text.secondary">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </TableCell>
                        );
                      case 'actions':
                        return (
                          <TableCell key={col.id}>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="View CRM details">
                                <IconButton size="small" color="primary" onClick={() => onView(lead._id)}>
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit lead fields">
                                <IconButton size="small" onClick={() => onEdit(lead)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete lead and history">
                                <IconButton size="small" color="error" onClick={() => onDelete(lead._id)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        );
                      default:
                        return null;
                    }
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination component */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 20]}
        component="div"
        count={totalItems}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_e, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
      />
    </Box>
  );
});
