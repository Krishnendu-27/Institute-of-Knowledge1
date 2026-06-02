// import React, { useState, useEffect } from "react";
// import toast from "react-hot-toast";
// import { Loader } from "lucide-react";
// import useFeesStore from "../stores/useFeesStore";
// import useUserStore from "../stores/useUserStore";
// import FilterPanel from "../components/UI/FilterPanel";
// import StudentRow from "../components/UI/StudentRow";
// import DashboardCards from "../components/UI/DashboardCards";
// import StudentSearch from "../components/UI/StudentSearch";
// import DiscountToggleButton from "../components/UI/DiscountToggleButton";
// import { api } from "../api/api";

// const Fees = () => {
//   const {
//     students,
//     mainClasses,
//     batches,
//     selectedMainClass,
//     selectedBatch,
//     isLoading,
//     fetchMainClasses,
//     fetchBatches,
//     fetchStudentsForClass,
//     fetchStudentsForBatch,
//     setSelectedMainClass,
//     setSelectedBatch,
//   } = useFeesStore();

//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [classFeesAmount, setClassFeesAmount] = useState(0);
//   const [filteredBatches, setFilteredBatches] = useState([]);
//   const [showDiscountFields, setShowDiscountFields] = useState(false);
//   const [searchResults, setSearchResults] = useState([]);
//   const [isSearching, setIsSearching] = useState(false);

//   // For Global Search
//   const { students: allStudents, getStudents } = useUserStore();
//   const [globalSearchResults, setGlobalSearchResults] = useState([]);
//   const [pendingCurrentMonth, setPendingCurrentMonth] = useState(0);
//   const [pendingPreviousMonth, setPendingPreviousMonth] = useState(0);
//   const [pendingLoading, setPendingLoading] = useState(false);

//   // Fetch initial data
//   useEffect(() => {
//     const loadInitialData = async () => {
//       await Promise.all([fetchMainClasses(), fetchBatches()]);
//       if (getStudents) getStudents(); // Load all students for global search
//     };
//     loadInitialData();
//   }, [fetchMainClasses, fetchBatches, getStudents]);

//   // Fetch students when main class is selected
//   useEffect(() => {
//     if (selectedMainClass) {
//       // Get class fees
//       const selectedClass = mainClasses.find(
//         (mc) => mc._id === selectedMainClass,
//       );
//       if (selectedClass) {
//         setClassFeesAmount(selectedClass.fees);
//       }

//       // Filter batches for this main class
//       const relevantBatches = batches.filter((batch) =>
//         batch.mainClasses?.some(
//           (mc) => mc._id === selectedMainClass || mc === selectedMainClass,
//         ),
//       );
//       setFilteredBatches(relevantBatches);
//     } else {
//       setFilteredBatches([]);
//     }
//   }, [selectedMainClass, mainClasses, batches]);

//   // Fetch students when batch is selected
//   useEffect(() => {
//     if (selectedBatch) {
//       fetchStudentsForBatch(selectedBatch);
//       setSearchResults([]);
//       setIsSearching(false);
//     } else {
//       setFilteredStudents([]);
//     }
//   }, [selectedBatch, fetchStudentsForBatch]);

//   // Handle search
//   const handleSearch = (results) => {
//     setSearchResults(results);
//     setIsSearching(results.length > 0 || results.length === 0);
//   };

//   // Determine which students to display
//   const displayedStudents = isSearching ? searchResults : students;

//   const getMonthLabel = (date) =>
//     date.toLocaleString("default", { month: "long", year: "numeric" });

//   useEffect(() => {
//     if (!allStudents?.length) return;

//     let isMounted = true;
//     const loadPendingCounts = async () => {
//       setPendingLoading(true);
//       const currentMonthLabel = getMonthLabel(new Date());
//       const previousMonthDate = new Date();
//       previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
//       const previousMonthLabel = getMonthLabel(previousMonthDate);

//       const pendingCurrent = new Set();
//       const pendingPrevious = new Set();

//       for (const student of allStudents) {
//         const studentId = student._id;
//         const classIds = (student.mainClasses || []).map(
//           (cls) => cls._id || cls,
//         );

//         for (const classId of classIds) {
//           try {
//             const response = await api.get(
//               `/fees/history/${classId}/${studentId}`,
//             );
//             const history = response.data?.history || [];

//             const paidCurrent = history.some(
//               (record) =>
//                 String(record.month || "")
//                   .trim()
//                   .toLowerCase() === currentMonthLabel.toLowerCase(),
//             );
//             const paidPrevious = history.some(
//               (record) =>
//                 String(record.month || "")
//                   .trim()
//                   .toLowerCase() === previousMonthLabel.toLowerCase(),
//             );

//             if (!paidCurrent) pendingCurrent.add(studentId);
//             if (!paidPrevious) pendingPrevious.add(studentId);
//           } catch (error) {
//             // Silently skip 404 errors (endpoint not ready yet)
//             if (error.response?.status !== 404) {
//               pendingCurrent.add(studentId);
//               pendingPrevious.add(studentId);
//             }
//           }
//         }
//       }

//       if (isMounted) {
//         setPendingCurrentMonth(pendingCurrent.size);
//         setPendingPreviousMonth(pendingPrevious.size);
//       }

//       if (isMounted) setPendingLoading(false);
//     };

//     loadPendingCounts();

//     return () => {
//       isMounted = false;
//     };
//   }, [allStudents]);

//   const handleMainClassChange = (mainClassId) => {
//     setSelectedMainClass(mainClassId);
//     setSelectedBatch(null); // Reset batch selection
//   };

//   const handleBatchChange = (batchId) => {
//     setSelectedBatch(batchId);
//   };

//   const handlePaymentSuccess = () => {
//     // Refresh student data
//     if (selectedBatch) {
//       fetchStudentsForBatch(selectedBatch);
//     }
//     toast.success("Payment processed successfully!");
//   };

//   // Handle Global Auto Selection
//   const handleAutoSelectStudent = (student) => {
//     let foundBatch = null;
//     let foundMainClassId = null;

//     for (const batch of batches) {
//       const hasStudent =
//         batch.students?.some(
//           (s) => s === student._id || s._id === student._id,
//         ) ||
//         batch.mainClassStudentPairs?.some(
//           (pair) =>
//             pair.student === student._id || pair.student?._id === student._id,
//         );
//       if (hasStudent) {
//         foundBatch = batch;
//         const pair = batch.mainClassStudentPairs?.find(
//           (p) => p.student === student._id || p.student?._id === student._id,
//         );
//         if (pair) {
//           foundMainClassId = pair.mainClass?._id || pair.mainClass;
//         } else if (batch.mainClasses?.length > 0) {
//           foundMainClassId = batch.mainClasses[0]?._id || batch.mainClasses[0];
//         }
//         break;
//       }
//     }

//     if (foundBatch && foundMainClassId) {
//       handleMainClassChange(foundMainClassId);
//       setTimeout(() => handleBatchChange(foundBatch._id), 100);
//       setGlobalSearchResults([]); // close search
//       toast.success(`Found and selected ${student.name}'s batch`);
//     } else if (student.mainClasses?.length > 0) {
//       handleMainClassChange(
//         student.mainClasses[0]?._id || student.mainClasses[0],
//       );
//       toast.success(
//         `Selected main class for ${student.name}. Please select a batch manually.`,
//       );
//       setGlobalSearchResults([]);
//     } else {
//       toast.error("Student is not assigned to any batch or class.");
//     }
//   };

//   // Find selected batch name and main class name
//   const selectedBatchObj = batches.find((b) => b._id === selectedBatch);
//   const selectedMainClassObj = mainClasses.find(
//     (mc) => mc._id === selectedMainClass,
//   );
//   const batchName = selectedBatchObj
//     ? `${selectedBatchObj.name} (${selectedBatchObj.startTime} - ${selectedBatchObj.endTime})`
//     : "";

//   return (
//     <div className="min-h-screen bg-background text-foreground p-4 md:p-8 transition-colors duration-300">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-4xl font-bold text-foreground mb-2">
//           Fees Management
//         </h1>
//         <p className="text-muted-foreground">
//           Manage student fees, calculate fines, apply discounts, and process
//           payments
//         </p>
//       </div>

//       {/* Dashboard Cards */}
//       <DashboardCards
//         totalStudents={displayedStudents.length}
//         pendingCurrentMonth={pendingCurrentMonth}
//         pendingPreviousMonth={pendingPreviousMonth}
//         isLoading={isLoading || pendingLoading}
//       />

//       {/* Global Student Search */}
//       <div className="bg-card border border-border rounded-xl shadow-sm p-6 mb-6">
//         <h2 className="text-xl font-bold text-foreground mb-4">
//           Global Student Search
//         </h2>
//         <StudentSearch
//           students={allStudents || []}
//           onSearch={(results) => setGlobalSearchResults(results)}
//           debounceMs={300}
//         />
//         {globalSearchResults.length > 0 && (
//           <div className="mt-4 border border-border rounded-xl overflow-hidden divide-y divide-border/50 max-h-60 overflow-y-auto">
//             {globalSearchResults.map((student) => (
//               <div
//                 key={student._id}
//                 className="flex items-center justify-between p-3 bg-muted/20 hover:bg-muted/50 transition-colors"
//               >
//                 <div>
//                   <p className="font-semibold text-foreground">
//                     {student.name}
//                   </p>
//                   <p className="text-xs text-muted-foreground">
//                     Phone: {student.phone} | Email: {student.email}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => handleAutoSelectStudent(student)}
//                   className="bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
//                 >
//                   Locate & Select
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Filter Panel */}
//       <div>
//         <FilterPanel
//           mainClasses={mainClasses}
//           batches={filteredBatches}
//           selectedMainClass={selectedMainClass}
//           selectedBatch={selectedBatch}
//           onMainClassChange={handleMainClassChange}
//           onBatchChange={handleBatchChange}
//           isLoading={isLoading}
//         />
//       </div>

//       {/* Students Table */}
//       {selectedMainClass && selectedBatch && (
//         <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden transition-colors">
//           {/* Search Bar */}
//           <div className="p-6 border-b border-border">
//             <StudentSearch
//               students={students}
//               onSearch={handleSearch}
//               debounceMs={500}
//             />
//             {isSearching && searchResults.length > 0 && (
//               <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary">
//                 Showing {searchResults.length} search result
//                 {searchResults.length !== 1 ? "s" : ""}
//               </div>
//             )}
//           </div>

//           {isLoading ? (
//             <div className="flex items-center justify-center py-12">
//               <Loader className="w-8 h-8 text-primary animate-spin" />
//               <span className="ml-2 text-muted-foreground font-medium">
//                 Loading students...
//               </span>
//             </div>
//           ) : displayedStudents && displayedStudents.length === 0 ? (
//             <div className="p-8 text-center">
//               <p className="text-muted-foreground text-lg">
//                 {isSearching
//                   ? "No students found matching your search."
//                   : selectedBatch
//                     ? "No students found for this batch."
//                     : "Please select both a class and batch to view students."}
//               </p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto custom-scrollbar">
//               <table className="w-full border-collapse">
//                 <thead>
//                   <tr className="bg-muted/50 border-b border-border sticky top-0">
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
//                       Photo
//                     </th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
//                       Student Name
//                     </th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
//                       ID
//                     </th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
//                       Phone
//                     </th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
//                       Month
//                     </th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
//                       Monthly Fee
//                     </th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
//                       Fine
//                     </th>
//                     {showDiscountFields && (
//                       <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
//                         Conscession
//                       </th>
//                     )}
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
//                       Total Payable
//                     </th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
//                       Action
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-border/50">
//                   {displayedStudents.map((student) => (
//                     <StudentRow
//                       key={student._id}
//                       student={student}
//                       mainClassId={selectedMainClass}
//                       classFees={classFeesAmount}
//                       batchName={batchName}
//                       onPaymentSuccess={handlePaymentSuccess}
//                       showDiscount={showDiscountFields}
//                     />
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {/* Table Summary */}
//           {displayedStudents && displayedStudents.length > 0 && (
//             <div className="bg-muted/30 border-t border-border px-6 py-4">
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                 <div>
//                   <span className="text-muted-foreground">Total Students:</span>
//                   <p className="font-bold text-lg text-primary">
//                     {displayedStudents.length}
//                   </p>
//                 </div>
//                 <div>
//                   <span className="text-muted-foreground">Class:</span>
//                   <p className="font-bold text-primary">
//                     {mainClasses.find((mc) => mc._id === selectedMainClass)
//                       ?.name || "N/A"}
//                   </p>
//                 </div>
//                 <div>
//                   <span className="text-muted-foreground">Batch:</span>
//                   <p className="font-bold text-primary">
//                     {selectedBatchObj?.name || "N/A"}
//                   </p>
//                 </div>
//                 <div>
//                   <span className="text-muted-foreground">
//                     Fee per Student:
//                   </span>
//                   <p className="font-bold text-primary">₹{classFeesAmount}</p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Info Boxes */}
//       <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 shadow-sm">
//           <h3 className="font-semibold text-primary mb-2">
//             📅 Fine Calculation
//           </h3>
//           <p className="text-sm text-foreground/80">
//             ₹10 per day after the 10th of every month. Select a payment date and
//             click "Calculate Fine" to determine the applicable fine amount.
//           </p>
//         </div>
//         <div className="bg-success/10 border border-success/20 rounded-xl p-5 shadow-sm">
//           <h3 className="font-semibold text-success mb-2">Cons Option</h3>
//           <p className="text-sm text-foreground/80">
//             Click the floating button at the bottom-right to show/hide discount
//             fields for all students. Apply fixed amount discounts as needed.
//           </p>
//         </div>
//         <div className="bg-muted/50 border border-border rounded-xl p-5 shadow-sm">
//           <h3 className="font-semibold text-foreground mb-2">
//             ✓ Payment Validation
//           </h3>
//           <p className="text-sm text-muted-foreground">
//             The Process button only enables when the paid amount exactly matches
//             the calculated total (fees + fine - discount).
//           </p>
//         </div>
//       </div>

//       {/* Floating Discount Button */}
//       <DiscountToggleButton
//         isVisible={showDiscountFields}
//         onToggle={() => setShowDiscountFields(!showDiscountFields)}
//       />

//       {/* Footer Note */}
//       <div className="mt-8 bg-info/10 border border-info/30 rounded-xl p-6 shadow-sm">
//         <h3 className="text-lg font-bold text-info mb-2">
//           💡 Tips for Managing Fees
//         </h3>
//         <ul className="text-sm text-foreground/80 space-y-2">
//           <li>
//             • Use the search bar to quickly find students by name, ID, or phone
//             number
//           </li>
//           <li>
//             • Fine is calculated as ₹10 per day after the 10th of the month
//           </li>
//           <li>
//             • Students can pay multiple months together; fines apply to each
//             month separately
//           </li>
//           <li>
//             • Discounts only reduce the payable amount; fines are not reduced
//           </li>
//           <li>• Payment must exactly match the total amount to process</li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default Fees;

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import useFeesStore from "../stores/useFeesStore";
import useUserStore from "../stores/useUserStore";
import FilterPanel from "../components/UI/FilterPanel";
import StudentRow from "../components/UI/StudentRow";
import DashboardCards from "../components/UI/DashboardCards";
import StudentSearch from "../components/UI/StudentSearch";
import DiscountToggleButton from "../components/UI/DiscountToggleButton";
import { api } from "../api/api";

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

  const [classFeesAmount, setClassFeesAmount] = useState(0);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [showDiscountFields, setShowDiscountFields] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // For Global Search
  const { students: allStudents, getStudents } = useUserStore();
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [pendingCurrentMonth, setPendingCurrentMonth] = useState(0);
  const [pendingPreviousMonth, setPendingPreviousMonth] = useState(0);
  const [pendingLoading, setPendingLoading] = useState(false);

  // BUG FIX: Prevent re-fetching if data already exists in Zustand to retain state on tab switch
  useEffect(() => {
    const loadInitialData = async () => {
      if (!mainClasses || mainClasses.length === 0) await fetchMainClasses();
      if (!batches || batches.length === 0) await fetchBatches();
      if (getStudents && (!allStudents || allStudents.length === 0))
        getStudents();
    };
    loadInitialData();
  }, []); // Empty dependency array prevents infinite loops on mount

  // Fetch students when main class is selected
  useEffect(() => {
    if (selectedMainClass) {
      const selectedClass = mainClasses?.find(
        (mc) => mc._id === selectedMainClass,
      );
      if (selectedClass) {
        setClassFeesAmount(selectedClass.fees);
      }

      const relevantBatches = batches?.filter((batch) =>
        batch.mainClasses?.some(
          (mc) => mc._id === selectedMainClass || mc === selectedMainClass,
        ),
      );
      setFilteredBatches(relevantBatches || []);
    } else {
      setFilteredBatches([]);
    }
  }, [selectedMainClass, mainClasses, batches]);

  // Fetch students when batch is selected
  useEffect(() => {
    if (selectedBatch) {
      fetchStudentsForBatch(selectedBatch);
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [selectedBatch, fetchStudentsForBatch]);

  const handleSearch = (results) => {
    setSearchResults(results);
    setIsSearching(results.length > 0 || results.length === 0);
  };

  // BUG FIX: Fallback to empty array to prevent mapping crashes
  const displayedStudents = isSearching ? searchResults : students || [];

  const getMonthLabel = (date) =>
    date.toLocaleString("default", { month: "long", year: "numeric" });

  // BUG FIX: Optimized the N+1 API problem using concurrent Promise execution
  useEffect(() => {
    if (!allStudents?.length) return;

    let isMounted = true;
    const loadPendingCounts = async () => {
      setPendingLoading(true);
      const currentMonthLabel = getMonthLabel(new Date());
      const previousMonthDate = new Date();
      previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
      const previousMonthLabel = getMonthLabel(previousMonthDate);

      const pendingCurrent = new Set();
      const pendingPrevious = new Set();

      // Collect all API requests into an array to fire concurrently
      const promises = [];

      for (const student of allStudents) {
        const studentId = student._id;
        const classIds = (student.mainClasses || []).map(
          (cls) => cls._id || cls,
        );

        for (const classId of classIds) {
          const request = api
            .get(`/fees/history/${classId}/${studentId}`)
            .then((response) => {
              const history = response.data?.history || [];
              const paidCurrent = history.some(
                (record) =>
                  String(record.month || "")
                    .trim()
                    .toLowerCase() === currentMonthLabel.toLowerCase(),
              );
              const paidPrevious = history.some(
                (record) =>
                  String(record.month || "")
                    .trim()
                    .toLowerCase() === previousMonthLabel.toLowerCase(),
              );

              if (!paidCurrent) pendingCurrent.add(studentId);
              if (!paidPrevious) pendingPrevious.add(studentId);
            })
            .catch((error) => {
              if (error.response?.status !== 404) {
                pendingCurrent.add(studentId);
                pendingPrevious.add(studentId);
              }
            });

          promises.push(request);
        }
      }

      // Execute all API calls concurrently
      await Promise.all(promises);

      if (isMounted) {
        setPendingCurrentMonth(pendingCurrent.size);
        setPendingPreviousMonth(pendingPrevious.size);
        setPendingLoading(false);
      }
    };

    loadPendingCounts();

    return () => {
      isMounted = false;
    };
  }, [allStudents]);

  const handleMainClassChange = (mainClassId) => {
    setSelectedMainClass(mainClassId);
    setSelectedBatch(null);
  };

  const handleBatchChange = (batchId) => {
    setSelectedBatch(batchId);
  };

  const handlePaymentSuccess = () => {
    if (selectedBatch) {
      fetchStudentsForBatch(selectedBatch);
    }
    toast.success("Payment processed successfully!");
  };

  const handleAutoSelectStudent = (student) => {
    let foundBatch = null;
    let foundMainClassId = null;

    for (const batch of batches) {
      const hasStudent =
        batch.students?.some(
          (s) => s === student._id || s._id === student._id,
        ) ||
        batch.mainClassStudentPairs?.some(
          (pair) =>
            pair.student === student._id || pair.student?._id === student._id,
        );

      if (hasStudent) {
        foundBatch = batch;
        const pair = batch.mainClassStudentPairs?.find(
          (p) => p.student === student._id || p.student?._id === student._id,
        );
        if (pair) {
          foundMainClassId = pair.mainClass?._id || pair.mainClass;
        } else if (batch.mainClasses?.length > 0) {
          foundMainClassId = batch.mainClasses[0]?._id || batch.mainClasses[0];
        }
        break;
      }
    }

    if (foundBatch && foundMainClassId) {
      handleMainClassChange(foundMainClassId);
      setTimeout(() => handleBatchChange(foundBatch._id), 100);
      setGlobalSearchResults([]);
      toast.success(`Found and selected ${student.name}'s batch`);
    } else if (student.mainClasses?.length > 0) {
      handleMainClassChange(
        student.mainClasses[0]?._id || student.mainClasses[0],
      );
      toast.success(
        `Selected main class for ${student.name}. Please select a batch manually.`,
      );
      setGlobalSearchResults([]);
    } else {
      toast.error("Student is not assigned to any batch or class.");
    }
  };

  const selectedBatchObj = batches?.find((b) => b._id === selectedBatch);
  const selectedMainClassObj = mainClasses?.find(
    (mc) => mc._id === selectedMainClass,
  );
  const batchName = selectedBatchObj
    ? `${selectedBatchObj.name} (${selectedBatchObj.startTime} - ${selectedBatchObj.endTime})`
    : "";

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Fees Management
        </h1>
        <p className="text-muted-foreground">
          Manage student fees, calculate fines, apply discounts, and process
          payments
        </p>
      </div>

      <DashboardCards
        totalStudents={displayedStudents.length}
        pendingCurrentMonth={pendingCurrentMonth}
        pendingPreviousMonth={pendingPreviousMonth}
        isLoading={isLoading || pendingLoading}
      />

      <div className="bg-card border border-border rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Global Student Search
        </h2>
        <StudentSearch
          students={allStudents || []}
          onSearch={(results) => setGlobalSearchResults(results)}
          debounceMs={300}
        />
        {globalSearchResults.length > 0 && (
          <div className="mt-4 border border-border rounded-xl overflow-hidden divide-y divide-border/50 max-h-60 overflow-y-auto">
            {globalSearchResults.map((student) => (
              <div
                key={student._id}
                className="flex items-center justify-between p-3 bg-muted/20 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {student.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Phone: {student.phone} | Email: {student.email}
                  </p>
                </div>
                <button
                  onClick={() => handleAutoSelectStudent(student)}
                  className="bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Locate & Select
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <FilterPanel
          mainClasses={mainClasses || []}
          batches={filteredBatches || []}
          selectedMainClass={selectedMainClass}
          selectedBatch={selectedBatch}
          onMainClassChange={handleMainClassChange}
          onBatchChange={handleBatchChange}
          isLoading={isLoading}
        />
      </div>

      {selectedMainClass && selectedBatch && (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden transition-colors">
          <div className="p-6 border-b border-border">
            <StudentSearch
              students={students || []}
              onSearch={handleSearch}
              debounceMs={500}
            />
            {isSearching && searchResults.length > 0 && (
              <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary">
                Showing {searchResults.length} search result
                {searchResults.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-primary animate-spin" />
              <span className="ml-2 text-muted-foreground font-medium">
                Loading students...
              </span>
            </div>
          ) : displayedStudents.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground text-lg">
                {isSearching
                  ? "No students found matching your search."
                  : selectedBatch
                    ? "No students found for this batch."
                    : "Please select both a class and batch to view students."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border sticky top-0">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                      Photo
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                      Student Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                      Month
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                      Monthly Fee
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                      Fine
                    </th>
                    {showDiscountFields && (
                      <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                        Conscession
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                      Total Payable
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {displayedStudents.map((student) => (
                    <StudentRow
                      key={student._id}
                      student={student}
                      mainClassId={selectedMainClass}
                      classFees={classFeesAmount}
                      batchName={batchName}
                      onPaymentSuccess={handlePaymentSuccess}
                      showDiscount={showDiscountFields}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {displayedStudents.length > 0 && (
            <div className="bg-muted/30 border-t border-border px-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Students:</span>
                  <p className="font-bold text-lg text-primary">
                    {displayedStudents.length}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Class:</span>
                  <p className="font-bold text-primary">
                    {selectedMainClassObj?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Batch:</span>
                  <p className="font-bold text-primary">
                    {selectedBatchObj?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Fee per Student:
                  </span>
                  <p className="font-bold text-primary">₹{classFeesAmount}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-primary mb-2">
            📅 Fine Calculation
          </h3>
          <p className="text-sm text-foreground/80">
            ₹10 per day after the 10th of every month. Select a payment date and
            click "Calculate Fine" to determine the applicable fine amount.
          </p>
        </div>
        <div className="bg-success/10 border border-success/20 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-success mb-2">Cons Option</h3>
          <p className="text-sm text-foreground/80">
            Click the floating button at the bottom-right to show/hide discount
            fields for all students. Apply fixed amount discounts as needed.
          </p>
        </div>
        <div className="bg-muted/50 border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-2">
            ✓ Payment Validation
          </h3>
          <p className="text-sm text-muted-foreground">
            The Process button only enables when the paid amount exactly matches
            the calculated total (fees + fine - discount).
          </p>
        </div>
      </div>

      <DiscountToggleButton
        isVisible={showDiscountFields}
        onToggle={() => setShowDiscountFields(!showDiscountFields)}
      />

      <div className="mt-8 bg-info/10 border border-info/30 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-info mb-2">
          💡 Tips for Managing Fees
        </h3>
        <ul className="text-sm text-foreground/80 space-y-2">
          <li>
            • Use the search bar to quickly find students by name, ID, or phone
            number
          </li>
          <li>
            • Fine is calculated as ₹10 per day after the 10th of the month
          </li>
          <li>
            • Students can pay multiple months together; fines apply to each
            month separately
          </li>
          <li>
            • Discounts only reduce the payable amount; fines are not reduced
          </li>
          <li>• Payment must exactly match the total amount to process</li>
        </ul>
      </div>
    </div>
  );
};

export default Fees;