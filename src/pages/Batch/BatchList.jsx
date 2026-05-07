import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import useBatchStore from "../../stores/useBatchStore";
import useAuthStore from "../../stores/useAuthStore";
import BatchDetails from "./BatchDetails";

const BatchList = () => {
  const { batches, fetchBatches, isLoading } = useBatchStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);
  
  const filteredBatches = batches.filter((batch) => {
    const query = searchQuery.toLowerCase();
    return (
      batch.name?.toLowerCase().includes(query) ||
      batch.weekday?.toLowerCase().includes(query) ||
      batch.teacherEmail?.toLowerCase().includes(query)
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container mx-auto px-4 py-8 max-w-7xl"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <p className="text-slate-500 mt-1">
          Overview of all active Batches, Assigned Course, fees, and student allocations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search batches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>

          {/* Create Batch Button (Admin Only) */}
          {user?.role === "Admin" && (
            <Link
              to="/batches/create"
              className="whitespace-nowrap px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/30 active:scale-95 flex items-center justify-center"
            >
              + Create Batch
            </Link>
          )}
        </div>
      </div>

      {/* Content Section (Localized Loading) */}
      {isLoading ? (
        // Skeleton Loader grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((skeleton) => (
            <div
              key={skeleton}
              className="h-32 p-6 rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-gray-100 dark:border-gray-700 shadow-sm animate-pulse"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredBatches.length === 0 ? (
        // Empty State
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-white/40 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700"
        >
          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No batches found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery
              ? "Try adjusting your search terms."
              : "There are currently no batches available."}
          </p>
        </motion.div>
      ) : (
        // Data Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBatches.map((batch, index) => (
            <motion.div
              key={batch._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/batches/${encodeURIComponent(batch.name)}`}
                state={{ batchId: batch._id }}
                className="block h-full"
              >
                <div className="h-full p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate pr-2">
                      {batch.name}
                    </h2>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 shrink-0">
                      {batch.weekday}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    <p className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 shrink-0 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {batch.startTime} - {batch.endTime}
                    </p>
                    <p className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 shrink-0 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="truncate">{batch.teacherEmail}</span>
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default BatchList;
