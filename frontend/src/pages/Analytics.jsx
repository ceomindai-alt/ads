import React, { useEffect, useState } from 'react';
import client from '../api/api';
import { useParams } from 'react-router-dom';

export default function Analytics(){
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(()=>{
    async function load(){
      const res = await client.get(`/links/analytics/${id}`);
      setData(res.data);
    }
    load();
  }, [id]);

  if(!data) return <div>Loading analytics…</div>;

  return (
    <div className="card p-4">

      <h2>Analytics</h2>
      <p>Total Clicks: {data.total}</p>

      <h3>Countries</h3>
      <pre>{JSON.stringify(data.countries, null, 2)}</pre>

      <h3>Devices</h3>
      <pre>{JSON.stringify(data.devices, null, 2)}</pre>

      <h3>Browsers</h3>
      <pre>{JSON.stringify(data.browsers, null, 2)}</pre>

      <h3>Recent Clicks</h3>
      <pre>{JSON.stringify(data.recent, null, 2)}</pre>

    </div>
  );
}
