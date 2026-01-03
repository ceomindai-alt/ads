import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

export default function AdminCPM() {
  const [cpms, setCpms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState(null);

  /* LOAD CPM */
  const loadCPM = async () => {
    try {
      const res = await axiosInstance.get("/admin/cpm");
      setCpms(res.data);
    } catch (e) {
      console.error("CPM load error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCPM();
  }, []);

  /* UPDATE INPUT */
  const updateValue = (i, value) => {
    const updated = [...cpms];
    updated[i].cpm = value === "" ? "" : Number(value);
    setCpms(updated);
  };

  /* SAVE SINGLE CPM */
 const saveSingle = async (i) => {
  const item = cpms[i];

  if (item.cpm === "" || Number(item.cpm) <= 0) {
    alert("Enter a valid CPM value");
    return;
  }

  setSavingIndex(i);

  try {
    await axiosInstance.post("/admin/cpm", [
      {
        country: item.country,
        countryCode: item.countryCode,
        cpm: Number(item.cpm)
      }
    ]);

    alert(`${item.country} CPM updated`);
  } catch (e) {
    console.error("Failed to save CPM:", e.response?.data);
    alert("Failed to save CPM");
  } finally {
    setSavingIndex(null);
  }
};


  return (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 transition-colors">
    <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
      CPM Settings
    </h2>

    {loading && (
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    )}

    {!loading && cpms.length === 0 && (
      <p className="opacity-60 text-gray-600 dark:text-gray-400">
        No CPM data found
      </p>
    )}

    {/* ✅ 3 COLUMN GRID */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cpms.map((item, i) => (
        <div
          key={item.countryCode}
          className="bg-white dark:bg-gray-800 shadow rounded-xl p-5 border border-gray-200 dark:border-gray-700 transition-colors"
        >
          <label className="block font-semibold mb-2 text-gray-900 dark:text-gray-100">
            {item.country}
          </label>

          <input
            type="number"
            step="0.01"
            value={item.cpm}
            onChange={(e) => updateValue(i, e.target.value)}
            className="w-full p-3 border rounded-lg mb-3
                       bg-white dark:bg-gray-700
                       border-gray-300 dark:border-gray-600
                       text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            disabled={savingIndex === i}
            onClick={() => saveSingle(i)}
            className="w-full px-4 py-2
                       bg-gradient-to-r from-blue-500 to-purple-600
                       hover:from-blue-600 hover:to-purple-700
                       text-white rounded-lg font-semibold
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {savingIndex === i ? "Saving..." : "Save"}
          </button>
        </div>
      ))}
    </div>
  </div>
);
}