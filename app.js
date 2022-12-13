const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000

app.set("view engine", "ejs")
app.use(express.static("public"))

app.get("/", (req, res) => {
    res.render("index")
})

app.get("/about", (req, res) => {
    res.render("about")
})

app.get("/register", (req, res)=>{
    res.render("signup")
})

app.get("/login", (req, res)=>{
    res.render("login")
})

app.listen(PORT, ()=>console.log(`Server listening on ${PORT}`))