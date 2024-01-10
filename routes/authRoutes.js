const router = require("express").Router();
const authControllers = require("../controllers/authControllers");
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/admin_login', authControllers.admin_login)
router.get('/get_user', authMiddleware, authControllers.getUser)
router.post('/seller_register', authControllers.seller_register)
router.post('/seller_login', authControllers.seller_login)
router.post('/profile-image-upload', authMiddleware, authControllers.profile_image_upload)
router.post('/profile-info-add', authMiddleware, authControllers.profile_info_add)

module.exports = router