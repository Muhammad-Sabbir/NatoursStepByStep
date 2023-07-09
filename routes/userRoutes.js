const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protects all routes after this middleware.
router.use(authController.protect); // this comes before all these other routes.

router.patch(
  '/updateMyPassword',
  // authController.protect, because we are using router.use(authController.protect);
  authController.updatePassword
);
router.get(
  '/me',
  // authController.protect,  // because we are using router.use(authController.protect);
  userController.getMe,
  userController.getUser
);
router.patch('/updateMe', userController.updateMe); // because we are using router.use(authController.protect);
router.delete('/deleteMe', userController.deleteMe); // because we are using router.use(authController.protect);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
