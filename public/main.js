var com = {
	create: function(params){		
		com.viewID = params.view
		com.view = document.getElementById(params.view)
		com.site = params.siteName;
		com.page = params.pageName;
		com.simple = params.simple;
		com.type = params.type;

		/*com.exceptions["backgroundcolor"] = params.backgroundcolor || "";
        com.exceptions["comment1color"] = params.comment1color || "";
        com.exceptions["comment2color"] = params.comment2color || "";
        com.exceptions["fontFamily"] = params.fontFamily || "";
        com.exceptions["fontSize"] = params.fontSize || "";
        com.exceptions["fontColor"] = params.fontColor || "";
        com.exceptions["borderSize"] = params.borderSize || "";
        com.exceptions["borderColor"] = params.borderColor || "";
        com.exceptions["borderStyle"] = params.borderStyle || "";
        com.exceptions["borderRadius"] = params.borderRadius || "";*/

        //if (typeof params.backgroundcolor != undefined) getCSSRule(".comColor1").style.backgroundColor = params.backgroundcolor;
        if (params.comment1color != undefined) $('.comColor1').css('background-color', params.comment1color);
        if (params.comment2color != undefined){ $('.comColor2').css('background-color', params.comment2color);}
        if (params.fontFamily != undefined) $(".comments").css("font", "normal x-small "+params.fontFamily);
        /*if (typeof params.backgroundcolor != undefined) getCSSRule(".comColor1").style.backgroundColor = params.backgroundcolor;
        if (typeof params.backgroundcolor != undefined) getCSSRule(".comColor1").style.backgroundColor = params.backgroundcolor;
        if (typeof params.backgroundcolor != undefined) getCSSRule(".comColor1").style.backgroundColor = params.backgroundcolor;*/
	},

	render: function(callback){

		callback = callback || function(){};
		var url = "reddit.com/r/"+com.site+"/comments/"+com.page;		
	    url = url.replace("http://", "");
		url = url.substring(url.length-1)=="/"?url.substring(0,url.length-1):url;
		//document.body.innerHTML += "<div id='comments'></div>";

		com.loadStyle("./style.css", function (){
			if (typeof $ == "undefined"){
				com.loadScript("//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js", function(){
					com.start(url, function(){
						callback();
					});
				});
			}else{
				com.start(url, function(){
					callback();
				});
			}	
		});
	},

	start: function(url, call){
		$.get("./get/?url="+url + "/.json", function(data){
			com.view.innerHMTL = "";
			//com.innerHTML += "<p>" + data + "</p>";			
			if (typeof JSON == "undefined"){
				com.loadScript("./json.js", function(){
					var obj = JSON.parse(data);
					var _comments = obj[1].data.children;
					com.make(com.view, _comments, 0);
					call();
				})
			}else{
				var obj = JSON.parse(data);
				var _comments = obj[1].data.children;
				com.make(com.view, _comments, 0);
				call();
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


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////Below are some scripts from hunlock.com/blogs/Totally_Pwn_CSS_with_Javascript for working with stylesheets////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function getCSSRule(ruleName, deleteFlag) {               // Return requested style obejct
   ruleName=ruleName.toLowerCase();                       // Convert test string to lower case.
   if (document.styleSheets) {                            // If browser can play with stylesheets
      for (var i=0; i<document.styleSheets.length; i++) { // For each stylesheet
         var styleSheet=document.styleSheets[i];          // Get the current Stylesheet
         var ii=0;                                        // Initialize subCounter.
         var cssRule=false;                               // Initialize cssRule. 
         do {                                             // For each rule in stylesheet
            if (styleSheet.cssRules) {                    // Browser uses cssRules?
               cssRule = styleSheet.cssRules[ii];         // Yes --Mozilla Style
            } else {                                      // Browser usses rules?
               cssRule = styleSheet.rules[ii];            // Yes IE style. 
            }                                             // End IE check.
            if (cssRule && cssRule.selectorText!=undefined)  {                               // If we found a rule...
               if (cssRule.selectorText.toLowerCase()==ruleName) { //  match ruleName?
                  if (deleteFlag=='delete') {             // Yes.  Are we deleteing?
                     if (styleSheet.cssRules) {           // Yes, deleting...
                        styleSheet.deleteRule(ii);        // Delete rule, Moz Style
                     } else {                             // Still deleting.
                        styleSheet.removeRule(ii);        // Delete rule IE style.
                     }                                    // End IE check.
                     return true;                         // return true, class deleted.
                  } else {                                // found and not deleting.
                     return cssRule;                      // return the style object.
                  }                                       // End delete Check
               }                                          // End found rule name
            }                                             // end found cssRule
            ii++;                                         // Increment sub-counter
         } while (cssRule)                                // end While loop
      }                                                   // end For loop
   }                                                      // end styleSheet ability check
   return false;                                          // we found NOTHING!
}                                                         // end getCSSRule 

function killCSSRule(ruleName) {                          // Delete a CSS rule   
   return getCSSRule(ruleName,'delete');                  // just call getCSSRule w/delete flag.
}                                                         // end killCSSRule

function addCSSRule(ruleName) {                           // Create a new css rule
   if (document.styleSheets) {                            // Can browser do styleSheets?
      if (!getCSSRule(ruleName)) {                        // if rule doesn't exist...
         if (document.styleSheets[0].addRule) {           // Browser is IE?
            document.styleSheets[0].addRule(ruleName, null,0);      // Yes, add IE style
         } else {                                         // Browser is IE?
            document.styleSheets[0].insertRule(ruleName+' { }', 0); // Yes, add Moz style.
         }                                                // End browser check
      }                                                   // End already exist check.
   }                                                      // End browser ability check.
   return getCSSRule(ruleName);                           // return rule we just created.
} 