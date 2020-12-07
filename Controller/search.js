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

module.exports.getInfo = function (query){

    return new Promise(function (resolve,reject){
        dbpediaAPI.sparqlGet('select * Where {\n' +
            '%3Fcountry a dbo:Country; dbo:longName %3FLongName.\n' +
            'OPTIONAL{\n' +
            '%3Fcountry dbo:abstract %3Fabstract.\n' +
            '}\n' +
            'OPTIONAL{\n' +
            '%3Fcountry dbo:thumbnail %3Fflag.\n' +
            '}\n' +
            'OPTIONAL{\n' +
            '%3Fcountry dbo:capital %3Fcapital.\n' +
            '}\n' +
            'OPTIONAL{\n' +
            '%3Fcountry dbo:demonym %3Fnationality.\n' +
            '}\n' +
            'OPTIONAL{\n' +
            '%3Fcountry dbo:areaTotal %3Farea.\n' +
            '}\n' +
            'OPTIONAL{\n' +
            '%3Fcountry dbo:governmentType %3Fgov.\n' +
            '}\n' +
            'OPTIONAL{\n' +
            '%3Fcountry dbpedia2:gdpNominal %3Fgdp.\n' +
            '}\n' +
            'OPTIONAL{\n' +
            '%3Fcountry dbpedia2:gdpNominalYear %3FgdpYear.\n' +
            '}\n' +
            'OPTIONAL{\n' +
            '%3Fcountry dbpedia2:gdpNominalRank %3FgdpRank.\n' +
            '}\n' +
            'FILTER(langMatches(lang(%3FLongName), "en")%26%26langMatches(lang(%3Fabstract), "en")).\n' +
            'FILTER(regex(%3Fcountry, "'+ query.search +'"))\n' +
            '}\n' +
            'Limit 1',function (err,data){
            if(err){
                return reject(err)
            }
            var result = {}
            data = data.results.bindings[0]
            result.longname = data.LongName.value
            result.abstract = data.abstract.value
            result.flagUrl = data.flag.value.split('?')[0]
            result.capital = { name:getLastWord(data.capital.value), uri:data.capital.value }
            result.nationality = data.nationality.value
            result.area = data.area.value/1000000
            result.gov = { name:getLastWord(data.gov.value), uri:data.gov.value }
            result.gdp = data.gdp.value
            result.gdpYear = data.gdpYear.value
            result.gdpRank = data.gdpRank.value
            resolve(result)
        })
    })
}

module.exports.getLeaderInfo = function (query,data){
    return new Promise(function (resolve, reject){
        dbpediaAPI.sparqlGet('SELECT * WHERE {\n' +
            ':'+ query.search +' dbo:leader %3Fleader.\n' +
            '}',function (err,leaders){
            if(err){
                return reject(err)
            }
            var leaderList = leaders.results.bindings
            dbpediaAPI.sparqlGet('SELECT * WHERE {\n' +
                ':'+ query.search +' dbo:leaderTitle %3Ftitle.\n' +
                '}',function (err,titles){
                if(err){
                    return reject(err)
                }
                var titleList = titles.results.bindings
                var leaderTitle = []
                for(var i = 0; i < leaderList.length; i++){
                    var obj = {}
                    obj.TitleName = titleList[i].title.value
                    obj.leaderName = { name:getLastWord(leaderList[i].leader.value), uri:leaderList[i].leader.value }
                    leaderTitle.push(obj)
                }
                data.leader = leaderTitle
                resolve(data)
            })

        })
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