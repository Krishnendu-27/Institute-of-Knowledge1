import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import useFeesStore from "../../stores/useFeesStore";

const StudentRow = ({
  student,
  mainClassId,
  classFees,
  batchName,
  onPaymentSuccess,
}) => {
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [fineAmount, setFineAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [showDiscount, setShowDiscount] = useState(false);
  const [paidAmount, setPaidAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [fineCalculated, setFineCalculated] = useState(false);
  const [showFineLoading, setShowFineLoading] = useState(false);

  const recordFeesPaid = useFeesStore((state) => state.recordFeesPaid);

  // Calculate final amount
  const totalAmount = classFees;
  const finalAmount = totalAmount + fineAmount - discountAmount;

  // Check if process button should be enabled
  const isProcessButtonEnabled =
    fineCalculated &&
    paidAmount &&
    parseFloat(paidAmount) === finalAmount &&
    finalAmount > 0;

  // Handle date change - recalculate fine
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setPaymentDate(newDate);
    setFineAmount(0);
    setFineCalculated(false);
  };

  // Calculate fine based on payment date
  const handleCalculateFine = async () => {
    if (!paymentDate) {
      toast.error("Please select a payment date");
      return;
    }

    setShowFineLoading(true);
    try {
      // For now, we'll use a simple calculation:
      // Fine = late days * X amount per day
      // This should ideally come from backend
      const selectedDate = new Date(paymentDate);
      const today = new Date();

      let lateDays = 0;
      if (selectedDate < today) {
        lateDays = Math.floor((today - selectedDate) / (1000 * 60 * 60 * 24));
      }

      // Example: 50 per day late fee
      const calculatedFine = lateDays * 50;
      setFineAmount(calculatedFine);
      setFineCalculated(true);
      if (calculatedFine > 0) {
        toast.success(`Fine calculated: ₹${calculatedFine}`);
      } else {
        toast.success("No fine applicable");
      }
    } catch (error) {
      toast.error("Failed to calculate fine");
    } finally {
      setShowFineLoading(false);
    }
  };

  // Handle process payment
  const handleProcessPayment = async () => {
    if (!isProcessButtonEnabled) {
      toast.error("Please enter the correct payment amount");
      return;
    }

    setIsProcessing(true);
    try {
      const paymentData = {
        month: new Date(paymentDate).toLocaleString("default", {
          month: "long",
          year: "numeric",
        }),
        totalAmount: finalAmount,
        paidAmount: parseFloat(paidAmount),
        PaidAt: new Date(paymentDate),
      };

      const result = await recordFeesPaid(
        mainClassId,
        student._id,
        paymentData,
      );

      if (result) {
        // Reset form
        setPaymentDate(new Date().toISOString().split("T")[0]);
        setFineAmount(0);
        setDiscountAmount(0);
        setPaidAmount("");
        setFineCalculated(false);
        setShowDiscount(false);
        onPaymentSuccess?.();
      }
    } catch (error) {
      toast.error("Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Student Photo */}
      <td className="px-4 py-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
          {student.profilePic ? (
            <img
              src={student.profilePic}
              alt={student.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{student.name?.charAt(0)?.toUpperCase()}</span>
          )}
        </div>
      </td>

      {/* Student Name */}
      <td className="px-4 py-3 font-medium">{student.name}</td>

      {/* Father Name */}
      <td className="px-4 py-3 text-gray-700">{student.fatherName || "-"}</td>

      {/* Village Name */}
      <td className="px-4 py-3 text-gray-700">{student.address || "-"}</td>

      {/* Total Fees */}
      <td className="px-4 py-3 font-semibold text-gray-800">₹{classFees}</td>

      {/* Fine Amount Section */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-2">
          <input
            type="date"
            value={paymentDate}
            onChange={handleDateChange}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          />
          <button
            onClick={handleCalculateFine}
            disabled={showFineLoading}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {showFineLoading ? "Calculating..." : "Calculate Fine"}
          </button>
          <div className="text-sm font-semibold text-red-600">
            ₹{fineAmount.toFixed(2)}
          </div>
        </div>
      </td>

      {/* Discount Amount */}
      <td className="px-4 py-3">
        {!showDiscount ? (
          <button
            onClick={() => setShowDiscount(true)}
            className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Add Discount
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="number"
              value={discountAmount}
              onChange={(e) =>
                setDiscountAmount(parseFloat(e.target.value) || 0)
              }
              placeholder="Discount"
              className="px-2 py-1 border border-gray-300 rounded text-sm w-24"
              min="0"
            />
            <button
              onClick={() => {
                setShowDiscount(false);
                setDiscountAmount(0);
              }}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </td>

      {/* Final Amount to Pay */}
      <td className="px-4 py-3">
        <div className="text-lg font-bold text-green-600">
          ₹{finalAmount.toFixed(2)}
        </div>
      </td>

      {/* Paid Amount & Action */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-2">
          <input
            type="number"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            placeholder="Enter amount"
            className="px-2 py-1 border border-gray-300 rounded text-sm"
            disabled={!fineCalculated}
            step="0.01"
            min="0"
          />
          <button
            onClick={handleProcessPayment}
            disabled={!isProcessButtonEnabled || isProcessing}
            className={`px-4 py-2 text-sm font-semibold rounded transition-colors ${
              isProcessButtonEnabled
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isProcessing ? "Processing..." : "Process"}
          </button>
          {!isProcessButtonEnabled && fineCalculated && (
            <div className="text-xs text-red-500">
              Amount must equal ₹{finalAmount.toFixed(2)}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default StudentRow;
