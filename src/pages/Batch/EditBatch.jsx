import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import useBatchStore from "../../stores/useBatchStore";
import Loading from "../Loading";

const EditBatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBatch, fetchBatchById, updateBatch, isLoading } =
    useBatchStore();

  const [formData, setFormData] = useState({
    name: "",
    weekday: "Monday",
    startTime: "",
    endTime: "",
    teacherEmail: "",
    mainClasses: "",
    students: "",
  });

  // Fetch the batch data when the component mounts
  useEffect(() => {
    fetchBatchById(id);
  }, [id, fetchBatchById]);

  // Pre-fill the form once the batch data is loaded
  useEffect(() => {
    if (currentBatch) {
      setFormData({
        name: currentBatch.name || "",
        weekday: currentBatch.weekday || "Monday",
        startTime: currentBatch.startTime || "",
        endTime: currentBatch.endTime || "",
        teacherEmail: currentBatch.teacherEmail || "",
        // Assuming populated arrays from the backend, map them back to comma-separated strings for the MVP form
        mainClasses:
          currentBatch.mainClasses
            ?.map((c) => (typeof c === "object" ? c._id : c))
            .join(", ") || "",
        students:
          currentBatch.students
            ?.map((s) => (typeof s === "object" ? s._id : s))
            .join(", ") || "",
      });
    }
  }, [currentBatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Formatting data to match the expected backend payload
    const payload = {
      ...formData,
      mainClasses: formData.mainClasses
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
      students: formData.students
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    };

    await updateBatch(id, payload, navigate);
  };

  if (isLoading && !currentBatch) return <Loading />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8 max-w-2xl"
    >
      <div className="p-8 rounded-3xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl border border-gray-200 dark:border-gray-700 shadow-2xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Edit Batch
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Batch Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="e.g. Morning Batch A"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weekday
              </label>
              <select
                name="weekday"
                value={formData.weekday}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teacher Email
              </label>
              <input
                type="email"
                name="teacherEmail"
                required
                value={formData.teacherEmail}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                required
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                required
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Hidden or advanced fields for raw array editing if needed, 
              though managing students is better done via the BatchDetails page */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Advanced IDs (Comma Separated)
            </h3>
            <div>
              <input
                type="text"
                name="mainClasses"
                value={formData.mainClasses}
                onChange={handleChange}
                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Main Class IDs..."
              />
            </div>
            <div>
              <input
                type="text"
                name="students"
                value={formData.students}
                onChange={handleChange}
                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Student IDs..."
              />
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full py-3.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98]"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditBatch;
