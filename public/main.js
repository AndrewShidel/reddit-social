var com = {

	create: function(params){
		com.viewID = params.view
		com.view = document.getElementById(params.view)
		com.site = params.siteName;
		com.page = params.pageName;
		com.simple = params.simple;
	},

	render: function(callback){
		var url = "reddit.com/r/"+com.site+"/comments/"+com.page;
		console.log("URL: " + url);
	    url = url.replace("http://", "");
		url = url.substring(url.length-1)=="/"?url.substring(0,url.length-1):url;
		//document.body.innerHTML += "<div id='comments'></div>";
		
		
		$.get("./get/?url="+url + "/.json", function(data){
			//com.innerHTML += "<p>" + data + "</p>";
			
			var obj = JSON.parse(data);
			var _comments = obj[1].data.children;
			
			com.make(com.view, _comments, 0);
			callback()
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
	    console.log(data);
	    var id = "parent"+com.viewID+"comLevel"+level+"num"+i
	    var comment = "<div class='"+_class+"' id="+id+">" 
	        +"<div class='updown'><div class='up'></div><span class='comScore'>"+(data.ups - data.downs)+"</span><div class='down'></div></div>"
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
	    var subs = con.getElementsByClassName("comment");
	    for (var i = 0; i < subs.length; i++){
	        subs[i].style.display = display;
	    }
	    return false;
	}

}