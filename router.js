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

    search.getInfo(query)
        .then(function (data) {
            return search.getLeaderInfo(query,data)
        },function (err){
            next(err)
        })
        .then(function (data) {
            // res.render('Country.html',{
            //     data:data
            // })
            return search.getCountryLargestCities(query,data)
        },function (err){
            next(err)
        })
        .then(function (data){
            res.render('Country.html',{
                data:data
            })
        },function (err){
            next(err)
        })
})

router.get('/searchqueryCity',function (req,res,next){
    var query = query

    search.getCityInfo()
})

module.exports = router