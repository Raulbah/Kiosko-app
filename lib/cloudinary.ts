import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: File, folder: string = "kiosko/users"): Promise<string | null> {
    if (!file || file.size === 0) return null;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
        { folder: folder },
        (error, result) => {
            if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
            } else {
            resolve(result?.secure_url || null);
            }
        }
        ).end(buffer);
    });
}