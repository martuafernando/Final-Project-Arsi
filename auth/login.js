'use strict'

const express = require('express')
const daftar = express.Router();

const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const hash = require('pbkdf2-password')()

const users = {
  tj: { name: 'tj' }
};

function authenticate(name, pass, fn) {
  if (!module.parent) console.log('authenticating %s:%s', name, pass);
  var user = users[name];
  if (!user) return fn(null, null)
  
  hash({ password: pass, salt: user.salt }, function (err, pass, salt, hash) {
    if (err) return fn(err);
    if (hash === user.hash) return fn(null, user)
    fn(null, null)
  });
}

daftar.post('/', urlencodedParser, function (req, res, next) {
  const response = {}
  try{
    if(!req.body.email || !req.body.password) throw "Masukkan email dan password"
    
    authenticate(req.body.email, req.body.password, function(err, user){
      if (err) return next(err)
      if (user) {
        req.session.regenerate(function(){
          req.session.user = user;
          response['message'] = "Login berhasil"
        });
      } else throw "Email belum terdaftar"
    });
  }catch(error){
    response["message"] = error
    res.json(response)
  }
});

module.exports = daftar;