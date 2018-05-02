var express = require('express');
var router = express.Router();
var userController = require('../controller/userInfoController');
var User = require('../models/user.js');
var mid = require('../../middleware/index');


router.get('/profile', mid.requiredLogin, userController.toProfile);

router.get('/login', mid.loggedOut, function(req, res, next) {
  return res.render('login', {title: 'Log In'});
});

router.post('/login', userController.login);


// GET /logout
router.get('/logout', userController.logout);

// GET /
router.get('/', userController.toIndex);

// GET /about
router.get('/about', function(req, res, next) {
  return res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

// Get /register
router.get('/register', mid.loggedOut, function(req, res, next) {
  return res.render('register', { title: 'Register'});
})

// Post /register
router.post('/register', userController.register);


module.exports = router;
