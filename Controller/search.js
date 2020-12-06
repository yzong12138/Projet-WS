var dbpediaAPI = require('../service/dbpediaAPI')

// A simple query of the country with just the basic description (no numbers no photos)
module.exports.getBasicCountryInfo = function (query,next,callback){
    dbpediaAPI.sparqlGet('SELECT %3Fproperty %3Fvalue WHERE {\n' +
        ':'+ query.search +' a dbo:Country; %3Fproperty %3Fvalue.\n' +
        '    Filter(langmatches(lang(%3Fvalue),\'EN\'))\n' +
        '}',function (err,data){
        if(err){
            return next(err)
        }
        var result = data.results.bindings
        for(var i = 0; i < result.length; i++){
            result[i].property.simpleName =  getLastWord(result[i].property.value)
        }
        callback(result)
    })
}

//Finding the infomation related with the dbpedia in the query.
module.exports.getRelatedInfo = function (query,next,callback){
    dbpediaAPI.spotlightAnnoteGet(query.search,function (err,data){
        if(err){
            return next(err)
        }
        var resource = data.Resources
        for(var i = 0; i < resource.length; i++){
            console.log(resource[i]['@URI'])
        }
        callback(resource)
    })
}

module.exports.getInfo = function (query,next,callback){
    dbpediaAPI.sparqlGet('SELECT * WHERE {\n' +
        ':'+ query.search + ' a dbo:Country; dbo:longName %3FLongName;\n' +
        'dbo:thumbnail %3Fflag; dbo:capital %3Fcapital;\n' +
        'dbo:demonym %3Fnationality;\n' +
        'dbo:areaTotal %3Farea.\n' +
        '\n' +
        'FILTER(langMatches(lang(%3FLongName), "en")).\n' +
        '}',function (err,data){
        if(err){
            return next(err)
        }
        var result = {}
        data = data.results.bindings[0]
        result.longname = data.LongName.value
        result.flagUrl = data.flag.value.split('?')[0]
        result.capital = getLastWord(data.capital.value)
        result.nationality = data.nationality.value
        result.area = data.area.value/1000000
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