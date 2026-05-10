import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  User,
  GraduationCap,
} from "lucide-react";
import useUserStore from "../../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import { generateSlug } from "../../util/generateSlug";

const AllStudents = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Assuming your store has `students` and `getStudents` functions
  const students = useUserStore((state) => state.students);
  const getStudents = useUserStore((state) => state.getStudents);
  const isLoading = useUserStore((state) => state.isLoading);
  const error = useUserStore((state) => state.error);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch students when the component mounts
    getStudents();
  }, [getStudents]);

  const filteredStudents = Array.isArray(students)
    ? students.filter(
        (student) =>
          student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 },
  };

  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3,
  };

  return (
    <>
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="min-h-screen bg-background p-6 md:p-8 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <p className="text-muted-foreground mt-1">
              Manage and view all students along with their assigned batches and
              details.
            </p>
          </div>

          <div className="relative group max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-base"
            />
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive flex items-center gap-2 font-medium">
              <span>⚠️</span> {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p>Loading Students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border border-dashed p-12 text-center">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Students Found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "No students available at the moment."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {filteredStudents.map((student, index) => (
                  <motion.div
                    key={student._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() =>
                      navigate(`/profile/${generateSlug(student.name)}`, {
                        state: {
                          userId: student?._id,
                          userData: student,
                        },
                      })
                    }
                    className="group bg-card rounded-2xl border border-border hover:border-primary hover:shadow-lg transition-all cursor-pointer overflow-hidden shadow-sm"
                  >
                    <div className="p-6 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          {student.profilePic ? (
                            <img
                              src={student.profilePic}
                              alt={student.name}
                              className="w-14 h-14 rounded-full object-cover bg-muted"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground">
                              {student.name}
                            </h3>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Mail
                                  size={16}
                                  className="text-muted-foreground/70"
                                />
                                {student.email}
                              </div>
                              {student.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone
                                    size={16}
                                    className="text-muted-foreground/70"
                                  />
                                  {student.phone}
                                </div>
                              )}
                              {/* Optional: Show stream or grade if available */}
                              {student.grade && (
                                <div className="flex items-center gap-1">
                                  <GraduationCap
                                    size={16}
                                    className="text-muted-foreground/70"
                                  />
                                  Grade: {student.grade}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-2xl font-bold text-primary">
                            {student.batches?.length ||
                              student.mainClasses?.length ||
                              0}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Batches
                          </p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default AllStudents;