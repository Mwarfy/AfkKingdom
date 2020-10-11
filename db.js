const MongoClient = require('mongodb').MongoClient
const fs = require('fs')
const vm = require('vm')

MongoClient.connect('mongodb://localhost:27017/', {useNewUrlParser : true}, async function(err, db){
  if(err) throw err
  var dbo = db.db('AFK')
  await dbo.createCollection('users')
  await dbo.createCollection('pseudo')
  await dbo.createCollection('perso')
  eval(fs.readFileSync(__dirname + '/http.js')+'')
})
