var axios = require('axios')
var endpointUrl = 'https://query.wikidata.org/sparql?query='


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