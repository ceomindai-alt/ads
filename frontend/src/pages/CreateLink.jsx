import React, { useState } from 'react';
import client from '../api/api';

export default function CreateLink(){
  const [url,setUrl]=useState('');
  const [alias,setAlias]=useState('');
  const [adType,setAdType]=useState('banner');
  const [msg,setMsg]=useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try{
      const res = await client.post('/links/create', { 
        originalUrl: url, 
        customAlias: alias || null, 
        adType 
      });

      setMsg({type:'success', text: 'Link created: /r/' + res.data.link.shortCode});
    }catch(e){
      setMsg({type:'error', text: e.response?.data?.message || 'Failed'});
    }
  };

  return (
    <div className="card max-w-lg mx-auto">
      <h2>Create Short Link</h2>

      { msg && <div style={{color: msg.type==='error' ? '#ff6b6b':'#8cf7a6'}}>{msg.text}</div> }

      <form onSubmit={submit}>
        <label>Original URL</label>
        <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com" />

        <label>Custom alias (optional)</label>
        <input value={alias} onChange={e=>setAlias(e.target.value)} placeholder="my-link" />

        <label>Ad Type</label>
        <select value={adType} onChange={e=>setAdType(e.target.value)}>
          <option value="banner">Banner (Low revenue)</option>
          <option value="pop">Pop (Medium revenue)</option>
          <option value="interstitial">Interstitial (High revenue)</option>
          <option value="rewarded">Rewarded (Very high revenue)</option>
        </select>

        <button className="btn mt-3" type="submit">Create</button>
      </form>
    </div>
  );
}
