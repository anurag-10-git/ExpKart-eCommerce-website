const mongoose = require('mongoose');

const Schema = mongoose.Schema; // this is a constructor(Schema) allows to construct schema

const productSchema = new Schema({
   name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }

});// here you define data schema of your product
//ref is set a relation between collections 
module.exports = mongoose.model('Product', productSchema) // connects a name with a schema























// const getDb = require('../util/database').getDb;
// const mongodb = require('mongodb');

// class Product {
//     constructor(name, imageUrl, price , description, id, userId){
//         this.name = name;
//         this.imageUrl = imageUrl;
//         this.price = price;
//         this.description= description;
//         this._id = id ? new mongodb.ObjectId(id) : null;
//         this.userId = userId;
//     }

//     save() {
//      const db = getDb();
//      let dbOp;

//      if(this._id){
//        dbOp = db.collection('productsStorage').updateOne({_id: this._id },{$set: this}); // you can use {$set: {name: this.name , imageUrl: this.imageUrl}}
//      }else {
//        dbOp = db.collection('productsStorage').insertOne(this);
//      }

//     //console.log('this is db in models......',db);
//       return dbOp.then(result => {
//         console.log('product-saved!');
//       }).catch(err => {
//          console.log(err);
//       })
//     }

//     static fetchAll() {
//      const db = getDb();
//      console.log('....fetching data....');
//      return db.collection('productsStorage').find().toArray().then(products => {
//       return products;
//      }).catch(err=>{
//       console.log(err);
//      })
//    } 

//    static findById(prodId) {
//     const db = getDb();
//     return db.collection('productsStorage').find({_id:new mongodb.ObjectId(prodId)}).next().then(product => {
//       console.log('product found');
//       return product;
//     }).catch(err=>{
//       console.log(err);
//     })
//    }

//    static deleteById(prodId) {
//     const db = getDb();
//     return db.collection('productsStorage').deleteOne({_id: new mongodb.ObjectId(prodId)});
//    }
// }

// module.exports = Product;