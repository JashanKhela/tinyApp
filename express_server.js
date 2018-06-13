const express = require('express');
const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');

//require your body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



//get method for urls/
app.get('/urls',function(req , res){
    let templateVars = { urls : urlDatabase } ;
    res.render('urls_index' , templateVars )
});

//POST method WITH A NEW RANDOM STRING
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body['longURL']
  console.log(urlDatabase)

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




app.get("/urls/new", (req, res) => {
  res.render("urls_new");
  res.redirect('/urls')
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

//GET method to show previous values on your update page
app.get("/urls/:id/", (req , res) => {
    let templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id]
    };

    res.render("urls_show", templateVars)

})




app.post("/urls/:id/", (req , res) => {
    console.log(req.params.id)

    urlDatabase[req.params.id] = req.body.longURL
    console.log(urlDatabase)

    res.redirect('/urls')

})


//make sure you are listening
app.listen(8080);
console.log('8080 is the magic port');