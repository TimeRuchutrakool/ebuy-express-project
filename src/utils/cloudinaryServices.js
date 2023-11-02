const cloudinary = require("../config/cloudinary");

exports.upload = async (file, folder) => {
  const result = await cloudinary.uploader.upload(file);
  console.log(result.secure_url)
  return result.secure_url;
};
