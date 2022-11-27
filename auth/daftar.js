'use strict'

const express = require('express')
const daftar = express.Router()

const bodyParser = require('body-parser');
const mysql = require('mysql')
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const passwordHash = require('pbkdf2-password')()


const table = "users"
const salt = "p/5AR2T_p(U)qfqQ8T&Kqn/rF$S6[DjXGTm7gW9=WmkiDtYe]cyFBmFp5jjj&qpig}R#[Q4.eW}wZL(_65(t3cR42PiWeh6N.;EN"
const config = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'FP_ARSI'
}

daftar.post('/', urlencodedParser, async function (req, res) {
  const response = {}
  try{
    if(!req.body.email || !req.body.password) throw ({message: "Masukkan email dan password", code: 400})
    if(await exists(req.body.email)) throw ({message: "Email sudah terdaftar", code: 400})

    passwordHash({ password: 'foobar', salt: salt }, function (err, pass, salt, hash) {
      if (err) throw err;
      insert('email, password', `'${req.body.email}', '${hash}'`)
    });

    response.message = "Pendaftaran Berhasil"
    res.json(response)

  }catch(error){
    response["message"] = error.message || error
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