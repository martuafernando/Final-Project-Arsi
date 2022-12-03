'use strict'

const express = require('express')
const Login = express.Router()

const bodyParser = require('body-parser')
const mysql = require('mysql2')
const jwt = require('jsonwebtoken')
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

Login.post('/', urlencodedParser, async function (req, res) {
  const response = {}
  try{
    if(!req.body.email || !req.body.password) throw ({message: "Masukkan email dan password", statusCode: 400})
    if(!await exists(req.body.email)) throw ({message: "Email tidak terdaftar", statusCode: 400})

    passwordHash({ password: req.body.password, salt: salt }, async function (err, pass, salt, hash) {
      try{
        if (err) throw err
        if(hash == (await select("password", `email='${req.body.email}'`))[0].password){
          // eslint-disable-next-line no-undef
          const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            user_id: (await select("id", `email='${req.body.email}'`))[0].id
          // eslint-disable-next-line no-undef
          }, process.env.key)
          
          response.message = "Login berhasil"
          response.data = {"token": token }
          res.json(response)
        } else {
          response.message = "Email atau password tidak sesuai"
          res.statusCode = 400
          res.json(response)
        }
      }catch(error){
        response.message = error.message || error
        res.statusCode = error.statusCode || 500
        res.json(response)
      }
    })

  }catch(error){
    response.message = error.message || error
    res.statusCode = error.statusCode || 500
    res.json(response)
  }
})

// Function for select data from database
function select(attribute, condition=null) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(config)
    
    let sql

    if(condition==null){
      sql = `SELECT ${attribute} FROM ${table}`
    }else{
      sql = `SELECT ${attribute} FROM ${table} WHERE ${condition}`
    }

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

module.exports = Login