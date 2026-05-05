import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useBatchStore from "../../stores/useBatchStore";
import useAuthStore from "../../stores/useAuthStore";
import Loading from "../Loading";

const BatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentBatch,
    fetchBatchById,
    addStudentToBatch,
    deleteBatch,
    isLoading,
  } = useBatchStore();
  const { user } = useAuthStore();

  const [studentEmail, setStudentEmail] = useState("");
  const [mainClassId, setMainClassId] = useState("");

  useEffect(() => {
    fetchBatchById(id);
  }, [id, fetchBatchById]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!studentEmail || !mainClassId) return;
    await addStudentToBatch(id, { studentEmail, mainClassId });
    setStudentEmail("");
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      deleteBatch(id, navigate);
    }
  };

  if (isLoading || !currentBatch) return <Loading />;

  const isStaff = user?.role === "Admin" || user?.role === "Teacher";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8 max-w-5xl"
    >
      {/* Header Card */}
      <div className="p-8 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl border border-gray-200 dark:border-gray-700 shadow-xl mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
              {currentBatch.name}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
              Instructor: {currentBatch.teacherEmail}
            </p>
          </div>

          {user?.role === "Admin" && (
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/batches/edit/${id}`)}
                className="px-5 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Day</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {currentBatch.weekday}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Time
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {currentBatch.startTime} - {currentBatch.endTime}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Total Students
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {currentBatch.students?.length || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enrolled Students List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Enrolled Students
          </h2>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
            {currentBatch.students?.length > 0 ? (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {currentBatch.students.map((student) => (
                  <li
                    key={student._id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold">
                        {student.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {student.name || "Student"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-6 text-gray-500 dark:text-gray-400 text-center">
                No students enrolled yet.
              </p>
            )}
          </div>
        </div>

        {/* Admin/Teacher Control Panel */}
        {isStaff && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-50 to-white dark:from-gray-800 dark:to-gray-800/80 border border-indigo-100 dark:border-gray-700 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Add Student
              </h3>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Student Email
                  </label>
                  <input
                    type="email"
                    required
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="student@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Main Class ID
                  </label>
                  <input
                    type="text"
                    required
                    value={mainClassId}
                    onChange={(e) => setMainClassId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Enter Class ID..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md active:scale-95"
                >
                  Enroll Student
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BatchDetails;
