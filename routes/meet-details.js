var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/:lat/:lon', function(req, res, next) {
  res.render('meet-details', { title: 'Venda | Meet Details' });
});

module.exports = router;