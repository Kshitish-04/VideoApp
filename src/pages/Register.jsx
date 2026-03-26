import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, User, Play, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error: signUpError } = await signUp(form.email, form.password, form.username);
    if (signUpError) {
      toast.error(signUpError.message);
      setLoading(false);
      return;
    }

    // Auto-login immediately after signup (requires email confirmation disabled in Supabase)
    const { error: signInError } = await signIn(form.email, form.password);
    if (signInError) {
      // Fallback: Supabase may still require confirmation
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } else {
      toast.success('Welcome to LuminaStream! 🎉');
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

        <h2 className="auth-card__title">Create Account</h2>
        <p className="auth-card__sub">Join thousands of creators on LuminaStream.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-wrap">
              <User size={16} className="input-wrap__icon"/>
              <input
                id="reg-username"
                className="form-input input-wrap__input"
                type="text"
                placeholder="your_username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
                minLength={3}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrap">
              <Mail size={16} className="input-wrap__icon"/>
              <input
                id="reg-email"
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
                id="reg-password"
                className="form-input input-wrap__input"
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
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

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-wrap">
              <Lock size={16} className="input-wrap__icon"/>
              <input
                id="reg-confirm"
                className="form-input input-wrap__input"
                type={showPass ? 'text' : 'password'}
                placeholder="Repeat password"
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                required
              />
            </div>
          </div>

          <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
            {loading ? <span className="spinner"/> : 'Create Account'}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Sign in</Link>
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
