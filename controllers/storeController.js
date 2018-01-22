const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

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
    console.log('Let\'s save the store!');
    const store = await(new Store(req.body)).save();
    req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`);
    res.redirect(`/store/${store.slug}`);
   // res.json(req.body);
    //res.render('editStore', { title: 'Add Store'});
};

exports.getStores = async (req, res) => {
    // Query the database for a list of all stores
    const stores = await Store.find();
    console.log(stores);
    res.render('stores', { title: 'Stores', stores} );
};

exports.editStore = async (req,res) => {
    const store = await Store.findOne({_id: req.params.id});
    res.render('editStore', {title: `Edit ${store.name}`, store});
};

exports.updateStore = async (req,res) => {
    req.body.location.type = 'Point';
    const store = await Store.findOneAndUpdate({ _id: req.params.id}, req.body, { new: true, runValidators: true}).exec();
    req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store</a>`)
    res.redirect(`/stores/${store._id}/edit`);
};

exports.getStore = async (req, res) => {
    // Query the database for a list of all stores
    const store = await Store.findOne({slug: req.params.slug});
    if(!store)
      return next();
    console.log(store);
    res.render('store', { title: `${store.name}`, store} );
};