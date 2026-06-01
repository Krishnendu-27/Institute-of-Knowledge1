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
import useAuthStore from "../../stores/useAuthStore";
import useUserStore from "../../stores/useUserStore";
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
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <div className="w-8 h-8 animate-spin text-primary mb-4 border-4 border-primary/20 border-t-primary rounded-full"></div>
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
      className="min-h-screen bg-background p-6 md:p-8 transition-colors duration-300"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-primary hover:opacity-80 font-medium transition-opacity"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm transition-colors">
          {/* Header Banner */}
          <div className="h-24 bg-primary/20"></div>

          <div className="px-6 md:px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 -mt-12 mb-6">
              {studentData.profilePic ? (
                <img
                  src={studentData.profilePic}
                  alt={studentData.name}
                  className="w-24 h-24 rounded-2xl object-cover bg-muted border-4 border-card shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-3xl border-4 border-card shadow-lg">
                  {studentData.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 pt-2">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {studentData.name}
                </h1>
                <div className="flex flex-wrap gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail size={18} className="text-muted-foreground/70" />
                    {studentData.email}
                  </div>
                  {studentData.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={18} className="text-muted-foreground/70" />
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
                    <h2 className="text-xl font-bold text-foreground mb-4">
                      Your Enrolled Classes
                    </h2>
                    <div className="space-y-4">
                      {studentData.mainClasses.map((mainClass) => {
                        const key = `${user._id}_${mainClass._id}`;
                        const progress = studentProgress[key] || {};
                        return (
                          <div
                            key={mainClass._id}
                            className="bg-muted/30 rounded-xl p-4 border border-border hover:border-primary/50 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-foreground">
                                  {mainClass.name}
                                </h3>
                                <div className="flex flex-wrap gap-4 mt-1 text-sm text-muted-foreground">
                                  <div>
                                    Duration: {mainClass.duration} months
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
                              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
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
                                  color: "primary",
                                },
                                {
                                  key: "examComplete",
                                  field: "examcompletion",
                                  icon: FileText,
                                  label: "Exam Complete",
                                  color: "accent",
                                },
                                {
                                  key: "certificateComplete",
                                  field: "certificateIssued",
                                  icon: Check,
                                  label: "Certificate Issued",
                                  color: "success",
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

                                  // Map colors to theme variables
                                  const colorClass =
                                    color === "primary"
                                      ? "bg-primary/10 border-primary/30"
                                      : color === "accent"
                                        ? "bg-accent/50 border-accent-foreground/30"
                                        : "bg-success/10 border-success/30";

                                  const textColorClass =
                                    color === "primary"
                                      ? "text-primary"
                                      : color === "accent"
                                        ? "text-accent-foreground"
                                        : "text-success";

                                  const iconBgClass =
                                    color === "primary"
                                      ? "bg-primary/20"
                                      : color === "accent"
                                        ? "bg-accent"
                                        : "bg-success/20";

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
                                          ? `${colorClass}`
                                          : "bg-card border-border hover:border-primary/50"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div
                                          className={`p-2.5 rounded-lg ${
                                            isComplete
                                              ? iconBgClass
                                              : "bg-muted"
                                          }`}
                                        >
                                          <Icon
                                            size={20}
                                            className={
                                              isComplete
                                                ? textColorClass
                                                : "text-muted-foreground"
                                            }
                                          />
                                        </div>
                                        {isComplete && (
                                          <div className="bg-success text-success-foreground rounded-full p-1">
                                            <Check size={16} strokeWidth={3} />
                                          </div>
                                        )}
                                      </div>
                                      <p
                                        className={`font-semibold text-sm ${
                                          isComplete
                                            ? textColorClass
                                            : "text-muted-foreground"
                                        }`}
                                      >
                                        {label}
                                      </p>
                                      {isComplete && (
                                        <p className="text-xs opacity-70 mt-1">
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
                  <h2 className="text-xl font-bold text-foreground mb-4">
                    Your Assigned Batches
                  </h2>
                  <div className="space-y-3">
                    {studentData.batches.map((batch) => (
                      <div
                        key={batch._id}
                        className="bg-muted/30 rounded-xl p-4 border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {batch.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
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
                  <div className="bg-card rounded-2xl border border-border border-dashed p-12 text-center">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-muted-foreground/60" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No Classes Enrolled
                    </h3>
                    <p className="text-muted-foreground">
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
