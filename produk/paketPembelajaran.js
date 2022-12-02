'use strict'

const express = require('express')
const PaketPembelajaran = express.Router()
const mysql = require('mysql2')
require('dotenv').config();

const table = "paket_pembelajaran"

const config = {
  // eslint-disable-next-line no-undef
  host: process.env.dbHost, user: process.env.dbUser, password: process.env.dbPassword, database: process.env.dbDatabase
}

PaketPembelajaran.get('/', async function (req, res) {
  const response = {}
  try{
    
    const results = await select("*")
    response.message = "Berhasil"
    response.data = []
    for (const result of results) {
      const d = new Date(result.kadaluarsa*1000)
      response.data.push({
        "kelas" : result.kelas,
        "nama_kelas" : result.nama,
        "deskripsi_paket" : result.deskripsi.split("|"),
        "harga" : result.harga,
        "masa_aktif_hingga" : `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`
      }) 
    }
    
    res.json(response)

  }catch(error){
    response.message = error.message || error
    res.statusCode = error.code || 500
    res.json(response)
  }
});

// Function for select data from database
function select(attribute, condition=null) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(config)
    
    let sql;

    if(condition==null){
      sql = `SELECT ${attribute} FROM ${table}`;
    }else{
      sql = `SELECT ${attribute} FROM ${table} WHERE ${condition}`;
    }

    connection.query(sql, (err, result) => {
      if(err) return reject(err);
      resolve(result);
    });

    connection.end()
  });
}

module.exports = PaketPembelajaran;