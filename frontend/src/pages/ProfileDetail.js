import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProfileDetail({ userId, onBack, onAccountDeleted, onUpdated }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    // Fetch user info: currently backend returns user in login only, so try GET via backend if available.
    // We'll rely on data passed from parent in this minimal implementation.
  }, [userId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      const res = await axios.put(`http://localhost:8000/update-user/${userId}`, form);
      setMsg('Profile updated');
      if (onUpdated) onUpdated(res.data);
    } catch (err) {
      setErr(err?.response?.data?.detail || 'Update failed');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete account? This cannot be undone.')) return;
    try {
      await axios.delete(`http://localhost:8000/delete-user/${userId}`);
      localStorage.removeItem('sd_user');
      if (onAccountDeleted) onAccountDeleted();
    } catch (err) {
      setErr(err?.response?.data?.detail || 'Delete failed');
    }
  };

  return (
    <div className="profile-card">
      <button className="back" onClick={onBack}>← Back</button>
      <h3>Profile</h3>
      {err && <div className="auth-error">{err}</div>}
      {msg && <div className="auth-success">{msg}</div>}

      <form onSubmit={handleUpdate} className="profile-form">
        <label>Full name</label>
        <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        <label>Email</label>
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label>Phone</label>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <div className="profile-actions">
          <button className="primary">Save</button>
          <button type="button" className="danger" onClick={handleDelete}>Delete account</button>
        </div>
      </form>
    </div>
  );
}
