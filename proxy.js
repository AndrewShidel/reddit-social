var express = require('express'),
    app = express(),
    request = require('request'),
    fs = require('fs'),
    url = require('url'),
    https = require('https'),
    sjcl = require("./public/sjcl.js")

var key = "SECRET KEY THAT IS DIFFERENT IN PRODUCTION CODE"

app.listen(3000);
console.log('Listening on port 3000');

app.use(express.static(__dirname + '/public'));

app.get('/post/', function(req, res) {
    if (req.query.json != undefined)
        var json = JSON.parse(req.query.json);
    var type = req.query.oauth=="true"?"oauth":"ssl";

    console.log("\nThe type is "+type+".\n")

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
    }else if(req.query.method=="login"){
        if (isNewSite(json.name)){
            console.log("Password: "+json.passwd);
            var pass = sjcl.encrypt(key, json.passwd);
            var userObj = {
                user: json.user,
                pass: pass,
                siteName: json.name,
                posts: {}
            }
            fs.writeFile("./info/"+json.name+'.json', JSON.stringify(userObj), function (err) {});
        }
    }
    if (req.query.header!=undefined)
        header = JSON.parse(req.query.header);

    console.log("\n");
    console.log("uri: "+"https://"+type+".reddit.com/api/"+req.query.method+"/\nheaders: "+JSON.stringify(header)+"\nform: "+JSON.stringify(json));
    console.log("\n");

    request({
      uri: "https://"+type+".reddit.com/api/"+req.query.method+"/",
      method: "POST",
      headers: header,
      form: json
    }, function(error, response, body) {
        if (error){
            res.status(400).send(error)
            return;
        }
        res.send(JSON.stringify(body)+"\n\n"+JSON.stringify(response))
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
	var url = req.query.url;
	console.log("Get: " + url);
	getSource2(url, res, req);
});

app.get("/test/", function(req, res){
    getSource2("http://www.reddit.com/api/me.json", res);
})

app.get('/new/', function(req, res){
    var subData = JSON.parse(req.query.subdata);
    getSource("https://ssl.reddit.com/api/site_admin/", subData, res);
});

app.get('/newPost/', function(req, res){
    var json = JSON.parse(req.query.json);
    createNewPost(json);
});

function isNewSite(user){
    var files = fs.readdirSync("./info/");
    for (var i=0; i < files.length; i++){
        if (files[i].substring(0,files[i].lastIndexOf("."))==user) return false;
    }
    return true;
}

function getSource2(uri, res, req){
    var user = loadUserInfo(req.query.site);

    var usesUri=false;
    if (uri!="title"){
        usesUri=true
        uri="http://"+( uri[uri.length-1]=="/"?uri.substring(0,uri.length-2):uri )+".json";
    }else{
        usesUri = false;
        uri=user.posts[req.query.title]+".json"
    }

    if (user.posts[req.query.title] != undefined || usesUri){
    	request(uri, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                if (body.length>150) {
                    res.send(body);
                    return;
                }
            }

        });
    }else{
        console.log("New")

        var post={
            user: user,
            text: "",
            title: req.query.title,
            url: req.query.origin
        }
        console.log("post: "+JSON.stringify(post));
        createNewPost(post);
        return;
    }
}

function createNewPost(post){
    var user = post.user;
    console.log("user: "+JSON.stringify(user));
    login(user, function(modhash, cookie){
        console.log("mod: "+modhash+"  cookie: "+cookie);
        var request = require("request");
        request = request.defaults({jar: true})

        header = {
            'User-Agent': 'Reddit-Social-Comments made by /u/tannerdaman1',
            'Cookie': "reddit_session="+cookie,
            'X-Modhash': modhash
        }
        console.log("Headers: " + JSON.stringify(header));

        var data = {
            api_type: "json",
            extention: "",
            kind: "link",
            resubmit: true,
            save: true,
            sendreplies: false,
            sr: user.siteName,
            text: post.text,
            then: "comments",
            title: post.title,
            uh: modhash,
            url: post.url
        }
        console.log(data);
        request({
          uri: "https://ssl.reddit.com/api/submit/",
          method: "POST",
          headers: header,
          form: data
        }, function(error, response, body) {
          console.log(body);
          user.posts[post.title]=JSON.parse(body).json.data.url;
          saveUser(user);
        });
    });
}

function login(user, callback){
    var pass = sjcl.decrypt(key, user.pass);
    console.log("Pass: "+pass);
    var json = {passwd:pass,rem:true,user:user.user,api_type:'json'};

    var request = require("request");
    var header = {
        'User-Agent': 'Reddit-Social-Comments'
    };
    var request = request.defaults({jar: true});

    request({
      uri: "https://ssl.reddit.com/api/login/",
      method: "POST",
      headers: header,
      form: json
    }, function(error, response, body) {
        console.log("body: "+body);
        body=JSON.parse(body);
        callback(body["json"]["data"]["modhash"], body["json"]["data"]["cookie"]);
    });

}

function loadUserInfo(user){

    return JSON.parse(fs.readFileSync("./info/"+user+".json"));
}
function saveUser(user){
    fs.writeFile("./info/"+user.siteName+'.json', JSON.stringify(user), function (err) {});
}

function getSource(uri, json, res) {
    //Get the source of the url.
    request.post(uri, json, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body);
        }else{
            res.send("An error Has occured, the url was most likly incorrect.");
        }
    });
}

