import React, { useState } from 'react';
import client from '../api/api';

export default function Login({ setToken }) {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [err,setErr]=useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try{
      const res = await client.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      window.location = '/dashboard';
    }catch(e){
      setErr(e.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container">
      <div className="card max-w-md mx-auto">
        <h2 className="text-2xl mb-2">Login</h2>
        { err && <div style={{color:'#ff6b6b'}}>{err}</div> }
        <form onSubmit={submit}>
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} />
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="btn mt-3" type="submit">Login</button>
        </form>
        <p className="mt-3">New? <a href="/register" style={{color:'#9aa4ff'}}>Register</a></p>
      </div>
    </div>
  );
}
