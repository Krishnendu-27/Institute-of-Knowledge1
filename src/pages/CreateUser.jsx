import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import useUserStore from "../stores/useUserStore";
import toast from "react-hot-toast";

const CreateUser = () => {
  const { addUser, isLoading, error, success, resetStatus } = useUserStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Student",
    adhar: "",
    mainClasses: "",
  });

  const [profilePic, setProfilePic] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [preview, setPreview] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDocChange = (e) => {
    const files = Array.from(e.target.files);
    if (documents.length + files.length > 3) {
      toast.error("Maximum 3 documents allowed");
      return;
    }
    setDocuments([...documents, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    // Append text fields
    Object.keys(formData).forEach((key) => {
      if (key === "mainClasses") {
        const classArray = formData[key].split(",").map((s) => s.trim());
        data.append(key, JSON.stringify(classArray));
      } else {
        data.append(key, formData[key]);
      }
    });

    // Append files
    if (profilePic) data.append("profilePic", profilePic);
    documents.forEach((doc) => data.append("documents", doc));

    try {
      await addUser(data);
      // Reset form on success if needed
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
      >
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <UserPlus size={24} /> Add New User
            </h2>
            <p className="text-indigo-100 text-sm">
              Register a new student or teacher to the system
            </p>
          </div>
          {isLoading && (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Basic Info */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="John Doe"
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="john@example.com"
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="+91..."
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Account Role
                </label>
                <div className="flex gap-4">
                  {["Student", "Teacher"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r })}
                      className={`flex-1 py-2 rounded-lg border-2 transition-all font-medium ${
                        formData.role === r
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-100 bg-slate-50 text-slate-500"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {formData.role === "Student" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Aadhar Number *
                  </label>
                  <input
                    type="text"
                    name="adhar"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="12-digit Aadhar"
                    onChange={handleInputChange}
                  />
                </motion.div>
              )}
            </div>

            {/* Right Column: Profile & Docs */}
            <div className="space-y-6">
              {/* Profile Pic Upload */}
              <div className="flex flex-col items-center p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 relative">
                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                    />
                    <button
                      onClick={() => {
                        setPreview(null);
                        setProfilePic(null);
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-lg"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-2">
                      <Upload className="text-indigo-600" size={24} />
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      Upload Profile Photo
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>

              {/* Documents Section (Student Only) */}
              {formData.role === "Student" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Documents (Max 3)
                  </label>
                  <div className="space-y-2">
                    <label className="block w-full text-center py-3 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                      <span className="text-sm text-slate-500 flex items-center justify-center gap-2">
                        <FileText size={18} /> Click to upload documents
                      </span>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleDocChange}
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {documents.map((doc, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full flex items-center gap-1"
                        >
                          {doc.name.substring(0, 10)}...{" "}
                          <X
                            size={10}
                            className="cursor-pointer"
                            onClick={() =>
                              setDocuments(
                                documents.filter((_, i) => i !== idx),
                              )
                            }
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3"
              >
                <AlertCircle size={20} /> {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-3"
              >
                <CheckCircle2 size={20} /> User added successfully!
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Create User Profile"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateUser;
