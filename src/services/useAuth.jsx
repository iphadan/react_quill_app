import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApiCall } from './QuillService'; // Import the service

export const useAuth = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const login = async (email, password) => {
        const result = await loginApiCall(email, password);

        if (result.success) {
            alert('Login successful!');
            navigate('/'); // Redirect to the main page or dashboard
        } else {
            setError(result.message);
        }
    };

    return {
        login,
        error,
    };
};
