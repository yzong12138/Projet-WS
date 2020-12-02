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

dbpediaAPi.sparqlGet("SELECT * WHERE { %3Fcountry  a dbo:Country;  dbo:populationTotal  %3Fpopulation;  rdfs:label  %3Flabel.\n" +
    "FILTER ( %3Fpopulation>15000000%20%26%26%20langMatches ( lang(%3Flabel),  \"EN\" ))}\n" +
    "ORDER BY DESC(%3Fpopulation)  LIMIT 50",function (err,data){
    if(err){
        return console.log('nm$l')
    }
    console.log(data)
})

app.listen(3000,function (){
    console.log('The server is running on the port 3000....')
})