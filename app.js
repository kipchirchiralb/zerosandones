const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000
const saltRounds = 4;
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'zerosandones'
})

db.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
  
    console.log('Connected to the MySQL server.');
});

app.set("view engine", "ejs")
// app.use(express.static("public"))  // 
app.use(express.static(path.join(__dirname, 'public')));
app.use('/profile', express.static(path.join(__dirname, 'public'))) // read further on serving static files on nested routes

app.use(express.urlencoded({ extended: true})) // body-parser
app.use(session({
    secret: "secretword",
    resave: false,
    saveUninitialized: false,
})
)
app.use((req,res, next)=>{
    // console.log(req)
    if(req.session.userId){
        res.locals.isLoggedIn = true
        res.locals.userId = req.session.userId
    }else{
        res.locals.isLoggedIn = false
    }
    next()
})

// writing a middleware function
// app.use((req, res, next) => {
//     console.log("middleware executed")
//     next()
// })

app.get("/", (req, res) => {
    if(req.session.isLoggedIn){
        res.render('home', {user: req.session.user})
    }else{
        res.render("index")
    }    
})

app.get("/about", (req, res) => {
    res.render("about")
})

app.get("/register", (req, res)=>{
    res.render("signup")
})
app.post("/register", (req, res)=>{
    // signup logic
    // compare password and confirm Password
    // if passwords match, encrypt passwords
    // check is email exists in db(email is registered)
    // if it does not, save new user details to database
    // direct them to the login page
    let user = req.body
    // console.log(user)
    if(user.password !== user.confirmpassword) {
        res.render('signup', {error: "Password and Confirm Password mismatch", user: user})
        return
    }
    bcrypt.hash(user.password, saltRounds, function(err, hash) {
        if(err){
            res.render('signup', {error: "Something went wrong"})
        }else{
            // console.log(hash)
            // Store hash in your password DB. -- continue with our logic
            db.query(`SELECT email FROM users WHERE email = '${user.email}'`, (err, results)=>{
                if(err){
                    console.log(err)
                    res.render('signup', {error: "Something went wrong. Try again"})                    
                }
                if(results.length > 0){
                    res.render('signup', {error: "Email already registered.Check your email or log in", user: user})
                }else{
                    //save user to DB
                    db.query(`INSERT INTO users(firstName, lastName, email, password, course) VALUES('${user.firstname}', '${user.lastname}', '${user.email}', '${hash}','${user.course}')`, (err) => {
                        if(err){
                            console.log(err)
                            res.render('signup', {error: "Something went wrong. Try again"})  
                        }else{
                            res.render('login', {message: "Registration successful. Login."})
                        }
                    })
                }
            })
            
        }
    });
})

app.get("/login", (req, res)=>{
    res.render("login")
})

app.post('/login', (req, res)=>{
    // login logic
    // check if email is in the database(email is registered)
    // campare password provided with tht stored in db (use bcrypt)
    let user = req.body
    // console.log(user)
    db.query(`SELECT * FROM users WHERE email =  '${user.email}'`, (err, result)=>{
        if(err) {
            console.log(err)
            res.render('login', {error: "Internal Server Error. contact Admin"})
            return
        }
        if(result.length > 0){
            // check passwords 
            // console.log(result)
            bcrypt.compare(user.password, result[0].password, function(err, matched) {
                if(matched){
                    // console.log("a successful login")
                    req.session.isLoggedIn = true
                    req.session.userId = result[0].userId
                    req.session.user = result[0]
                    // console.log(req.session.id)
                    res.redirect('/')
                }else{
                    res.render("login", {error: "Wrong Password or Email"})
                }
            });
        }else{
            res.render('login', {error: "Email not registered. Check email or Sign up."})
        }

    })

    
})

app.get('/logout', (req, res) => {
    req.session.destroy((err)=>{
        if(err){
            console.log(err)
        }
        res.redirect('/')
    })
})

app.get("/profile/:userId", (req, res)=>{
    console.log(req.params.userId)
    db.query(`select * from users where userId = ${Number(req.params.userId)}`, (err, result)=>{
        if(err) {
            console.log(err)
        }else{
            console.log(result[0])
            res.render("profile", {user: result[0]})
        }
    })
})

app.all("*", (req, res)=>{
    res.render("404")
})

app.listen(PORT, ()=>console.log(`Server listening on ${PORT}`))