import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth'; 
export const signup = async (fullname, email, password) => {
    return await axios.post(`${API_URL}/signup`, { fullname, email, password });
};
