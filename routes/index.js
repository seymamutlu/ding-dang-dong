const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const { catchErrors } = require('../handlers/errorHandlers');
// Do work here
router.get('/', catchErrors(storeController.getStores));
router.get('/add', authController.isLoggedIn, storeController.addStore);
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
router.get('/stores/page/:page', catchErrors(storeController.getStores));
router.get('/stores/:id/edit', catchErrors(storeController.editStore));
router.get('/store/:slug', catchErrors(storeController.getStore));

router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

router.get('/login', userController.login);
router.post('/login', authController.login);


router.get('/register', userController.registerForm);

router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', catchErrors(userController.updateAccount));


// 1. We need to validate the data
// 2. Save the user to the database
router.post('/register', 
userController.validateRegister,
userController.register,
authController.login
);

router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token', 
  authController.confirmedPasswords, 
  catchErrors(authController.update)
);

router.get('/reverse/:name', (req,res) => {
  const reverse = [...req.params.name].reverse().join('');
  //res.send(`Yess, it works! Hello ${req.params.name}! The reverse is ${reverse}`)
  res.render('hello', {name: reverse})
});

router.get('/logout', authController.logout);


router.get('/api/search', catchErrors(storeController.searchStores));
router.get('/api/stores/near', catchErrors(storeController.mapStores));
router.get('/map', storeController.mapPage);

router.post('/api/stores/:id/heart', catchErrors(storeController.heartStore));

router.get('/hearts', authController.isLoggedIn, catchErrors(storeController.getHearts));

router.post('/review/:id',
  authController.isLoggedIn, 
    catchErrors(reviewController.addReview)
  );

router.get('/top', catchErrors(storeController.getTopStores));

module.exports = router;
