const path = require('path');

require('dotenv').config();
const cors = require('cors') // Place this with other requires (like 'path' and 'express')
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const fs = require('fs');
// const https = require('https');

// const httpsOptions = {
//   key: fs.readFileSync('./key.pem'),
//   cert: fs.readFileSync('./cert.pem')
// };

const errorController = require('./controllers/error');
const User = require('./models/user')

const app = express();

const corsOptions = {
  origin: "https://kmpcs.herokuapp.com/",
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  family: 4
};

const PORT = process.env.PORT || 5000; // So we can run on heroku || (OR) localhost:5000
const MONGODB_URL = process.env.MONGODB_URL;

const store = new MongoDBStore({
  uri: MONGODB_URL,
  collection: 'sessions'
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    MONGODB_URL, options
  )
  .then(result => {
      //https.createServer(httpsOptions, app).listen(PORT);
      app.listen(PORT);
  })
  .catch(err => {
    console.log(err);
  });