


const {CloudinaryStorage} = require('multer-storage-cloudinary')
const cloudinary = require('cloudinary').v2
const dotenv = require('dotenv')


dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'YelpCamp',
        // allowedFormats: ['pdf', 'docx', 'doc', 'txt']
    }
});

module.exports = {
    cloudinary,
    storage
}
