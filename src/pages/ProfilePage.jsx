import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  Edit2,
  Save,
  X,
  Camera,
  FileText,
  Upload,
  Layers,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

// Adjust these paths to match your actual project structure
import useAuthStore from "../stores/useAuthStore";
import useUserStore from "../stores/useUserStore";

const ProfilePage = () => {
  // Global Store Data
  const globalUser = useAuthStore((state) => state.user);
  const updateUser = useUserStore((state) => state.updateUser);
  const isUpdating = useUserStore((state) => state.isLoading);

  const user = globalUser || {};
  const isAdmin = user.role === "Admin";

  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    mainClasses: user.mainClasses ? user.mainClasses.join(", ") : "",
  });

  // Keep form data synced if the global user changes
  useEffect(() => {
    if (globalUser) {
      setFormData({
        name: globalUser.name || "",
        email: globalUser.email || "",
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
      mainClasses: user.mainClasses ? user.mainClasses.join(", ") : "",
    });
    setNewProfilePic(null);
    setNewProfilePreview(null);
    setNewDocuments([]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Security check: Match backend constraint
    if (!isAdmin) {
      return toast.error("Access denied. Admin privileges required.");
    }
    if (!user._id) return toast.error("User ID is missing.");

    // Construct FormData for Multer on the backend
    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("email", formData.email);

    let parsedClasses = [];
    if (formData.mainClasses) {
      parsedClasses = formData.mainClasses
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Appending same key multiple times allows Multer to parse it as an array
      parsedClasses.forEach((cls) => {
        submitData.append("mainClasses", cls);
      });
    }

    // Append Files
    if (newProfilePic) {
      submitData.append("profilePic", newProfilePic);
    }

    if (newDocuments.length > 0) {
      newDocuments.forEach((doc) => {
        submitData.append("documents", doc);
      });
    }

    try {
      // Execute the actual API call
      // Ensure your store does NOT set 'Content-Type': 'application/json' for this request.
      // The browser must set it automatically to 'multipart/form-data' with the proper boundary.
      const response = await updateUser(user._id, submitData);

      // Optimistic UI Update
      const updatedUserData = response?.data || {
        ...globalUser,
        name: formData.name,
        email: formData.email,
        mainClasses: parsedClasses,
        profilePicUrl: newProfilePreview || globalUser.profilePicUrl,
      };

      // Directly update the auth store
      useAuthStore.setState({ user: updatedUserData });

      toast.success("Profile updated successfully!");
      setIsEditing(false);

      // Clean up file states
      setNewProfilePic(null);
      setNewDocuments([]);
    } catch (error) {
      toast.error(error.message || "Something went wrong while updating.");
      console.error(error);
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

  if (!globalUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10 px-4 transition-colors duration-200 flex justify-center">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700"
        >
          {/* Cover Gradient */}
          <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
            {isAdmin && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all shadow-lg"
              >
                <Edit2 size={18} /> Edit Profile
              </button>
            )}
          </div>

          <div className="px-8 pb-8 relative">
            {/* Profile Picture Anchor */}
            <div className="flex justify-between items-end -mt-16 mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-xl flex items-center justify-center">
                  {newProfilePreview || user.profilePicUrl ? (
                    <img
                      src={newProfilePreview || user.profilePicUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={48} className="text-slate-400" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2.5 rounded-full cursor-pointer shadow-lg hover:bg-indigo-700 transition-colors border-2 border-white dark:border-slate-800">
                    <Camera size={18} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePicChange}
                    />
                  </label>
                )}
              </div>

              {!isEditing && (
                <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-1.5 rounded-full text-sm font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-2">
                  <Shield size={16} /> {user.role}
                </div>
              )}
            </div>

            {/* View Mode vs Edit Mode */}
            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.div
                  key="view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                        {user.name}
                      </h1>
                      <div className="flex items-center text-slate-500 dark:text-slate-400 gap-2">
                        <Mail size={16} /> {user.email}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          <Layers size={16} /> Main Classes
                        </div>
                        <div className="text-slate-800 dark:text-slate-200 font-medium">
                          {user.mainClasses?.length > 0
                            ? user.mainClasses.join(", ")
                            : "No classes assigned"}
                        </div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          <Clock size={16} /> Joined Date
                        </div>
                        <div className="text-slate-800 dark:text-slate-200 font-medium">
                          {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <FileText size={18} /> Documents (
                        {user.documents?.length || 0})
                      </h3>
                      {user.documents?.length > 0 ? (
                        <div className="space-y-2">
                          {user.documents.map((doc, idx) => (
                            <div
                              key={idx}
                              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer truncate"
                            >
                              Document_{idx + 1}.pdf
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                          No documents uploaded.
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleUpdate}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Classes (Comma separated)
                      </label>
                      <input
                        type="text"
                        name="mainClasses"
                        value={formData.mainClasses}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="e.g., Math, Science"
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Append New Documents
                      </label>
                      <label className="flex items-center justify-center w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900">
                        <div className="text-center">
                          <Upload
                            size={20}
                            className="mx-auto text-indigo-500 mb-1"
                          />
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Click to attach files
                          </span>
                        </div>
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleDocChange}
                        />
                      </label>
                      {newDocuments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {newDocuments.map((doc, idx) => (
                            <span
                              key={idx}
                              className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs px-2.5 py-1 rounded-md flex items-center gap-1 border border-indigo-200 dark:border-indigo-800"
                            >
                              {doc.name.substring(0, 15)}...
                              <X
                                size={12}
                                className="cursor-pointer ml-1 hover:text-red-500"
                                onClick={() =>
                                  setNewDocuments(
                                    newDocuments.filter((_, i) => i !== idx),
                                  )
                                }
                              />
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-6 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      disabled={isUpdating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center gap-2"
                    >
                      {isUpdating ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <Save size={18} />
                      )}
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
