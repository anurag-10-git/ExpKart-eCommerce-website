const express = require('express');
const adminController = require('../controller/admin');
const isAuth = require('../middleware/is-auth');
const {  body } = require('express-validator');

const router = express.Router();

router.get('/add-products',isAuth ,adminController.getAddProducts);
router.post('/add-products',[body('name','enter valid name(< 3 letters)').isString().isLength({min: 3}).trim(),body('price','price should be a number').isFloat().trim(),body('description','description must be < 20 characters').isLength({min:20, max: 70}).trim()],isAuth,adminController.postAddProducts);
router.get('/admin-control',isAuth,adminController.getAdminControl);
router.delete('/product/:productId',isAuth,adminController.deleteProduct);
router.get('/edit-product/:productId',isAuth,adminController.getEditProduct);
router.post('/edit-products',[body('name','enter valid name(< 3 letters)').isString().isLength({min: 3}).trim(),body('price','price should be a number').isFloat().trim(),body('description','description must be < 20 characters').isLength({min:20, max: 70}).trim()],isAuth,adminController.postEditProduct);

module.exports = router;