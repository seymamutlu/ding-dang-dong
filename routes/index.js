const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
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

router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

router.get('/login', userController.login)
router.get('/register', userController.register)

// 1. We need to validate the data
// 2. Save the user to the database
router.post('/register', 
userController.validateRegister,
userController.register)


router.get('/reverse/:name', (req,res) => {
  const reverse = [...req.params.name].reverse().join('');
  //res.send(`Yess, it works! Hello ${req.params.name}! The reverse is ${reverse}`)
  res.render('hello', {name: reverse})
});

module.exports = router;
