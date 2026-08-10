const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = (buffer, resourceType = "image") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: resourceType,
                folder: "food_view",
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        stream.end(buffer);
    });
};

const deleteFromCloudinary = async (url, resourceType = "image") => {
    if (!url) return null;
    try {
        // Extract public_id from Cloudinary URL (e.g. food_view/filename)
        const parts = url.split('/');
        const fileNameWithExt = parts[parts.length - 1];
        const folderName = parts[parts.length - 2];
        const publicId = `${folderName}/${fileNameWithExt.split('.')[0]}`;
        
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        return result;
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        return null;
    }
};

module.exports = {
  uploadOnCloudinary,
  deleteFromCloudinary
};