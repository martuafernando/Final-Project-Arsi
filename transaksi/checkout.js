'use strict'

const express = require('express')
const Pembelian = express.Router()

const bodyParser = require('body-parser')
const mysql = require('mysql2')
const jwt = require('jsonwebtoken')
const urlencodedParser = bodyParser.urlencoded({ extended: false })
require('dotenv').config()

const user_table = "user"
const transaction_table = "pembelian"
const payment_table = "pembayaran"


const config = {
  // eslint-disable-next-line no-undef
  host: process.env.dbHost, user: process.env.dbUser, password: process.env.dbPassword, database: process.env.dbDatabase
}

Pembelian.post('/', urlencodedParser, async function (req, res) {
  const response = {}
  try{

    // eslint-disable-next-line no-undef
    const token = jwt.verify(req.header("authorization").split(" ")[1], process.env.key)
    if(!await exists(token.user_id, user_table)) throw ({message: "Data akun tidak ada", statusCode: 400})

    if(!req.body.id_pembelian || !req.body.nominal_pembayaran) throw ({message: "Masukkan id_pembelian dan nominal_pembayaran", statusCode: 400})

    if(!await exists(req.body.id_pembelian, transaction_table)) throw ({message: "Data pembelian tidak ditemukan", statusCode: 400})

    const pembelian = (await select("total_pembelian, status", transaction_table, `id='${req.body.id_pembelian}'`))[0]

    if(pembelian.total_pembelian != req.body.nominal_pembayaran) throw ({message: "Pembayaran tidak valid. Nominal pembayaran tidak sesuai dengan tagihan", statusCode: 400})
    if(pembelian.status != 0) throw ({message: "Tagihan sudah dibayar", statusCode: 400})

    const id_pembayaran = (await insert('total_pembayaran, metode, waktu_pembayaran', `'${req.body.nominal_pembayaran}', '${(await select('nama_lengkap', user_table, `id='${token.user_id}'`))[0].nama_lengkap}', ${new Date().getTime()/1000}`, payment_table)).insertId

    await changeTransactionStatus(req.body.id_pembelian, id_pembayaran)

    response.message = "Pembayaran berhasil"

    res.json(response)

  }catch(error){
    console.log(error)
    response.message = error.message || error
    res.statusCode = error.statusCode || 500
    res.json(response)
  }
})

// Function to change status of transaction
function changeTransactionStatus(id_pembelian, id_pembayaran){
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(config)
    const sql = `UPDATE ${transaction_table} SET status = '1', id_pembayaran = '${id_pembayaran}' WHERE id = ${id_pembelian}`

    connection.query(sql, (err, result) => {
      if(err) return reject(err)
      resolve(result)
    })

    connection.end()
  })
}

// Function for insert data to database
function insert(field, data, table) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(config)
    const sql = `INSERT INTO ${table} (${field}) VALUES (${data});`

    connection.query(sql, (err, result) => {
      if(err) return reject(err)
      resolve(result)
    })

    connection.end()
  })
}

// Function for select data from database
function select(attribute, table, condition=null) {
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
async function exists(id, table) {
  const result = await select("id", table, `id='${id}'`)
  return (result.length > 0)
}

module.exports = Pembelian