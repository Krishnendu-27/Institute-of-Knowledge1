import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  Users,
  Clock,
  Mail,
  Phone,
  CheckCircle2,
  Circle,
  GraduationCap,
  Loader2,
  Search,
  MoreVertical,
  Trash2,
  AlertTriangle,
  X,
  Edit,
  Save,
} from "lucide-react";
import useClassStore from "../../stores/useClassStore";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const CourseDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract data from the hidden routing state
  const courseId = location.state?.courseId;
  const displayCourseName = location.state?.courseName || "Course Details";

  const getClassById = useClassStore((state) => state.getClassById);
  const getStudentProgress = useClassStore((state) => state.getStudentProgress);
  const removeStudentInClass = useClassStore(
    (state) => state.removeStudentInClass,
  );
  const updateClass = useClassStore((state) => state.updateClass);
  const isLoading = useClassStore((state) => state.isLoading);

  const [courseData, setCourseData] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [loadingKeys, setLoadingKeys] = useState({});
  const [studentSearchTerm, setStudentSearchTerm] = useState("");

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdatingCourse, setIsUpdatingCourse] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    startDate: "",
    duration: "",
    endDate: "",
    fees: "",
    teacherName: "",
    teacherEmail: "",
    isActive: true,
  });

  const pageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    in: { opacity: 1, y: 0, scale: 1 },
    out: { opacity: 0, y: 20, scale: 0.98 },
  };

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) {
        navigate("/courses");
        return;
      }
      try {
        const data = await getClassById(courseId);
        setCourseData(data);
      } catch (err) {
        setLocalError("Failed to load course details. Please try again.");
      }
    };
    fetchCourseDetails();
  }, [courseId, getClassById, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleOpenEditModal = () => {
    const { mainClass } = courseData;
    setEditFormData({
      name: mainClass?.name || "",
      startDate: mainClass?.startDate
        ? new Date(mainClass.startDate).toISOString().split("T")[0]
        : "",
      duration: mainClass?.duration || "",
      endDate: mainClass?.endDate
        ? new Date(mainClass.endDate).toISOString().split("T")[0]
        : "",
      fees: mainClass?.fees || "",
      teacherName: mainClass?.teacherName || "",
      teacherEmail: mainClass?.teacherEmail || "",
      isActive: mainClass?.isActive !== undefined ? mainClass.isActive : true,
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingCourse(true);
    try {
      await updateClass(courseData.mainClass._id, editFormData);

      setCourseData((prevData) => ({
        ...prevData,
        mainClass: {
          ...prevData.mainClass,
          ...editFormData,
        },
      }));

      toast.success("Course details updated successfully!");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update course", error);
      toast.error(
        error.response?.data?.message || "Failed to update course details.",
      );
    } finally {
      setIsUpdatingCourse(false);
    }
  };

  const handleStatusToggle = async (recordId, fieldName, currentValue) => {
    const updateKey = `${recordId}-${fieldName}`;
    setLoadingKeys((prev) => ({ ...prev, [updateKey]: true }));

    try {
      await getStudentProgress(recordId, { [fieldName]: !currentValue });
      setCourseData((prevData) => {
        const updatedProgress = prevData.studentsProgress.map((record) => {
          if (record._id === recordId) {
            return { ...record, [fieldName]: !currentValue };
          }
          return record;
        });
        return { ...prevData, studentsProgress: updatedProgress };
      });
      toast.success("Status update successfully !!");
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error(error.message || "An error occurred");
    } finally {
      setLoadingKeys((prev) => {
        const newKeys = { ...prev };
        delete newKeys[updateKey];
        return newKeys;
      });
    }
  };

  const handleConfirmRemove = async () => {
    if (!studentToRemove) return;
    setIsRemoving(true);

    try {
      await removeStudentInClass({
        mainClassId: courseData.mainClass._id,
        studentId: studentToRemove.student._id,
      });

      setCourseData((prevData) => {
        const updatedProgress = prevData.studentsProgress.filter(
          (record) => record?.student?._id !== studentToRemove?.student?._id,
        );

        const updatedMainClassStudents =
          prevData.mainClass?.students?.filter(
            (s) => s?._id !== studentToRemove?.student?._id,
          ) || [];

        return {
          ...prevData,
          studentsProgress: updatedProgress,
          mainClass: {
            ...prevData.mainClass,
            students: updatedMainClassStudents,
          },
        };
      });
      toast.success("Student Removed Successfully !!");
      setStudentToRemove(null);
    } catch (err) {
      console.error("Failed to remove student", err);
      toast.error(err.response?.data?.message || "Failed to remove student.");
    } finally {
      setIsRemoving(false);
    }
  };

  if (isLoading || (!courseData && !localError)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-lg">Loading {displayCourseName}...</p>
      </div>
    );
  }

  if (localError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl max-w-2xl mx-auto text-center">
          <p>{localError}</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-red-100 rounded-lg hover:bg-red-200 transition font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { mainClass, studentsProgress } = courseData;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const ToggleButton = ({ recordId, fieldName, status }) => {
    const isUpdating = !!loadingKeys[`${recordId}-${fieldName}`];

    return (
      <button
        onClick={() => handleStatusToggle(recordId, fieldName, status)}
        disabled={isUpdating}
        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 group flex items-center justify-center mx-auto"
        title={`Toggle ${fieldName}`}
      >
        {isUpdating ? (
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
        ) : status ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
        ) : (
          <Circle className="w-5 h-5 text-slate-300 group-hover:text-slate-400 transition-colors" />
        )}
      </button>
    );
  };

  const filteredStudents =
    studentsProgress?.filter((record) => {
      const searchLower = studentSearchTerm.toLowerCase();
      return (
        record?.student?.name?.toLowerCase().includes(searchLower) ||
        record?.student?.email?.toLowerCase().includes(searchLower) ||
        record?.rollno?.toString().includes(searchLower)
      );
    }) || [];

  return (
    <>
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-slate-50 p-6 md:p-8"
      >
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                {/* <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                  {mainClass?.name || displayCourseName}
                </h1> */}
                <p className="text-slate-500 flex items-center gap-2 mt-1">
                  <span
                    className={`w-2 h-2 rounded-full ${mainClass?.isActive ? "bg-emerald-500" : "bg-red-500"}`}
                  ></span>
                  {mainClass?.isActive ? "Active Course" : "Inactive Course"} •
                  Created on {formatDate(mainClass?.createdAt)}
                </p>
              </div>
            </div>

            {/* Edit Course Button */}
            <button
              onClick={handleOpenEditModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-medium"
            >
              <Edit className="w-4 h-4" />
              Edit Course
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 md:col-span-2 space-y-6">
              {/* <h2 className="text-2xl font-semibold text-slate-800 border-b border-slate-100 pb-2 capitalize">
              {mainClass?.name || displayCourseName}
              </h2> */}

              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 Ca">
                {mainClass?.name || displayCourseName}
              </h1>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-slate-400 text-sm flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> Start Date
                  </span>
                  <p className="font-medium text-slate-900">
                    {formatDate(mainClass?.startDate)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 text-sm flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> End Date
                  </span>
                  <p className="font-medium text-slate-900">
                    {formatDate(mainClass?.endDate)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Duration
                  </span>
                  <p className="font-medium text-slate-900">
                    {mainClass?.duration || 0} Months
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 text-sm flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4" /> Fees
                  </span>
                  <p className="font-medium text-slate-900 text-indigo-600">
                    ₹{mainClass?.fees || 0}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-medium text-slate-500 mb-3">
                  Instructor Details
                </h3>
                <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-900">
                      {mainClass?.teacherName || "Unassigned"}
                    </p>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3.5 h-3.5" />{" "}
                      {mainClass?.teacherEmail || "No Email Provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">
                Batches & Capacity
              </h2>
              <div className="flex items-center gap-4 bg-indigo-50 border border-indigo-100 text-indigo-700 p-4 rounded-xl">
                <Users className="w-8 h-8 text-indigo-500 bg-white p-1.5 rounded-lg shadow-sm" />
                <div>
                  <p className="text-2xl font-bold">
                    {mainClass?.students?.length || 0}
                  </p>
                  <p className="text-sm font-medium opacity-80">
                    Total Students Enrolled
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">
                  Assigned Batches
                </h3>
                <div className="space-y-2">
                  {mainClass?.batches?.map((batch) => (
                    <div
                      key={batch?._id || Math.random()}
                      className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      {batch?.name}
                    </div>
                  ))}
                  {(!mainClass?.batches || mainClass.batches.length === 0) && (
                    <p className="text-sm text-slate-400 italic">
                      No batches assigned yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Student Progress Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
            <div className="p-6 border-b border-slate-200 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-t-2xl">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <GraduationCap className="text-indigo-500" />
                Student Progress Tracker
              </h2>

              {studentsProgress?.length > 0 && (
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                  />
                </div>
              )}
            </div>

            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-16">Roll No</th>
                    <th className="px-6 py-4 font-semibold">Student Info</th>
                    <th className="px-6 py-4 font-semibold">Join Date</th>
                    <th className="px-6 py-4 font-semibold text-center">
                      Batch Status
                    </th>
                    <th className="px-6 py-4 font-semibold text-center">
                      Exam Cleared
                    </th>
                    <th className="px-6 py-4 font-semibold text-center">
                      Certificate
                    </th>
                    <th className="px-6 py-4 font-semibold text-center w-16">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 pb-20">
                  {studentsProgress?.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-12 text-center text-slate-400"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Users className="w-8 h-8 opacity-50" />
                          <p>No students enrolled in this course yet.</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        <p>No students match your search term.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((record) => (
                      <tr
                        key={record?._id || Math.random()}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                            #{record?.rollno || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">
                            {record?.student?.name || "Unknown Student"}
                          </p>
                          <div className="flex items-center gap-3 text-slate-500 text-xs mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />{" "}
                              {record?.student?.email || "No Email"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />{" "}
                              {record?.student?.phone || "No Phone"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDate(record?.joinDate)}
                        </td>

                        <td className="px-6 py-4 align-middle text-center">
                          <ToggleButton
                            recordId={record?._id}
                            fieldName="batchcompletion"
                            status={record?.batchcompletion}
                          />
                        </td>
                        <td className="px-6 py-4 align-middle text-center">
                          <ToggleButton
                            recordId={record?._id}
                            fieldName="examcompletion"
                            status={record?.examcompletion}
                          />
                        </td>
                        <td className="px-6 py-4 align-middle text-center">
                          <ToggleButton
                            recordId={record?._id}
                            fieldName="certificateIssued"
                            status={record?.certificateIssued}
                          />
                        </td>

                        <td className="px-6 py-4 align-middle text-center relative">
                          {activeDropdown === record?._id && (
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveDropdown(null)}
                            />
                          )}

                          <button
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === record?._id
                                  ? null
                                  : record?._id,
                              )
                            }
                            className={`p-1.5 rounded-lg transition-colors relative z-20 ${
                              activeDropdown === record?._id
                                ? "bg-indigo-50 text-indigo-600"
                                : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            }`}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          <AnimatePresence>
                            {activeDropdown === record?._id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-10 top-10 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden"
                              >
                                <button
                                  onClick={() => {
                                    setStudentToRemove(record);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remove Student
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Remove Student Modal */}
      <AnimatePresence>
        {studentToRemove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative"
            >
              <button
                onClick={() => !isRemoving && setStudentToRemove(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Remove Student?
                </h3>
                <p className="text-slate-500 mb-1">
                  Are you sure you want to remove{" "}
                  <strong className="text-slate-800">
                    {studentToRemove?.student?.name || "this student"}
                  </strong>{" "}
                  from this course?
                </p>
                <p className="text-sm text-red-500 font-medium">
                  This action cannot be undone. Progress tracking will be lost.
                </p>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button
                  onClick={() => setStudentToRemove(null)}
                  disabled={isRemoving}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRemove}
                  disabled={isRemoving}
                  className="px-4 py-2 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-2 shadow-sm shadow-red-200 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isRemoving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Course Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Edit className="w-5 h-5 text-indigo-600" />
                  Edit Course Details
                </h3>
                <button
                  onClick={() => !isUpdatingCourse && setIsEditModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <form
                  id="editCourseForm"
                  onSubmit={handleEditSubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-medium text-slate-700">
                        Course Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={editFormData.name}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        required
                        value={editFormData.startDate}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        required
                        value={editFormData.endDate}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">
                        Duration (Months)
                      </label>
                      <input
                        type="number"
                        name="duration"
                        required
                        min="1"
                        value={editFormData.duration}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">
                        Fees (₹)
                      </label>
                      <input
                        type="number"
                        name="fees"
                        required
                        min="0"
                        value={editFormData.fees}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">
                        Instructor Name
                      </label>
                      <input
                        type="text"
                        name="teacherName"
                        required
                        value={editFormData.teacherName}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">
                        Instructor Email
                      </label>
                      <input
                        type="email"
                        name="teacherEmail"
                        required
                        value={editFormData.teacherEmail}
                        onChange={handleEditFormChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div className="md:col-span-2 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={editFormData.isActive}
                          onChange={handleEditFormChange}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-slate-700">
                          Course is Active
                        </span>
                      </label>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isUpdatingCourse}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="editCourseForm"
                  disabled={isUpdatingCourse}
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isUpdatingCourse ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CourseDetails;
