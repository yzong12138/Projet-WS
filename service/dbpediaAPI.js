var axios = require('axios')

exports.sparqlGet = function (str){

    str = "default-graph-uri=http%3A%2F%2Fdbpedia.org&query=select+distinct+?Concept+where+{[]+a+?Concept}+LIMIT+100"


        axios({
            method: 'get',
            url: 'https://dbpedia.org/sparql?'+str+'&format=text%2Fhtml&CXML_redir_for_subjs=121&CXML_redir_for_hrefs=&timeout=30000&debug=on&run=+Run+Query+',
            responseType: 'text/html'
        })
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            })

}

exports.spotlightAnnoteGet = function (str){

    str = "the biggest city in france"


    axios({
        method: 'get',
        url: 'https://api.dbpedia-spotlight.org/en/annotate?text='+str,
        responseType: 'application/json'
    })
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
        })

}
