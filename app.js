const express = require('express');
const path = require('path')
const authRoutes = require('./routes/authRoutes');
const shopRoutes = require('./routes/shopRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bodyParser = require('body-parser');
const User = require('./models/UserModel');
const errorController = require('./controller/error');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const MONGODB_URI = 'mongodb+srv://anurag:R3DfiPAZnt78pkg8@clusters.nmumkwm.mongodb.net/ExpKart';

const app = express();
const store = new MongoDBStore({
uri: MONGODB_URI,
collection: 'sessions'
});

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    } ,
    filename: (req, file, cb ) => {
        cb(null, Math.random() + '-' + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null, true);
    }else {
        cb(null, false);
    }
}

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false})) // url encoded data is text encoded data.
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname,'public')));
app.use('/images', express.static(path.join(__dirname,'images')));
app.use(session({secret: 'my secret', resave: false, saveUninitialized: false, store: store}))
//session({resave: false}) - session will not be saved on every request done, save only when something is changed in the session!.
//session({saveUninitialized: false}) - ensure that no session get saved for a request where it doesn't need to be saved because nothing was changed!

app.use(csrfProtection);
app.use(flash());

app.use((req,res,next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})//locals are local fields means set local variables present only for the views which are currently rendered

app.use((req,res,next) => {
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id).then(user => {
        if(!user) {
            return next();
        }
        req.user = user;
        next();
    }).catch(err => {
        next(new Error(err));
    })
})

//req.user - avaliable every time because it run first before any routes take place

app.use('/admin',adminRoutes)
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

// app.use((error, req, res, next) => {
//     res.status(500).render('error500',{
//         isAuthenticated: req.session.isLoggedIn
//     })
// })

mongoose.set('strictQuery', true);

mongoose.connect(MONGODB_URI).then(result => {
    app.listen(3000);
}).catch(err => {
    console.log(err);
})