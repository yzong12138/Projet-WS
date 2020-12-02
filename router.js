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
    dbpediaAPI.spotlightAnnoteGet(query.search,function (err,data){
        if(err){
            res.status('500').send('Internal Error')
        }
        var resource = data.Resources
        for(var i = 0; i < resource.length; i++){
            console.log(resource[i]['@URI'])
        }
    })


})

module.exports = router