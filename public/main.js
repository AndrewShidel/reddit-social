var com = {
	create: function(params){		
		com.viewID = params.view
		com.view = document.getElementById(params.view)
		com.site = params.siteName;
		com.page = params.pageName;
		com.simple = params.simple||true;
		com.type = params.type;
		com.title = params.title||document.title;

		//If a url is specified, then use it, else use the page title.
		com.url=params.url||"title";

        if (params.comment1color != undefined) $('.comColor1').css('background-color', params.comment1color);
        if (params.comment2color != undefined){ $('.comColor2').css('background-color', params.comment2color);}
        if (params.fontFamily != undefined) $(".comments").css("font-family", params.fontFamily);
        if (params.fontSize!= undefined) $(".comments").css("font-size", params.fontSize+"pt");
        if (params.fontColor!= undefined) $(".comments").css("color", params.fontColor);

        if (params.borderRadius!= undefined) $(".commentSimple").css("border-radius", params.borderRadius);
        if (params.borderStyle!= undefined) $(".commentSimple").css("border-style", params.borderStyle);
        if (params.borderColor!= undefined) $(".commentSimple").css("border-color", params.borderColor);
        if (params.borderSize!= undefined) $(".commentSimple").css("border-width", params.borderSize);

	},

	render: function(callback){

		callback = callback || function(){};

		if (com.page==undefined||com.page==null||com.page=="") com.page=document.title;

		/*var url = "reddit.com/r/"+com.site+"/comments/"+com.page;		
	    url = url.replace("http://", "");
		url = url.substring(url.length-1)=="/"?url.substring(0,url.length-1):url;*/

		com.loadStyle("./style.css", function (){
			if (typeof $ == "undefined"){
				com.loadScript("//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js", function(){
					com.start(function(res){						
						callback();
					});
				});
			}else{
				com.start(function(res){
					callback();
				});
			}	
		});
	},

	authentcate: function(){

	},
	makeComment: function(){

	},
	reply: function(parent){

	}
	vote: function(up){

	},

	start: function(call){
		var location = window.location.href;
		location = location.substring(location.indexOf("//")+2)

		//Reddit rejects localhost urls, so this will be temporarily used.
		location = "http://shidel.com";

		$.get("./get/?url=" + com.url + "/.json&origin="+location+"&site="+com.site+"&title="+com.title, function(data){			
			com.view.innerHMTL = "";

			console.log(data);
			if (data=="Creating"){
				call("nothing");
				return;
			}
			var obj = JSON.parse(data);
			if (obj[1].data.children.length==0){

				call("nothing");				
				return;
			}
			//com.innerHTML += "<p>" + data + "</p>";			
			if (typeof JSON == "undefined"){
				com.loadScript("./json.js", function(){					
					var _comments = obj[1].data.children;
					com.make(com.view, _comments, 0);
					call("success");
				})
			}else{				
				var _comments = obj[1].data.children;
				com.make(com.view, _comments, 0);
				call("success");
			}
		});	
	},

	make: function(parent, comments,level){
		for (var i = 0; i < comments.length; i++){
			if (comments[i].data.body_html!=undefined) parent.innerHTML += com.makeComment(level, i, comments[i].data)
	        else continue;
			try{
				if (comments[i].data.replies.data.children.length>0){
					com.make(document.getElementById("parent"+com.viewID+"comLevel"+level+"num"+i), comments[i].data.replies.data.children, level+1);
				}
			}catch(e){}
		}
	},

	makeComment: function(level, i, data){		
		var _class = com.simple?"commentSimple ":"comment " 
		if (com.simple) _class += level%2==0?"comColor1":"comColor2";
	    var id = "parent"+com.viewID+"comLevel"+level+"num"+i
	    var comment = "<div class='"+_class+"' id="+id+">" 
	        +"<div class='updown'><div class='up'></div><span class='comScore'>"+(data.ups - data.downs)+"</span><div class='down'></div></div>"
	        +"<div class='comInfo'><a class='shrink' onclick='return com.hideCommnet(this)'>[-]&nbsp&nbsp</span><a class='comAuthor'>"+data.author+"</a><span>&nbsp&nbsp"+com.getTime(data.created_utc)+"</span></div>"
	        +com.decodeEntities(data.body_html)
	        + "</div>"
	        + "<div class='comFooter'><span>permalink</span><span>source</span><span>save</span><span>report</span><span>give gold</span><span>reply</span><span>hide child comments</span></div>"

	    return comment;
	},

	decodeEntities: function (s){
	    var str, temp= document.createElement('p');
	    temp.innerHTML= s;
	    str= temp.textContent || temp.innerText;
	    temp=null;
	    return str;
	},

	getTime: function (secs){
	    var date = new Date(secs*1000);

	    var diff = new Date() / 1000 - date/1000

	    if (diff<60){
	        return Math.floor(diff)+" second" + (Math.floor(diff)>1?"s":"") + " ago"
	    }else if (diff < 3600){
	        return Math.floor(diff/60)+" miniute" + (Math.floor(diff/60)>1?"s":"") + " ago"
	    }else if (diff < 86400){
	        return Math.floor(diff/3600)+" hour" + (Math.floor(diff/3600)>1?"s":"") + " ago"
	    }else if (diff < 2592000){
	        return Math.floor(diff/86400)+" day" + (Math.floor(diff/86400)>1?"s":"") + " ago"
	    }else {
	        return Math.floor(diff/2592000)+" year" + (Math.floor(diff/2592000)>1?"s":"") + " ago"
	    }
	},


	hideCommnet: function (e){
	    var display = "none";
	    var con = e.parentNode.parentNode;
	    if (con.getElementsByClassName("md")[0].style.display == "none") display = "block"
	    con.getElementsByClassName("md")[0].style.display = display;
	    var subs = [];

	    if (!com.simple)
	    	subs = con.getElementsByClassName("comment")
	    else
	    	subs = con.getElementsByClassName("commentSimple");

	    if (subs.length == 0)
	    	if (com.simple)
	    		subs = con.getElementsByClassName("comment")
	    	else
	    		subs = con.getElementsByClassName("commentSimple");

	    for (var i = 0; i < subs.length; i++){
	        subs[i].style.display = display;
	    }
	    return false;
	},
	loadScript: function(url, callback)
	{
		// Adding the script tag to the head as suggested before
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;

		// Then bind the event to the callback function.
		// There are several events for cross browser compatibility.
		script.onreadystatechange = callback;
		script.onload = callback;

		// Fire the loading
		head.appendChild(script);
	},
	loadStyle: function(url, callback)
	{
		// Adding the script tag to the head as suggested before
		var head = document.getElementsByTagName('head')[0];
		var style = document.createElement('link');
		style.rel="stylesheet"
		style.type = 'text/css';
		style.href = url;

		// Then bind the event to the callback function.
		// There are several events for cross browser compatibility.
		style.onreadystatechange = callback;
		style.onload = callback;

		// Fire the loading
		head.appendChild(style);
	}

}