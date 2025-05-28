import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';

export const fileUpload = async (localFilePath,name,quality='auto') => {
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
         //  TODO -> Remove File Path Locally
         return response;
     } catch (error) {
         //  TODO -> Remove File Path Locally
         console.error('Error in uploading file to cloudinary: ', error.message);
     }
}
