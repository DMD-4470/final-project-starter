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
app.get('/', createUserIfNotExists, async (req, res) => {

    let isAuthenticated = req.oidc.isAuthenticated();

    // Render index.njk using the variable "title" 
   res.render('index.njk', { title: "Public Page", isAuthenticated });
})


// Only authenticated users can view this page!
app.get('/profile', requiresAuth(), (req, res) => {
    console.log(req.oidc.user)

    res.render('profile.njk', { title: "Your Profile", user: req.oidc.user });

})

/**
 * This is a middleware function that will check if the user exists in the database.
 * If the user does not exist, it will create the user in the database.
 * This function will only run if the user is authenticated.
 */
async function createUserIfNotExists (req, res, next) {

    console.info("Checking if this user exists in database...")

    if(req.oidc.isAuthenticated()){

        // Get the user information from the request
        let { sub:auth0_id, given_name, family_name, email, picture } = req.oidc.user

        // Check if the logged-in user exists in the database
        let user = await client.query('SELECT * FROM users WHERE auth0_id = $1', [auth0_id])
        if(user.rowCount === 0){
            console.log('New User! Inserting into database')
            // Insert the user into the database
            await client.query(
                'INSERT INTO users (auth0_id, given_name, family_name, email, picture) VALUES ($1, $2, $3, $4, $5)', 
                [auth0_id, given_name, family_name, email, picture || null]
            )
            console.info('User inserted into database:', email)
        }else{
            console.info('User already exists in database:', user.rows[0].email)
        }
    }else{
        console.info('Nevermind. This user is not authenticated.')
    }

    // Carry on my wayward son...
    next()
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})