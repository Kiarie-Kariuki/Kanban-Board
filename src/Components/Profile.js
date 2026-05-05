import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { Card, CardContent, Typography, Button } from '@mui/material';

const Profile = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <Card sx={{ minWidth: 300, maxWidth: 450 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Welcome, {user.fullname || 'User'}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Email: {user.email || 'Not available'}
          </Typography>
          <Typography variant="body2" gutterBottom>
            You are now signed in and can freely use the Kanban board.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate('/board')}
          >
            Go to Board
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
