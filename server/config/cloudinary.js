const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    return {
      folder: 'classroom-materials',
      allowed_formats: ['pdf', 'ppt', 'pptx', 'doc', 'docx'],
      resource_type: 'raw',
      public_id: Date.now() + '-' + Math.round(Math.random() * 1e9),
    };
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

module.exports = { cloudinary, upload };