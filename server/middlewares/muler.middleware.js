import multer from 'multer';
import fs from 'fs';
import path from 'path';


const uploadDir = './public/temp';

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const basename = path.basename(file.originalname, extension);
        cb(null, `${basename}-${uniqueSuffix}${extension}`);
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 5 }, 
});
