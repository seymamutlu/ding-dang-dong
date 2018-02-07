const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
const User = mongoose.model('User');

const multerOptions = {
    storege: multer.memoryStorage(),
    fileFilter(req,file,next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if(isPhoto) {
            next(null, true);
        } else {
            next({ message: `The filetype isn't allowed!` }, false);
        }
    }
};
exports.homePage = (req, res) => {
    res.render('index');
  };
exports.storeController = (req,res) => {
    console.log('Heeeyyyy');
    res.send("Heyyy")
};

exports.addStore = (req,res) => {
    console.log('Heeeyyyy');
    res.render('editStore', { title: 'Add Store'});
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req,res,next) => {
    // Check if there is no new file to resize
    if(!req.file) {
        next();
        return
    }
    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    // Now we resize
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);
    // Once we have written the photo to pur filesystem, keep going!
    next();
};

exports.createStore = async (req,res) => {
    req.body.author = req.user.id;
    console.log('Let\'s save the store!');
    const store = await(new Store(req.body)).save();
    req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`);
    res.redirect(`/store/${store.slug}`);
   // res.json(req.body);
    //res.render('editStore', { title: 'Add Store'});
};

exports.getStores = async (req, res) => {
    // Query the database for a list of all stores
    const page = req.params.page || 1;
    const limit = 4;
    const skip = (page * limit) - limit;
    const storesPromise =  Store
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ created: 'desc' });

    const countPromise = Store.count();

    const [stores, count] = await Promise.all([storesPromise, countPromise]);
    //console.log(stores);
    const pages = Math.ceil(count / limit);
    if(!stores.length && skip) {
        req.flash('info', `Hey! You asked for page ${page}. But that doesn't exist. So I put you on page ${pages}`);
        res.redirect(`/stores/page/${pages}`);
        return;
    }
    res.render('stores', { title: 'Stores', stores, page, pages, count} );
};

const confirmOwner = (store, user) => {
    if(!store.author.equals(user._id)) {
        throw Error('You must own a store in order to edit it!');
    }
    else {
        return false;
    }
};

exports.editStore = async (req,res) => {
    // 1. 
    const store = await Store.findOne({_id: req.params.id});

    // 2. Confirm that user is the owner
    confirmOwner(store, req.user);
    
    res.render('editStore', {title: `Edit ${store.name}`, store});
  
    req.flash('error', 'You don\'t have an autorizatio to edit this store!');
    res.redirect('/stores');
};

exports.updateStore = async (req,res) => {
    req.body.location.type = 'Point';
    const store = await Store.findOneAndUpdate({ _id: req.params.id}, req.body, { new: true, runValidators: true}).exec();
    req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store</a>`)
    res.redirect(`/stores/${store._id}/edit`);
};

exports.getStore = async (req, res) => {
    // Query the database for a list of all stores
    const store = await Store.findOne({slug: req.params.slug}).populate('author reviews');
    if(!store)
      return next();
    console.log(store);
    res.render('store', { title: `${store.name}`, store} );
};

exports.getStoresByTag = async (req,res) => {
    const tag = req.params.tag;
    const tagQuery = tag || { $exists: true };
    const tagsPromise =  Store.getTagsList();
    const storesPromise = Store.find({ tags: tagQuery});
    const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
    res.render('tag', {tags, title: 'Tags', tag, stores});
};

exports.searchStores = async (req, res) => {
    const stores = await Store.find({
        $text: {
            $search: req.query.q
        }
    }, {
        score: { $meta: 'textScore' }
    })
    .sort({
        score: { $meta: 'textScore'}
    })
    .limit(5);
    res.json(stores);
};


exports.mapStores = async(req,res) => {
    const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
    const q = {
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates
                },
                $maxDistance: 10000  //10km
            }
        }
    }
    const stores = await Store.find(q).select('slug name description location photo').limit(10);
    res.json(stores);
};

exports.mapPage = async(req,res) => {
    res.render('map', {title: 'Map'});
};

exports.heartStore = async (req,res) => {
    const hearts = req.user.hearts.map(obj => obj.toString());
    const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
    const user = await User.findOneAndUpdate(req.user._id,
    {
        [operator]: { hearts: req.params.id}
    }, 
    { new: true }
    );
    console.log(hearts);
    res.json(user);
};

exports.getHearts = async (req, res) => {
    const stores = await Store.find({
        _id: { $in: req.user.hearts }
    });
    res.render('stores', { title: 'Hearted Stores', stores });
};

exports.getTopStores = async (req,res) => {
    const stores = await Store.getTopStores();
    //res.json(stores);
    res.render('topStores', { stores, title : '* Top Stores!'});
};