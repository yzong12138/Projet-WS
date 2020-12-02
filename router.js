var express = require('express')
var router = express.Router()
var dbpediaAPI = require('./service/dbpediaAPI')

router.get('/',function (req,res){
    res.render('index.html',{
        hotkey:['aaa','bbb','ccc','ddd','eee'],
        suggestions:['France','Allemagne','Chine','Italie']
    })
})

router.get('/searchquery',function (req,res){
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
            return res.status(500).send('Internal Error')
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
        console.log(result)
        res.render('Inforelated.html',{
            data:result
        })
    })
})

module.exports = router