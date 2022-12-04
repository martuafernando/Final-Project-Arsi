'use strict'

const express = require('express')
const DetailRiwayat = express.Router()

const bodyParser = require('body-parser')
const mysql = require('mysql2')
const jwt = require('jsonwebtoken')
const urlencodedParser = bodyParser.urlencoded({ extended: false })
require('dotenv').config()

const user_table = "user"
const product_table = "paket_pembelajaran"
const transaction_table = "pembelian"
const discount_table = "diskon"
const payment_table = "pembayaran"

const config = {
  // eslint-disable-next-line no-undef
  host: process.env.dbHost, user: process.env.dbUser, password: process.env.dbPassword, database: process.env.dbDatabase
}

DetailRiwayat.get('/:riwayat_id', urlencodedParser, async function (req, res) {
  const response = {}
  try{

    // eslint-disable-next-line no-undef
    const token = jwt.verify(req.header("authorization").split(" ")[1], process.env.key)
    if(!await exists(token.user_id, user_table)) throw ({message: "Data akun tidak ada", statusCode: 400}) 

    if(!await exists(req.params.riwayat_id, transaction_table)) throw ({message: "Riwayat tidak ditemukan", statusCode: 400})

    const histories = await getDataPaket(token.user_id, req.params.riwayat_id, (await select('id_diskon', transaction_table, `pembelian.id='${req.params.riwayat_id}'`))[0].id_diskon)

    if(histories.length <= 0) throw ({message: "Riwayat tidak ditemukan", statusCode: 400}) 
    
    response.message = "Berhasil"

    console.log(histories)

    response.data = {
      id_pembelian: histories[0].id,
      nama_paket : histories[0].nama,
      harga_paket: histories[0].harga,
      potongan_harga_promo: histories[0].diskon,
      harga_pembelian : histories[0].total_pembelian,
      status : histories[0].status ? "Sudah Dibayar" : "Belum Dibayar",
      metode_pembayaran : histories[0].metode == null ? undefined : histories[0].metode
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
function getDataPaket(user_id, riwayat_id, useDiscount=false) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(config)

    let sql;

    if(useDiscount) sql = `SELECT *, pembelian.id AS id FROM ${transaction_table} INNER JOIN ${product_table} ON ${transaction_table}.id_paket = ${product_table}.id INNER JOIN ${discount_table} ON ${transaction_table}.id_diskon = ${discount_table}.id LEFT JOIN ${payment_table} ON ${transaction_table}.id_pembayaran = ${payment_table}.id WHERE ${transaction_table}.id_user='${user_id}' AND pembelian.id=${riwayat_id}`
    else sql = `SELECT *, pembelian.id AS id FROM ${transaction_table} INNER JOIN ${product_table} ON ${transaction_table}.id_paket = ${product_table}.id LEFT JOIN ${payment_table} ON ${transaction_table}.id_pembayaran = ${payment_table}.id WHERE ${transaction_table}.id_user='${user_id}' AND pembelian.id=${riwayat_id}`
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

module.exports = DetailRiwayat