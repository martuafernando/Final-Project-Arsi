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
const product_table = "paket_pembelajaran"
const discount_table = "diskon"


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
    
    if(!req.body.id_paket) throw ({message: "Masukkan id_paket dan kode_diskon (optional)", statusCode: 400})

    const paket_pembelajaran =  (await select("id, harga", product_table, `id='${req.body.id_paket}'`))
    if(!(paket_pembelajaran.length > 0)) throw ({message: "Paket pembelajaran tidak ada", statusCode: 400}) 

    if(req.body.kode_diskon){
      const diskon =  (await select("id, diskon, waktu_berakhir", discount_table, `kode_diskon='${req.body.kode_diskon}'`))
      
      if(!(diskon.length > 0)) throw ({message: "Kode diskon tidak terdaftar", statusCode: 400}) 
      if(new Date() > new Date(diskon[0].waktu_berakhir*1000)) throw ({message: "Masa berlaku kode diskon sudah berakhir", statusCode: 400}) 
      
      const total_pembelian = (paket_pembelajaran[0].harga - diskon[0].diskon) < 0 ? 0 : paket_pembelajaran[0].harga - diskon[0].diskon
      
      insert('id_user, id_paket, status, total_pembelian, id_diskon, waktu_pembelian', `'${token.user_id}', '${req.body.id_paket}', '0', '${total_pembelian}', '${diskon[0].id}', ${new Date().getTime()/1000}`, transaction_table)
    }else{
      insert('id_user, id_paket, status, total_pembelian, waktu_pembelian', `'${token.user_id}', '${req.body.id_paket}', '0', '${paket_pembelajaran[0].harga}', ${new Date().getTime()/1000}`, transaction_table)
    }

    response.message = "Pembelian berhasil"

    res.json(response)

  }catch(error){
    console.log(error)
    response.message = error.message || error
    res.statusCode = error.statusCode || 500
    res.json(response)
  }
})

// Function for insert data to database
function insert(field, data, table) {
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