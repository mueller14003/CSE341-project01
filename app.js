const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const mongoConnect = require('./util/database').mongoConnect;

const cors = require('cors') // Place this with other requires (like 'path' and 'express')

const PORT = process.env.PORT || 5000; // So we can run on heroku || (OR) localhost:5000

const errorController = require('./controllers/error');

const User = require('./models/user')

const app = express();

const corsOptions = {
  origin: "https://kmpcs.herokuapp.com/",
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('609d89b985e754a5557e45dc')
    .then(user => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    }).catch(err => {
      console.log(err);
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(() => {
  app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
});