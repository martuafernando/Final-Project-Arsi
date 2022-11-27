'use strict'

const express = require('express')
const daftar = express.Router()

const bodyParser = require('body-parser');
const mysql = require('mysql')
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const passwordHash = require('pbkdf2-password')()
require('dotenv').config();

const table = "users"

// eslint-disable-next-line no-undef
const salt = process.env.SALT
const config = {
  // eslint-disable-next-line no-undef
  host: process.env.dbHost, user: process.env.dbUser, password: process.env.dbPassword, database: process.env.dbDatabase
}

daftar.post('/', urlencodedParser, async function (req, res) {
  const response = {}
  try{
    if(!req.body.email || !req.body.password) throw ({message: "Masukkan email dan password", code: 400})
    if(await exists(req.body.email)) throw ({message: "Email sudah terdaftar", code: 400})

    passwordHash({ password: req.body.password, salt: salt }, function (err, pass, salt, hash) {
      if (err) throw err;
      insert('email, password', `'${req.body.email}', '${hash}'`)
    });

    response.message = "Pendaftaran Berhasil"
    res.json(response)

  }catch(error){
    response.message = error.message || error
    res.statusCode = error.code || 500
    res.json(response)
  }
});

// Function for select data from database
function select(attribute, condition) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(config)
    const sql = `SELECT ${attribute} FROM ${table} WHERE ${condition}`;

    connection.query(sql, (err, result) => {
      if(err) return reject(err);
      resolve(result);
    });

    connection.end()
  });
}

// Function for insert data to database
function insert(field, data) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(config)
    const sql = `INSERT INTO ${table} (${field}) VALUES (${data})`;

    connection.query(sql, (err, result) => {
      if(err) return reject(err);
      resolve(result);
    });

    connection.end()
  });
}

// check if the credential already registered
async function exists(email) {
  const result = await select("id", `email='${email}'`)
  return (result.length > 0)
}

module.exports = daftar;