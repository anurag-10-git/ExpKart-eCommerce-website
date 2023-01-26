const Product = require('../models/productsModel');
const { validationResult } = require('express-validator');
const fileHelper = require('../util/file');

exports.getAddProducts = (req,res,next) => {
    
    res.render('add-products',{
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
}

exports.postAddProducts = (req, res, next) => {
    const name = req.body.name; 
    const image = req.file; 
    const price = req.body.price; 
    const description = req.body.description;
    
    if(!image){
        return res.status(422).render('add-products',{
            editing: false,
            hasError: true,
            product: {
                name: name,
                price: price,
                description: description
            },
            errorMessage: 'Attached file is not an image.',
            validationErrors: []
        });
    }

    const imageUrl = image.path;

    const errors = validationResult(req);

    if(!errors.isEmpty()){
       return res.status(422).render('add-products',{
            editing: false,
            hasError: true,
            product: {
                name: name,
                price: price,
                description: description
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    const product = new Product({name: name, price: price, description: description, imageUrl:imageUrl, userId: req.user});

    product.save().then((result)=>{
        console.log('created product added to database');
        res.redirect('/admin/add-products');
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}

//populate('userId','name email')//first argument is field second is nested arguments

exports.getAdminControl = (req,res,next) => {
    Product.find({userId: req.user._id}).then(products => { // use -id inside .select() to not include 
     res.render('admin-control',{
        prods: products,
      });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.deleteProduct = (req,res,next) => {
   const prodId = req.params.productId;

   Product.findById(prodId).then(product => {
    if(!product){
        return next(new Error('Product not found.'));
    }
    fileHelper.deleteFile(product.imageUrl);
     return Product.deleteOne({_id: prodId, userId: req.user._id})
   }).then(()=>{
    console.log('product deleted');
    res.status(200).json({message: 'Success!'});

 }).catch(err => {
   res.status(500).json({message: 'Deleting product failed!'});
});
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if(!editMode){
        return;
    }
    const prodId = req.params.productId;
    Product.findById(prodId).then((product) => {
        if(!product) {
            return res.redirect('/');
        }
        console.log(product);

        res.render('add-products',{
            editing: editMode,
            product: product,
            hasError: false,
            errorMessage: null,
            validationErrors: []
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.postEditProduct = (req ,res, next) => {
    const prodId = req.body.productId;
    const updatedName = req.body.name;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updatedDesc = req.body.description;
     
    const errors = validationResult(req);

    if(!errors.isEmpty()){
       return res.status(422).render('add-products',{
            editing: true,
            hasError: true,
            product: {
                name: updatedName,
                price: updatedPrice,
                description: updatedDesc,
                _id: prodId
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    Product.findById(prodId).then(product => {
        if(product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }
        product.name = updatedName;
        product.price = updatedPrice;
        product.description = updatedDesc;
        if(image) {
            fileHelper.deleteFile(product.imageUrl);
            product.imageUrl = image.path;
        }
      return product.save().then( result => {
        console.log('Product Updated');
        res.redirect('/')
    })
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}