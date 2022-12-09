'use strict'

const express = require('express')
const Riwayat = express.Router()

const bodyParser = require('body-parser')
const mysql = require('mysql2')
const jwt = require('jsonwebtoken')
const urlencodedParser = bodyParser.urlencoded({ extended: false })
require('dotenv').config()

const user_table = "user"
const product_table = "paket_pembelajaran"
const transaction_table = "pembelian"

const config = {
  // eslint-disable-next-line no-undef
  host: process.env.dbHost, user: process.env.dbUser, password: process.env.dbPassword, database: process.env.dbDatabase
}

Riwayat.get('/', urlencodedParser, async function (req, res) {
  const response = {}
  try{

    // eslint-disable-next-line no-undef
    const token = jwt.verify(req.header("authorization").split(" ")[1], process.env.key)
    if(!await exists(token.user_id)) throw ({message: "Data akun tidak ada", statusCode: 400}) 
    
    const histories = await getDataPaket(token.user_id)
    
    response.message = "Berhasil"
    response.data = []

    for (const history of histories) {
      response.data.push({
        id_pembelian: history.id,
        nama_paket : history.nama,
        kelas: history.kelas,
        harga_pembelian : history.total_pembelian,
        status : history.status ? "Sudah Dibayar" : "Belum Dibayar"
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
function getDataPaket(user_id) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(config)

    const sql = `SELECT nama, kelas, total_pembelian, status, pembelian.id AS id FROM ${transaction_table} INNER JOIN ${product_table} ON ${transaction_table}.id_paket = ${product_table}.id WHERE ${transaction_table}.id_user='${user_id}'`

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

module.exports = Riwayat