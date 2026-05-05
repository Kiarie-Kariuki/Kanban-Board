import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from './Components/UserContext';
import Navbar from './Components/Navbar';
import SignUp from './Components/Sign-up/SignUp';
import SignIn from './Components/sign-in/SignIn';
import CustomBoard from './Components/CustomBoard';
import Profile from './Components/Profile';
import Students from './Components/Students';
import StudentProfile from './Components/StudentProfile';
import AppTheme from './Components/shared-theme/AppTheme';

function App() {
  return (
    <AppTheme>
      <UserProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/board" element={<CustomBoard />} />
              <Route path="/students" element={<Students />} />
              <Route path="/students/:id" element={<StudentProfile />} />
            </Routes>
          </Router>
      </UserProvider>
    </AppTheme>
  );
}

export default App;
