export default function AdminUsers() {
return (
<div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
<h2 className="text-3xl font-bold mb-6">Manage Users</h2>
<div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
<table className="w-full border-collapse text-left">
<thead>
<tr className="border-b dark:border-gray-700">
<th className="p-3">Username</th>
<th className="p-3">Email</th>
<th className="p-3">Status</th>
<th className="p-3">Actions</th>
</tr>
</thead>
<tbody>
{[{ user: "Arun", email: "arun@mail.com", status: "Active" }, { user: "Sneha", email: "sneha@mail.com", status: "Banned" }].map((row, i) => (
<tr key={i} className="border-b dark:border-gray-700">
<td className="p-3">{row.user}</td>
<td className="p-3">{row.email}</td>
<td className="p-3">{row.status}</td>
<td className="p-3 flex gap-3">
<button className="px-3 py-1 bg-blue-500 text-white rounded">View</button>
<button className="px-3 py-1 bg-red-500 text-white rounded">Block</button>
</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
);
}