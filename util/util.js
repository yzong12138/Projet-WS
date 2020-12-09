module.exports.countryNameDict = function (country) {
    if (country === "United_States") return "United States of America"
    if (country === "China") return "People\'s Republic of China"
    if (country === "United_Kingdom") return "United Kingdom"
    var temp = country
    temp = temp.replace(/_/, " ")
    console.log(temp)
    return temp
}