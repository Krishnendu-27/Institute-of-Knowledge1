import React, { useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle } from "lucide-react";
import useFeesStore from "../../stores/useFeesStore";
import {
  calculateFineForMonth,
  formatFineAmount,
} from "../../util/fineCalculation";
import { getStudentId } from "../../util/getStudentId";

const StudentRow = ({
  student,
  mainClassId,
  classFees,
  batchName,
  onPaymentSuccess,
  showDiscount = false,
}) => {
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [fineAmount, setFineAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [fineCalculated, setFineCalculated] = useState(true);
  const [showFineLoading, setShowFineLoading] = useState(false);

  // BUG FIX: Added state to properly handle image fallbacks
  const [imgError, setImgError] = useState(false);

  const recordFeesPaid = useFeesStore((state) => state.recordFeesPaid);

  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  });

  const [availableMonths] = useState(() => {
    const options = [];
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    for (let i = 0; i < 12; i++) {
      options.push(`${MONTHS[d.getMonth()]} ${d.getFullYear()}`);
      d.setMonth(d.getMonth() + 1);
    }
    return options;
  });

  const studentId = student.studentId || student._id || student.id;
  const studentPhone = student.phone || student.phoneNumber || "-";
  const studentPhoto = student.profilePic || student.profile_picture || "";

  const totalAmount = parseFloat(classFees) || 0;
  const finalAmount = totalAmount + fineAmount - discountAmount;

  const isProcessButtonEnabled =
    fineCalculated &&
    paidAmount &&
    parseFloat(paidAmount) === finalAmount &&
    finalAmount > 0;

  const handleDateChange = (e) => {
    setPaymentDate(e.target.value);
    setFineAmount(0);
    setFineCalculated(false);
  };

  const handleCalculateFine = async () => {
    if (!paymentDate) {
      toast.error("Please select a payment date");
      return;
    }

    setShowFineLoading(true);
    try {
      // Split the string and construct date safely to avoid timezone shift issues
      const [year, month, day] = paymentDate.split("-");
      const selectedDate = new Date(year, month - 1, day);

      const fine = calculateFineForMonth(selectedDate, 10, 10);
      setFineAmount(fine);
      setFineCalculated(true);

      if (fine > 0) {
        toast.success(`Fine calculated: ${formatFineAmount(fine)}`);
      } else {
        toast.success("No fine applicable");
      }
    } catch (error) {
      toast.error("Failed to calculate fine");
    } finally {
      setShowFineLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!isProcessButtonEnabled) {
      toast.error("Please enter the correct payment amount");
      return;
    }

    setIsProcessing(true);
    try {
      if (!mainClassId || !studentId) {
        toast.error("Student or Class information is missing");
        setIsProcessing(false);
        return;
      }

      // Safe date formatting
      const [year, month, day] = paymentDate.split("-");
      const paymentDateTime = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      const isoDateTime = paymentDateTime.toISOString();

      const paymentData = {
        month: selectedMonth,
        totalAmount: parseFloat(paidAmount),
        PaidAt: isoDateTime,
      };

      const result = await recordFeesPaid(mainClassId, studentId, paymentData);

      if (result === false) {
        setIsProcessing(false);
        return;
      }

      setPaymentDate(new Date().toISOString().split("T")[0]);
      setFineAmount(0);
      setDiscountAmount(0);
      setPaidAmount("");
      setFineCalculated(true);
      onPaymentSuccess?.();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold overflow-hidden shrink-0">
          {studentPhoto && !imgError ? (
            <img
              src={studentPhoto}
              alt={student.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span>{student.name?.charAt(0)?.toUpperCase() || "S"}</span>
          )}
        </div>
      </td>

      <td className="px-4 py-3 font-medium text-foreground">{student.name}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
        {getStudentId(student)}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {studentPhone !== "-" ? studentPhone : "-"}
      </td>

      <td className="px-4 py-3">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-2 py-1 border border-border bg-background text-foreground rounded text-sm w-36 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
        >
          {availableMonths.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </td>

      <td className="px-4 py-3 font-semibold text-foreground">₹{classFees}</td>

      <td className="px-4 py-3">
        <div className="flex flex-col gap-2">
          <input
            type="date"
            value={paymentDate}
            onChange={handleDateChange}
            className="px-2 py-1 border border-border bg-background text-foreground rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
          />
          <button
            onClick={handleCalculateFine}
            disabled={showFineLoading}
            className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {showFineLoading ? "Calculating..." : "Calculate Fine"}
          </button>
          <div
            className={`text-sm font-semibold ${fineAmount > 0 ? "text-destructive" : "text-success"}`}
          >
            {formatFineAmount(fineAmount)}
          </div>
        </div>
      </td>

      {showDiscount && (
        <td className="px-4 py-3">
          <div className="flex gap-2">
            <input
              type="number"
              value={discountAmount || ""}
              onChange={(e) =>
                setDiscountAmount(parseFloat(e.target.value) || 0)
              }
              placeholder="Discount"
              className="px-2 py-1 border border-border bg-background text-foreground rounded text-sm w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              min="0"
            />
          </div>
        </td>
      )}

      <td className="px-4 py-3">
        <div className="text-lg font-bold text-success">
          ₹{finalAmount.toFixed(2)}
        </div>
        {discountAmount > 0 && (
          <div className="text-xs text-muted-foreground">
            Discount: ₹{discountAmount.toFixed(2)}
          </div>
        )}
      </td>

      <td className="px-4 py-3">
        <div className="flex flex-col gap-2">
          <input
            type="number"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            placeholder="Enter amount"
            className="px-2 py-1 border border-border bg-background text-foreground rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
            disabled={!fineCalculated}
            step="0.01"
            min="0"
          />
          <button
            onClick={handleProcessPayment}
            disabled={!isProcessButtonEnabled || isProcessing}
            className={`px-4 py-2 text-sm font-semibold rounded transition-all flex items-center justify-center gap-2 ${
              isProcessButtonEnabled
                ? "bg-success text-success-foreground hover:opacity-90 shadow-md shadow-success/20"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Process
              </>
            )}
          </button>
          {!isProcessButtonEnabled && fineCalculated && (
            <div className="text-xs text-destructive">
              Amount must equal ₹{finalAmount.toFixed(2)}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default StudentRow;