const express = require('express');
const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');
const bcrypt = require('bcrypt');
//require your body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
//require the COOKIES parser
var cookieSession = require('cookie-session') ;
//use the cookiesession
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

const urlDatabase1 = {
  "b2xVn2": { user_id : "acbc1",
            url : "http://www.lighthouselabs.ca",  },
  "9sm5xK": { user_id : "asdf3",
            url :"http://www.google.com"
            }
};
//DATAPOOL FOR USERS
const users = {
  "acbc1": {
    id: "acbc1",
    email: "user@example.com",
    password: "purple",
    hashedPassword : bcrypt.hashSync("purple", 10)
  },
 "zxcv2": {
    id: "zxcv2",
    email: "user2@example.com",
    password: "dishwasher-funk",
    hashedPassword : bcrypt.hashSync("dishwasher-funk", 10)

  },
  "asdf3": {
    id: "asdf3",
    email: "MrT@gmail.com",
    password : "fluffy",
    hashedPassword : bcrypt.hashSync("fluffy", 10)
  }
}

//get method for urls/
app.get('/urls',function(req , res){
  const user_id = req.session.user_id ;
  const user_object = checkForUsersInDB(user_id) ;
  const userURLs = urlsForUsers(user_id) ;
  let templateVars = {
    urls : userURLs,
    user : user_object,

     } ;
  res.render('urls_index' , templateVars ) ;
});


app.get('/urls.json',function(req , res){
  return res.json(urlDatabase1);
});

//After you submit a new URL, get redirected back to home page
app.get("/urls/new",ensureLoggedIn, (req, res) => {
  const user_id = req.session.user_id ;
  const user_object = checkForUsersInDB(user_id) ;
  let templateVars = { shortURL: req.params.id,
    longURL: urlDatabase1[req.params.id],
    user : user_object,
    };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.session.user_id ;
  const user_object = checkForUsersInDB(user_id) ;
  let url = urlDatabase1[req.params.id] ;
  console.log(url)
  let templateVars = { shortURL: req.params.id,
                        longURL: urlDatabase1[req.params.id],
                        user : user_object,
                        };
  res.render("urls_show", templateVars);
});

//Use the short URL to be redirected to the longURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase1[req.params.shortURL]
  res.redirect(longURL);
});

//GET method to show previous values on your update page
app.get("/urls/:id/", (req , res) => {
  const user_id = req.session.user_id ;
  const user_object = checkForUsersInDB(user_id) ;
  let templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase1[req.params.id].url,
        user : user_object,
    };
  res.render("urls_show", templateVars);
})

//This is the Get / login endpoint
app.get('/login', function(req , res){
  const user_id = req.session.user_id;
  const user_object = checkForUsersInDB(user_id);

  let templateVars = { shortURL: req.params.id,
                      longURL: urlDatabase1[req.params.id],
                      user : user_object,

                      };
  res.render('urls_login' , templateVars) ;
})

//This method is to collect the username and store as a cookie
app.post("/login" , function (req, res) {
  let userEmail = req.body.email ;
  let userPassword = req.body.password ;
  var user = {} ;
  for(var userId in users) {
    if(users[userId].email === req.body.email) {
      user = users[userId] ;
    }
  }
  if(user){
    if(bcrypt.compareSync(userPassword , user.hashedPassword)){
      req.session.user_id = user.id ;
      res.redirect('/urls') ;
    } else {
      res.status(403).send('Invalid Login , Check your login info') ;
    }
    } else {
        res.status(403).send('User does not exist , Check your login info') ;
      }
})
//Logout Method and Clear Cookies
app.post('/logout' , function(req , res){
  req.session = null ;
  res.redirect('/urls') ;
})


//Go to User Creation Page
app.get('/register', function(req , res){
  let templateVars = users;
  res.render('urls_register' , users  )
})


//POST method WITH A NEW RANDOM STRING
app.post("/urls", (req, res) => {
  const user_id = req.session.user_id ;
  let shortURL = generateRandomString();
  urlDatabase1[shortURL] = {
    user_id : user_id,
    url : req.body['longURL']
  }
  res.redirect('/urls')
  //This redirect allows the app to redirect back to home page
});

//POST method to delete a post
app.post("/urls/:id/delete", (req, res) => {
  let deleteURL = req.params.id ;
  delete urlDatabase1[deleteURL] ;
  res.redirect('/urls') ;
});


//Update your URLs and get redirected back to the main Page
app.post("/urls/:id/", (req , res) => {
  urlDatabase1[req.params.id].url = req.body.longURL;
  res.redirect('/urls') ;
})








// //This method is to collect the username and store as a cookie
// app.post("/login" , function (req, res) {
//   let userEmail = req.body.email ;
//   let userPassword = req.body.password ;
//   var user = {} ;
//   for(var userId in users) {
//     if(users[userId].email === req.body.email) {
//       user = users[userId] ;
//     }
//   }
//   if(user && bcrypt.compareSync(userPassword , user.hashedPassword)) {
//     req.session.user_id = user.id ;
//      res.redirect('/urls') ;
//     }
//     else {
//       res.status(403).send('Invalid Login , Check your login info') ;
//     }
// })

// //Logout Method and Clear Cookies
// app.post('/logout' , function(req , res){
//   req.session = null ;
//   res.redirect('/urls') ;
// })


// //Go to User Creation Page
// app.get('/register', function(req , res){
//   let templateVars = users;
//   res.render('urls_register' , users  )
// })

//POST for /register
app.post('/register', function(req , res){
  const newUserID = generateRandomID();
  const NewEmail = req.body.email;
  const NewPassword = req.body.password ;
  const hashedPassword = bcrypt.hashSync(NewPassword, 10);
  let valid = errorCheck(newUserID , NewEmail , NewPassword);
    if(valid) {
      const newUser = {
      id: newUserID,
        email: req.body.email,
        password: req.body.password,
        hashedPassword : hashedPassword
    }
  users[newUserID] = newUser;
  req.session.user_id = newUserID ;
  res.redirect('/urls') ;
    } else {
  res.render('urls_register' , { error : 'Status Code 404'})
    }
})
//Check to see if users exist in database
function checkForUsersInDB(userid) {
  const user = {};
  for (var item in users) {
    if (users[item].id === userid ) {
      return users[item] ;
    }
  }
  return user ;
}
//Function to store URL for users
function urlsForUsers(id){
  const userUrl = {} ;
  for(let item in urlDatabase1){
    if(urlDatabase1[item].user_id === id){
      userUrl[item] = urlDatabase1[item].url ;
    }
  }
  return userUrl ;
}
//Function to ensure the user is logged in
function ensureLoggedIn(req, res, next) {
  const userId = req.session.user_id ;
  if (userId) {
    res.locals.user = users[userId];
    res.locals.urls = urlDatabase1;
    return next();
  }
  return res.redirect('/login');
}
//A function for returning a random ID to be used for your NEW shortURL
function generateRandomString() {
  var id = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++)
    id += possible.charAt(Math.floor(Math.random() * possible.length));
  return id;
}
//Check to see if email exist
function checkExistingEmail(email) {
  for(var item in user) {
    if(user[item].email === userEmail) {
      var existingUser = user[item];
    }
  return existingUser;
    }
}
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
  for (let useremail in users){
    if(users[useremail].email === email){
      valid = false ;
    }
        // return true
  }
    return valid ;
}

//make sure you are listening
app.listen(PORT);
console.log(`${PORT} is listening , Hello User`);