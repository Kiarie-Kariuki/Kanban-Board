import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Components/Navbar';
import SignUp from './Components/Sign-up/SignUp';
import SignIn from './Components/sign-in/SignIn';

function App() {
  return (
    <Router>
    <Navbar />
    <Routes>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
    </Routes>
  </Router>
  );
}

export default App;
