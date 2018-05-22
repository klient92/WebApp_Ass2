var express = require('express');
var router = express.Router();
var userController = require('../controller/userInfo');
var overallController = require('../controller/overallAnalytics')
var User = require('../models/user.js');
var mid = require('../../middleware/index');


router.get('/profile', mid.requiredLogin, userController.toProfile);

router.get('/login', mid.loggedOut, function(req, res, next) {
  return res.render('login', {title: 'Log In'});
});

router.post('/login', userController.login);

// ------------------------------ Overall Analytics ------------------------
// Get /overall
router.get('/overall', mid.requiredLogin, function(req, res, next){
    return res.render('overall', { title: 'Overall Anayltics'})
});
// Get /Titles of the three articles with highest number of revisions.
// This is the default behavior.
router.get('/overall/tln-articles-with-highest-number-of-revisions', mid.requiredLogin,overallController.getTLNArticleWithHighestRevision);

// The article edited by largest / smallest group of registered users.
router.get('/overall/tln-articles-edited-by-registered-users', mid.requiredLogin, overallController.rankByGroupOfRgsdUser);

// ------------------------------------ User ----------------------------------
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


// Get /individual
router.get('/individual', mid.requiredLogin, function(req, res, next){
    return res.render('individual', { title: 'Individual Article Anayltics'})
});
// Get /author
router.get('/author', mid.requiredLogin, function(req, res, next){
    return res.render('author', { title: 'Author Anayltics'})
});

// Post /register
router.post('/register', userController.register);


module.exports = router;
