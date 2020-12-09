var dbpediaAPI = require('../service/dbpediaAPI')
var wikidataAPI = require('../service/wikidataAPI')
var util = require("../util/util")
// A simple query of the country with just the basic description (no numbers no photos)
module.exports.getBasicCountryInfo = function (query,next,callback){
    dbpediaAPI.dbpediaSPARQLGet('SELECT %3Fproperty %3Fvalue WHERE {\n' +
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
        dbpediaAPI.dbpediaSPARQLGet('select * Where {\n' +
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
            //console.log(data)
            result.longname = data.LongName.value
            result.abstract = data.abstract.value
            if(data.flag !== undefined){
                result.flagUrl = data.flag.value.split('?')[0]
            }
            if(data.capital !== undefined){
                result.capital = { name:getLastWord(data.capital.value), uri:data.capital.value }
            }
            if(data.nationality !== undefined){
                result.nationality = data.nationality.value
            }
            if(data.area!== undefined){
                result.area = data.area.value/1000000
            }
            if(data.gov !== undefined){
                result.gov = { name:getLastWord(data.gov.value), uri:data.gov.value }
            }
            if(data.gdp !== undefined){
                result.gdp = data.gdp.value
            }
            if(data.gdp !== undefined){
                result.gdpYear = data.gdpYear.value
            }
            if(data.gdp !== undefined){
                result.gdpRank = data.gdpRank.value
            }
            resolve(result)
        })
    })
}

module.exports.getLeaderInfo = function (query,data){
    return new Promise(function (resolve, reject){
        dbpediaAPI.dbpediaSPARQLGet('SELECT * WHERE {\n' +
            ':'+ query.search +' dbo:leader %3Fleader.\n' +
            '}',function (err,leaders){
            if(err){
                return reject(err)
            }
            var leaderList = leaders.results.bindings
            dbpediaAPI.dbpediaSPARQLGet('SELECT * WHERE {\n' +
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

module.exports.getCountryLargestCities = function (query, data) {
    return new Promise(function (resolve, reject) {
        wikidataAPI.wikidataSPARQLGet("SELECT DISTINCT %3FcityLabel %3Fcity %3Fpopulation  " +
            "WHERE {  %3Fcountry rdfs:label \"" + util.countryNameDict(query.search) + "\"%40en. " +
            "%3Fcity wdt:P17 %3Fcountry." +
            " %3Fcity wdt:P1082 %3Fpopulation ." +
            " %3Fcity wdt:P31%2Fwdt:P279* wd:Q515 ." +
            " SERVICE wikibase:label {" +
            " bd:serviceParam wikibase:language \"en\" .}}" +
            " ORDER BY DESC(%3Fpopulation) LIMIT 10", function (err, cities) {
            if(err){
                return reject(err)
            }
            var largestCities = []
            var cityList = cities.results.bindings
            for (var i = 0; i < cityList.length; i ++) {
                var obj = {}
                obj.cityName = cityList[i].cityLabel.value
                obj.population = cityList[i].population.value
                obj.cityCode = cityList[i].city.value
                largestCities.push(obj)
            }
            data.largestCities = largestCities
            resolve(data)
        })
    })
}

module.exports.getCityInfo = function (query,data){
    return new Promise(function (resolve, reject){
        wikidataAPI.wikidataSPARQLGet('',function (err,data){
            if(err){
                reject(err)
            }
            resolve(data)
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

