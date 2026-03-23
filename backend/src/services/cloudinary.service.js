import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';

/**
 * Upload a buffer to Cloudinary via a stream
 * @param {Buffer} buffer
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'Aspar',
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(new ApiError(500, `Cloudinary upload failed: ${error.message}`));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary by publicId
 * @param {string} publicId
 * @returns {Promise<void>}
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset ${publicId}:`, error.message);
  }
};

/**
 * Upload multiple buffers concurrently
 * @param {Buffer[]} buffers
 * @param {Object} options
 * @returns {Promise<Array>}
 */
export const uploadManyToCloudinary = async (buffers, options = {}) => {
  return Promise.all(buffers.map((buffer) => uploadToCloudinary(buffer, options)));
};

/**
 * Delete multiple assets concurrently
 * @param {string[]} publicIds
 * @returns {Promise<void>}
 */
export const deleteManyFromCloudinary = async (publicIds) => {
  if (!publicIds || publicIds.length === 0) return;
  await Promise.all(publicIds.filter(Boolean).map((id) => deleteFromCloudinary(id)));
};
