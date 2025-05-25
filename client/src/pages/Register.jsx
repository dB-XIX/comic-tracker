import { useState } from 'react';
import './Register.css';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const sanitize = str => str.replace(/[<>"'`;]/g, '');

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const cleanEmail = sanitize(email);
        const cleanPassword = sanitize(password);

        if (cleanPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (cleanPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': 'secure-token-placeholder' // for future CSRF protection
                },
                body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess('Registration successful. You can now log in.');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            } else {
                setError(data.msg || 'Registration failed');
            }
        } catch {
            setError('Server error. Please try again later.');
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-box">
                <h2 className="auth-title">Register</h2>
                {error && <p className="auth-error">{error}</p>}
                {success && <p className="auth-success">{success}</p>}
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
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="auth-btn">Register</button>
            </form>
        </div>
    );
}

export default Register;
