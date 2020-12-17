var axios = require('axios')
var endpointUrl = 'https://query.wikidata.org/sparql?query='

/**
 * Method to launch a request sparql in the DB wikidata
 * @param str the request string(url which is not complete)
 * @param callback the function callback
 */
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