const cloudinary = require("../config/cloudinary");

exports.upload = async (file, folder) => {
  const result = await cloudinary.uploader.upload(file);
  return result.secure_url;
};
