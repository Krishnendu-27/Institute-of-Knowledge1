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
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 transition-colors duration-300">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Fees Management
        </h1>
        <p className="text-muted-foreground">
          Manage student fees, calculate fines, apply discounts, and process
          payments
        </p>
      </div>

      {/* Filter Panel */}
      <div>
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
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden transition-colors">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-primary animate-spin" />
              <span className="ml-2 text-muted-foreground font-medium">
                Loading students...
              </span>
            </div>
          ) : students && students.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground text-lg">
                {selectedBatch
                  ? "No students found for this batch."
                  : "Please select both a class and batch to view students."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                      Photo
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                      Student Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                      Father Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                      Village
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                      Total Fees
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                      Fine Amount
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                      Discount
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                      Final Amount
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
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
            <div className="bg-muted/30 border-t border-border px-6 py-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-foreground font-medium">
                  Total Students:{" "}
                  <span className="font-bold text-lg text-primary">
                    {students.length}
                  </span>
                </span>
                <span className="text-foreground font-medium">
                  Class:{" "}
                  <span className="font-bold text-primary">
                    {
                      mainClasses.find((mc) => mc._id === selectedMainClass)
                        ?.name
                    }
                  </span>
                </span>
                {selectedBatchObj && (
                  <span className="text-foreground font-medium">
                    Batch:{" "}
                    <span className="font-bold text-primary">
                      {selectedBatchObj.name}
                    </span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-primary mb-2">
            📅 Fine Calculation
          </h3>
          <p className="text-sm text-foreground/80">
            Select a payment date and click "Calculate Fine" to determine
            applicable fine amount based on late payment.
          </p>
        </div>
        <div className="bg-success/10 border border-success/20 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-success mb-2">
            💰 Discount Option
          </h3>
          <p className="text-sm text-foreground/80">
            Click "Add Discount" to apply manual adjustments or institutional
            discounts to the fees.
          </p>
        </div>
        <div className="bg-muted/50 border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-2">
            ✓ Payment Validation
          </h3>
          <p className="text-sm text-muted-foreground">
            The Process button only enables when the paid amount exactly matches
            the calculated final amount.
          </p>
        </div>
      </div>

      {/* PDF Generation Placeholder */}
      <div className="mt-8 bg-warning/10 border border-warning/30 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-warning mb-2">
          📄 PDF Bill Generation
        </h3>
        <p className="text-warning/80 mb-3">
          PDF receipt generation is currently on hold pending backend support.
          Once payments are processed, bills will be automatically generated and
          can be downloaded.
        </p>
        <div className="bg-warning/20 border border-warning/40 rounded-lg p-3 text-sm text-warning font-medium">
          <strong>Coming Soon:</strong> Automated PDF receipts with QR codes and
          payment details
        </div>
      </div>
    </div>
  );
};

export default Fees;