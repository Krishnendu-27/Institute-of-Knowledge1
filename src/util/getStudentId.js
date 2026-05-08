export const getStudentId = (user) => {
  if (!user._id) return "N/A";

  const year = new Date(user.createdAt || Date.now())
    .getFullYear()
    .toString()
    .slice(-2);

  let hash = 0;
  for (let i = 0; i < user._id.length; i++) {
    hash = user._id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const uniqueNum = String(Math.abs(hash) % 1000).padStart(3, "0");

  return `IK/${year}/${uniqueNum}`;
};
