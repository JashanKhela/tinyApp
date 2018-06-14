const express = require('express');
const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');

//require your body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//require the COOKIES parser
var cookieParser = require('cookie-parser')
app.use(cookieParser())


//DATAPOOL FOR URLS
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//DATAPOOL FOR USERS
const users = {
  "acbc1": {
    id: "acbc1",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "zxcv2": {
    id: "zxcv2",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "asdf3": {
    id: "asdf3",
    email: "MrT@gmail.com",
    password : "fluffy",
  }
}


//get method for urls/
app.get('/urls',function(req , res){
    let templateVars = { urls : urlDatabase,
        username: req.cookies["username"], } ;
    res.render('urls_index' , templateVars )
});

//POST method WITH A NEW RANDOM STRING
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body['longURL']

  //console.log(req.body);  // debug statement to see POST parameters
  res.redirect('/urls')
  //This redirect allows the app to redirect back to home page
});


//POST method to delete a post
app.post("/urls/:id/delete", (req, res) => {
  let deleteURL = req.params.id
  delete urlDatabase[deleteURL]
  console.log(urlDatabase)
  res.redirect('/urls')
});



//After you submit a new URL, get redirected back to home page
app.get("/urls/new", (req, res) => {

  let templateVars = { shortURL: req.params.id,
                        longURL: urlDatabase[req.params.id],
                        username: req.cookies["username"],};
  res.render("urls_new", templateVars);
});


//get method for urls/:id
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                        longURL: urlDatabase[req.params.id],
                        username: req.cookies["username"],};
  res.render("urls_show", templateVars);
});

//Use the short URL to be redirected to the longURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});


//A function for returning a random ID to be used for your NEW shortURL
function generateRandomString() {
  var id = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    id += possible.charAt(Math.floor(Math.random() * possible.length));

  return id;
}

//GET method to show previous values on your update page
app.get("/urls/:id/", (req , res) => {
    let templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id],
        username: req.cookies["username"],
    };
    res.render("urls_show", templateVars);
})

//Update your URLs and get redirected back to the main Page
app.post("/urls/:id/", (req , res) => {
    console.log(req.params.id)

    urlDatabase[req.params.id] = req.body.longURL
    res.redirect('/urls')
})


//This is the Get / login endpoint
app.get('/login', function(req , res){
    let templateVars = users ;
    console.log(templateVars)
    res.render('urls_login' , users  )
})



//This method is to collect the username and store as a cookie
app.post("/login" , function (req, res) {
    let username = req.body.username
    res.cookie('username' , username)
    res.redirect('/urls')
})

//Logout Method and Clear Cookies
app.post('/logout' , function(req , res){
    res.clearCookie('username',);
    res.redirect('/urls')
})

//Go to User Creation Page
app.get('/register', function(req , res){
    let templateVars = users ;
    console.log(templateVars)
    res.render('urls_register' , users  )
})

//POST for /register
app.post('/register', function(req , res){
    const newUserID = generateRandomID();
    const NewEmail = req.body.email;
    const NewPassword = req.body.password ;
    res.cookie('username' , newUserID)
    let valid = errorCheck(newUserID , NewEmail , NewPassword);
    if(valid) {
    const newUser = {
        id: newUserID,
        email: req.body.email,
        password: req.body.password
    }
    users[newUserID] = newUser;
    res.cookie('username' , newUserID)
    res.redirect('/urls')
    } else {
        res.render('urls_register' , { error : 'Status Code 404'})
    }
})

//UniqueIDforUsers
function generateRandomID() {
  let id = "";
  let possible = "abcdefghijklmnopqrstuvwxyz012345";

  for (let i = 0; i < 5; i++)
    id += possible.charAt(Math.floor(Math.random() * possible.length));

  return id;
}
//Check to see if the fields are populated
function errorCheck(newUserID , NewEmail , NewPassword){
  if (NewEmail.length > 0 && NewPassword.length > 0 && checkExistingEmail(NewEmail)) {

    return true;
  }
  return false;
}
//Check to see if the email already exists
function checkExistingEmail(email){
let valid = true;
    for (let key in users){
        if(users[key].email === email){
            valid = false
        }
        // return true
    }
    return valid
}

//make sure you are listening
app.listen(8080);
console.log('8080 is the magic port');
