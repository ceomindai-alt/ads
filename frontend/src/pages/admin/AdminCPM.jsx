import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

export default function AdminCPM() {
  const [cpms, setCpms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    updated[i].cpm = Number(value);
    setCpms(updated);
  };

  /* SAVE TO DB */
  const saveChanges = async () => {
    setSaving(true);
    try {
      await axiosInstance.post("/admin/cpm", cpms);
      alert("CPM updated successfully");
    } catch (e) {
      alert("Failed to save CPM");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold mb-6">CPM Settings</h2>

      <div className="bg-white shadow rounded-xl p-6 max-w-xl">
        {loading && <p>Loading...</p>}

        {!loading && cpms.length === 0 && (
          <p className="opacity-60">No CPM data found</p>
        )}

        {cpms.map((item, i) => (
          <div key={item.countryCode} className="mb-5">
            <label className="block font-semibold mb-1">
              {item.country}
            </label>
            <input
              type="number"
              step="0.01"
              value={item.cpm}
              onChange={(e) => updateValue(i, e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>
        ))}

        {cpms.length > 0 && (
          <button
            disabled={saving}
            onClick={saveChanges}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>
    </div>
  );
}
