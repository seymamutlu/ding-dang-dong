const mongoose = require('mongoose');

exports.login = (req, res) => {
    res.render('login', { title: 'Login' });
}

exports.register = (req, res) => {
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
    re.checkBody('password-confirm', 'Oops! Your passwords do not match!').equals(req.body.password);

    const errors = req.validateRegister();
    if(error) {
        req.flash('error', errors.map(err => err.msg));
        res.render('register', {title: 'Register', body: req.body, flashes: req.flash()});
    }
}