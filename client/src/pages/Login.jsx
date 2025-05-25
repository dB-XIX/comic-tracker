import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const sanitize = str => str.replace(/[<>"'`;]/g, '');

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');

        const cleanEmail = sanitize(email);
        const cleanPassword = sanitize(password);

        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': 'secure-token-placeholder'
                },
                body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
            });

            const data = await res.json();
            if (res.ok && data.token) {
                localStorage.setItem('token', data.token);
                navigate('/dashboard');
            } else {
                setError(data.msg || 'Login failed');
            }
        } catch {
            setError('Server error. Please try again later.');
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-box">
                <h2 className="auth-title">Login</h2>
                {error && <p className="auth-error">{error}</p>}
                <div className="input-wrapper">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="auth-btn">Login</button>
                <div className="password-recovery">
                    <Link to="/forgot-password">Forgot Password?</Link>
                </div>
            </form>
        </div>
    );
}

export default Login;
