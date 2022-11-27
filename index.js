'use strict'

const express = require('express')
const app = module.exports = express();


app.get('/', function(req, res) {
  res.json('message: Hello from root route.')
});

app.use('/login', require('./auth/login'))
app.use('/daftar', require('./auth/daftar'))

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000)
  console.log('Express started on port 3000')
}