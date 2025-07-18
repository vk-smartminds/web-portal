import multer from 'multer';
import multerS3 from 'multer-s3';
import s3 from './s3.js';

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'vk-web-portal1',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, `images/${Date.now()}-${file.originalname}`);
    }
  })
});

export default upload; 