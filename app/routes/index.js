var express = require('express');
var router = express.Router();
var userController = require('../controller/userInfo');
var overallController = require('../controller/overallAnalytics');
var individualController = require('../controller/individualAnalytics');
var authorController = require('../controller/authorAnalytics');
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
    console.log("aaaaaaaa");
    return res.render('overall', { title: 'Overall Anayltics'})
});
// Get /Titles of the three articles with highest number of revisions.
// This is the default behavior.
router.get('/overall/tln-articles-with-highest-number-of-revisions', mid.requiredLogin,overallController.getTLNArticleWithHighestRevision);

// The article edited by largest / smallest group of registered users.
router.get('/overall/tln-articles-edited-by-registered-users', mid.requiredLogin, overallController.rankByGroupOfRgsdUser);

// The top 3 articles with the longest history (measured by age).
router.get('/overall/top-n-article-with-lors-history', mid.requiredLogin, overallController.rankByHistory);

// A bar chart of revision number distribution by year and by user type across the
// whole dataset.
router.get('/overall/distribution_by_year_and_user', mid.requiredLogin, overallController.overallDstbByYandU);

// A pie chart of revision number distribution by user type across the whole data set.
router.get('/overall/distribution_by_user', mid.requiredLogin, overallController.distributionByUser);

// A pie chart of revision number distribution by user type across the whole data set.
router.get('/overall/get_total_articles_number', mid.requiredLogin, overallController.getTotalArticleNumber);


// ------------------------------ Individual Analytics ------------------------

// Get all titles and revisions number
router.get('/individual/get_all_title_and_revisions_nummber', mid.requiredLogin, individualController.getAllTitleAndRevisionsNumber);

// Update from wiki by title
router.get('/individual/update_title_from_wiki', mid.requiredLogin, individualController.updateLatestDataFromWikiAPI);

// The top 5 regular users ranked by total revision numbers on this article, and
// the respective revision numbers.
router.get('/individual/top_n_rgl_users_ranked_by_revisions', mid.requiredLogin, individualController.getTopNUserbyRevision);

// A bar chart of revision number distributed by year and by user type for this article.
router.get('/individual/revisions_distribution_by_year_user', mid.requiredLogin, individualController.individualDstbByYandU);

// A pie chart of revision number distribution based on user type for this article.
router.get('/individual/revisions_distribution_by_user', mid.requiredLogin, individualController.individualDstbByUser);

// A bar chart of revision number distributed by year made by one or a few of the top 5
router.get('/individual/revisions_distribution_by_year_in_top5_user', mid.requiredLogin, individualController.rvsnMadeByTop5ByY);

// ------------------------------------ Author ----------------------------------
// All user and his revisions number
router.get('/author/author_revisions', mid.requiredLogin, authorController.getUserAndHisRevisions);

// Get all article by author
router.get('/author/articles_by_author', mid.requiredLogin, authorController.articlesChangedByUser);

// Get all revisions by article
router.get('/author/revision_timestamp_by_author_and_article', mid.requiredLogin, authorController.getTimestampsOfRevisionUnderUser);


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
