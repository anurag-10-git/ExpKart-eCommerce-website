const express = require('express');
const authController = require('../controller/auth');
const router = express.Router();
const { check, body } = require('express-validator'); // you can check just body,params,cookies of request.
const User = require('../models/UserModel'); 

router.get('/login', authController.getLogin);
router.post('/login',[check('email').isEmail().withMessage('Please enter a valid email address!').toLowerCase(), body('password','Password has to be valid!').isLength({min: 5}).isAlphanumeric().trim()], authController.postLogin);
router.post('/logout', authController.postLogout);
router.get('/signup', authController.getSignup);
router.post('/signup',[check('email').isEmail().withMessage('Please enter a valid email address!').custom((value,{req})=>{
    return User.findOne({ email: value })
    .then((userDoc) => {
      if (userDoc) {
         return Promise.reject('Oops! email already exists.')
      }})    
}).toLowerCase(),body('password','Please enter a password with only numbers and text and at least 5 characters.').isLength({min:6}).isAlphanumeric().trim(),body('confirmPassword').custom((value,{req})=> {
  if(value !== req.body.password){
     throw new Error('Passwords do not match!');
  }
  return true;
}).trim()], authController.postSignup);
router.get('/reset-password', authController.getResetPassword);
router.post('/reset-password', authController.postResetPassword);
router.get('/reset-password/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);
module.exports = router;