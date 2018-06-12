var express = require('express');

var app = express();

var PORT = 8080;

app.set('view engine', 'ejs');

//require your body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));



var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



//get method for urls/
app.get('/urls',function(req , res){
    let templateVars = { urls : urlDatabase } ;
    res.render('urls_index' , templateVars )
});

//POST method for urls
app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body['longURL']
  console.log(urlDatabase)

  //console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});


//get method for urls/new
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


//get method for urls/:id
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                        longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});


//A function for returning a random ID
function generateRandomString() {
  var id = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    id += possible.charAt(Math.floor(Math.random() * possible.length));

  return id;
}
//make sure you are listening
app.listen(8080);
console.log('8080 is the magic port');