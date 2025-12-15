export default function AdminWithdrawals() {
return (
<div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
<h2 className="text-3xl font-bold mb-6">Withdrawal Requests</h2>
<div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
<table className="w-full border-collapse text-left">
<thead>
<tr className="border-b dark:border-gray-700">
<th className="p-3">User</th>
<th className="p-3">Amount</th>
<th className="p-3">Method</th>
<th className="p-3">Status</th>
<th className="p-3">Actions</th>
</tr>
</thead>
<tbody>
{[{ user: "Arun", amount: "₹500", method: "UPI", status: "Pending" }, { user: "Sneha", amount: "₹1200", method: "Bank", status: "Pending" }].map((row, i) => (
<tr key={i} className="border-b dark:border-gray-700">
<td className="p-3">{row.user}</td>
<td className="p-3">{row.amount}</td>
<td className="p-3">{row.method}</td>
<td className="p-3">{row.status}</td>
<td className="p-3 flex gap-3">
<button className="px-3 py-1 bg-green-500 text-white rounded">Approve</button>
<button className="px-3 py-1 bg-red-500 text-white rounded">Reject</button>
</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
);
}