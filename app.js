const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql');

const app = express();
const PORT = process.env.PORT || 3000
const saltRounds = 4;
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'zerosandones'
})

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true})) // body-parser

// writing a middleware function
// app.use((req, res, next) => {
//     console.log("middleware executed")
//     next()
// })

app.get("/", (req, res) => {
    res.render("index")
    
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
    let user = req.body
    console.log(user)
    if(user.password !== user.confirmpassword) {
        res.render('signup', {error: "Password and Confirm Password mismatch"})
        return
    }
    bcrypt.hash(user.password, saltRounds, function(err, hash) {
        if(err){
            res.render('signup', {error: "Something went wrong"})
        }else{
            console.log(hash)
            // Store hash in your password DB. -- continue with our logic
            db.query(`SELECT email FROM users WHERE email = '${user.email}'`, (err, results)=>{
                if(err){
                    console.log(err)
                    res.render('signup', {error: "Something went wrong. Try again"})                    
                }
                if(results.length > 0){
                    res.render('signup', {error: "Email already registered.Check your email or log in"})
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

app.listen(PORT, ()=>console.log(`Server listening on ${PORT}`))