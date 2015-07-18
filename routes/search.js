var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('search', { title: 'Venda | Search' });
});


router.post('/', function(req, res, next) {
  res.redirect(301, '/sell');
});

module.exports = router;