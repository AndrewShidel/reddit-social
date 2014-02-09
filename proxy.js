var express = require('express'),
    app = express(),
    request = require('request'),
    fs = require('fs'),
    url = require('url');
	
	
app.listen(3000);
console.log('Listening on port 3000');

app.use(express.static(__dirname + '/public'));
 
app.get('/post/', function(req, res) {
    //A function that takes a url and downloads the source. This will be defined in the next step.
    //console.log("Get: " + req.params[0].substring(0));
	console.log("URl: "+req.query.url+"\nJSON: "+req.query.json);
	//res.send("Done");
	getSource(req.query.url, req.query.json, res);
});

app.get('/get/', function(req, res) {
    //A function that takes a url and downloads the source. This will be defined in the next step.
    //console.log("Get: " + req.params[0].substring(0));
	var url = "http://" + req.query.url;
	console.log("Get: " + url);
	//res.send("Done");
	getSource2(url, res);
});
function getSource2(uri, res){
	request(uri, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body);                
        }else{
            res.send("An error Has occured, the url was most likly incorrect.");
        }
    });
}
function getSource(uri, json, res) {
	//uri = decodeURIComponent(uri);
    //Get the source of the url.
    request.post(uri, json, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body);                
        }else{
            res.send("An error Has occured, the url was most likly incorrect.");
        }
    });
}