var express = require('express')
var router = express.Router()

router.get('/',function (req,res){
    res.render('index.html',{
        hotkey:['aaa','bbb','ccc','ddd','eee'],
        suggestions:['France','Allemagne','Chine','Italie']
    })
})

module.exports = router