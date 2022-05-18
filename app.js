const express = require('express');
const tradeRoutes = require('./routes/tradeRoutes')
const mainRoutes = require('./routes/mainRoutes')
const userRoutes = require('./routes/userRoutes')
const methodOverride = require('method-override');
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const flash = require('connect-flash')

const app = express();
let port = 3000;
let host = 'localhost';
app.set('view engine', 'ejs')

mongoose.connect('mongodb://localhost:27017/project3', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        //start the server
        app.listen(port, host, () => {
            console.log('Server is running on port', port);
        });
    })
    .catch(err => console.log(err.message));

app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.use(session( {
    secret: 'qwertyuiopqwertyuiop',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60*60*1000},
    store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/project3'})
}))

app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.session.user||null;
    res.locals.successMessages = req.flash('success')
    res.locals.errorMessages = req.flash('error')
    next();
})

app.use('/trades', tradeRoutes);
app.use('/user', userRoutes);
app.use('/', mainRoutes);

app.use((req, res, next) => {
    let err= new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next)=>{
    if(!err.status) {
        err.status = 500;
        err.message = "Internal server error";
    }
    res.status(err.status);
    res.render('main/error', {error: err});
});