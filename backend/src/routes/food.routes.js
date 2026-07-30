const express = require('express');
const router  = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const foodController = require('../controllers/food.controller');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// Both video and thumbnail required on create/edit
const uploadFoodFiles = upload.fields([
    { name: 'video',     maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]);

// POST /api/v1/food  — create new food item
router.post(
    '/',
    authMiddleware.authFoodPartnerMiddleware,
    uploadFoodFiles,
    foodController.createFood
);

// GET /api/v1/food  — feed of all food items (user)
router.get(
    '/',
    authMiddleware.authUserMiddleware,
    foodController.getFoodItems
);

// POST /api/v1/food/like
router.post(
    '/like',
    authMiddleware.authUserMiddleware,
    foodController.likeFood
);

// POST /api/v1/food/save
router.post(
    '/save',
    authMiddleware.authUserMiddleware,
    foodController.saveFood
);

// GET /api/v1/food/saved
router.get(
    '/saved',
    authMiddleware.authUserMiddleware,
    foodController.getSavedFood
);

// PATCH /api/v1/food/:id  — edit food (partner only, optional new files)
router.patch(
    '/:id',
    authMiddleware.authFoodPartnerMiddleware,
    uploadFoodFiles,
    foodController.editFood
);

// DELETE /api/v1/food/:id  — delete food (partner only)
router.delete(
    '/:id',
    authMiddleware.authFoodPartnerMiddleware,
    foodController.deleteFood
);

module.exports = router;