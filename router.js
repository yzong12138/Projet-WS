var express = require('express')
var router = express.Router()
var dbpediaAPI = require('./service/dbpediaAPI')
var index = require('./Controller/index')
var search = require('./Controller/search')

router.get('/',function (req,res,next){
    index.getAllList(next,function (data){
        res.render('index.html',{
            suggestions:data,
            hotkeys:['France','China','Ottoman_Empire','Roman_Empire']
        })
    })
})

router.get('/searchquery',function (req,res,next){
    var query = req.query

    // search.getBasicCountryInfo(query,next,function (result){
    //     res.render('Inforelated.html',{
    //         data:result
    //     })
    // })

    search.getInfo(query,next,function (data){
        res.render('Country.html',{
            data:data
        })
    })
})

module.exports = router