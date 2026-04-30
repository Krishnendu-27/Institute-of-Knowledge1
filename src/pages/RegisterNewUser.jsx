import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Upload,
  X,
  FileText,
  Eye,
  Trash2,
  Image as ImageIcon,
  FileBadge,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import useUserStore from "../stores/useUserStore";
import useClassStore from "../stores/useClassStore";
import toast, { ErrorIcon } from "react-hot-toast";

const RegisterNewUser = () => {
  const { addUser, isLoading: isAddingUser, error, success } = useUserStore();
  const {
    allClass = [],
    getClasses,
    isLoading: isClassesLoading,
    resetStatus,
  } = useClassStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Student",
    adhar: "",
    mainClasses: [],
  });

  const [profilePic, setProfilePic] = useState(null);
  const [documents, setDocuments] = useState([]);

  const [profilePreview, setProfilePreview] = useState(null);
  const [viewingFile, setViewingFile] = useState(null);
  
  useEffect(() => {
    if (getClasses) {
      getClasses();
    }
  }, [getClasses]);

  useEffect(() => {
    return () => {
      resetStatus();
      useUserStore.setState({ error: null, success: false });
    };
  }, [resetStatus]);

  useEffect(() => {
    let timer;

    if (success) {
      toast.success("User added successfully!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "Student",
        adhar: "",
        mainClasses: [],
      });
      setProfilePic(null);
      setProfilePreview(null);
      setDocuments([]);
    }

    if (error) {
      if (error.startsWith("E11000")) {
        toast.error("Aadhar already exists !!");
      } else {
        toast.error(error);
      }
    }

    if (error || success) {
      timer = setTimeout(() => {
        useUserStore.setState({ error: null, success: false });
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [success, error]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData({ ...formData, phone: value });
  };

  const handleAdharChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 12) value = value.slice(0, 12);

    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setFormData({ ...formData, adhar: formatted });
  };

  const toggleClassSelection = (classId) => {
    setFormData((prev) => {
      const currentClasses = prev.mainClasses;
      if (currentClasses.includes(classId)) {
        return {
          ...prev,
          mainClasses: currentClasses.filter((id) => id !== classId),
        };
      } else {
        return { ...prev, mainClasses: [...currentClasses, classId] };
      }
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error(
          "Only image files (JPG, PNG) are allowed for the profile photo.",
        );
        return;
      }

      setProfilePic(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleDocChange = (e) => {
    const files = Array.from(e.target.files);

    const hasNonImage = files.some((file) => !file.type.startsWith("image/"));
    if (hasNonImage) {
      toast.error("Only image files (JPG, PNG) are allowed.");
      return;
    }

    if (documents.length + files.length > 3) {
      toast.error("Maximum 3 documents allowed");
      return;
    }
    setDocuments([...documents, ...files]);
  };

  const removeDocument = (index) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const openPreview = (file) => {
    const url = URL.createObjectURL(file);
    setViewingFile({ url, type: file.type, name: file.name });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (formData.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }

    const rawAdhar = formData.adhar.replace(/\s/g, ""); // Strip spaces for backend
    if (formData.role === "Student" && rawAdhar.length !== 12) {
      toast.error("Aadhar number must be exactly 12 digits.");
      return;
    }

    if (formData.mainClasses.length === 0) {
      toast.error(
        `Please select at least one ${formData.role === "Student" ? "enrolled" : "assigned"} course.`,
      );
      return;
    }

    const data = new FormData();

    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("role", formData.role);

    if (formData.role === "Student") {
      data.append("adhar", rawAdhar);
    }

    formData.mainClasses.forEach((clsId) => {
      data.append("mainClasses", clsId);
    });

    if (profilePic) data.append("profilePic", profilePic);
    documents.forEach((doc) => data.append("documents", doc));
    await addUser(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 flex items-center justify-center transition-colors duration-200">
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
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-4">
                  {viewingFile.name}
                </h3>
                <button
                  onClick={() => setViewingFile(null)}
                  className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
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
                  <div className="text-slate-500 dark:text-slate-400 flex flex-col items-center gap-3">
                    <FileBadge size={48} />
                    <p>Preview not available for this file type.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors duration-200"
      >
        {/* <div className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:bg-indigo-700 p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <UserPlus size={28} /> Register New User
            </h2>
            <p className="text-indigo-100 mt-1">
              Register a new student or teacher to the Institute
            </p>
          </div>
        </div> */}

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Account Role
                </label>
                <div className="flex gap-4">
                  {["Student", "Teacher"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          role: r,
                          mainClasses: [],
                          adhar: "",
                        })
                      }
                      className={`flex-1 py-3 rounded-xl border-2 transition-all font-medium flex items-center justify-center gap-2 ${
                        formData.role === r
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm"
                          : "border-slate-200 bg-slate-50 text-slate-500 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                      }`}
                      disabled={isAddingUser}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all"
                    placeholder="John Doe"
                    onChange={handleInputChange}
                    disabled={isAddingUser}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all"
                      placeholder="john@example.com"
                      onChange={handleInputChange}
                      disabled={isAddingUser}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Phone (10 Digits) *
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      required
                      className={`w-full px-4 py-3 rounded-xl border ${
                        formData.phone.length > 0 && formData.phone.length < 10
                          ? "border-amber-400 focus:ring-amber-400"
                          : "border-slate-300 dark:border-slate-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      } bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none transition-all`}
                      placeholder="9876543210"
                      onChange={handlePhoneChange}
                      disabled={isAddingUser}
                    />
                    {formData.phone.length > 0 &&
                      formData.phone.length < 10 && (
                        <p className="text-amber-500 text-xs mt-2 flex items-center gap-1">
                          <AlertCircle size={14} /> Must be exactly 10 digits.
                        </p>
                      )}
                  </div>
                </div>

                <AnimatePresence>
                  {formData.role === "Student" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 mt-1">
                        Aadhar Number (12 Digits) *
                      </label>
                      <input
                        type="text"
                        name="adhar"
                        value={formData.adhar}
                        required={formData.role === "Student"}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          formData.adhar.replace(/\s/g, "").length > 0 &&
                          formData.adhar.replace(/\s/g, "").length < 12
                            ? "border-amber-400 focus:ring-amber-400"
                            : "border-slate-300 dark:border-slate-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                        } bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none transition-all`}
                        placeholder="XXXX XXXX XXXX"
                        onChange={handleAdharChange}
                        disabled={isAddingUser}
                      />
                      {formData.adhar.replace(/\s/g, "").length > 0 &&
                        formData.adhar.replace(/\s/g, "").length < 12 && (
                          <p className="text-amber-500 text-xs mt-2 flex items-center gap-1">
                            <AlertCircle size={14} /> Must be exactly 12 digits.
                          </p>
                        )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    {formData.role === "Student"
                      ? "Enrolled Courses"
                      : "Assigned Courses"}{" "}
                    *
                  </label>

                  {isClassesLoading ? (
                    <div className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent mr-3" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Loading courses...
                      </span>
                    </div>
                  ) : allClass.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                      No courses available. Please create classes first.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 no-scrollbar">
                      {allClass.map((cls) => {
                        const isSelected = formData.mainClasses.includes(
                          cls._id,
                        );
                        return (
                          <button
                            key={cls._id}
                            type="button"
                            onClick={() => toggleClassSelection(cls._id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                              isSelected
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                                : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-400"
                            }`}
                            disabled={isAddingUser}
                          >
                            {isSelected && <CheckCircle2 size={16} />}
                            {cls.name || cls.className || "Unnamed Class"}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                  Profile Photo
                </label>
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    {profilePreview ? (
                      <div className="relative">
                        <img
                          src={profilePreview}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-600 shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() =>
                            setViewingFile({
                              url: profilePreview,
                              type: "image/jpeg",
                              name: "Profile Photo Preview",
                            })
                          }
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfilePreview(null);
                            setProfilePic(null);
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-slate-400">
                        <Upload size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium py-2 px-4 rounded-lg transition-colors text-sm inline-block">
                      Browse Files
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isAddingUser}
                      />
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      JPG, PNG up to 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {formData.role === "Student" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 overflow-hidden"
                  >
                    <div className="flex justify-between items-end mb-4">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Supporting Documents
                      </label>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {documents.length} / 3 Uploaded
                      </span>
                    </div>

                    <label className="block w-full py-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 text-center mb-4">
                      <FileText
                        size={28}
                        className="mx-auto text-indigo-500 mb-2"
                      />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Click to upload files
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        JPG, PNG allowed
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleDocChange}
                        disabled={isAddingUser}
                      />
                    </label>

                    <div className="space-y-2">
                      {documents.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            {doc.type.startsWith("image/") ? (
                              <ImageIcon
                                size={18}
                                className="text-blue-500 flex-shrink-0"
                              />
                            ) : (
                              <FileText
                                size={18}
                                className="text-red-500 flex-shrink-0"
                              />
                            )}
                            <span className="text-sm text-slate-700 dark:text-slate-300 truncate font-medium">
                              {doc.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openPreview(doc)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                              title="Preview Document"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeDocument(idx)}
                              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                              title="Remove Document"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="submit"
              disabled={
                isAddingUser ||
                (formData.role === "Student" &&
                  formData.adhar.replace(/\s/g, "").length !== 12 &&
                  formData.adhar.length > 0) ||
                (formData.phone.length !== 10 && formData.phone.length > 0)
              }
              className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-lg flex justify-center items-center gap-2"
            >
              {isAddingUser ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Creating Profile...
                </>
              ) : (
                "Create User Profile"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterNewUser;
