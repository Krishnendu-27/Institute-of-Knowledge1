import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Mail,
  Phone,
  BookOpen,
  FileText,
  Check,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import useAuthStore from "../stores/useAuthStore";
import useUserStore from "../stores/useUserStore";
import { useNavigate } from "react-router-dom";

const StudentProfile = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentProgress = useUserStore((state) => state.studentProgress);
  const getStudentProgress = useUserStore((state) => state.getStudentProgress);
  const updateStudentProgress = useUserStore(
    (state) => state.updateStudentProgress,
  );
  const [loadingProgress, setLoadingProgress] = useState({});

  useEffect(() => {
    // Simulate loading student data
    if (user && user._id) {
      setStudentData({
        _id: user._id,
        name: user.name || "Student",
        email: user.email || "",
        phone: user.phone || "",
        profilePic: user.profilePic || null,
        mainClasses: user.mainClasses || [],
        batches: user.batches || [],
      });

      // Fetch progress for all classes
      if (Array.isArray(user.mainClasses) && user.mainClasses.length > 0) {
        user.mainClasses.forEach((mainClass) => {
          getStudentProgress(user._id, mainClass._id);
        });
      }

      setLoading(false);
    }
  }, [user, getStudentProgress]);

  const toggleProgressCheckbox = async (mainClassId, field) => {
    if (!user || !studentData) return;

    const key = `${user._id}_${mainClassId}`;
    const currentProgress = studentProgress[key] || {};
    const newValue =
      !currentProgress[
        field === "courseComplete"
          ? "batchcompletion"
          : field === "examComplete"
            ? "examcompletion"
            : "certificateIssued"
      ];

    // Show loading state
    setLoadingProgress((prev) => ({
      ...prev,
      [`${key}_${field}`]: true,
    }));

    const progressData = {
      batchcompletion:
        field === "courseComplete" ? newValue : currentProgress.batchcompletion,
      examcompletion:
        field === "examComplete" ? newValue : currentProgress.examcompletion,
      certificateIssued:
        field === "certificateComplete"
          ? newValue
          : currentProgress.certificateIssued,
    };

    try {
      const result = await updateStudentProgress(
        user._id,
        mainClassId,
        progressData,
      );

      if (result) {
        const fieldLabel =
          field === "courseComplete"
            ? "Course"
            : field === "examComplete"
              ? "Exam"
              : "Certificate";
        toast.success(`${fieldLabel} status updated successfully!`);
      } else {
        toast.error("Failed to update progress. Please try again.");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Error updating progress. Please try again.");
    } finally {
      setLoadingProgress((prev) => ({
        ...prev,
        [`${key}_${field}`]: false,
      }));
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 20 },
  };

  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3,
  };

  if (loading || !studentData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="w-8 h-8 animate-spin text-indigo-600 mb-4 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-screen bg-slate-50 p-6 md:p-8"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
          <div className="h-24 bg-gradient-to-r from-indigo-600 to-purple-600"></div>

          <div className="px-6 md:px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 -mt-12 mb-6">
              {studentData.profilePic ? (
                <img
                  src={studentData.profilePic}
                  alt={studentData.name}
                  className="w-24 h-24 rounded-2xl object-cover bg-slate-100 border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-lg">
                  {studentData.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 pt-2">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {studentData.name}
                </h1>
                <div className="flex flex-wrap gap-4 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail size={18} className="text-slate-400" />
                    {studentData.email}
                  </div>
                  {studentData.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={18} className="text-slate-400" />
                      {studentData.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {studentData.mainClasses &&
                studentData.mainClasses.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                      Your Enrolled Classes
                    </h2>
                    <div className="space-y-4">
                      {studentData.mainClasses.map((mainClass) => {
                        const key = `${user._id}_${mainClass._id}`;
                        const progress = studentProgress[key] || {};
                        return (
                          <div
                            key={mainClass._id}
                            className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-indigo-300 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-slate-900">
                                  {mainClass.name}
                                </h3>
                                <div className="flex flex-wrap gap-4 mt-1 text-sm text-slate-600">
                                  <div>
                                    Duration: {mainClass.duration} hours
                                  </div>
                                  <div>
                                    Start:{" "}
                                    {new Date(
                                      mainClass.startDate,
                                    ).toLocaleDateString()}
                                  </div>
                                  <div>
                                    End:{" "}
                                    {new Date(
                                      mainClass.endDate,
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                ₹ {mainClass.fees}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              {[
                                {
                                  key: "courseComplete",
                                  field: "batchcompletion",
                                  icon: BookOpen,
                                  label: "Course Complete",
                                  color: "indigo",
                                },
                                {
                                  key: "examComplete",
                                  field: "examcompletion",
                                  icon: FileText,
                                  label: "Exam Complete",
                                  color: "purple",
                                },
                                {
                                  key: "certificateComplete",
                                  field: "certificateIssued",
                                  icon: Check,
                                  label: "Certificate Issued",
                                  color: "emerald",
                                },
                              ].map(
                                ({
                                  key: fieldKey,
                                  field,
                                  icon: Icon,
                                  label,
                                  color,
                                }) => {
                                  const isComplete = progress[field];
                                  const colorClass =
                                    color === "indigo"
                                      ? "from-indigo-50 to-indigo-100 border-indigo-200"
                                      : color === "purple"
                                        ? "from-purple-50 to-purple-100 border-purple-200"
                                        : "from-emerald-50 to-emerald-100 border-emerald-200";
                                  const textColorClass =
                                    color === "indigo"
                                      ? "text-indigo-600"
                                      : color === "purple"
                                        ? "text-purple-600"
                                        : "text-emerald-600";

                                  return (
                                    <button
                                      key={fieldKey}
                                      onClick={() =>
                                        toggleProgressCheckbox(
                                          mainClass._id,
                                          fieldKey,
                                        )
                                      }
                                      disabled={
                                        loadingProgress[`${key}_${fieldKey}`]
                                      }
                                      className={`relative rounded-xl p-4 border-2 transition-all disabled:opacity-50 ${
                                        isComplete
                                          ? `bg-gradient-to-br ${colorClass} border-${color}-300`
                                          : "bg-white border-slate-200 hover:border-slate-300"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div
                                          className={`p-2.5 rounded-lg ${
                                            isComplete
                                              ? `bg-${color}-100`
                                              : "bg-slate-100"
                                          }`}
                                        >
                                          <Icon
                                            size={20}
                                            className={
                                              isComplete
                                                ? textColorClass
                                                : "text-slate-400"
                                            }
                                          />
                                        </div>
                                        {isComplete && (
                                          <div className="bg-green-500 text-white rounded-full p-1">
                                            <Check size={16} />
                                          </div>
                                        )}
                                      </div>
                                      <p
                                        className={`font-semibold text-sm ${
                                          isComplete
                                            ? textColorClass
                                            : "text-slate-600"
                                        }`}
                                      >
                                        {label}
                                      </p>
                                      {isComplete && (
                                        <p className="text-xs text-slate-500 mt-1">
                                          Completed
                                        </p>
                                      )}
                                    </button>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {studentData.batches && studentData.batches.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    Your Assigned Batches
                  </h2>
                  <div className="space-y-3">
                    {studentData.batches.map((batch) => (
                      <div
                        key={batch._id}
                        className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-purple-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {batch.name}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">
                              <Calendar size={14} className="inline mr-1" />
                              {batch.weekday} • {batch.startTime} -{" "}
                              {batch.endTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!studentData.mainClasses ||
                studentData.mainClasses.length === 0) &&
                (!studentData.batches || studentData.batches.length === 0) && (
                  <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No Classes Enrolled
                    </h3>
                    <p className="text-slate-500">
                      You haven't enrolled in any classes yet. Check the courses
                      page to explore available options.
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentProfile;
