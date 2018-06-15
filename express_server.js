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


// DATAPOOL FOR URLS
const urlDatabase = {

  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",

};

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
    password: "purple"
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

function urlsForUsers(id){
    const userUrl = {}
    for(let item in urlDatabase1){
        if(urlDatabase1[item].user_id === id){
            userUrl[item] = urlDatabase1[item].url ;
        }
    }
    console.log(userUrl );
    return userUrl ;
}

//get method for urls/
app.get('/urls',function(req , res){
    const user_id = req.cookies.user_id ;
    const user_object = checkForUsersInDB(user_id) ;
    const userURLs = urlsForUsers(user_id)
    let templateVars = {
            urls : userURLs,
            user : user_object,
         //urls : urlDatabase1
     } ;
    res.render('urls_index' , templateVars )
});


app.get('/urls.json',function(req , res){
    return res.json(urlDatabase1);
});


function checkForUsersInDB(userid) {
    const user = {}
    for (var item in users) {
        console.log(users[item])
        if (users[item].id === userid ) {
            return users[item]
        }
    }
    return user ;
}


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



function ensureLoggedIn(req, res, next) {
  const userId = req.cookies.user_id

  if (userId) {
    res.locals.user = users[userId];
    res.locals.urls = urlDatabase;
    return next();
  }
  return res.redirect('/login');
}

//After you submit a new URL, get redirected back to home page
app.get("/urls/new",ensureLoggedIn, (req, res) => {
    const user_id = req.cookies.user_id
    const user_object = checkForUsersInDB(user_id)
    // const {user} = res.locals;
  let templateVars = { shortURL: req.params.id,
                        longURL: urlDatabase[req.params.id],
                        user : user_object,
                        };
  res.render("urls_new", templateVars);
});


//get method for urls/:id
app.get("/urls/:id", (req, res) => {
    const user_id = req.cookies.user_id
    const user_object = checkForUsersInDB(user_id)

  let templateVars = { shortURL: req.params.id,
                        longURL: urlDatabase[req.params.id],
                        user : user_object,
                        };
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
    const user_id = req.cookies.user_id
    const user_object = checkForUsersInDB(user_id)

    let templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id],
        user : user_object,
    };
    res.render("urls_show", templateVars);
})

//Update your URLs and get redirected back to the main Page
app.post("/urls/:id/", (req , res) => {


    urlDatabase[req.params.id] = req.body.longURL
    res.redirect('/urls')
})


//This is the Get / login endpoint
app.get('/login', function(req , res){
    const user_id = req.cookies.user_id
    const user_object = checkForUsersInDB(user_id)


    let templateVars = { shortURL: req.params.id,
                        longURL: urlDatabase[req.params.id],
                        user : user_object
                        };
    res.render('urls_login' , templateVars   )

})





function ExsistingPassword(user,password ){
    if(password === user.password) {
        return true
    }
    return false
}


//This method is to collect the username and store as a cookie
app.post("/login" , function (req, res) {
    let userEmail = req.body.email
    let userPassword = req.body.password
    let user = {

    }

    for(var item in users) {
        if(users[item].email === req.body.email ) {
            user = users[item]
        }
    }

   if(ExsistingPassword(user, userPassword)){
    res.cookie('user_id' , user.id)
    res.redirect('/urls')

   } else {
    res.render('urls_login' , { error : 'Status Code 403'})
   }


})

//Check to see if email exist
function checkExistingEmail(email) {
        for(var item in user) {
        if(user[item].email === userEmail) {
            var existingUser = user[item]
        }
        return existingUser
    }

}



//Logout Method and Clear Cookies
app.post('/logout' , function(req , res){
    res.clearCookie('user_id',);
    res.redirect('/urls')
})

//Go to User Creation Page
app.get('/register', function(req , res){
    let templateVars = users ;
    res.render('urls_register' , users  )
})

//POST for /register
app.post('/register', function(req , res){
    const newUserID = generateRandomID();
    const NewEmail = req.body.email;
    const NewPassword = req.body.password ;


    let valid = errorCheck(newUserID , NewEmail , NewPassword);
    if(valid) {
    const newUser = {
        id: newUserID,
        email: req.body.email,
        password: req.body.password
    }
    users[newUserID] = newUser;
    res.cookie('user_id' , newUserID)
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
