import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import axios from 'axios';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  LinearProgress,
  Paper,
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';

const packageOptions = [
  'All Packages',
  'Web Design Pro',
  'Basic Computing',
  'Cyber Security',
  'Advanced Excel',
];

const paymentStatusOptions = ['All Status', 'Paid', 'Partial', 'Unpaid'];
const sortOptions = ['Enrollment Date', 'Progress'];

const Students = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ packageType: 'All Packages', paymentStatus: 'All Status', sortBy: 'Enrollment Date' });
  const [form, setForm] = useState({ name: '', phone: '', start_date: '', end_date: '', package_type: 'Web Design Pro', program: 'Cloud Architecture Specialist', total_fee: 4500 });

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    fetchStudents();
  }, [user, navigate]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to load students.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students
      .filter((student) => {
        const matchesPackage = filters.packageType === 'All Packages' || student.package_type === filters.packageType;
        const matchesPayment = filters.paymentStatus === 'All Status' || student.payment_status === filters.paymentStatus;
        return matchesPackage && matchesPayment;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'Progress') {
          return b.progress - a.progress;
        }
        return new Date(b.start_date) - new Date(a.start_date);
      });
  }, [students, filters]);

  const handleAddStudent = async () => {
    if (!form.name || !form.phone || !form.start_date || !form.end_date) {
      setError('Please fill in all required student fields.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/students', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpen(false);
      setForm({ name: '', phone: '', start_date: '', end_date: '', package_type: 'Web Design Pro', program: 'Cloud Architecture Specialist', total_fee: 4500 });
      setError('');
      fetchStudents();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add student');
    }
  };

  const handleNavigateToProfile = (id) => {
    navigate(`/students/${id}`);
  };

  const totalActive = students.length;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Student Directory
          </Typography>
          <Typography sx={{ color: 'text.secondary', maxWidth: 650 }}>
            Manage and monitor active trainees, payment status, enrollment timelines, and learning progress.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ minWidth: 170, py: 1.5 }}
          onClick={() => setOpen(true)}
        >
          Enroll Student
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ borderRadius: 3, p: 3, bgcolor: 'background.paper' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Package Type</InputLabel>
                  <Select value={filters.packageType} label="Package Type" onChange={(e) => setFilters((prev) => ({ ...prev, packageType: e.target.value }))}>
                    {packageOptions.map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Payment Status</InputLabel>
                  <Select value={filters.paymentStatus} label="Payment Status" onChange={(e) => setFilters((prev) => ({ ...prev, paymentStatus: e.target.value }))}>
                    {paymentStatusOptions.map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select value={filters.sortBy} label="Sort By" onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}>
                    {sortOptions.map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 3, p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary' }}>
              Total Active
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>
              {totalActive}
            </Typography>
            <Typography sx={{ color: 'text.secondary', mt: 1 }}>
              {totalActive} enrolled students currently being tracked.
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ borderRadius: 3, p: 3, mb: 3, bgcolor: 'background.paper' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Details</TableCell>
                  <TableCell>Package & Track</TableCell>
                  <TableCell>Enrollment</TableCell>
                  <TableCell>Course Progress</TableCell>
                  <TableCell>Financials</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#667eea', width: 44, height: 44 }}> {student.name?.charAt(0) || 'S'} </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>{student.name}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>SID-{student.id.toString().padStart(4, '0')} • {student.phone}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>{student.package_type || 'Web Design Pro'}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{student.program || 'Cloud Architecture Specialist'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>{new Date(student.start_date).toLocaleDateString()}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Ends {new Date(student.end_date).toLocaleDateString()}</Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 190 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 700 }}>{student.progress}%</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{student.completed_courses}/{student.total_courses || 0}</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={student.progress} sx={{ mt: 1, height: 8, borderRadius: 5 }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip label={student.payment_status} size="small" color={student.payment_status === 'Paid' ? 'success' : student.payment_status === 'Unpaid' ? 'error' : 'warning'} />
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>${student.total_paid?.toFixed(2) || '0.00'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Button endIcon={<ArrowForwardIosIcon />} size="small" variant="contained" onClick={() => handleNavigateToProfile(student.id)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Enroll New Student</DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Student Name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Phone" fullWidth value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Start Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="End Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Package</InputLabel>
                <Select value={form.package_type} label="Package" onChange={(e) => setForm((prev) => ({ ...prev, package_type: e.target.value }))}>
                  {packageOptions.slice(1).map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Program" fullWidth value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField type="number" label="Total Fee" fullWidth value={form.total_fee} onChange={(e) => setForm({ ...form, total_fee: Number(e.target.value) })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddStudent}>Enroll</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Students;