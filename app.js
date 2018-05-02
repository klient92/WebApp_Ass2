var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var helper = require('./helper/text-processing');
var app = express();
var Revision = require('./app/models/revision');
var Editor = require('./app/models/editor');

// mongodb connection
var mongoDB = 'mongodb://localhost:27017/wikilatic';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var conn = mongoose.connection;
// mongo error
conn.on('error', console.error.bind(console, 'connection error:'));

// Check Editors exist and write
conn.on('open', function () {
    //helper.addRoleToData('./public/data/Bot.txt');
    Revision.bulkUpdateUser('./public/data/Bot.txt','bot');
    conn.db.listCollections({name: 'editors'})
        .next(function(err, collinfo) {
            if (!collinfo) {
                Editor.writeEditorsToDB('./public/data/Bot.txt','bot');
                //helper.writeEditorsToDB('./public/data/Bot.txt', './public/data/Admin.txt');
            }
        });
});

// Join
//helper.joinEditorAndRevisions()

//
//helper.getNewestData();

// helper.test();
// use express-session for tracking logins
app.use(session({
  secret: 'charlezheng',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: conn
  })
}));

app.use(function(req, res, next){
  res.locals.currentUser = req.session.userId;
  next();
});

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from /public
app.use(express.static(__dirname + '/public'));

// view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/app/views');

// include routes
var routes = require('./app/routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// listen on port 3000
app.listen(3000, function () {
  console.log('Express app listening on port 3000');
});
