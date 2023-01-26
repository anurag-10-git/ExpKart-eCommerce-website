const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://anurag:R3DfiPAZnt78pkg8@clusters.nmumkwm.mongodb.net/NewShop?retryWrites=true&w=majority"
    )
    // mongodb+srv://anurag:R3DfiPAZnt78pkg8@clusters.nmumkwm.mongodb.net/NewShop?retryWrites=true&w=majority
    .then((client) => {
      console.log("connected");
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log(err);
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  } else {
    throw "no database found";
  }
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
