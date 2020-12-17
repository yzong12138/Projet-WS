var express = require('express')
var router = express.Router()
var dbpediaAPI = require('./service/dbpediaAPI')
var index = require('./Controller/index')
var search = require('./Controller/search')

/**
 * Treat the search path '/' for the index page
 */
router.get('/',function (req,res,next){
    index.getAllList(next,function (data){
        res.render('index.html',{
            suggestions:data,
            hotkeys:['France','China','Ottoman_Empire','Roman_Empire']
        })
    })
})

/**
 * Trait the search path '/' for the Country page and also launch a request sparql
 */
router.get('/searchquery',function (req,res,next){
    var query = req.query

    // search.getBasicCountryInfo(query,next,function (result){
    //     res.render('Inforelated.html',{
    //         data:result
    //     })
    // })
    var searchquery = search.getCountryLargestCitiesQuery(query);
    search.getInfo(query)
        .then(function (data) {
            return search.getLeaderInfo(query,data)
        },function (err){
            next(err)
        })
        .then(function (data){
            res.render('Country.html',{
                data:data,
                search: searchquery
            })
        },function (err){
            next(err)
        })
})

/**
 * Trait the search path '/' for the City page and also launch a request sparql
 */
router.get('/searchqueryCity',function (req,res,next){
    var cityCode = req.query.citycode
    search.getCityInfo(cityCode)
        .then(function(data){
            res.render('City.html',{
                data:data
            })
        },function (err){
            next(err)
        })
})

module.exports = router