var express = require('express')
var bodyParser = require('body-parser')
var path = require('path')
var router = require('./router')

var app = express()

app.use('/public/',express.static(path.join(__dirname,'public')))
app.use('/node_modules/',express.static(path.join(__dirname,'node_modules')))

app.engine('.html',require('express-art-template'))

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

app.set('views',path.join(__dirname,'./views/'))

app.use(router)

app.listen(3000,function (){
    console.log('The server is running on the port 3000....')
})