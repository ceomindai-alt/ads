export default function AdminLinks() {
return (
<div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
<h2 className="text-3xl font-bold mb-6">Manage Links</h2>
<div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
<table className="w-full border-collapse text-left">
<thead>
<tr className="border-b dark:border-gray-700">
<th className="p-3">Short Link</th>
<th className="p-3">Long URL</th>
<th className="p-3">Clicks</th>
<th className="p-3">Actions</th>
</tr>
</thead>
<tbody>
{[{ short: "lp.in/a1b2", long: "https://youtube.com/...", clicks: 1200 }, { short: "lp.in/c3d4", long: "https://google.com/...", clicks: 540 }].map((row, i) => (
<tr key={i} className="border-b dark:border-gray-700">
<td className="p-3">{row.short}</td>
<td className="p-3 truncate max-w-xs">{row.long}</td>
<td className="p-3">{row.clicks}</td>
<td className="p-3 flex gap-3">
<button className="px-3 py-1 bg-blue-500 text-white rounded">View</button>
<button className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
);
}