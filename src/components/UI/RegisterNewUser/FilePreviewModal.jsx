import { motion, AnimatePresence } from "framer-motion";
import { FileBadge, X } from "lucide-react";
import React from "react";

export const FilePreviewModal = ({ viewingFile, setViewingFile }) => {
  return (
    <AnimatePresence>
      {viewingFile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-4  flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-4">
                {viewingFile.name}
              </h3>
              <button
                onClick={() => setViewingFile(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-900 flex-1 flex items-center justify-center min-h-[50vh] max-h-[80vh] overflow-auto">
              {viewingFile.type.startsWith("image/") ? (
                <img
                  src={viewingFile.url}
                  alt="Preview"
                  className="max-w-full max-h-full rounded-lg object-contain"
                />
              ) : (
                <div className="text-slate-500 flex flex-col items-center gap-3">
                  <FileBadge size={48} />
                  <p>Preview not available</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
