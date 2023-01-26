const crypto = require('crypto');
const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer');
const sendinblueTransport = require('nodemailer-sendinblue-transport');
const {validationResult} = require('express-validator');

const transporter = nodemailer.createTransport(
  new sendinblueTransport({
    apiKey: "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",
  })
  );

exports.getLogin = (req, res, next) => {
  // const isLoggedIn = req.get('Cookie').trim().split('=')[1] === 'true'? true : false;
  let message = req.flash('error');

   
  if(message.length > 0){
    message = message[0];
  }else{
    message = null;
  }

  res.render("login", {
    errorMessage: message, // its an array
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.status(422).render("login", {
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password
      },
      validationErrors: errors.array()
    });
  }

  User.findOne({ email: email})
    .then((user) => {
      if (!user) {
        return res.status(422).render("login", {
          errorMessage: "Email does not exist!",
          oldInput: {
            email: email,
            password: password
          },
          validationErrors: []
        });
      }

      bcrypt.compare(password, user.password) //in both matching and non-matching case we will result to then block
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;

            return req.session.save((err) => {
              console.log(err);
              return res.redirect("/");
            });
          }
          return res.status(422).render("login", {
            errorMessage: "check your password!",
            oldInput: {
              email: email,
              password: password
            },
            validationErrors: []
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  });
};
//when we send reponse the last request is dead.
//on cookie set, by default browser will send to the server with every request cookie
//session is shared across requests not across users

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
   
  if(message.length > 0){
   message = message[0];
  }else{
    message = null;
  }

  res.render("signup", {
    errorMessage: message,
    oldInput: { email:"", password:""},
    validationErrors: []
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  // const passwordConfirm = req.body.passwordConfirm;
 console.log(email, password);
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.status(422).render("signup", {
      errorMessage: errors.array()[0].msg,
      oldInput: {email: email, password: password},
      validationErrors: errors.array()
    });
  }

      // first argument is what you want to hash 2nd is how many rounds of hashing to be applied
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then((result) => {
          res.redirect("/login");
        return transporter.sendMail({
            to: email,
            from: 'ExpKart@shop.com',
            subject: 'Signup successfully!',
            text: 'Signup successfully!',
            html: '<h1>You sccessfully signed up!</h1>'                 
          })
        }).catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
      });
};

exports.getResetPassword = (req,res,next) => {
  let message = req.flash('error');
   
  if(message.length > 0){
    message = message[0];
  }else{
    message = null;
  }
   res.render('reset-password',{
    errorMessage: message
   })
}


exports.postResetPassword = (req, res, next) => {
  crypto.randomBytes(32,(err, buffer)=>{
    if(err){
      return res.redirect('/reset-password');
    }
    const token = buffer.toString('hex');
    User.findOne({email: req.body.email}).then(user => {
      if(!user) {
        req.flash('error','No user found, check email address!');
        return res.redirect('/reset-password');
      }

      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save();
    }).then(result => {
      res.redirect('/');
      transporter.sendMail({
        to: req.body.email,
        from: 'ExpKart@shop.com',
        subject: 'reset password',
        text: 'reset password',
        html: `<p>You requested a password reset ?</p>
               <p>Click this <a href="http://localhost:3000/reset-password/${token}">link</a> to set a new password.</p>
        `                 
      })
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  })
  })
};

exports.getNewPassword = (req,res,next) => { 
  const token = req.params.token;

  User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}}).then(user => {

  let message = req.flash('error'); 

  if(message.length > 0){
    message = message[0];
  }else{
    message = null;
  }

  res.render('new-password',{
    errorMessage: message,
    userId: user._id.toString(),
    passwordToken: token
   })

  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
});
}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({resetToken: passwordToken, resetTokenExpiration:{$gt: Date.now()}, _id: userId}).then(user => {
    resetUser = user;
   return bcrypt.hash(newPassword, 12);
  }).then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
  }).then(result => {
    res.redirect('/login');
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
});
}