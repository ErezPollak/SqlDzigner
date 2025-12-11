import React from 'react';

export default function Home({ onOpenProfile, onLogout }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">SQL Dezigner</div>
        <div className="header-actions">
          <button className="ghost" onClick={onOpenProfile}>Profile</button>
          <button className="secondary" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <main className="home-main">
        <section className="hero">
          <h2>Welcome to SQL Dezigner</h2>
          <p>This is your workspace. Start by creating a new design or open an existing one.</p>
          <div className="placeholder-canvas">Your SQL designer will appear here.</div>
        </section>
      </main>

      <footer className="app-footer">© {new Date().getFullYear()} SQL Dezigner</footer>
    </div>
  );
}
