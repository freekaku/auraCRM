import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Stars as WonIcon,
  Cancel as LostIcon,
  MonetizationOn as RevenueIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface DashboardData {
  kpis: {
    totalLeads: number;
    qualifiedLeads: number;
    wonLeads: number;
    lostLeads: number;
    totalExpectedRevenue: number;
  };
  industryStats: Array<{ industry: string; count: number; revenue: number }>;
  statusStats: Array<{ status: string; count: number; revenue: number }>;
  recentLeads: Array<{
    _id: string;
    name: string;
    company: string;
    status: string;
    expectedRevenue: number;
    createdAt: string;
  }>;
}

const COLORS = ['#4F5DFF', '#56D4B4', '#7C8CFF', '#A8F0D8', '#3A4ADB', '#3BB896'];

const STATUS_COLORS: Record<string, string> = {
  New: '#4F5DFF',
  Contacted: '#56D4B4',
  Qualified: '#7C8CFF',
  Proposal: '#A8F0D8',
  Won: '#22C55E',
  Lost: '#EF4444',
};

export const Dashboard: React.FC = React.memo(() => {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/leads/stats');
      return res.data;
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, py: 8 }}>
        <CircularProgress sx={{ color: '#4F5DFF' }} />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: '#EF4444' }}>
          Failed to load dashboard insights. Please verify database connection.
        </Typography>
      </Box>
    );
  }

  const { kpis, industryStats, statusStats, recentLeads } = data;

  const kpiCards = [
    {
      title: 'Total Leads',
      value: kpis.totalLeads,
      icon: <PeopleIcon />,
      gradient: 'linear-gradient(135deg, #4F5DFF 0%, #3A4ADB 100%)',
      bgLight: 'rgba(79, 93, 255, 0.06)',
    },
    {
      title: 'Qualified Leads',
      value: kpis.qualifiedLeads,
      icon: <CheckCircleIcon />,
      gradient: 'linear-gradient(135deg, #7C8CFF 0%, #4F5DFF 100%)',
      bgLight: 'rgba(124, 140, 255, 0.06)',
    },
    {
      title: 'Deals Won',
      value: kpis.wonLeads,
      icon: <WonIcon />,
      gradient: 'linear-gradient(135deg, #56D4B4 0%, #3BB896 100%)',
      bgLight: 'rgba(86, 212, 180, 0.06)',
    },
    {
      title: 'Deals Lost',
      value: kpis.lostLeads,
      icon: <LostIcon />,
      gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      bgLight: 'rgba(239, 68, 68, 0.06)',
    },
    {
      title: 'Expected Value',
      value: `$${kpis.totalExpectedRevenue.toLocaleString()}`,
      icon: <RevenueIcon />,
      gradient: 'linear-gradient(135deg, #56D4B4 0%, #4F5DFF 100%)',
      bgLight: 'rgba(86, 212, 180, 0.06)',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'primary';
      case 'Contacted': return 'secondary';
      case 'Qualified': return 'primary';
      case 'Proposal': return 'secondary';
      case 'Won': return 'success';
      default: return 'error';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, mb: 1, color: '#2B2D42' }}>
          AuraCRM Workspace Analytics
        </Typography>
        <Typography variant="body2" sx={{ color: '#7A7F9A' }}>
          Track sales execution performance, pipeline distribution, and deal value aggregates.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiCards.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Card
              sx={{
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(79, 93, 255, 0.1)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: kpi.gradient,
                  opacity: 0.08,
                  zIndex: 0,
                }}
              />
              <CardContent sx={{ zIndex: 1, position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#7A7F9A' }}>
                    {kpi.title}
                  </Typography>
                  <Avatar
                    sx={{
                      background: kpi.gradient,
                      width: 40,
                      height: 40,
                      boxShadow: `0 4px 12px rgba(79, 93, 255, 0.15)`,
                    }}
                  >
                    {kpi.icon}
                  </Avatar>
                </Box>
                <Typography variant="h4" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: '#2B2D42' }}>
                  {kpi.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3, height: 380, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, mb: 3, color: '#2B2D42' }}>
              Expected Revenue by Industry
            </Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              {industryStats.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography sx={{ color: '#7A7F9A' }}>No industry data logged yet.</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={industryStats} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
                    <XAxis dataKey="industry" tick={{ fill: '#7A7F9A', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#7A7F9A', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <ChartTooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E8EBF3',
                        borderRadius: 8,
                        color: '#2B2D42',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      }}
                    />
                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]} name="Expected Revenue ($)">
                      {industryStats.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, height: 380, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, mb: 1, color: '#2B2D42' }}>
              Leads by Status Pipeline
            </Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {statusStats.length === 0 ? (
                <Typography sx={{ color: '#7A7F9A' }}>No pipeline data logged yet.</Typography>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="status"
                    >
                      {statusStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E8EBF3',
                        borderRadius: 8,
                        color: '#2B2D42',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12, color: '#7A7F9A' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, color: '#2B2D42' }}>
            Recently Added Leads
          </Typography>
          <Button
            variant="text"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/leads')}
            sx={{ fontWeight: 600, color: '#4F5DFF' }}
          >
            View Full Pipeline
          </Button>
        </Box>

        {recentLeads.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#7A7F9A' }}>No leads present in CRM pipeline.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Lead Name</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Expected Deal Value</TableCell>
                  <TableCell align="right">Date Added</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentLeads.map((lead) => (
                  <TableRow
                    key={lead._id}
                    hover
                    onClick={() => navigate(`/leads?activeLeadId=${lead._id}`)}
                    sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: '#2B2D42' }}>{lead.name}</TableCell>
                    <TableCell sx={{ color: '#2B2D42' }}>{lead.company}</TableCell>
                    <TableCell>
                      <Chip
                        label={lead.status}
                        color={getStatusColor(lead.status)}
                        size="small"
                        sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#2B2D42' }}>
                      ${lead.expectedRevenue.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#7A7F9A' }}>
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
});
