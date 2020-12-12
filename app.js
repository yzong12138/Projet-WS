var express = require('express')
var bodyParser = require('body-parser')
var path = require('path')
var router = require('./router')
var dbpediaAPi = require('./service/dbpediaAPI')
var app = express()

app.use('/public/',express.static(path.join(__dirname,'public')))
app.use('/node_modules/',express.static(path.join(__dirname,'node_modules')))

app.engine('.html',require('express-art-template'))

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

app.set('views',path.join(__dirname,'./views/'))

app.use(router)

// Page for 404 not found
app.use(function (req,res){
    res.render('404.html')
})

// Throw errors
app.use(function (err,req,res,next){
    res.status(500).json(err)
})


app.listen(3000,function (){
    console.log('The server is running on the port 3000....')
})

// var search = require("./Controller/search")
// search.getCityInfo("Q8686")