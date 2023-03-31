const express = require("express");

const authController = require("./../controllers/authController");

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.get('/verifySignUp/:verificationToken', authController.verifySignUp);
// Protect all routes after this middleware

router.post('/checkLogin', authController.checkLogin);
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
// router.get('/me', userController.getMe, userController.getUser);
// router.patch('/updateMe', userController.uploadUserPhoto,userController.updateMe);
// router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));

module.exports = router;