'use strict'

const express = require('express')
const PaketSaya = express.Router()

const bodyParser = require('body-parser')
const mysql = require('mysql2')
const jwt = require('jsonwebtoken')
const urlencodedParser = bodyParser.urlencoded({ extended: false })
require('dotenv').config()

const user_table = "user"
const product_table = "paket_pembelajaran"
const packet_table = "paket_user"

const config = {
  // eslint-disable-next-line no-undef
  host: process.env.dbHost, user: process.env.dbUser, password: process.env.dbPassword, database: process.env.dbDatabase
}

PaketSaya.get('/', urlencodedParser, async function (req, res) {
  const response = {}
  try{

    // eslint-disable-next-line no-undef
    const token = jwt.verify(req.header("authorization").split(" ")[1], process.env.key)
    if(!await exists(token.user_id)) throw ({message: "Data akun tidak ada", statusCode: 400}) 
    
    const packets = await getPacketfromUser(8)
    
    response.message = "Berhasil"
    response.data = []

    for (const packet of packets) {
      response.data.push({
        id_paket : packet.id,
        nama_paket : packet.nama,
        harga_paket : packet.harga,
        status : new Date() < new Date(packet.kadaluarsa*1000) ? "Aktif" : "Nonaktif"
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
function getPacketfromUser(user_id) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(config)

    const sql = `SELECT * FROM ${packet_table} INNER JOIN ${product_table} ON ${packet_table}.id_paket = ${product_table}.id WHERE ${packet_table}.id_user='${user_id}'`

    connection.query(sql, (err, result) => {
      if(err) return reject(err)
      resolve(result)
    })

    connection.end()
  })
}

// Function for select data from database
function select(attribute, condition=null) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(config)
    
    let sql

    if(condition==null){
      sql = `SELECT ${attribute} FROM ${user_table}`
    }else{
      sql = `SELECT ${attribute} FROM ${user_table} WHERE ${condition}`
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

module.exports = PaketSaya