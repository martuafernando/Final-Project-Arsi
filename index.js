'use strict'

const express = require('express')
const app = module.exports = express();


app.get('/', function(req, res) {
  res.json({"message": "Hello From Root"})
});

app.use('/login', require('./auth/Login'))
app.use('/daftar', require('./auth/Daftar'))

app.use('/paket-pembelajaran', require('./produk/paketPembelajaran'))

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000)
  console.log('Express started on port 3000')
}