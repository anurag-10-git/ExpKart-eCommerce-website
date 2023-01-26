const express = require('express');
const shopController = require('../controller/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/',shopController.getIndex);

router.get('/product/:productId',shopController.getProductDetail);

router.post('/add-to-cart',isAuth ,shopController.postCart);

router.get('/cart',isAuth,shopController.getCart);

router.post('/remove-cart-item',isAuth, shopController.postRemoveCartItem);

router.post('/create-order',isAuth, shopController.postOrder);

router.get('/orders',isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/checkout/success', isAuth, shopController.getCheckoutSuccess);

router.get('/checkout/cancel', isAuth, shopController.getCheckout);

module.exports = router;
