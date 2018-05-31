function loggedOut(req, res, next){
  if (req.session && req.session.userId){
    return res.redirect('/profile');
  }
  return next();
}


function requiredLogin(req, res, next){
  if (!req.session || !req.session.userId){
    console.log('no user');
    var err = new Error('You must be logged in to view this page.');
    err.status = 401;
    return next(err);
  } else {
    console.log('ok');
    return next();
  }
}

module.exports.loggedOut = loggedOut;
module.exports.requiredLogin = requiredLogin;
