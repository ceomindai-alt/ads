import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ token, setToken }) {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  };
  return (
    <nav className="card p-3 mb-4 flex items-center justify-between">
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <Link to="/dashboard" className="text-xl font-semibold" style={{color:'white'}}>LinkVerse</Link>
        <Link to="/create" className="text-sm" style={{color:'rgba(255,255,255,0.7)'}}>Create</Link>
        <Link to="/links" className="text-sm" style={{color:'rgba(255,255,255,0.7)'}}>My Links</Link>
      </div>
      <div>
        { token ? (
          <button className="btn" onClick={logout}>Logout</button>
        ) : (
          <>
            <Link to="/login" className="btn">Login</Link>
          </>
        )}
      </div>
    </nav>
  )
}
