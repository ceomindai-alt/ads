import React, { useState } from 'react';
import client from '../api/api';

export default function Register({ setToken }) {
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [ref,setRef]=useState('');
  const [err,setErr]=useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try{
      const res = await client.post('auth/register', { name, email, password, referralCode: ref });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      window.location = '/dashboard';
    }catch(e){
      setErr(e.response?.data?.message || 'Register failed');
    }
  };

  return (
    <div className="container">
      <div className="card max-w-md mx-auto">
        <h2 className="text-2xl mb-2">Register</h2>
        { err && <div style={{color:'#ff6b6b'}}>{err}</div> }
        <form onSubmit={submit}>
          <label>Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} />
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} />
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <label>Referral code (optional)</label>
          <input value={ref} onChange={e=>setRef(e.target.value)} />
          <button className="btn mt-3" type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}
