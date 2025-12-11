import React, { useEffect, useState } from 'react';
import client from '../api/api';
import { Link } from 'react-router-dom';
import copy from "copy-to-clipboard";
import QRCode from "react-qr-code";

export default function LinksList(){
  const [links,setLinks] = useState([]);
  const [qr, setQR] = useState(null);

  useEffect(()=>{
    async function load(){
      const res = await client.get('/links/my');
      setLinks(res.data.links);
    }
    load();
  }, []);

  const API_BASE = import.meta.env.VITE_SITE_URL || "http://localhost:5000";

  async function deleteLink(id){
    if (!confirm("Delete this link?")) return;
    await client.delete(`/links/${id}`);
    setLinks(links.filter(x => x._id !== id));
  }

  return (
    <div>
      <h2>My Links</h2>
      <div className="card">

        <table className="table">
          <thead>
            <tr>
              <th>Short</th>
              <th>Clicks</th>
              <th>Earnings</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {links.map(l => (
              <tr key={l._id}>
                
                <td>
                  <a 
                    href={`${API_BASE}/r/${l.customAlias || l.shortCode}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {`${API_BASE}/r/${l.customAlias || l.shortCode}`}
                  </a>
                </td>

                <td>{l.clicks}</td>
                <td>₹{l.earnings}</td>

                <td style={{ display: "flex", gap: "8px" }}>

                  <button 
                    onClick={() => copy(`${API_BASE}/r/${l.customAlias || l.shortCode}`)}
                    className="btn-sm"
                  >
                    Copy
                  </button>

                  <button 
                    onClick={() => setQR(qr === l._id ? null : l._id)}
                    className="btn-sm"
                  >
                    QR
                  </button>

                  {qr === l._id && (
                    <QRCode 
                      value={`${API_BASE}/r/${l.customAlias || l.shortCode}`} 
                      size={100} 
                    />
                  )}

                  <Link to={`/analytics/${l._id}`} className="btn-sm">
                    Analytics
                  </Link>

                  <button 
                    className="btn-sm btn-danger"
                    onClick={() => deleteLink(l._id)}
                  >
                    Delete
                  </button>

                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
