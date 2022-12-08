'use strict'

const express = require('express')
const cors = require('cors')
const app = module.exports = express();

const showdown  = require('showdown')
const converter = new showdown.Converter()

const fs = require('fs')


app.get('/', function(req, res) {
  // res.json({"message": "Hello From Root"})
  fs.readFile('./README.md', 'utf8', (err, data) => {
    const html = converter.makeHtml(data)
    res.send(html);
  });
});

app.use('/login', require('./auth/Login'))
app.use('/daftar', require('./auth/Daftar'))

app.use('/paket-pembelajaran', require('./produk/paketPembelajaran'))

app.use('/profile', require('./account/profile'))
app.use('/paket-saya', require('./account/paketSaya'))

app.use('/pembelian', require('./transaksi/pembelian'))
app.use('/riwayat', require('./transaksi/riwayat'))
app.use('/riwayat', require('./transaksi/detailRiwayat'))

app.use('/checkout', require('./transaksi/checkout'))

app.use(cors({ credential: true, origin: 'http//localhost' }));

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000)
  console.log('Express started on port 3000')
}