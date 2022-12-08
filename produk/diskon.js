'use strict'

const express = require('express')
const Diskon = express.Router()

const bodyParser = require('body-parser')
const mysql = require('mysql2')
const jwt = require('jsonwebtoken')
const urlencodedParser = bodyParser.urlencoded({ extended: false })
require('dotenv').config()

const diskon_table = "diskon"

const config = {
  // eslint-disable-next-line no-undef
  host: process.env.dbHost, user: process.env.dbUser, password: process.env.dbPassword, database: process.env.dbDatabase
}

Diskon.get('/', urlencodedParser, async function (req, res) {
  const response = {}
  try{
    
    const diskons = await select('*')

    response.message = "Berhasil"
    response.data = []

    for (const diskon of diskons) {
      const d = new Date(diskon.waktu_berakhir*1000)
      response.data.push({
        kode_diskon: diskon.kode_diskon,
        tanggal_berakhir: `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`
      })
    }

    res.json(response)

  }catch(error){
    console.log(error)
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
      sql = `SELECT ${attribute} FROM ${diskon_table}`
    }else{
      sql = `SELECT ${attribute} FROM ${diskon_table} WHERE ${condition}`
    }

    connection.query(sql, (err, result) => {
      if(err) return reject(err)
      resolve(result)
    })

    connection.end()
  })
}


// check if the credential already registered
async function exists(id) {
  const result = await select("id", `id='${id}'`)
  return (result.length > 0)
}

module.exports = Diskon