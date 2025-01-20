var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) { 
    delete req.session.user;
    delete req.session.returnTo;
    res.redirect('/');
    //res.render('logout', { title: 'Logout' });
});

// router.post('/', function(req, res, next) {        
//     delete req.session.user;
//     delete req.session.returnTo;
//     res.redirect('/');
// });

module.exports = router;
