// Cloudinary removed — images are now stored as base64 in MongoDB.
// This file is kept as a stub so any old imports don't cause crash.
export const uploadToCloudinary = async (fileBuffer, folder) => {
  const mimeType = "image/jpeg";
  return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
};
export default {};
