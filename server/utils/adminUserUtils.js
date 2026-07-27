export const getUserDisplayStatus = (user = {}) => {
  return user?.isBlocked ? 'Blocked' : 'Active';
};

export const mapUserForAdmin = (user = {}, orderCount = 0) => {
  const safeUser = user || {};
  const { password, forgot_password_otp, forgot_password_expiry, ...rest } = safeUser;

  return {
    ...rest,
    id: safeUser._id || safeUser.id,
    name: safeUser.name || 'Unnamed User',
    email: safeUser.email || 'No email',
    role: safeUser.role || 'USER',
    orders: Number(orderCount) || 0,
    status: getUserDisplayStatus(safeUser),
    isBlocked: Boolean(safeUser.isBlocked),
    isVerified: Boolean(safeUser.isVerified),
  };
};
