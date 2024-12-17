export const getRolePath = (role: string) => {
  switch (role) {
    case "superadmin":
      return "superadmin";
    case "admin":
      return "admin";
    case "assistant":
      return "asisten";
    case "lecture":
      return "dosen";
    case "student":
      return "student";
    default:
      return "user"; // Nilai default jika tidak cocok
  }
};
