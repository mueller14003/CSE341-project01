const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 5000; // So we can run on heroku || (OR) localhost:5000

const errorController = require('./controllers/error');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
