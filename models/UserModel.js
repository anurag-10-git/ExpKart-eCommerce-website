
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
   email:{
    type: String,
    required: true
   },

   password:{
    type: String,
    required: true
   },

   resetToken: String,

   resetTokenExpiration: Date,

    cart: {
        items:[{productId:{type: Schema.Types.ObjectId, ref: 'Product' ,required: true}, quantity: {type:Number, required: true}, totalPrice:{type:Number, required: true}}]
    }
});

userSchema.methods.addToCart = function(product) {

    const cartProductIndex = this.cart.items.findIndex( item => {
                    return item.productId.toString() === product._id.toString();
                })
                
                const updatedCartItems = [...this.cart.items];
                const newQuantity = 1;
        
                if(cartProductIndex >= 0) {
                 updatedCartItems[cartProductIndex].quantity += 1;
                 updatedCartItems[cartProductIndex].totalPrice += product.price;
                } else {  
                    updatedCartItems.push({productId: product._id, quantity: newQuantity, totalPrice: product.price});
                }
        
                const updatedCart = {items: updatedCartItems};
                
                this.cart = updatedCart; 

                return this.save();
 }
       
 
userSchema.methods.removeItemFromCart = function(productId) {

    const updatedCartItems = this.cart.items.filter(item => {
                    return item.productId.toString() !== productId.toString();
                });
        
   this.cart.items = updatedCartItems;
   
   return this.save();
}

userSchema.methods.clearCart = function() {
    this.cart = {items: []};
    return this.save();
}        
              

module.exports = mongoose.model('User', userSchema);






















// const { ObjectId } = require('mongodb');
// const getDb = require('../util/database').getDb;

//  class User {
//     constructor(name, email, cart, id){
//         this.name = name;
//         this.email = email;
//         this.cart = cart;
//         this._id = id;
//     }

//     save() {
//         const db = getDb();
//         return db.collection('users').insert(this).then(user => {
//             console.log('user saved!');
//         }).catch(err => {
//             console.log(err);
//         })
//     }

//     addToCart(product) {
        
//         const cartProductIndex = this.cart.items.findIndex( item => {
//             return item.productId.toString() === product._id.toString();
//         })
        
//         const updatedCartItems = [...this.cart.items];
//         const newQuantity = 1;

//         if(cartProductIndex >= 0) {
//          updatedCartItems[cartProductIndex].quantity += 1;
//         } else {  
//             updatedCartItems.push({productId: new ObjectId(product._id), quantity: newQuantity});
//         }

//         const updatedCart = {items: updatedCartItems};

//         const db = getDb();
//         return db.collection('users').updateOne({_id: new ObjectId(this._id)}, {$set: {cart : updatedCart}});




//         // const updatedCart = {items : [{productId: product._id, quantity: 1}]};
//         // const db = getDb();

//         // return db.collection('users').updateOne(
//         //     {_id: new ObjectId(this._id)},
//         //     {$set: {cart: updatedCart}}
//         // )
//     }

//     getCart() {
//         const db = getDb();
//         const productIds = this.cart.items.map(i => {
//             return i.productId
//         })
//         return db.collection('productsStorage').find({_id:{$in:productIds}}).toArray().then(products => {
//             return products.map(p => {
//                 const mappedProduct = {...p, quantity: this.cart.items.find(i =>{
//                     return i.productId.toString() === p._id.toString();
//                 }).quantity}
                
//                 const totalPrice =( mappedProduct.quantity * mappedProduct.price); 
               
//                 return {...mappedProduct, totalPrice: totalPrice }
//             })
//         })
//     }

//     removeItemFromCart(productId){
//         const updatedCartItems = this.cart.items.filter(item => {
//              return item.productId.toString() !== productId.toString();
//         });
       
//         console.log(updatedCartItems);

//         const db = getDb();
//         return db.collection('users').updateOne(
//             {_id: new ObjectId(this._id)},
//             {$set: {cart: {items: updatedCartItems}}}
//         );
//     }

//     addOrder() {
//        const db = getDb();

//        return this.getCart().then(products => {
//         const order = {
//             items: products,
//             user: {
//                 _id: new ObjectId(this._id),
//                 name: this.name,
//                 email: this.email
//             }
//            }
//            return db.collection('orders').insertOne(order)
//        }).then(result => {
//            this.cart = {items:[]}; 

//         return db.collection('users').updateOne(
//             {_id: new ObjectId(this._id)},
//             {$set: {cart: {items:[]}}}
//         );
//         });
//     }

//     getOrders() {
//         const db = getDb();
//         return db.collection('orders').find({'user._id': new ObjectId(this._id)}).toArray();
//     }

//     static findById(userId){
//         const db = getDb();
//         return db.collection('users').findOne({_id: new ObjectId(userId)})
//     }
// }

// module.exports = User;