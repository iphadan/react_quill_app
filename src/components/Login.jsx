import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:8100/api/pdfbox/auth/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to log in');
            }

            const data = await response.json();

            // Store token in local storage
            localStorage.setItem('token', data.token);

            alert('Login successful!');
            navigate('/'); // Redirect to the main page or dashboard
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
            <form onSubmit={handleLogin} style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2>Login</h2>

                {error && <div style={{ color: 'red' }}>{error}</div>}

                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                    />
                </div>

                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                    />
                </div>

                <button type="submit" style={{ padding: '0.5rem', backgroundColor: 'gold', color: 'black', border: 'none', cursor: 'pointer', fontWeight:'bold' }}>
                    Log In
                </button>
            </form>
        </div>
    );
}

export default Login;