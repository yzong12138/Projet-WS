var dbpediaAPI = require('../service/dbpediaAPI')
var wikidataAPI = require('../service/wikidataAPI')
var util = require("../util/util")
/**
 * A simple query of the country with just the basic description (no numbers no photos)
 * @param query the object which contains the information to search
 * @param next the next function to call(promise)
 * @param callback the callback function
 */
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
/**
 * Get the information associate the dbpedia in phrase
 * @param query the object which contains the information to search
 * @param next the next function to call(promise)
 * @param callback the callback function
 */
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

/**
 * Get the basic information of the country: country name in query.search
 * @param query the object which contains the information to search
 * @returns {Promise<unknown>} a promise function which returns the data of a country
 */
module.exports.getInfo = function (query){

    return new Promise(function (resolve,reject){
        dbpediaAPI.dbpediaSPARQLGet('select * Where {\n' +
            '%3Fcountry a dbo:Country; rdfs:label %3Flabel\n' +
            'OPTIONAL{\n' +
            '%3Fcountry dbo:longName %3Flong.\n' +
            '}\n' +
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
            'FILTER(langMatches( lang(%3Flabel), "en")).'+
            'bind(IF(%3Flong, %3Flong, %3Flabel) as %3FLongName)'+
            'FILTER(regex(%3Fcountry, "%2F'+ query.search +'%24")).\n' +
            'bind(IF(langMatches(lang(%3Fabstract), "en"), "en", "fr") as %3Flang) .\n' +
            'FILTER(langMatches( lang(%3Fabstract), %3Flang)).'+
            '}\n'+
            'Order by %3Flang\n'+
            'Limit 1',function (err,data){
            if(err){
                return reject(err)
            }
            var result = {}
            data = data.results.bindings[0]
            // console.log(data)
            result.longname = data.LongName.value
            result.abstract = data.abstract.value
            result.label = data.label.value.replace(/_/g,' ')
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
                result.gdp = handleGdp(String(Number(data.gdp.value)))
            }
            if(data.gdpYear !== undefined){
                result.gdpYear = data.gdpYear.value
            }
            if(data.gdpRank !== undefined){
                result.gdpRank = Number(data.gdpRank.value)
            }
            //console.log(result)
            resolve(result)
        })
    })
}

/**
 * Get the name and title of a leader of a country
 * @param query query the object which contains the information to search
 * @param data the result we get from the last request. We join all the information together in one object.
 * @returns {Promise<unknown>} a promise function which returns the data of the leader of a country
 */
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
                for(var i = 0; i < Math.min(leaderList.length,titleList.length); i++){
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

/**
 * Get 10 largest city of a country
 * @param query the object which contains the information to search
 * @param data the result we get from the last request. We join all the information together in one object.
 * @returns {Promise<data>} a promise function which returns the data of the 10 largest city of a country
 */
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
                obj.cityCode = getLastWord(cityList[i].city.value)
                largestCities.push(obj)
            }
            data.largestCities = largestCities
            resolve(data)
        })
    })
}

/**
 * Get the details information of a city
 * @param cityCode the code of the city in wikidata. For exemple Shanghai is Q8686
 * @returns {Promise<data>} a promise function which returns the data of a city
 */
module.exports.getCityInfo = function (cityCode){
    return new Promise(function (resolve, reject){
        wikidataAPI.wikidataSPARQLGet("SELECT DISTINCT * " +
            "WHERE {" +
            "  wd:" + cityCode + " wdt:P1082 %3Fpopulation ." +
            "  OPTIONAL{" +
            "  wd:" + cityCode + " rdfs:label %3FcityLabel ." +
            " FILTER(langMatches(lang(%3FcityLabel), \"en\"))." +
            "    }" +
            "  OPTIONAL{" +
            "  wd:" + cityCode + " wdt:P571 %3Finception ." +
            "    }" +
            "  OPTIONAL{" +
            "  wd:" + cityCode + " wdt:P2046 %3Farea ." +
            "    }" +
            "  OPTIONAL{" +
            "  wd:" + cityCode + " wdt:P281 %3Fpostal ." +
            "    }" +
            "  OPTIONAL{" +
            "  wd:" + cityCode + " wdt:P18 %3Fimage ." +
            "    }" +
            "  OPTIONAL{" +
            "  wd:" + cityCode + " wdt:P421 %3Ftimezone ." +
            "  %3Ftimezone rdfs:label %3FtimezoneLabel ." +
            "  FILTER(langMatches(lang(%3FtimezoneLabel), \"en\"))." +
            "    }" +
            "  OPTIONAL{" +
            "  wd:" + cityCode + " wdt:P3134 %3Ftripadvisor ." +
            "    }" +
            "  OPTIONAL{" +
            "  wd:" + cityCode + " wdt:P206 %3Fwater ." +
            "  ?water rdfs:label %3FwaterName." +
            "  FILTER(langMatches(lang(%3FwaterName), \"en\"))." +
            "    }" +
            "  OPTIONAL{" +
            "  wd:" + cityCode + " wdt:P2044 %3Felevation." +
            "    }" +
            "  OPTIONAL{" +
            "  wd:" + cityCode + " wdt:P856 %3Fsite ." +
            "  }" +
            "  OPTIONAL{" +
            "  wd:" + cityCode + " wdt:P37 %3Flang ." +
            "  %3Flang rdfs:label %3FlangLabel." +
            " FILTER(langMatches(lang(%3FlangLabel), \"en\"))." +
            "  }" +
            "  SERVICE wikibase:label {" +
            "    bd:serviceParam wikibase:language \"en\" ." +
            "  }}",function (err,data){
            if(err){
                reject(err)
            }
            data = data.results.bindings[0]
            //console.log(data)
            var cityInfo = {}
            cityInfo.country = data.country
            if(data.population !== undefined){
                cityInfo.population = data.population.value
            }
            if(data.inception !== undefined){
                cityInfo.inception = data.inception.value
                if (parseInt(cityInfo.inception.substring(0,1))) {
                    cityInfo.inception = cityInfo.inception.substring(0, cityInfo.inception.length - 10)
                } else {
                    cityInfo.inception = cityInfo.inception.substring(1, cityInfo.inception.length - 10)
                }
                if (cityInfo.inception.substring(0, 4) > new Date().getFullYear()) {
                    cityInfo.inception = "B.C. " + cityInfo.inception
                }
            }
            if(data.cityLabel !== undefined){
                cityInfo.cityLabel = data.cityLabel.value
            }
            if(data.waterName !== undefined){
                cityInfo.waterNearBy = data.waterName.value
                cityInfo.water = data.water.value
            }
            if(data.timezone !== undefined){
                cityInfo.timeZoneName = data.timezoneLabel.value
                cityInfo.timeZone = data.timezone.value
            }
            if(data.area !== undefined){
                cityInfo.area = data.area.value
            }
            if(data.postal !== undefined){
                cityInfo.postal = data.postal.value
            }
            if(data.image !== undefined){
                cityInfo.image = data.image.value
            }
            if(data.tripadvisor !== undefined){
                cityInfo.tripadvisor = data.tripadvisor.value
            }
            if(data.site !== undefined){
                cityInfo.site = data.site.value
            }
            if(data.elevation !== undefined){
                cityInfo.elevation = data.elevation.value
            }
            //TODO: ** data.cityName represent the name of the city **
            //TODO: ** It will be better to have an abstract description of the city
            resolve(cityInfo)
        })
    })
}

/**
 * Get the last word of a url by splitting the '/'
 * @param str the original url
 * @returns {string} the last word
 */
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

/**
 * Get the query of searching the 10 largest cities of a country(for async use)
 * @param query the object which contains the information to search
 * @returns {string}
 */
module.exports.getCountryLargestCitiesQuery = function (query) {
    return "SELECT DISTINCT %3FcityLabel %3Fcity %3Fpopulation  " +
            "WHERE {  %3Fcountry rdfs:label \"" + util.countryNameDict(query.search) + "\"%40en. " +
            "%3Fcity wdt:P17 %3Fcountry." +
            " %3Fcity wdt:P1082 %3Fpopulation ." +
            " %3Fcity wdt:P31%2Fwdt:P279* wd:Q515 ." +
            " SERVICE wikibase:label {" +
            " bd:serviceParam wikibase:language \"en\" .}}" +
            " ORDER BY DESC(%3Fpopulation) LIMIT 10"
}

/**
 * Handle the problem that the GDP of a country ends with lots of 0
 * @param str the original number
 * @returns {string|*} the new number in form of a string and added some words like billion behind
 */
function handleGdp(str){
    if(str.endsWith('000000000')){
        str = str.substring(0,str.length-9)
        if(str.length > 3){
            var index = str.length-3
            return str.slice(0,index) + '.' + str.slice(index) + ' trillion'
        }else{
            return str + ' billion'
        }
    }else if(str.endsWith('000000')){
        str = str.substring(0,str.length-6)
        if(str.length > 3){
            var index = str.length-3
            return str.slice(0,index) + '.' + str.slice(index) + ' billion'
        }else{
            return str + ' million'
        }
    }else if(str.endsWith('000')){
        str = str.substring(0,str.length-3)
        if(str.length > 3){
            var index = str.length-3
            return str.slice(0,index) + '.' + str.slice(index) + ' million'
        }else{
            return str + ' thousand'
        }
    }else{
        console.log('你真的太穷了(How poor you are!)')
        return str
    }
}