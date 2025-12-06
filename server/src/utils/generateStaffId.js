// Generate unique staff ID for approved staff members
// Format: HOSPITALCODE-XXXX (4-digit random number)
export const generateStaffId = (hospitalCode) => {
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number (1000-9999)
  return `${hospitalCode}-${random}`;
};

export default generateStaffId;
