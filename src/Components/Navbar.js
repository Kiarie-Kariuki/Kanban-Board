import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link , useNavigate} from 'react-router-dom';
import { useUser } from './UserContext';

const Navbar = () => {
  const { user, signOut } = useUser();

  const navigate = useNavigate();



  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Kanban Board
        </Typography>
        {user ? ( 
        <>
          <Typography variant="body1" style={{ marginRight: '20px' }}>
              Hello, {user.fullname}
            </Typography>
            <Button color="inherit" onClick={() => {
              signOut();
              navigate('/signin'); 
            }}>
              Sign Out
            </Button>
        </>
      ) : (
        <>
          <Button color="inherit" component={Link} to="/signup">
                Sign Up
          </Button>
          <Button color="inherit" style={{ marginRight: '80px' }} component={Link} to="/signin">
            Sign In
          </Button>
        </>
      )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;