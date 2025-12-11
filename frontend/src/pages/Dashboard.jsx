import React, { useEffect, useState } from "react";
import client from "../api/api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    async function load() {
      const res = await client.get("/links/my");
      setLinks(res.data.links);

      const me = await client.get("/auth/me");
      setBalance(me.data.walletBalance);
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl mb-3">Dashboard</h1>

      <div className="card p-4 mb-4">
        <div style={{ display: "flex", gap: 12 }}>
          <div className="card p-3" style={{ minWidth: 180 }}>
            <div>Total Links</div>
            <div className="text-xl">{links.length}</div>
          </div>

          <div className="card p-3" style={{ minWidth: 180 }}>
            <div>Wallet Balance</div>
            <div className="text-xl">₹{balance}</div>

            <Link
              to="/withdraw"
              className="btn mt-2"
              style={{ background: "#6A4BFF", color: "white", width: "100%" }}
            >
              Withdraw
            </Link>
          </div>

          <div className="card p-3" style={{ minWidth: 180 }}>
            <div>Create</div>
            <a className="btn" href="/create">
              New Link
            </a>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="mb-2">Recent Links</h3>

        {links.length === 0 ? (
          <div>No links yet</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Short</th>
                <th>Original</th>
                <th>Clicks</th>
                <th>Earnings</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l._id}>
                  <td>
                    <a href={`/r/${l.shortCode}`} target="_blank">
                      /r/{l.shortCode}
                    </a>
                  </td>
                  <td
                    style={{
                      maxWidth: 320,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {l.originalUrl}
                  </td>
                  <td>{l.clicks}</td>
                  <td>₹{l.earnings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
