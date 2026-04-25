import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  Edit3,
  Save,
  X,
  Camera,
  FileText,
  UploadCloud,
  BookOpen,
  Fingerprint,
  ExternalLink,
  ChevronRight,
  Phone,
  CreditCard,
  ZoomIn,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../stores/useAuthStore";
import useUserStore from "../stores/useUserStore";
import { getStudentId } from "../util/getStudentId";

const ProfilePage = () => {
  const globalUser = useAuthStore((state) => state.user);
  const updateUser = useUserStore((state) => state.updateUser);
  const isUpdating = useUserStore((state) => state.isLoading);

  const user = globalUser || {};
  const isAdmin = user.role === "Admin";

  const [isEditing, setIsEditing] = useState(false);

  // Modal States
  const [activeDocument, setActiveDocument] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showProfilePicModal, setShowProfilePicModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    adhar: user.adhar || "",
    mainClasses: user.mainClasses ? user.mainClasses.join(", ") : "",
  });

  useEffect(() => {
    if (globalUser) {
      setFormData({
        name: globalUser.name || "",
        email: globalUser.email || "",
        phone: globalUser.phone || "",
        adhar: globalUser.adhar || "",
        mainClasses: globalUser.mainClasses
          ? globalUser.mainClasses.join(", ")
          : "",
      });
    }
  }, [globalUser]);

  // File States
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [newProfilePreview, setNewProfilePreview] = useState(null);
  const [newDocuments, setNewDocuments] = useState([]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePic(file);
      setNewProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleDocChange = (e) => {
    const files = Array.from(e.target.files);
    setNewDocuments([...newDocuments, ...files]);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      adhar: user.adhar || "",
      mainClasses: user.mainClasses ? user.mainClasses.join(", ") : "",
    });
    setNewProfilePic(null);
    setNewProfilePreview(null);
    setNewDocuments([]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      return toast.error("Access denied. Admin privileges required.");
    }
    if (!user._id) return toast.error("User ID is missing.");

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("email", formData.email);
    submitData.append("phone", formData.phone);
    submitData.append("adhar", formData.adhar);

    let parsedClasses = [];
    if (formData.mainClasses) {
      parsedClasses = formData.mainClasses
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      parsedClasses.forEach((cls) => {
        submitData.append("mainClasses", cls);
      });
    }

    if (newProfilePic) {
      submitData.append("profilePic", newProfilePic);
    }

    if (newDocuments.length > 0) {
      newDocuments.forEach((doc) => {
        submitData.append("documents", doc);
      });
    }

    try {
      const response = await updateUser(user._id, submitData);
      const updatedUserData = response?.data || {
        ...globalUser,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        adhar: formData.adhar,
        mainClasses: parsedClasses,
        profilePicUrl: newProfilePreview || globalUser.profilePic,
      };

      useAuthStore.setState({ user: updatedUserData });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setNewProfilePic(null);
      setNewDocuments([]);
    } catch (error) {
      toast.error(error.message || "Something went wrong while updating.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDocName = (doc, idx) => {
    if (typeof doc === "string")
      return doc.split("/").pop() || `Document_${idx + 1}`;
    return doc.name || doc.originalName || `Document_${idx + 1}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  if (!globalUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="relative flex justify-center items-center">
          <div className="absolute animate-ping w-12 h-12 rounded-full bg-indigo-500 opacity-75"></div>
          <div className="relative w-8 h-8 rounded-full bg-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative  px-4 sm:px-8 overflow-hidden bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 dark:bg-purple-600/20 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          {/* {isAdmin && !isEditing && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="group flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-full font-semibold shadow-sm hover:shadow-indigo-500/20 transition-all"
            >
              <Edit3
                size={16}
                className="text-indigo-500 group-hover:rotate-12 transition-transform"
              />
              <span>Edit Details</span>
            </motion.button>
          )} */}
        </div>

        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.div
              key="view-mode"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: Identity Card */}
              <motion.div
                variants={itemVariants}
                className="lg:col-span-4 flex flex-col gap-6"
              >
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 rounded-3xl p-8 flex flex-col items-center text-center shadow-xl shadow-indigo-100/20 dark:shadow-none">
                  {/* Profile Picture */}
                  <div className="relative group mb-6">
                    <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-500">
                      <div
                        onClick={() =>
                          user.profilePic && setShowProfilePicModal(true)
                        }
                        className={`w-full h-full rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center relative ${user.profilePic ? "cursor-pointer group/pic" : ""}`}
                      >
                        {user.profilePic ? (
                          <>
                            <img
                              src={user.profilePic}
                              alt="Profile"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/pic:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/pic:opacity-100 transition-opacity z-10">
                              <ZoomIn className="text-white" size={28} />
                            </div>
                          </>
                        ) : (
                          <User
                            size={64}
                            className="text-slate-300 dark:text-slate-600"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setShowUserModal(true)}
                    className="cursor-pointer group/name relative inline-block mb-1"
                  >
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white group-hover/name:text-indigo-500 transition-colors">
                      {user.name}
                    </h2>
                    <ExternalLink
                      size={14}
                      className="absolute -right-5 top-2 opacity-0 group-hover/name:opacity-100 text-indigo-500 transition-opacity"
                    />
                  </div>

                  <div className="w-full bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 flex justify-between items-center border border-indigo-100 dark:border-indigo-800/30">
                    <span className="text-sm text-indigo-700 dark:text-indigo-400 font-medium">
                      Institute ID
                    </span>
                    <span className="text-indigo-800 dark:text-indigo-300 font-mono font-bold tracking-wider">
                      {getStudentId()}
                    </span>
                  </div>

                  {/* Contact Info Block */}
                  <div className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 mt-4 mb-6 flex flex-col gap-3 border border-slate-200 dark:border-slate-700/50">
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm font-medium">
                      <Mail size={16} className="text-slate-400" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm font-medium">
                      <Phone size={16} className="text-slate-400" />
                      <span>{user.phone || "No phone linked"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm font-medium">
                      <CreditCard size={16} className="text-slate-400" />
                      <span>
                        {user.adhar
                          ? `XXXX-XXXX-${user.adhar.slice(-4)}`
                          : "No Aadhar linked"}
                      </span>
                    </div>
                  </div>

                  <div className="w-full flex flex-col gap-3">
                    <div className="w-full bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-4 flex justify-between items-center border border-slate-200 dark:border-slate-700/50">
                      <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Access Level
                      </span>
                      <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Bento Details & Documents */}
              <motion.div
                variants={itemVariants}
                className="lg:col-span-8 flex flex-col gap-6"
              >
                {/* Stats Row */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 rounded-3xl p-6 shadow-lg shadow-slate-100/20 dark:shadow-none group hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                        <BookOpen size={24} />
                      </div>
                      <h3 className="font-semibold text-slate-600 dark:text-slate-300">
                        Enrolled Classes
                      </h3>
                    </div>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">
                      {user.mainClasses?.length > 0
                        ? user.mainClasses.join(", ")
                        : "Not enrolled any Class yet !!"}
                    </p>
                  </div>
                </div>

                {/* Documents Grid */}
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 rounded-3xl p-6 sm:p-8 flex-1 shadow-lg shadow-slate-100/20 dark:shadow-none">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <FileText className="text-indigo-500" /> Uploaded
                      Documents
                    </h3>
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-1 px-3 rounded-full text-sm font-bold">
                      {user.documents?.length || 0} Files
                    </span>
                  </div>

                  {user.documents?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user.documents.map((doc, idx) => {
                        const docName = getDocName(doc, idx);

                        // Safely extract the URL for the image
                        const docUrl =
                          typeof doc === "string"
                            ? doc
                            : doc.url ||
                              (doc instanceof File
                                ? URL.createObjectURL(doc)
                                : "");

                        return (
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            key={idx}
                            onClick={() =>
                              setActiveDocument({
                                computedName: docName,
                                url: docUrl,
                              })
                            }
                            className="group flex items-center p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-all shadow-sm"
                          >
                            <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-sm">
                              <img
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                src={docUrl}
                                alt={docName}
                              />
                            </div>

                            {/* Document Info */}
                            <div className="ml-4 flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate text-slate-800 dark:text-slate-200">
                                {/* {docName} */}
                                {`Document${idx + 1}`}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Click to view image
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                        <UploadCloud size={32} className="text-slate-400" />
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">
                        No documents stored in the system.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            /* EDIT MODE */
            <motion.div
              key="edit-mode"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl border border-white/50 dark:border-slate-700 rounded-3xl p-6 sm:p-10 shadow-2xl"
            >
              <div className="mb-8 border-b border-slate-200 dark:border-slate-700 pb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Edit3 className="text-indigo-500" /> Update Profile
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Modify institute records and attachments.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdate} className="space-y-8">
                <div className="flex flex-col sm:flex-row gap-8 items-start">
                  {/* Photo Edit */}
                  <div className="flex flex-col items-center space-y-4 w-full sm:w-auto">
                    <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                      {newProfilePreview || user.profilePic ? (
                        <img
                          src={newProfilePreview || user.profilePic}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={48} className="text-slate-300" />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Camera size={28} className="text-white" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleProfilePicChange}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Profile Photo
                    </span>
                  </div>

                  {/* Input Fields */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Aadhar Number
                      </label>
                      <input
                        type="text"
                        name="aadhar"
                        value={formData.adhar}
                        onChange={handleInputChange}
                        placeholder="XXXX XXXX XXXX"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Enrolled Classes (Comma Separated)
                      </label>
                      <input
                        type="text"
                        name="mainClasses"
                        value={formData.mainClasses}
                        onChange={handleInputChange}
                        placeholder="e.g., Computer Architecture, Software Engineering"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Document Upload Area */}
                <div className="bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 relative hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleDocChange}
                  />
                  <UploadCloud
                    size={40}
                    className="mx-auto text-indigo-400 group-hover:text-indigo-500 mb-3 transition-colors"
                  />
                  <h4 className="text-slate-800 dark:text-slate-200 font-semibold mb-1">
                    Upload Additional Images
                  </h4>
                  <p className="text-sm text-slate-500">
                    Drag and drop image files here or click to browse
                  </p>

                  {newDocuments.length > 0 && (
                    <div className="mt-6 flex flex-wrap justify-center gap-3 relative z-20">
                      {newDocuments.map((doc, idx) => (
                        <div
                          key={idx}
                          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-3 pr-1 py-1 rounded-lg flex items-center gap-2 shadow-sm"
                        >
                          <span className="text-xs font-medium max-w-[120px] truncate">
                            {doc.name}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setNewDocuments(
                                newDocuments.filter((_, i) => i !== idx),
                              )
                            }
                            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={isUpdating}
                    className="px-6 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    {isUpdating ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    {isUpdating ? "Processing..." : "Save Configuration"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {/* Profile Picture Viewer Modal */}
        {showProfilePicModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => setShowProfilePicModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full flex justify-center"
            >
              <button
                onClick={() => setShowProfilePicModal(false)}
                className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
              >
                <X size={32} />
              </button>
              <img
                src={user.profilePic}
                alt="Profile Full View"
                className="rounded-2xl shadow-2xl object-contain max-h-[80vh] border border-slate-900/10"
              />
            </motion.div>
          </motion.div>
        )}

        {/* User Info Modal */}
        {showUserModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative overflow-hidden"
            >
              {/* Decorative Top */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />

              <button
                onClick={() => setShowUserModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-8 mt-2">
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-5 rotate-3">
                  <Fingerprint size={28} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  System Registry
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Unique identifier parameters.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">
                    Internal UUID
                  </label>
                  <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-sm text-indigo-600 dark:text-indigo-400 break-all select-all">
                    {user._id || "UUID_UNAVAILABLE"}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">
                    Initialization Date
                  </label>
                  <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {formatDate(user.createdAt)}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* PURE IMAGE VIEWER MODAL (No Download, No PDF) */}
        {activeDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md"
            onClick={() => setActiveDocument(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-100 dark:bg-slate-950 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col h-[85vh] border border-slate-700/50"
            >
              {/* Image Viewer Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <FileText size={18} />
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-white truncate max-w-[200px] sm:max-w-md">
                    {activeDocument.computedName}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveDocument(null)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Image Display Area */}
              <div className="flex-1 w-full bg-slate-200/50 dark:bg-black flex items-center justify-center overflow-hidden relative p-4 sm:p-8">
                {activeDocument.url ? (
                  <img
                    src={activeDocument.url}
                    alt={activeDocument.computedName}
                    className="max-w-full max-h-full object-contain drop-shadow-md rounded-md"
                  />
                ) : (
                  <div className="text-slate-500 flex flex-col items-center">
                    <FileText size={48} className="mb-4 opacity-50" />
                    <p>Unable to load image.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
