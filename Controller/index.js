var dbpediaAPI = require('../service/dbpediaAPI')

// Get all the countries and then put them in the data list.
exports.getAllList = function (next,callback){
    dbpediaAPI.sparqlGet('SELECT DISTINCT %3Fcountry WHERE {\n' +
        '%3Fcountry a dbo:Country; dbo:longName %3Fname.\n' +
        'FILTER(!regex(%3Fcountry, ".*0|1|2|3|4|5|6|7|8|9|0+.*")).\n' +
        '}',function (err,data){
            if(err){
                return next(err)
            }
            var result = data.results.bindings
            for(var i = 0; i < result.length; i++) {
                result[i].country.simpleName = getLastWord(result[i].country.value)
            }
            callback(result)
        })


}

function getLastWord(str){
    var listStrings = str.split('/')
    var lastString = listStrings[listStrings.length - 1]
    if(lastString.includes('#')){
        var arr = lastString.split('#')
        return arr[ arr.length - 1 ]
    }else{
        return lastString
    }
}