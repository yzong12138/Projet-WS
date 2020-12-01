var express = require('express')
var router = express.Router()

router.get('/',function (req,res){
    res.render('index.html',{
        name:['a','b','c','d','e']
    })
})

module.exports = router