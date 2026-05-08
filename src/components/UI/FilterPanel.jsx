import React from "react";
import { ChevronDown } from "lucide-react";

const FilterPanel = ({
  mainClasses,
  batches,
  selectedMainClass,
  selectedBatch,
  onMainClassChange,
  onBatchChange,
  isLoading,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Filters</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Class Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">
            Main Class
          </label>
          <div className="relative">
            <select
              value={selectedMainClass || ""}
              onChange={(e) => onMainClassChange(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="">-- Select Main Class --</option>
              {mainClasses.map((mainClass) => (
                <option key={mainClass._id} value={mainClass._id}>
                  {mainClass.name} (₹{mainClass.fees})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Batch Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">
            Batch
          </label>
          <div className="relative">
            <select
              value={selectedBatch || ""}
              onChange={(e) => onBatchChange(e.target.value)}
              disabled={isLoading || !selectedMainClass}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all ${
                !selectedMainClass ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <option value="">-- Select Batch --</option>
              {batches.map((batch) => (
                <option key={batch._id} value={batch._id}>
                  {batch.name} ({batch.startTime} - {batch.endTime})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
          {!selectedMainClass && (
            <p className="text-xs text-gray-500 mt-2">
              Select a main class first
            </p>
          )}
        </div>
      </div>

      {selectedMainClass && selectedBatch && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            ✓ Filters applied. Showing students for the selected class and
            batch.
          </p>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
