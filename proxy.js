var express = require('express'),
    app = express(),
    request = require('request'),
    fs = require('fs'),
    url = require('url'),
    https = require('https'),
    sjcl = require(".public/sjcl.js")

var key = "SECRET KEY THAT IS DIFFERENT IN PRODUCTION CODE"	

app.listen(3000);
console.log('Listening on port 3000');

app.use(express.static(__dirname + '/public'));
 
app.get('/post/', function(req, res) {
	//console.log("URl: "+req.query.method+"\nJSON: "+JSON.parse(req.query.json).user);
    var json = JSON.parse(req.query.json);
    var request = require("request");
    var header = {
        'User-Agent': 'Reddit-Social-Comments'
    };
    var request = request.defaults({jar: true})
    if (req.query.method=="site_admin"){
        header = {
            'User-Agent': 'Reddit-Social-Comments made by /u/tannerdaman1',
            'Cookie': "reddit_session="+req.query.cookie,
            'X-Modhash': JSON.parse(req.query.json).modhash
        }
        console.log("Headers: " + JSON.stringify(header));

        if (newUser(json.user)){
            var pass = sjcl.encrypt(key, json.passwd);
            var userObj = {
                user: json.user,
                pass: pass,
                posts: {}
            }
            fs.writeFile("../info/"+json.user+'.json', JSON.stringify(userObj), function (err) {});
        }

    }

    

    request({
      uri: "https://ssl.reddit.com/api/"+req.query.method+"/",
      method: "POST",
      headers: header,
      form: json
    }, function(error, response, body) {
      console.log(body);
      res.send(body)
    });
});

app.get('/req/', function(req, res) {
    var filename = __dirname + "/info/" + req.query.site + "/" + req.query.page + ".json";
    if (s.existsSync(filename)){
        fs.readFile(filename,function(err, data){
            if (!err){
                var info = JSON.parse(data);
                res.send(info.path);
            }else{
                res.send("Error");
            }
        });
    }else{
        //TODO: Make post to reddit, and add JSON containing path to info/site.
    }
});


app.get('/get/', function(req, res) {
    //A function that takes a url and downloads the source. This will be defined in the next step.
	var url = "http://" + req.query.url;
	console.log("Get: " + url);
	getSource2(url, res);
});

app.get("/test/", function(req, res){
    getSource2("http://www.reddit.com/api/me.json", res);
})

app.get('/new/', function(req, res){
    var subData = JSON.parse(req.query.subdata);
    getSource("https://ssl.reddit.com/api/site_admin/", subData, res);
});

function isNewUser(user){
    var files = fs.readdirSync("../info/");
    for (var i=0; i < file.length; i++){
        if (files.substring(0,files[i].lastIndexOf("."))==user) return false;
    }
    return true;
}

function getSource2(uri, res){
	request(uri, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body);                
        }else{            
            try{
                var json = JSON.parse(body);
                if (json["error"]==404) {
                    res.send("Creating");
                    createNewPost(uri);
                }
            }
            res.send("An error Has occured, the url was most likly incorrect.");
        }
    });
}
function createNewPost(uri){

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

