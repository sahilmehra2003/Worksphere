import fs from 'fs';
export const removeLocalFilePath = (localFilePath) => {
    if (fs.existsSync(localFilePath)) {
        try {
            fs.unlinkSync(localFilePath);
        } catch (error) {
            console.error("Error in removing localFile", error.message);
        }
    } else {
        console.warn(`File not found: ${localFilePath}`)
    }
}