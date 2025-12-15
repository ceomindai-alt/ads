export default function AdminCPM() {
return (
<div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
<h2 className="text-3xl font-bold mb-6">CPM Settings</h2>
<div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 max-w-xl">
{[{ country: "United States", cpm: 1500 }, { country: "United Kingdom", cpm: 1200 }, { country: "India", cpm: 150 }].map((item, i) => (
<div key={i} className="mb-6">
<label className="block mb-2 font-semibold">{item.country}</label>
<input
type="number"
defaultValue={item.cpm}
className="w-full p-3 rounded-lg border dark:border-gray-700 dark:bg-gray-700 dark:text-white"
/>
</div>
))}
<button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold">Save Changes</button>
</div>
</div>
);
}