import fs from "fs/promises";
import cloudinary from "../config/cloudinary.js";
import optimizeImage from "./image-helper.js";

/**
 * Optimizes local temp image, uploads it to Cloudinary, and deletes local temp file.
 * 
 * @param {string} filePath - Absolute or relative path to local temp file
 * @param {string} folder - Subfolder name inside Cloudinary (e.g. 'categories', 'products', 'avatars')
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadToCloudinary = async (filePath, folder = "general") => {
    try {
        // 1. Resize and optimize image with Sharp
        await optimizeImage(filePath);

        // 2. Upload optimized file to Cloudinary
        const result = await cloudinary.uploader.upload(filePath, {
            folder: `ecommerce/${folder}`,
        });

        // 3. Remove local temporary file
        await fs.unlink(filePath).catch(() => {});

        return {
            url: result.secure_url,
            publicId: result.public_id,
        };
    } catch (error) {
        // Clean up temporary local file on failure
        await fs.unlink(filePath).catch(() => {});
        throw error;
    }
};

/**
 * Deletes an asset from Cloudinary using its publicId.
 * Does not throw errors to prevent blocking main database operations,
 * but returns a status result for observability.
 * 
 * @param {string} publicId - The Cloudinary public_id of the asset
 * @returns {Promise<{success: boolean, result?: any, error?: any}>}
 */
export const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return { success: false, reason: "No publicId provided" };
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return { success: true, result };
    } catch (error) {
        console.error(`[Cloudinary Cleanup Error] Failed to delete asset '${publicId}':`, error);
        return { success: false, error };
    }
};
