/**
 * Generate Student ID in format: IKMMYYxxx
 * MM = Month (01-12)
 * YY = Last 2 digits of year
 * xxx = Sequential number (001, 002, etc.)
 * Example: IK0526001 (May 2026, first student)
 */
export const getStudentId = (user, allStudents = []) => {
  if (!user) return "N/A";

  // If student already has a generated studentId, return it
  if (user.studentId) return user.studentId;

  // Get creation date
  const createdDate = new Date(user.createdAt || Date.now());
  const month = String(createdDate.getMonth() + 1).padStart(2, "0"); // 01-12
  const year = createdDate.getFullYear().toString().slice(-2); // Last 2 digits

  // Calculate sequential number
  // Find all students created in the same month/year
  let sequentialNumber = 1;

  if (allStudents && allStudents.length > 0) {
    const sameMonthYearStudents = allStudents.filter((student) => {
      if (!student.createdAt) return false;
      const studentDate = new Date(student.createdAt);
      const studentMonth = String(studentDate.getMonth() + 1).padStart(2, "0");
      const studentYear = studentDate.getFullYear().toString().slice(-2);
      return studentMonth === month && studentYear === year;
    });

    // Get max sequential from existing IDs
    const existingSequentials = sameMonthYearStudents
      .map((s) => {
        if (s.studentId && s.studentId.startsWith(`IK${month}${year}`)) {
          const seqStr = s.studentId.slice(-3);
          return parseInt(seqStr, 10);
        }
        return 0;
      })
      .filter((n) => n > 0);

    if (existingSequentials.length > 0) {
      sequentialNumber = Math.max(...existingSequentials) + 1;
    }
  } else {
    // Fallback: use hash if no students list provided
    let hash = 0;
    if (user._id) {
      for (let i = 0; i < user._id.length; i++) {
        hash = user._id.charCodeAt(i) + ((hash << 5) - hash);
      }
      sequentialNumber = (Math.abs(hash) % 999) + 1;
    }
  }

  const sequential = String(sequentialNumber).padStart(3, "0");
  return `IK${month}${year}${sequential}`;
};
