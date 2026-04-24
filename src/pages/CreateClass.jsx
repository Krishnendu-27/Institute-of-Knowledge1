import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Plus,
  X,
  Calendar,
  User,
  DollarSign,
  Save,
} from "lucide-react";
import useClassStore from "../stores/useClassStore";
import toast from "react-hot-toast";

const CreateClass = () => {
  const { addClass, getTeachers, teachers, isLoading, error, success } =
    useClassStore();

  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    fees: "",
    teacherName: "",
  });

  const [features, setFeatures] = useState([]);
  const [showFeatureForm, setShowFeatureForm] = useState(false);
  const [featureFormData, setFeatureFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    fees: "",
    teacherName: "",
  });

  // Fetch teachers on component mount
  useEffect(() => {
    getTeachers();
  }, [getTeachers]);

  // Handle toast notifications
  useEffect(() => {
    if (success) {
      toast.success("Class added successfully!");
      setFormData({
        name: "",
        startDate: "",
        endDate: "",
        fees: "",
        teacherName: "",
      });
      setFeatures([]);
    }
    if (error) {
      toast.error(error);
    }
  }, [success, error]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFeatureInputChange = (e) => {
    const { name, value } = e.target;
    setFeatureFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addFeature = () => {
    if (
      !featureFormData.name ||
      !featureFormData.startDate ||
      !featureFormData.endDate ||
      !featureFormData.fees ||
      !featureFormData.teacherName
    ) {
      toast.error("Please fill all feature fields");
      return;
    }

    // Validate dates
    if (
      new Date(featureFormData.startDate) > new Date(featureFormData.endDate)
    ) {
      toast.error("Start date must be before end date");
      return;
    }

    setFeatures([...features, { ...featureFormData, id: Date.now() }]);
    setFeatureFormData({
      name: "",
      startDate: "",
      endDate: "",
      fees: "",
      teacherName: "",
    });
    setShowFeatureForm(false);
    toast.success("Feature added!");
  };

  const removeFeature = (id) => {
    setFeatures(features.filter((feature) => feature.id !== id));
    toast.success("Feature removed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.fees
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("Start date must be before end date");
      return;
    }

    try {
      const classData = {
        ...formData,
        features: features,
      };
      await addClass(classData);
    } catch (err) {
      toast.error(err.message || "Failed to create class");
      console.error(err);
    }
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

  return (
    <div className="min-h-screen bg-background dark:bg-slate-900 p-4 md:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        {/* <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <BookOpen className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-foreground">
                Create New Class
              </h1>
              <p className="text-foreground/60 mt-1">
                Set up a new class with features and assignment details
              </p>
            </div>
          </div>
        </motion.div> */}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Class Information */}
          <motion.div
            variants={itemVariants}
            className="bg-card dark:bg-slate-800 border border-border dark:border-slate-700 rounded-2xl overflow-hidden shadow-lg"
          >
            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BookOpen size={22} />
                Class Information
              </h2>
              <p className="text-sm opacity-90 mt-1">
                Enter the basic details about your class
              </p>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Class Name */}
                <div>
                  <label className="block text-sm font-semibold text-foreground dark:text-slate-200 mb-2">
                    Class Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Advanced JavaScript"
                    className="w-full px-4 py-2.5 rounded-lg border border-border dark:border-slate-600 bg-background dark:bg-slate-700 text-foreground dark:text-slate-100 placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Teacher Name */}
                <div>
                  <label className="block text-sm font-semibold text-foreground dark:text-slate-200 mb-2">
                    Lead Teacher <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="teacherName"
                    value={formData.teacherName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-border dark:border-slate-600 bg-background dark:bg-slate-700 text-foreground dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select a teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.name}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-foreground dark:text-slate-200 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-border dark:border-slate-600 bg-background dark:bg-slate-700 text-foreground dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-semibold text-foreground dark:text-slate-200 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-border dark:border-slate-600 bg-background dark:bg-slate-700 text-foreground dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Fees */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-foreground dark:text-slate-200 mb-2">
                    Class Fees <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <DollarSign size={20} className="text-foreground/40" />
                    <input
                      type="number"
                      name="fees"
                      value={formData.fees}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="flex-1 px-4 py-2.5 rounded-lg border border-border dark:border-slate-600 bg-background dark:bg-slate-700 text-foreground dark:text-slate-100 placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features Section */}
          <motion.div
            variants={itemVariants}
            className="bg-card dark:bg-slate-800 border border-border dark:border-slate-700 rounded-2xl overflow-hidden shadow-lg"
          >
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-400 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Plus size={22} />
                  Class Features
                </h2>
                <p className="text-sm opacity-90 mt-1">
                  Add specialized learning modules or topics to your class
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFeatureForm(true)}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl"
              >
                + Add Feature
              </button>
            </div>

            <div className="p-6 md:p-8">
              {/* Feature Input Form */}
              {showFeatureForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-6 bg-indigo-50 dark:bg-slate-700/50 rounded-xl border-2 border-indigo-200 dark:border-indigo-500/30"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-foreground dark:text-slate-100">
                      New Feature Details
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowFeatureForm(false);
                        setFeatureFormData({
                          name: "",
                          startDate: "",
                          endDate: "",
                          fees: "",
                          teacherName: "",
                        });
                      }}
                      className="p-1 hover:bg-indigo-200 dark:hover:bg-slate-600 rounded-full transition-colors"
                    >
                      <X size={18} className="text-foreground" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Feature Name */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground dark:text-slate-200 mb-2">
                        Feature Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={featureFormData.name}
                        onChange={handleFeatureInputChange}
                        placeholder="e.g., React Fundamentals"
                        className="w-full px-3 py-2 rounded-lg border border-border dark:border-slate-600 bg-background dark:bg-slate-700 text-foreground dark:text-slate-100 placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Feature Teacher */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground dark:text-slate-200 mb-2">
                        Teacher Name <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="teacherName"
                        value={featureFormData.teacherName}
                        onChange={handleFeatureInputChange}
                        className="w-full px-3 py-2 rounded-lg border border-border dark:border-slate-600 bg-background dark:bg-slate-700 text-foreground dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select a teacher</option>
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.name}>
                            {teacher.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Feature Start Date */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground dark:text-slate-200 mb-2">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={featureFormData.startDate}
                        onChange={handleFeatureInputChange}
                        className="w-full px-3 py-2 rounded-lg border border-border dark:border-slate-600 bg-background dark:bg-slate-700 text-foreground dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Feature End Date */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground dark:text-slate-200 mb-2">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={featureFormData.endDate}
                        onChange={handleFeatureInputChange}
                        className="w-full px-3 py-2 rounded-lg border border-border dark:border-slate-600 bg-background dark:bg-slate-700 text-foreground dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Feature Fees */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-foreground dark:text-slate-200 mb-2">
                        Feature Fees <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <DollarSign size={18} className="text-foreground/40" />
                        <input
                          type="number"
                          name="fees"
                          value={featureFormData.fees}
                          onChange={handleFeatureInputChange}
                          placeholder="0.00"
                          className="flex-1 px-3 py-2 rounded-lg border border-border dark:border-slate-600 bg-background dark:bg-slate-700 text-foreground dark:text-slate-100 placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={addFeature}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition-all shadow-lg"
                    >
                      Add Feature
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowFeatureForm(false);
                        setFeatureFormData({
                          name: "",
                          startDate: "",
                          endDate: "",
                          fees: "",
                          teacherName: "",
                        });
                      }}
                      className="px-4 py-2 bg-foreground/10 dark:bg-slate-600 hover:bg-foreground/20 dark:hover:bg-slate-500 text-foreground dark:text-slate-200 rounded-lg font-semibold transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Features List */}
              {features.length > 0 ? (
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-4 p-4 bg-indigo-50 dark:bg-slate-700/50 rounded-xl border border-indigo-200 dark:border-indigo-500/30 hover:shadow-md transition-all"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-foreground dark:text-slate-100">
                            {feature.name}
                          </h4>
                          <span className="px-2 py-1 text-xs font-medium bg-indigo-200 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-full">
                            Feature {index + 1}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-foreground/70 dark:text-slate-400">
                            <User size={16} />
                            <span>{feature.teacherName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-foreground/70 dark:text-slate-400">
                            <Calendar size={16} />
                            <span>
                              {new Date(feature.startDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-foreground/70 dark:text-slate-400">
                            <Calendar size={16} />
                            <span>
                              {new Date(feature.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
                            <DollarSign size={16} />
                            <span>{feature.fees}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFeature(feature.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-500/10 rounded-full w-fit mx-auto mb-3">
                    <Plus
                      className="text-indigo-600 dark:text-indigo-400"
                      size={24}
                    />
                  </div>
                  <p className="text-foreground/60 dark:text-slate-400">
                    No features added yet. Click "Add Feature" to get started.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={itemVariants} className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary/70 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent" />
                  Creating Class...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Create Class
                </>
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateClass;
