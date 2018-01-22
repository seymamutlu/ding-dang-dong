exports.homeMiddleware = (req,res,next) => {
    req.name='Seyma'
    next();
}

exports.homepage = (req,res) => {
    console.log(`Heeeyyyy ${req.name}`);
    res.render('index');
//   const seyma = { name: 'Seyma', age: 32, cool: true };
//   res.json(seyma);
  //res.send('Hey! It works!');
};