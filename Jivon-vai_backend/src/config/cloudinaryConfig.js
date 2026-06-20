import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dsngklegp',
    api_key: process.env.CLOUDINARY_API_KEY || '757111131846348',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'ZxikvLLc_rUk4sFQ4VWlOgRFWRs',
});


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'arcforma_projects', 
        resource_type: 'auto', 
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'mov', 'webm', 'mkv', 'avi', 'flv', 'wmv', 'mpeg', 'mp3', 'wav', 'ogg'] // অনুমোদিত ফাইল ফরম্যাটের তালিকা ,
    },
});

const uploadCloud = multer({ storage: storage });

export default uploadCloud;