import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

export const uploadOnCloudinary = async (localFilePath,name,quality='auto') => {
     try {
         const options = {};
         options.public_id = name;
         if (quality) {
             options.quality = quality;
         }
         options.resource_type = 'auto'
         options.overwrite = true;
         options.folder = process.env.CLOUDINARY_FOLDER_NAME || "Worksphere"
         const response = await cloudinary.uploader.upload(localFilePath, options);
         fs.unlinkSync(localFilePath);
         return response;
     } catch (error) {
         fs.unlinkSync(localFilePath);
         console.error('Error in uploading file to cloudinary: ', error.message);
     }
}
