const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const storeController = require('../controllers/storeController');
const { catchErrors } = require('../handlers/errorHandlers');
// Do work here
router.get('/', homeController.homeMiddleware,homeController.homepage);
router.get('/add', storeController.addStore);
router.post('/add', 
  storeController.upload , 
  catchErrors(storeController.resize), 
  catchErrors(storeController.createStore)
);
router.post('/add/:id', 
  storeController.upload , 
  catchErrors(storeController.resize), 
  catchErrors(storeController.updateStore)
);
router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/:id/edit', catchErrors(storeController.editStore));
router.get('/store/:slug', catchErrors(storeController.getStore));

router.get('/reverse/:name', (req,res) => {
  const reverse = [...req.params.name].reverse().join('');
  //res.send(`Yess, it works! Hello ${req.params.name}! The reverse is ${reverse}`)
  res.render('hello', {name: reverse})
});

module.exports = router;
