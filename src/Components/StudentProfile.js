import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import GetAppIcon from '@mui/icons-material/GetApp';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', payment_date: '', description: '' });
  const [certificateStatus, setCertificateStatus] = useState({ exists: false });
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingPayment, setSavingPayment] = useState(false);
  const [updatingCourse, setUpdatingCourse] = useState(null);
  const [pendingScoreUpdates, setPendingScoreUpdates] = useState({});
  const [error, setError] = useState(null);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    loadStudentProfile();
  }, [id, user]);

  const loadStudentProfile = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [studentRes, coursesRes, paymentsRes, classesRes, certRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/students/${id}`, { headers }),
        axios.get(`http://localhost:5000/api/students/${id}/courses`, { headers }),
        axios.get(`http://localhost:5000/api/students/${id}/payments`, { headers }),
        axios.get(`http://localhost:5000/api/students/${id}/classes`, { headers }),
        axios.get(`http://localhost:5000/api/students/${id}/certificate-status`, { headers }).catch(() => ({ data: { exists: false } })),
      ]);

      setStudent(studentRes.data);
      setEditData(studentRes.data);
      setCourses(coursesRes.data);
      setPayments(paymentsRes.data);
      setClasses(classesRes.data);
      setCertificateStatus(certRes.data);
      setDownloadUrl(certRes.data.downloadUrl || null);
    } catch (err) {
      console.error(err);
      setError('Failed to load student profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/students/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudent(response.data);
      setEditMode(false);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to save student updates.');
    }
  };

  const handleAddPayment = async () => {
    if (!paymentForm.amount || !paymentForm.payment_date) {
      setError('Please provide payment amount and date.');
      return;
    }

    setSavingPayment(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/students/${id}/payments`,
        paymentForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPaymentForm({ amount: '', payment_date: '', description: '' });
      await loadStudentProfile();
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Unable to save the payment.');
    } finally {
      setSavingPayment(false);
    }
  };

  const handleCourseStatusChange = async (courseId, status) => {
    setUpdatingCourse(courseId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/students/${id}/courses/${courseId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadStudentProfile();
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to update course status.');
    } finally {
      setUpdatingCourse(null);
    }
  };

  const handleScoreChange = (courseId, score) => {
    const numScore = score === '' ? null : parseInt(score, 10);
    setPendingScoreUpdates(prev => ({
      ...prev,
      [courseId]: numScore
    }));
  };

  const handleScoreUpdate = async (courseId) => {
    const newScore = pendingScoreUpdates[courseId];
    if (newScore === undefined) return;

    // Validate score
    if (newScore !== null && (newScore < 0 || newScore > 100)) {
      setError('Score must be between 0 and 100');
      return;
    }

    setUpdatingCourse(courseId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/students/${id}/courses/${courseId}`,
        { score: newScore },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Clear pending update
      setPendingScoreUpdates(prev => {
        const updated = { ...prev };
        delete updated[courseId];
        return updated;
      });
      await loadStudentProfile();
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to update course score.');
    } finally {
      setUpdatingCourse(null);
    }
  };

  const handleUnenroll = async (classId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/classes/${classId}/enroll/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadStudentProfile();
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Unable to unenroll from class.');
    }
  };

  const handleAwardCertificate = async () => {
    try {
      setGeneratingCertificate(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/generate-certificate',
        { student_id: Number(id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCertificateStatus({ exists: true, downloadUrl: response.data.downloadUrl, certificateId: response.data.certificateId });
      setDownloadUrl(response.data.downloadUrl);
      await loadStudentProfile();
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to generate certificate.');
    } finally {
      setGeneratingCertificate(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!student) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Student not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/students')} sx={{ mb: 2 }}>
        Back to Students
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{student.name}</Typography>
            <Typography color="textSecondary">Student ID: SID-{String(student.id).padStart(4, '0')}</Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={editMode ? <CancelIcon /> : <EditIcon />}
            onClick={() => setEditMode((prev) => !prev)}
          >
            {editMode ? 'Cancel' : 'Edit'}
          </Button>
        </Box>

        {editMode ? (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Package Type"
                value={editData.package_type}
                onChange={(e) => setEditData({ ...editData, package_type: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Program"
                value={editData.program}
                onChange={(e) => setEditData({ ...editData, program: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                type="date"
                value={editData.start_date}
                onChange={(e) => setEditData({ ...editData, start_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="End Date"
                type="date"
                value={editData.end_date}
                onChange={(e) => setEditData({ ...editData, end_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Phone</Typography>
              <Typography>{student.phone}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Package</Typography>
              <Typography>{student.package_type}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Program</Typography>
              <Typography>{student.program}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Enrollment</Typography>
              <Typography>{student.start_date} → {student.end_date}</Typography>
            </Grid>
          </Grid>
        )}
      </Paper>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Progress</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{student.progress}%</Typography>
              <LinearProgress variant="determinate" value={student.progress} sx={{ mt: 1 }} />
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                {student.completed_courses}/{student.total_courses} modules
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Payment Status</Typography>
              <Chip
                label={student.payment_status}
                color={student.payment_status === 'Paid' ? 'success' : student.payment_status === 'Partial' ? 'warning' : 'default'}
              />
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                Paid R{student.total_paid} / R{student.total_fee}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Balance</Typography>
              <Typography variant="h4" color={student.balance > 0 ? 'error' : 'success'}>
                R {student.balance}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Certificate</Typography>
              {certificateStatus.exists ? (
                <Box sx={{ mt: 1 }}>
                  <Chip label="Ready" color="success" size="small" />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<GetAppIcon />}
                    href={downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ mt: 1, display: 'block' }}
                  >
                    Download
                  </Button>
                  {certificateStatus.certificateId && (
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                      Certificate ID: {certificateStatus.certificateId}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAwardCertificate}
                  disabled={generatingCertificate || student.payment_status !== 'Paid'}
                  sx={{ mt: 1 }}
                >
                  {generatingCertificate ? <CircularProgress size={20} /> : 'Generate'}
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Courses & Progress</Typography>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f0f0f0' }}>
                  <TableRow>
                    <TableCell>Course</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={`${course.student_id}-${course.course_id}`}>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={course.status}
                          size="small"
                          color={course.status === 'completed' ? 'success' : course.status === 'in_progress' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{course.start_date || '-'}</TableCell>
                      <TableCell>{course.end_date || '-'}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={pendingScoreUpdates[course.course_id] !== undefined ? pendingScoreUpdates[course.course_id] || '' : course.score || ''}
                          onChange={(e) => handleScoreChange(course.course_id, e.target.value)}
                          onBlur={() => handleScoreUpdate(course.course_id)}
                          inputProps={{ min: 0, max: 100 }}
                          sx={{ width: 80 }}
                          disabled={updatingCourse === course.course_id}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={course.status}
                            label="Status"
                            onChange={(e) => handleCourseStatusChange(course.course_id, e.target.value)}
                            disabled={updatingCourse === course.course_id}
                          >
                            <MenuItem value="not_started">Not started</MenuItem>
                            <MenuItem value="in_progress">In progress</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Payment History</Typography>
            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAddPayment(); }} sx={{ display: 'grid', gap: 2, mb: 2 }}>
              <TextField
                label="Amount"
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Payment Date"
                type="date"
                value={paymentForm.payment_date}
                onChange={(e) => setPaymentForm((prev) => ({ ...prev, payment_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Description"
                value={paymentForm.description}
                onChange={(e) => setPaymentForm((prev) => ({ ...prev, description: e.target.value }))}
                fullWidth
              />
              <Button type="submit" variant="contained" disabled={savingPayment}>
                {savingPayment ? 'Saving...' : 'Add Payment'}
              </Button>
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ textAlign: 'center' }}>
                      No payments recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.payment_date}</TableCell>
                      <TableCell>{payment.description || 'Payment'}</TableCell>
                      <TableCell align="right">R {payment.amount}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Class Planner</Typography>
            {classes.length === 0 ? (
              <Typography variant="body2" color="textSecondary">No scheduled classes assigned.</Typography>
            ) : (
              classes.map((cls) => (
                <Paper key={cls.id} sx={{ mb: 2, p: 2, bgcolor: '#fafafa' }} elevation={0}>
                  <Typography sx={{ fontWeight: 700 }}>{cls.course_name}</Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                    {cls.type === 'makeup' ? 'Makeup' : 'Regular'} class
                  </Typography>
                  <Typography sx={{ mt: 1 }}>Date: {cls.date}</Typography>
                  <Typography>Time: {cls.start_time} ({cls.duration_hours}h)</Typography>
                  <Typography>Status: {cls.status}</Typography>
                  <Button
                    variant="text"
                    color="error"
                    size="small"
                    onClick={() => handleUnenroll(cls.id)}
                    sx={{ mt: 1 }}
                  >
                    Unenroll
                  </Button>
                </Paper>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentProfile;
