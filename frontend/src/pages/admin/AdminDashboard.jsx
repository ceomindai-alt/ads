export default function AdminDashboard() {
return (
<div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
<h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>
<div className="grid md:grid-cols-4 gap-6 mb-10">
{[{ title: "Total Users", value: "4,520" }, { title: "Total Links", value: "18,200" }, { title: "Pending Withdrawals", value: "67" }, { title: "Clicks Today", value: "142,980" }].map((item, i) => (
<div key={i} className="p-6 bg-white dark:bg-gray-800 shadow rounded-xl text-center">
<h3 className="text-lg font-semibold mb-2">{item.title}</h3>
<p className="text-2xl font-bold">{item.value}</p>
</div>
))}
</div>
<div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 mb-10">
<h3 className="text-xl font-bold mb-4">Clicks Per Day</h3>
<div className="w-full h-64 flex items-center justify-center text-gray-400">Admin Clicks Graph (Recharts)</div>
</div>
</div>
);
}