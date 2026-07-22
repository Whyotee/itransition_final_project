export function canManage(user) {
  return user?.role === "RECRUITER" || user?.role === "ADMIN";
}

export function isAdmin(user) {
  return user?.role === "ADMIN";
}
