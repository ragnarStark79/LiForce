// Generate unique staff ID for approved staff members
export const generateStaffId = (hospitalCode) => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${hospitalCode}-${timestamp}${random}`;
};

export default generateStaffId;
