const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Product = require("../models/productsModel");
const Order =  require('../models/orderModel');
const stripe = require('stripe')('sk_test_51MUL71SG7svL19uOTkI1DqfSxHYbC916TaI6rkK2JNlRaB7vXVYOUWzzCDsHmaz6uUXyK0KAkeaGoopGLRCzptzc00k4zw2aZf');

const ITEMS_PER_PAGE = 16;

exports.getIndex = (req,res,next)=>{

    const page = Number(req.query.page) || 1;
    let totalItems;

    Product.find().countDocuments().then(numProducts => {
      totalItems = numProducts;

      return Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
    }).then(products => {
      res.render('index', {
        prods: products,
        currentPage: page,
        // csrfToken: req.csrfToken()  //given by csrfProtection middleware
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      })
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  });
}

exports.getProductDetail = (req,res,next) => {
  const prodId = req.params.productId;
  Product.findById(prodId) // we can pass mongoose a string id it will convert to Object id
  .then(product => {
    res.render('product-details',{
      product: product,
    })
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
});
};

exports.postCart = (req,res,next) => {
  const productId = req.body.productId;

  Product.findById(productId).then(product => {
    return req.user.addToCart(product);
  }).then( result => {
    console.log('added to cart!');
    res.redirect('/cart');
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
});
}

exports.getCart = (req,res,next) => {
  req.user.populate('cart.items.productId').then(user => {
    const products = user.cart.items;

    res.render('cart',{
      products: products,
    });
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
});
}

exports.postRemoveCartItem = (req, res, next) => {
  const productId = req.body.productId;
  req.user.removeItemFromCart(productId).then(result => {
    res.redirect('/cart');
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
});
}

exports.getCheckoutSuccess = (req, res, next) => {
  req.user.populate('cart.items.productId').then(user => {
    const products = user.cart.items.map(i => {
      return { quantity: i.quantity, totalPrice: i.totalPrice, product: {...i.productId._doc}}
    });

    //_doc it allows only access to the data we need not the meta-datas 

    const order = new Order({
      user: { 
      email: req.user.email,
      userId: req.user
      },
      products: products
    });

    return order.save();
  })
  .then(result => {
    return req.user.clearCart();
  }).then(() =>{
    res.redirect('/orders');
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
});
}

exports.postOrder = (req, res, next) => {
  req.user.populate('cart.items.productId').then(user => {
    const products = user.cart.items.map(i => {
      return { quantity: i.quantity, totalPrice: i.totalPrice, product: {...i.productId._doc}}
    });

    //_doc it allows only access to the data we need not the meta-datas 

    const order = new Order({
      user: { 
      email: req.user.email,
      userId: req.user
      },
      products: products
    });

    return order.save();
  })
  .then(result => {
    return req.user.clearCart();
  }).then(() =>{
    res.redirect('/orders');
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
});
}

exports.getOrders = (req, res, next) => {
  Order.find({'user.userId': req.user._id}).then(orders => {
  res.render('orders', {
    orders: orders,
  })
 }).catch(err => {
  const error = new Error(err);
  error.httpStatusCode = 500;
  return next(error);
});
}

exports.getInvoice = (req,res,next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId).then(order => {
    if(!order){
      return next(new Error('No order Found!'));
    }
    if(order.user.userId.toString() !== req.user._id.toString()) {
         return next(new Error('Unauthorized!'));
    }

    const invoiceName = 'invoice-' + orderId + '.pdf';
    const invoicePath = path.join(__dirname,'..','data','invoices',invoiceName);

    const pdfDoc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition','inline; filename="'+ invoiceName +'"');

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    
    pdfDoc.fontSize(26).text('Invoice',{
      underline: false,
      align: 'center'
    });
    pdfDoc.fontSize(10).text('order Id - '+ order._id, {underline: false, align: 'center'})
    pdfDoc.fontSize(13).text('-----------------------------------------------------',{underline: false, align: 'center'})
    
    let totalPrice = 0;

    pdfDoc.text('\n');
    order.products.forEach(prod =>{
      totalPrice += prod.totalPrice;
       pdfDoc.text(prod.product.name + ' - ' + prod.quantity + ' x ' + 'Rs.' + prod.product.price + ' = ' + prod.totalPrice,{underline: false, align: 'center'});
    });

    pdfDoc.text('\n');

    pdfDoc.text('-----------------------------------------------------',{underline: false, align: 'center'})
    pdfDoc.fontSize(13).text('total cost' + ' = ' + totalPrice,{underline: false, align: 'center'});
    pdfDoc.text('-----------------------------------------------------',{underline: false, align: 'center'})

    pdfDoc.end();
    // fs.readFile(invoicePath,(err,data) => {
    //   if(err) {
    //      return next(err);
    //   }
    //   res.setHeader('Content-Type', 'application/pdf');
    //   res.setHeader('Content-Disposition','inline; filename="'+ invoiceName +'"'); // attachment to download, inline to open
    //   res.send(data);
    // })
   
    // const file = fs.createReadStream(invoicePath);
                                             // attachment to download, inline to open
      // file.pipe(res);


  }).catch(err => next(err));
}

exports.getCheckout = (req,res,next) => {
  let products;
  let total = 0;


    req.user.populate('cart.items.productId').then(user => {
    products = user.cart.items;

    total = 0;

    products.forEach(p => {
       total += p.totalPrice;
    })

    console.log(products);

    return stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: products.map(p => {
        return {
          quantity: p.quantity,
          price_data: {
            currency: 'inr',
            unit_amount: p.productId.price * 100,
            product_data: {
              name:  p.productId.name,
               description : p.productId.description,
            }
          }
        };
      }),
      mode: 'payment',
      success_url: req.protocol + '://' + req.get('host') + '/checkout/success' ,
      cancel_url:req.protocol + '://' + req.get('host') + '/checkout/cancel'
    });

    
  }).then(session =>{
     return res.render('checkout',{
            products: products,
            totalSum: total,
            sessionId: session.id
            });
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
});

}