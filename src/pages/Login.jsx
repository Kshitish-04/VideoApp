import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, Play, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(form.email, form.password);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Welcome back!');
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-card__logo">
          <Play size={28} fill="white"/>
          <span>LuminaStream</span>
        </div>

        <h2 className="auth-card__title">Welcome Back</h2>
        <p className="auth-card__sub">Sign in to your account to continue.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrap">
              <Mail size={16} className="input-wrap__icon"/>
              <input
                id="login-email"
                className="form-input input-wrap__input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <Lock size={16} className="input-wrap__icon"/>
              <input
                id="login-password"
                className="form-input input-wrap__input"
                type={showPass ? 'text' : 'password'}
                placeholder="Your password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <button
                type="button"
                className="input-wrap__toggle"
                onClick={() => setShowPass(s => !s)}
              >
                {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
            {loading ? <span className="spinner"/> : 'Sign In'}
          </button>
        </form>

        <p className="auth-card__footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>

      {/* Background decoration */}
      <div className="auth-page__bg">
        <div className="auth-page__circle auth-page__circle--1"/>
        <div className="auth-page__circle auth-page__circle--2"/>
        <div className="auth-page__circle auth-page__circle--3"/>
      </div>
    </div>
  );
}
