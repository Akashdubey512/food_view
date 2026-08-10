const express = require('express');
const router  = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const foodController = require('../controllers/food.controller');

const multer = require('multer');

const fileFilter = (req, file, cb) => {
    const allowedImages = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedVideos = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];

    if (file.fieldname === 'thumbnail') {
        if (allowedImages.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid thumbnail format. Only JPEG, PNG, and WebP are allowed.'), false);
        }
    } else if (file.fieldname === 'video') {
        if (allowedVideos.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid video format. Only MP4, WebM, and MOV are allowed.'), false);
        }
    } else {
        cb(new Error('Unexpected field name.'), false);
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, 
    },
    fileFilter
});

const uploadFoodFiles = upload.fields([
    { name: 'video',     maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]);

router.post(
    '/',
    authMiddleware.authFoodPartnerMiddleware,
    uploadFoodFiles,
    foodController.createFood
);

router.get(
    '/',
    authMiddleware.authUserMiddleware,
    foodController.getFoodItems
);

router.post(
    '/like',
    authMiddleware.authUserMiddleware,
    foodController.likeFood
);

router.post(
    '/save',
    authMiddleware.authUserMiddleware,
    foodController.saveFood
);

router.get(
    '/saved',
    authMiddleware.authUserMiddleware,
    foodController.getSavedFood
);

router.patch(
    '/:id',
    authMiddleware.authFoodPartnerMiddleware,
    uploadFoodFiles,
    foodController.editFood
);

router.delete(
    '/:id',
    authMiddleware.authFoodPartnerMiddleware,
    foodController.deleteFood
);

router.get(
    '/:foodId/like-status',
    authMiddleware.authUserMiddleware,
    foodController.getLikeStatus
);

router.get(
    '/:foodId/save-status',
    authMiddleware.authUserMiddleware,
    foodController.getSaveStatus
);

module.exports = router;