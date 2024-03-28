require('dotenv').config()
const express = require('express');
const nunjucks = require('nunjucks');

const app = express();
const port = process.env.PORT || 3000

// Database client
const client = require('./db/index.js')

const { auth, requiresAuth } = require('express-openid-connect');
const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.SITE_URL || 'http://localhost:3000',
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: 'https://bdaley.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));


// Configure Nunjucks
nunjucks.configure('views', {
    autoescape: true,
    noCache: process.env.NODE_ENV !== 'production',
    express: app
});

// Anyone can view this page!
app.get('/', async (req, res) => {

    let isAuthenticated = req.oidc.isAuthenticated();

    // Render index.njk using the variable "title" 
   res.render('index.njk', { title: "Public Page", isAuthenticated });
})


// Only authenticated users can view this page!
app.get('/profile', requiresAuth(), (req, res) => {
    console.log(req.oidc.user)

    res.render('profile.njk', { title: "Your Profile", user: req.oidc.user });

})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})