// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  FaDollarSign,
  FaMousePointer
} from 'react-icons/fa';
import CardStat from '../components/CardStat';
import Table from '../components/Table';
import LoadingSpinner from '../components/LoadingSpinner';
import axiosInstance from '../utils/axiosInstance';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

/* ================= UTIL ================= */
const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

const buildClicksPerDay = (links) => {
  const map = {};
  links.forEach((l) => {
    const day = new Date(l.createdAt).toISOString().split('T')[0];
    map[day] = (map[day] || 0) + (l.clicks || 0);
  });
  return map;
};

/* ================= COMPONENT ================= */
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [links, setLinks] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, linksRes] = await Promise.all([
          axiosInstance.get('/earnings'),
          axiosInstance.get('/user/links?limit=100')
        ]);

        setStats(statsRes.data || {});
        setLinks(linksRes.data.links || []);
      } catch (err) {
        console.error('Dashboard load failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const i = setInterval(fetchData, 30000);
    return () => clearInterval(i);
  }, []);

  /* ================= BUILD GRAPH ================= */
  useEffect(() => {
    if (!links.length) return;

    const days = getLast7Days();
    const clickMap = buildClicksPerDay(links);

    setChartData(
      days.map((d) => ({
        name: d,
        clicks: clickMap[d] || 0
      }))
    );
  }, [links]);

  if (loading) return <LoadingSpinner />;

  /* ================= TABLE ================= */
  const linkColumns = [
    {
      key: 'shortUrl',
      header: 'Short Link',
      render: (url) => (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 dark:text-purple-400 hover:underline"
        >
          {url}
        </a>
      )
    },
    {
      key: 'longUrl',
      header: 'Original URL',
      render: (url) => (
        <span className="text-sm truncate max-w-xs block">
          {url}
        </span>
      )
    },
    { key: 'clicks', header: 'Clicks' },
    {
      key: 'earnings',
      header: 'Earnings',
      render: (e) => `$${Number(e || 0).toFixed(4)}`
    },
    {
      key: 'createdAt',
      header: 'Created On',
      render: (d) => new Date(d).toLocaleDateString()
    }
  ];

  /* ================= UI ================= */
  return (
    <>
      {/* TITLE */}
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-purple-700">
        User Dashboard
      </h2>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <CardStat
          title="Total Earnings"
          value={`$${Number(stats?.totalEarnings || 0).toFixed(4)}`}
          icon={FaDollarSign}
          color="secondary"
        />

        <CardStat
          title="Wallet Balance"
          value={`$${Number(stats?.walletBalance || 0).toFixed(4)}`}
          icon={FaDollarSign}
          color="success"
        />

        <CardStat
          title="Total Clicks"
          value={stats?.totalClicks || 0}
          icon={FaMousePointer}
          color="danger"
        />
      </div>

      {/* GRAPH */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8 border border-gray-200 dark:border-gray-700 transition-colors">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Clicks Per Day (Last 7 Days)
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-gray-200 dark:text-gray-600"
            />
            <XAxis
              dataKey="name"
              stroke="currentColor"
              className="text-gray-600 dark:text-gray-200"
            />
            <YAxis
              allowDecimals={false}
              stroke="currentColor"
              className="text-gray-600 dark:text-gray-200"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                border: '1px solid #374151',
                color: '#fff'
              }}
              labelStyle={{ color: '#fff' }}
            />
            <Line
              type="monotone"
              dataKey="clicks"
              stroke="#7A5CFF"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* TABLE */}
      <Table
        title="Recent Shortened Links"
        columns={linkColumns}
        data={links.slice(0, 5)}
      />
    </>
  );
};

export default Dashboard;
