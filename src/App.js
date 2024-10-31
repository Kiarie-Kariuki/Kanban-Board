import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from './Components/UserContext';
import Navbar from './Components/Navbar';
import SignUp from './Components/Sign-up/SignUp';
import SignIn from './Components/sign-in/SignIn';
import CustomBoard from './Components/CustomBoard';

function App() {
  return (
    <UserProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/board" element={<CustomBoard />} />
          </Routes>
        </Router>
    </UserProvider>
  );
}

export default App;
