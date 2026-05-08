import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import useFeesStore from "../stores/useFeesStore";
import FilterPanel from "../components/UI/FilterPanel";
import StudentRow from "../components/UI/StudentRow";

const Fees = () => {
  const {
    students,
    mainClasses,
    batches,
    selectedMainClass,
    selectedBatch,
    isLoading,
    fetchMainClasses,
    fetchBatches,
    fetchStudentsForClass,
    fetchStudentsForBatch,
    setSelectedMainClass,
    setSelectedBatch,
  } = useFeesStore();

  const [filteredStudents, setFilteredStudents] = useState([]);
  const [classFeesAmount, setClassFeesAmount] = useState(0);
  const [filteredBatches, setFilteredBatches] = useState([]);

  // Fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([fetchMainClasses(), fetchBatches()]);
    };
    loadInitialData();
  }, [fetchMainClasses, fetchBatches]);

  // Fetch students when main class is selected
  useEffect(() => {
    if (selectedMainClass) {
      // Get class fees
      const selectedClass = mainClasses.find(
        (mc) => mc._id === selectedMainClass,
      );
      if (selectedClass) {
        setClassFeesAmount(selectedClass.fees);
      }

      // Filter batches for this main class
      const relevantBatches = batches.filter((batch) =>
        batch.mainClasses?.some(
          (mc) => mc._id === selectedMainClass || mc === selectedMainClass,
        ),
      );
      setFilteredBatches(relevantBatches);
    } else {
      setFilteredBatches([]);
    }
  }, [selectedMainClass, mainClasses, batches]);

  // Fetch students when batch is selected
  useEffect(() => {
    if (selectedBatch) {
      fetchStudentsForBatch(selectedBatch);
    } else {
      setFilteredStudents([]);
    }
  }, [selectedBatch, fetchStudentsForBatch]);

  const handleMainClassChange = (mainClassId) => {
    setSelectedMainClass(mainClassId);
    setSelectedBatch(null); // Reset batch selection
  };

  const handleBatchChange = (batchId) => {
    setSelectedBatch(batchId);
  };

  const handlePaymentSuccess = () => {
    // Optionally refresh student data or show success message
    toast.success("Payment processed successfully!");
  };

  // Find selected batch name
  const selectedBatchObj = batches.find((b) => b._id === selectedBatch);
  const batchName = selectedBatchObj
    ? `${selectedBatchObj.name} (${selectedBatchObj.startTime} - ${selectedBatchObj.endTime})`
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Fees Management
        </h1>
        <p className="text-gray-600">
          Manage student fees, calculate fines, apply discounts, and process
          payments
        </p>
      </div>

      {/* Filter Panel */}
      <div className="text-black [&_select]:text-black [&_option]:text-black [&_button]:text-black">
        <FilterPanel
          mainClasses={mainClasses}
          batches={filteredBatches}
          selectedMainClass={selectedMainClass}
          selectedBatch={selectedBatch}
          onMainClassChange={handleMainClassChange}
          onBatchChange={handleBatchChange}
          isLoading={isLoading}
        />
      </div>

      {/* Students Table */}
      {selectedMainClass && selectedBatch && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-2 text-gray-600">Loading students...</span>
            </div>
          ) : students && students.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-lg">
                {selectedBatch
                  ? "No students found for this batch."
                  : "Please select both a class and batch to view students."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Photo
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Student Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Father Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Village
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Total Fees
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Fine Amount
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Discountcourses/mern-devlopment
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Final Amount
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_td]:text-black [&_.text-gray-400]:!text-black [&_.text-gray-500]:!text-black [&_.text-gray-600]:!text-black [&_.text-gray-700]:!text-black [&_.text-gray-800]:!text-black [&_.text-gray-900]:!text-black">
                  {students.map((student) => (
                    <StudentRow
                      key={student._id}
                      student={student}
                      mainClassId={selectedMainClass}
                      classFees={classFeesAmount}
                      batchName={batchName}
                      onPaymentSuccess={handlePaymentSuccess}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Summary */}
          {students && students.length > 0 && (
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-black font-medium">
                  Total Students:{" "}
                  <span className="font-bold text-lg">{students.length}</span>
                </span>
                <span className="text-black font-medium">
                  Class:{" "}
                  <span className="font-bold">
                    {
                      mainClasses.find((mc) => mc._id === selectedMainClass)
                        ?.name
                    }
                  </span>
                </span>
                {selectedBatchObj && (
                  <span className="text-black font-medium">
                    Batch:{" "}
                    <span className="font-bold">{selectedBatchObj.name}</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            📅 Fine Calculation
          </h3>
          <p className="text-sm text-blue-700">
            Select a payment date and click "Calculate Fine" to determine
            applicable fine amount based on late payment.
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">
            💰 Discount Option
          </h3>
          <p className="text-sm text-green-700">
            Click "Add Discount" to apply manual adjustments or institutional
            discounts to the fees.
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2">
            ✓ Payment Validation
          </h3>
          <p className="text-sm text-purple-700">
            The Process button only enables when the paid amount exactly matches
            the calculated final amount.
          </p>
        </div>
      </div>

      {/* PDF Generation Placeholder */}
      <div className="mt-8 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
        <h3 className="text-lg font-bold text-yellow-900 mb-2">
          📄 PDF Bill Generation
        </h3>
        <p className="text-yellow-800 mb-3">
          PDF receipt generation is currently on hold pending backend support.
          Once payments are processed, bills will be automatically generated and
          can be downloaded.
        </p>
        <div className="bg-yellow-100 border border-yellow-400 rounded p-3 text-sm text-yellow-900">
          <strong>Coming Soon:</strong> Automated PDF receipts with QR codes and
          payment details
        </div>
      </div>
    </div>
  );
};

export default Fees;
