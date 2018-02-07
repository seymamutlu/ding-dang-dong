const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.login = (req, res) => {
    res.render('login', { title: 'Login' });
}

exports.registerForm = (req, res) => {
    res.render('register', { title: 'Register' });
}

exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name');
    req.checkBody('name', 'You must suppy a name!').notEmpty();
    req.checkBody('email','That Email is not valid!').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    });
    req.checkBody('password', 'Password canoot be blank!').notEmpty();
    req.checkBody('password-confirm', 'Confirmed Password cannot be blank!').notEmpty();
    req.checkBody('password-confirm', 'Oops! Your passwords do not match!').equals(req.body.password);

    const errors = req.validationErrors();
    if(errors) {
        req.flash('error', errors.map(err => err.msg));
        res.render('register', {title: 'Register', body: req.body, flashes: req.flash()});
        return;
    }
    next();
}

exports.register = async (req, res,next) => {
    const user = new User({email: req.body.email, name: req.body.name});
    // Register does not send promise so you have to user callback or you can promisify as below
    // We send also send 'User' to the promisify because the function lives on an object(so we should also send the object)
    const register = promisify(User.register, User);
    await register(user, req.body.password);
    next();
    //User.register(user,req.body.register, function(err, user){

    
    //res.render('register', { title: 'Register' });
}
exports.account = (req, res) => {
    res.render('account', { title: 'Edit Yout Account'});
}

exports.updateAccount = async(req,res,next) => {
    const updates = {
        name: req.body.name,
        email: req.body.email
    };

    const user = await User.findOneAndUpdate(
        {_id: req.user._id },
        { $set: updates },
        { new: true, runValidator: true, context: 'query' }
    );
    req.flash('success', 'Updated the profile!');
    res.redirect('back');
};