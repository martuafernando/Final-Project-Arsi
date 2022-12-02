'use strict'

const express = require('express')
const Profile = express.Router()

const bodyParser = require('body-parser');
const mysql = require('mysql2')
const jwt = require('jsonwebtoken');
const urlencodedParser = bodyParser.urlencoded({ extended: false })
require('dotenv').config();

const table = "user"

const config = {
  // eslint-disable-next-line no-undef
  host: process.env.dbHost, user: process.env.dbUser, password: process.env.dbPassword, database: process.env.dbDatabase
}

Profile.get('/', urlencodedParser, async function (req, res) {
  const response = {}
  try{

    // eslint-disable-next-line no-undef
    const data = jwt.verify(req.header("authorization").split(" ")[1], process.env.key);
    if(!await exists(data.user_id)) throw ({message: "Data akun tidak ada", statusCode: 400}) 
    
    response.message = "Berhasil"

    response.data = (await select("*", `id='${data.user_id}'`))[0]

    res.json(response)

  }catch(error){
    console.log(error)
    response.message = error.message || error
    res.statusCode = error.statusCode || 500
    res.json(response)
  }
});

// Function for select data from database
function select(attribute, condition=null) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(config)
    
    let sql;

    if(condition==null){
      sql = `SELECT ${attribute} FROM ${table}`;
    }else{
      sql = `SELECT ${attribute} FROM ${table} WHERE ${condition}`;
    }

    connection.query(sql, (err, result) => {
      if(err) return reject(err);
      resolve(result);
    });

    connection.end()
  });
}


// check if the credential already registered
async function exists(id) {
  const result = await select("id", `id='${id}'`)
  return (result.length > 0)
}

module.exports = Profile;