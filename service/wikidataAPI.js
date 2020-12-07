var axios = require('axios')
var endpointUrl = 'https://query.wikidata.org/sparql?query='


// var sparqlQuery = "#defaultView:BubbleChart\n" +
//         "SELECT DISTINCT ?cityLabel ?population ?gps\n" +
//         "WHERE\n" +
//         "{\n" +
//         "  ?city wdt:P31/wdt:P279* wd:Q515 .\n" +
//         "  ?city wdt:P1082 ?population .\n" +
//         "  ?city wdt:P625 ?gps .\n" +
//         "  SERVICE wikibase:label {\n" +
//         "    bd:serviceParam wikibase:language \"en\" .\n" +
//         "  }\n" +
//         "}\n" +
//         "ORDER BY DESC(?population) LIMIT 100"


exports.wikidataSPARQLGet = function (str, callback) {
    axios({
        method: "get",
        url: endpointUrl + str + "&format=json",
        responseType: 'application/json',
        Accept: 'application/sparql-results+json',
    })
        .then(function (response) {
            callback(null, response.data)
        })
        .catch(function (error) {
            callback(error)
        })
}