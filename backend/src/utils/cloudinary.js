const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (filePath, folder = 'serenova') => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return null;
  }
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    transformation: [{ width: 400, height: 400, crop: 'fill' }],
  });
  return result.secure_url;
};

const deleteImage = async (publicId) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) return;
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadImage, deleteImage };
