var axios = require('axios')
let prefix = "PREFIX%20owl%3A%20%3Chttp%3A//www.w3.org/2002/07/owl%23%3E%0APREFIX%20xsd%3A%20%3Chttp%3A//www.w3.org/2001/XMLSchema%23%3E%0APREFIX%20rdfs%3A%20%3Chttp%3A//www.w3.org/2000/01/rdf-schema%23%3E%0APREFIX%20rdf%3A%20%3Chttp%3A//www.w3.org/1999/02/22-rdf-syntax-ns%23%3E%0APREFIX%20foaf%3A%20%3Chttp%3A//xmlns.com/foaf/0.1/%3E%0APREFIX%20dc%3A%20%3Chttp%3A//purl.org/dc/elements/1.1/%3E%0APREFIX%20%3A%20%3Chttp%3A//dbpedia.org/resource/%3E%0APREFIX%20dbpedia2%3A%20%3Chttp%3A//dbpedia.org/property/%3E%0APREFIX%20dbpedia%3A%20%3Chttp%3A//dbpedia.org/%3E%0APREFIX%20skos%3A%20%3Chttp%3A//www.w3.org/2004/02/skos/core%23%3E%0APREFIX%20dbo%3A%3Chttp%3A//dbpedia.org/ontology/%3E%0D%0A"

exports.dbpediaSPARQLGet = function (str, callback){

    axios({
        method: 'get',
        url: 'http://dbpedia.org/sparql?default-graph-uri=http://dbpedia.org&query=' + prefix + str + '&format=application/json',
        responseType: 'application/json'
    })
        .then(function (response) {
            callback(null,response.data)
        })
        .catch(function (error) {
            callback(error)
        })

}

exports.spotlightAnnoteGet = function (str,callback){
    axios({
        method: 'get',
        url: 'https://api.dbpedia-spotlight.org/en/annotate?text='+str,
        responseType: 'application/json'
    })
        .then(function (response) {
            callback(null,response.data)
        })
        .catch(function (error) {
            callback(error)
        })
}
