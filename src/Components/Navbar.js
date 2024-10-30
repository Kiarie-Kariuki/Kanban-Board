import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Kanban Board
        </Typography>
        <Button color="inherit" component={Link} to="/signup">
          Sign Up
        </Button>
        <Button color="inherit" style={{ marginRight: '80px' }} component={Link} to="/signin">
          Sign In
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;