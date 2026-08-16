import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import '../styles/Auth.css';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const success = await login(email, password);

        if (success) {
            navigate('/admin');
        } else {
            setError('Those credentials did not match. Check the address and password, then try again.');
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <SEO title="Admin Access" noindex={true} lang="en" />
            <div className="auth-card">
                <h1>Admin Access</h1>

                {error && (
                    <p className="auth-error" role="alert">{error}</p>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label htmlFor="admin-email">Email address</label>
                        <input
                            id="admin-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="auth-field">
                        <label htmlFor="admin-password">Password</label>
                        <input
                            id="admin-password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn auth-submit" disabled={loading}>
                        {loading ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
