'use strict'

const express = require('express')
const Daftar = express.Router()

const bodyParser = require('body-parser')
const mysql = require('mysql2')
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const passwordHash = require('pbkdf2-password')()
require('dotenv').config()

const table = "user"

// eslint-disable-next-line no-undef
const salt = process.env.SALT
const config = {
  // eslint-disable-next-line no-undef
  host: process.env.dbHost, user: process.env.dbUser, password: process.env.dbPassword, database: process.env.dbDatabase
}

Daftar.post('/', urlencodedParser, async function (req, res) {
  const response = {}
  try{
    if(!req.body.nama_lengkap || !req.body.email || !req.body.password || !req.body.kelas) throw ({message: "Masukkan nama_lengkap, email, password, dan kelas", statusCode: 400})
    if(await exists(req.body.email)) throw ({message: "Email sudah terdaftar", statusCode: 400})

    passwordHash({ password: req.body.password, salt: salt }, function (err, pass, salt, hash) {
      if (err) throw err
      insert('nama_lengkap, email, password, kelas', `'${req.body.nama_lengkap}', '${req.body.email}', '${hash}', '${req.body.kelas}'`)
    })

    response.message = "Pendaftaran berhasil"
    res.json(response)

  }catch(error){
    response.message = error.message || error
    res.statusCode = error.statusCode || 500
    res.json(response)
  }
})

// Function for select data from database
function select(attribute, condition) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(config)
    const sql = `SELECT ${attribute} FROM ${table} WHERE ${condition}`

    connection.query(sql, (err, result) => {
      if(err) return reject(err)
      resolve(result)
    })

    connection.end()
  })
}

// Function for insert data to database
function insert(field, data) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(config)
    const sql = `INSERT INTO ${table} (${field}) VALUES (${data})`

    connection.query(sql, (err, result) => {
      if(err) return reject(err)
      resolve(result)
    })

    connection.end()
  })
}

// check if the credential already registered
async function exists(email) {
  const result = await select("id", `email='${email}'`)
  return (result.length > 0)
}

module.exports = Daftar