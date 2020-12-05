var express = require('express')
var router = express.Router()
var dbpediaAPI = require('./service/dbpediaAPI')

router.get('/',function (req,res,next){

    // Get all the countries and then put them in the data list.
    dbpediaAPI.sparqlGet('SELECT %3Fcountry WHERE {\n' +
        '%3Fcountry a dbo:Country\n' +
        '}',function (err,data){
        if(err){
            return next(err)
        }
        var result = data.results.bindings
        for(var i = 0; i < result.length; i++) {
            var listStrings = result[i].country.value.split('/')
            var lastString = listStrings[listStrings.length - 1]
            result[i].country.simpleName = lastString
        }
        // console.log(result)
        res.render('index.html',{
            suggestions:result,
            hotkeys:['France','China','Ottoman_Empire','Roman_Empire']
        })
    })
})

router.get('/searchquery',function (req,res,next){
    var query = req.query

    //Finding the infomation related with the dbpedia in the query.

    // dbpediaAPI.spotlightAnnoteGet(query.search,function (err,data){
    //     if(err){
    //         res.status('500').send('Internal Error')
    //     }
    //     var resource = data.Resources
    //     for(var i = 0; i < resource.length; i++){
    //         console.log(resource[i]['@URI'])
    //     }
    // })

    // A simple query of the country

    dbpediaAPI.sparqlGet('SELECT %3Fproperty %3Fvalue WHERE {\n' +
        ':'+ req.query.search +' a dbo:Country; %3Fproperty %3Fvalue.\n' +
        '    Filter(langmatches(lang(%3Fvalue),\'EN\'))\n' +
        '}',function (err,data){
        if(err){
            return next(err)
        }
        var result = data.results.bindings
        for(var i = 0; i < result.length; i++){
            var listStrings = result[i].property.value.split('/')
            var lastString = listStrings[listStrings.length - 1]
            if(lastString.includes('#')){
                var arr = lastString.split('#')
                result[i].property.simpleName = arr[ arr.length - 1 ]
            }else{
                result[i].property.simpleName = lastString
            }
        }
        res.render('Inforelated.html',{
            data:result
        })
    })
})

module.exports = router