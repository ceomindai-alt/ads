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
      await axiosInstance.post("/admin/cpm", [item]);
      alert(`${item.country} CPM updated`);
    } catch (e) {
      alert("Failed to save CPM");
    } finally {
      setSavingIndex(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold mb-6">CPM Settings</h2>

      {loading && <p>Loading...</p>}

      {!loading && cpms.length === 0 && (
        <p className="opacity-60">No CPM data found</p>
      )}

      {/* ✅ 3 COLUMN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cpms.map((item, i) => (
          <div
            key={item.countryCode}
            className="bg-white shadow rounded-xl p-5 border"
          >
            <label className="block font-semibold mb-2">
              {item.country}
            </label>

            <input
              type="number"
              step="0.01"
              value={item.cpm}
              onChange={(e) => updateValue(i, e.target.value)}
              className="w-full p-3 border rounded-lg mb-3"
            />

            <button
              disabled={savingIndex === i}
              onClick={() => saveSingle(i)}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold"
            >
              {savingIndex === i ? "Saving..." : "Save"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
