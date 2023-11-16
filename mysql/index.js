const mysql=require('mysql')

const db=mysql.createPool(
    {

        host:'127.0.0.1',
        user:'root',
        password:'LPL199712',
        database:'ceshi'
    }
)

module.exports=db