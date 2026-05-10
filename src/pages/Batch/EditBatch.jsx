import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import useBatchStore from "../../stores/useBatchStore";
import Loading from "../Loading";
import BackButton from "../../components/UI/Button";

const EditBatch = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const id = location.state?.batchId;

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

  useEffect(() => {
    if (id) {
      fetchBatchById(id);
    } else {
      navigate("/batches");
    }
  }, [id, fetchBatchById, navigate]);

  useEffect(() => {
    if (currentBatch) {
      setFormData({
        name: currentBatch.name || "",
        weekday: currentBatch.weekday || "Monday",
        startTime: currentBatch.startTime || "",
        endTime: currentBatch.endTime || "",
        teacherEmail: currentBatch.teacherEmail || "",
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

  if (!id || (isLoading && !currentBatch)) return <Loading />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8 max-w-2xl"
    >
      <div className="p-8 rounded-3xl bg-card/60 backdrop-blur-2xl border border-border shadow-2xl">
        <div className="pb-5">
          <BackButton />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-8">Edit Batch</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Batch Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
              placeholder="e.g. Morning Batch A"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Weekday
              </label>
              <select
                name="weekday"
                value={formData.weekday}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
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
              <label className="block text-sm font-medium text-foreground mb-2">
                Teacher Email
              </label>
              <input
                type="email"
                name="teacherEmail"
                required
                value={formData.teacherEmail}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                required
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                required
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
          </div>
          <div className="pt-6 flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full py-3.5 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-bold rounded-xl transition-all shadow-lg shadow-primary/30 active:scale-[0.98]"
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
