var com = {
	create: function(params){	

		

		com.viewID = params.view
		com.view = document.getElementById(params.view)
		com.site = params.siteName;
		com.page = params.pageName;
		com.simple = params.simple||true;
		com.type = params.type;
		com.title = params.title||document.title;
		com.rootURL = params.rootURL||"./"

		setTimeout(function(){
			console.log("Called!!!");

			var msg="LOADING COMMENTS...";
			
			com.view.innerHTML="<div class='comHeader'><h3 class='comHeaderText'>"+msg+"</h3><img style='height:25px;width:25px;position:relative;top:5px;' src='http://www.paynearme.com/assets/loading-6850ea7c280eb89c1510fa438a8bf9c1.gif'></img></div>";
			com.header=com.view.getElementsByClassName("comHeader")[0];
		}, 0);

		//If a url is specified, then use it, else use the page title.
		com.url=params.url||"title";

		com.setStyles(params)	    
	},

	setStyles:function(params){
		var keys={
			comment1color:['.comColor1','background-color'],
			comment2color:['.comColor2','background-color'],
			fontFamily:['.comments','font-family'],
			fontSize:['.comments','font-size'],
			fontColor:['.comments','color'],
			borderRadius:['.commentSimple','border-radius'],
			borderStyle:['.commentSimple','border-style'],
			borderColor:['.commentSimple','border-color'],
			borderSize:['.commentSimple','border-width'],
			headerColor:['.comHeader','background-color'],
			headerFontColor:['.comHeader','color'],
			headerFontSize:['.comHeader','font-size'],
			headerFontFamily:['.comHeader','font-family']			
		}
		var props=Object.keys(params),
			key, prop;
		for (var i=0;i<props.length,prop=props[i];i++){
			key=keys[prop];
			if (typeof key != 'undefined')
				$(key[0]).css(key[1], prop);
		}
	},

	render: function(callback){

		callback = callback || function(){};

		if (com.page==undefined||com.page==null||com.page=="") com.page=document.title;

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

	authentcate: function(toDo){
		toDo=toDo||"";
		var params = document.getElementsByClassName("inputs");
		var query = "https://ssl.reddit.com/api/v1/authorize?";
		query+="state="+encodeURIComponent(window.location.href.substring(window.location.href.indexOf("//")+2))+"&";
		query+="duration=permanent&";
		query+="response_type=code&";
		query+="scope=identity,edit,read,save,submit,vote&";
		query+="client_id=aatrT5XMBnbU0Q&";
		query+="redirect_uri=http://shidel.com/redirect.html";
		console.log(query);
		window.otherWindow=window.open(query, '_blank');
	  	window.otherWindow.focus();

	  	window.tempCookie="waiting"
	  	document.cookie=window.tempCookie;
	  	window.cookieInterval=setInterval(function(){
	  		if(document.cookie!=window.tempCookie){	  			
	  			window.tokenData=document.cookie;	  	
	  			clearInterval(window.cookieInterval);
	  			eval(toDo);
	  		}
	  	},500);
	},
	onLoad: function(){
		var QueryString = function () {
		  // This function is anonymous, is executed immediately and 
		  // the return value is assigned to QueryString!
		  var query_string = {};
		  var query = window.location.search.substring(1);
		  var vars = query.split("&");
		  for (var i=0;i<vars.length;i++) {
		    var pair = vars[i].split("=");
		    	// If first entry with this name
		    if (typeof query_string[pair[0]] === "undefined") {
		      query_string[pair[0]] = pair[1];
		    	// If second entry with this name
		    } else if (typeof query_string[pair[0]] === "string") {
		      var arr = [ query_string[pair[0]], pair[1] ];
		      query_string[pair[0]] = arr;
		    	// If third or later entry with this name
		    } else {
		      query_string[pair[0]].push(pair[1]);
		    }
		  } 
		    return query_string;
		} ();
		if (QueryString.code != undefined){
			var json={
				state: encodeURIComponent(window.location.href),
				scope: "identity,edit,read,save,submit,vote",
				client_id: "aatrT5XMBnbU0Q",
			   	redirect_uri: "http://shidel.com/redirect.html",
			   	code: QueryString.code,
			   	grant_type: 'authorization_code'
			}
			var header = {
				'User-Agent': 'Reddit-Social-Comments made by /u/tannerdaman1',
				'Authorization':'Basic '+btoa("aatrT5XMBnbU0Q:uu2YgQZoT6WrOMTrrybtwGwX1VU")
			};
			window.theURL=com.rootURL+"post/?method=v1/access_token&json="+JSON.stringify(json)+"&header="+JSON.stringify(header);
			console.log(window.theURL);
			$.get( com.rootURL+"post/?method=v1/access_token&json="+JSON.stringify(json)+"&header="+JSON.stringify(header), function( data ) {
				window.tokenData=JSON.parse(data).access_token;
				document.cookie=window.tokenData;
				close();
				//eval(QueryString.toDo);
				com.view.scrollIntoView( true );
			});
		}
	},
	sendComment: function(text, id){
		if (window.tokenData!=undefined){
			console.log("This id "+id);
			var json={
				api_type:"json",
				text:text,
				thing_id:id,
				'Authorization':'Bearer '+window.tokenData
			};
			var header = {
				'User-Agent': 'Reddit-Social-Comments made by /u/tannerdaman1',
				'Authorization':'Bearer '+window.tokenData
			}; 
			$.get( com.rootURL+"post/?method=comment&oauth=true&json="+JSON.stringify(json)+"&header="+JSON.stringify(header), function( data ) {
				console.log(data);
				document.body.innerHTML+="<div class='comError'>COMMENT CREATED</div>";
				$('.comError').fadeIn(400).delay(3000).fadeOut(400);
				com.render();
				com.view.scrollIntoView( true );
			});		
		}else{
			com.authentcate("com.sendComment('"+text+"','"+id+"')");
		}
	},
	reply: function(parent){
		parent=parent.parentNode;
		var text=parent.getElementsByTagName("textarea")[0].value,
			id=parent.getAttribute("name");
		com.sendComment(text, id);
	},
	removeBox: function(ele){
		ele.parentNode.removeChild(ele.parentNode.getElementsByClassName("comReply")[0]);		
	},
	replyButton: function(ele){

		var parent = ele.parentNode.parentNode;
		if (window.clickedOnce){
			parent.getElementsByClassName("comReply")[0].innerHTML="";
			window.clickedOnce=false;
			return;
		}
		var txt="<textarea style='height: 80px; width: 50%;display: block;'></textarea><button onclick='com.reply(this.parentNode)'>save</button><button onclick='com.replyButton(this.parentNode)'>cancel</button>"
		/*if (ele.parentNode.tagName.toLowerCase()=="span"){
			if (parent.getElementsByClassName("comReply").length==0)
				parent.innerHTML+=txt;
			return;
		}*/
  		parent.getElementsByClassName("comReply")[0].innerHTML=txt
  		window.clickedOnce=true;
	},
	vote:function(ele){
		com._vote(ele.parentNode.parentNode.getAttribute("name"),ele.getAttribute("class")=="comUp"?1:-1);
	},
	_vote: function(thingID,dir){
		if (window.tokenData!=undefined){
			var thing=thingID,
				direction=dir;

			var json={
					dir:direction,
					id:thing,
					'Authorization':'Bearer '+window.tokenData
			};
			var header = {
				'User-Agent': 'Reddit-Social-Comments made by /u/tannerdaman1',
				'Authorization':'Bearer '+window.tokenData
			}; 

			$.get( com.rootURL+"post/?method=vote&oauth=true&json="+JSON.stringify(json)+"&header="+JSON.stringify(header), function( data ) {
				console.log(data);				
				document.body.innerHTML+="<div class='comError'>VOTE CAST</div>";
				$('.comError').fadeIn(400).delay(3000).fadeOut(400);
			});		
		}else{
			com.authentcate("com._vote('"+thingID+"',"+dir+")");
		}
	},

	start: function(call){
		var location = window.location.href;
		location = location.substring(location.indexOf("//")+2)

		//Reddit rejects localhost urls, so this will be temporarily used.
		location = "http://shidel.com";

		$.get(com.rootURL+"get/?url=" + com.url + "/&origin="+location+"&site="+com.site+"&title="+com.title, function(data){			
			com.view.innerHMTL = "";

			if (data=="Creating"){
				call("nothing");
				return;
			}
			var obj = JSON.parse(data);
			window.mainID=obj[0].data.children[0].data.id;
			com.header.setAttribute("name",obj[0].data.children[0].data.name)
			if (obj[1].data.children.length==0){
				call("nothing");				
				return;
			}
			window.numComments=obj[0].data.children[0].data.num_comments;
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
		if (level==0){
			var msg="THERE "+(window.numComments==1?"IS ":"ARE ")+"<span class='numComments'>"+window.numComments+"</span> COMMENT"+(window.numComments==1?"":"s");			
			parent.innerHTML="<div class='comHeader' name='"+com.header.getAttribute('name')+"''><h3 class='comHeaderText'>"+msg+". <span><a class='addCommentLink' onclick='com.replyButton(this.parentNode)'>ADD YOURS</a></span></h3><div class='comReply'></div></div>"//+parent.innerHTML;
		}

		for (var i = 0; i < comments.length; i++){
			if (comments[i].data.body_html!=undefined) parent.innerHTML += com.makeComment(level, i, comments[i].data)
	        else continue;
			try{
				if (comments[i].data.replies.data.children.length>0){
					com.make(document.getElementById("parent"+com.viewID+"comLevel"+level+"num"+i), comments[i].data.replies.data.children, level+1);
				}
			}catch(e){}
		}
		if (level==0) {
			//parent.innerHTML += "<div style='width:1px;height:1px; overflow:visible;'><textarea class='comBoxMain'></textarea></div>"
		}
	},

	makeComment: function(level, i, data){
		var _class = com.simple?"commentSimple ":"comment " 
		if (com.simple) _class += level%2==0?"comColor1":"comColor2";
	    var id = "parent"+com.viewID+"comLevel"+level+"num"+i
	    console.log(data);
	    var comment = "<div class='"+_class+"' id="+id+" name='"+data.name+"'>" 
	        +"<div class='updown'><div onclick='com.vote(this)' class='comUp'></div><span class='comScore'>"+(data.ups - data.downs)+"</span><div onclick='com.vote(this)' class='comDown'></div></div>"
	        +"<div class='comInfo'><a class='shrink' onclick='return com.hideCommnet(this)'>[-]&nbsp&nbsp</span><a class='comAuthor'>"+data.author+"</a><span>&nbsp&nbsp"+com.getTime(data.created_utc)+"</span></div>"
	        +com.decodeEntities(data.body_html)
	        + "</div>"
	       
	    return comment;
	},

	decodeEntities: function (s){
	    var str, temp= document.createElement('p');
	    temp.innerHTML= s;
	    str= temp.textContent || temp.innerText;
	    temp=null;
	    str += "<div class='comReply'></div>"
	    str +=  "<div class='comFooter'><a class='comFooterItem'>permalink</a><a class='comFooterItem'>source</a><a class='comFooterItem'>save</a><a class='comFooterItem'>report</a><a class='comFooterItem'>give gold</a><a class='comFooterItem' onclick=\" com.replyButton(this); \">reply</a><a class='comFooterItem' onclick=\" com.hideCommnet(this); \">hide child comments</a></div>";
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
		con.getElementsByClassName("comFooter")[0].style.display = display;
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
window.addEventListener("load", com.onLoad, false);
//window.onload=com.onLoad;