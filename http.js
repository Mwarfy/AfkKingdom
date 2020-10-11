var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var multer = require('multer')
var upload = multer()
var session = require('express-session')
var cookieParser = require('cookie-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var database = require('./check')
var requete = require('./checkHttp')

app.set('view engine', 'pug')
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(upload.array());
app.use(cookieParser());
app.use(session({secret: "Your secret key"}));

app.use(function(req,res,next){
  next()
})
.get('/game', function(req,res){
  requete.checkLoadPage(req, res, 'game', '/signin')
})
.get('/compte', function(req, res){
  requete.checkLoadPage(req, res, 'compte', '/signin')
})
.get('/classement', function(req, res){
  requete.checkLoadPage(req, res, 'classement', '/signin')
})
.get('/personnages', async function(req, res){
  let tab = await dbo.collection('perso').find({_id:req.session.user.id}).toArray()
  if(!(req.session.error))
  {
    req.session.error = {
      errorPseudo : 'OK',
      errorPerso : 'OK',
      errorRace : 'OK',
      errorGender: 'OK'
    }
  }
  if(req.session.user){
    res.render('personnages', {tab:tab, error: req.session.error})
  }
  else
    res.redirect('/signin')
  //requete.checkLoadPage(req, res, 'personnages', '/signin')
})
.post('/personnages', async function(req, res){
  let tab = await database.checkPerso(req, dbo)
  req.session.error = {
    errorPseudo:tab.errorPseudo,
    errorPerso:tab.errorPerso,
    errorRace:tab.errorRace,
    errorGender:tab.errorGender
  }
  res.redirect('/personnages')
})
.get('/signin',function(req,res){
  requete.checkSessionError(req, res, 'signin', '/game')
})
.post('/signin', async function(req, res){
  let tab = await database.checkLogin(req.body, dbo)
  requete.checkUser(req, res, tab, '/game', '/signin', tab.error)
})
.get('/signup', function(req, res){
  requete.checkSessionError(req, res, 'signup', '/game')
})
.post('/signup', async function(req, res){
  let tab = await database.checkInscription(req.body, dbo)
  let error = {errorUsername : tab.errorUsername, errorPassword: tab.errorPassword, errorEmail: tab.errorEmail}
  requete.checkUser(req, res, tab, '/game', '/signup', error)
})
.get('/logout', function(req,res){
  req.session.destroy(function(){
    console.log('user logout')
  })
  res.redirect('/signin')
})
.get('/', function(req,res){
  if(req.session.user)
    res.redirect('/game')
  else
    res.redirect('/signin')
})
app.listen(4000, function(){
  console.log('Running on http://localhost:4000/signin')
})
