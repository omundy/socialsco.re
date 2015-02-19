/**
 * function buildingBuilder(){
 *
 *
 * }
 *	contentscript.js
 *	- runs when user visits webpage(s) listed in manifest.json
 *	- can access background.js with chrome.extension.sendMessage()
 *	- can use console.log()s)
 */

var userOptions = {};
var userData = {};
var scoreData = {};
var pageData = {'name':'pageData','currentURL':'','newURL':'','mouseX':0,'mouseY':0,'clickType':'','linkContents':''};
var buildingData= {'airport':1,'factory':1,'mall':1,'nightclub':1,'postoffice':1,'recordstore':1,'townhall':1};


// 1. When window loads... 
$(window).load(function(){
		console.log("============================= window loaded =============================");
		// Initial addition of score markers
		addScoreMarkers();
		//addScoreMarkers();	// a. insert html
		//updateScore();		// b. ?
		// c. from background.js ...
		
		});


function getUserOptions(){
	chrome.extension.sendMessage({'action':'getUserOptions'},function(response) {
			userOptions = response.userOptions;
		});
}
function getUserData(){
	chrome.extension.sendMessage({'action':'getUserData'},function(response) {
			userData = response.userData;
		});
}
function getScoreData(){
	chrome.extension.sendMessage({'action':'getScoreData'},function(response) {
			scoreData = response.scoreData;
updateScore();
		});
}
function saveScoreData(){
	chrome.extension.sendMessage({'action':'saveScoreData','scoreData':scoreData},function(response) {
			console.log('saveScoreData successful');
			console.log(scoreData);
		});
}
getUserOptions();
getUserData();
getScoreData();





function building(id,level,image,x,y) {
	this.id=id;
	this.rank=level;
	this.image=image;
	this.x=x;
	this.y=y;

};



var progress;
var logo_16x16=chrome.extension.getURL("images/logo_16x16.png");
var plusOneImage=chrome.extension.getURL("images/plusOne.gif");
var plusTwoImage=chrome.extension.getURL("images/plusTwo.png");
var minusTwoImage=chrome.extension.getURL("images/minusTwo.png");
var badge=chrome.extension.getURL("images/badgebgRotate.png");
var lvlup=chrome.extension.getURL("images/lvlup.png");
var progressBarImg=chrome.extension.getURL("images/barbg.png");
var dropDown=chrome.extension.getURL("images/dropdown2.png");
var stalker=chrome.extension.getURL("images/stalker.png");
var nightOwl=chrome.extension.getURL("images/nightOwl.png");
var workerBee=chrome.extension.getURL("images/workerBee.png");
var billboard_bg=chrome.extension.getURL("images/billboard_bg.png");
var closeButton=chrome.extension.getURL("images/close.png");
var soundOn=chrome.extension.getURL("images/icon_sound_on.png");
var soundOff=chrome.extension.getURL("images/icon_sound_off.png");
var plusOneOn=chrome.extension.getURL("images/icon_plus_one.png");
var plusOneOff=chrome.extension.getURL("images/icon_plus_one_off.png");
var optionsPage = chrome.extension.getURL("options.html");
var leaderboardPage = chrome.extension.getURL("http://socialsco.re/leaderBoard");
			  //0,1, 2, 3, 4,  5,  6,  7,  8,  9,  10,  11
var ranksArray=[0,1,10,25,50,100,200,400,600,800,1000,1500,2000,2500,5000,10000];
var bigDroppedDown=false;

var canLvlup;
var canClickBeSent=true;
/*
   var timeStamps=[];
   var timeStampArrayPosition;
   storage.get('timeStampArrayPos', function(pos){timeStampArrayPosition=pos.timeStampArrayPos;});
   if(timeStampArrayPosition==undefined||timeStampArrayPosition>100){timeStampArrayPosition=0};
   */







/**
 *	Show a visual near a click location
 *	@param string id Name of div to be created (e.g. 'plusOne')
 *	@param string img Name of image to show (e.g. 'plusTwoImage')
 *	@return void 
 */
function showClickVisual(id,img){
	if(userOptions['plusVisual'] == true){
		var newX=pageData.mouseX-20;
		var newY=pageData.mouseY-20;
		var html = "<div id='"+ id +"' "+
			"style='position:absolute;z-index:9999999999999;left:"+newX+"px;top:"+newY+"px;font-size:20px;'>"+
			"<img src='"+img+"'/></div>";	
		$("body").append(html);
		$("#"+id).animate({top:newY-20},300, function(){
			var elem = document.getElementById(id);
			elem.parentNode.removeChild(elem);
		});	
	}
}

// Show level up graphic
function showLvlup(){
	// if scoreData.totalScore advances them to next rank
	if(scoreData.totalScore >= ranksArray[scoreData.rank+1]){
		if(canLvlup==true){
			$("#lvlup").animate({top:0},300, function(){
					setTimeout(function(){$("#lvlup").animate({top:-40},300)},2000);
					canLvlup=false;
					});
			scoreData.rank++;
			saveScoreData();
		}
	}
	else canLvlup=true;
};

// Update the progress bar
function updateProgressBar(){
	var percentToNextRank = (scoreData.totalScore-ranksArray[scoreData.rank]) / (ranksArray[scoreData.rank+1]-ranksArray[scoreData.rank]);
	if(percentToNextRank>1){percentToNextRank=1};
	if(percentToNextRank*100<1){percentToNextRank=1/100};
	var barPercent=(percentToNextRank*100)+"%";
	$("#progressBar").animate({width:barPercent},300,"easeOutQuint");
	// show score tags on progress bar click
	$("#scoreContainer").stop().animate({opacity:1},100,"easeInQuint");
	setTimeout(function(){$("#scoreContainer").stop().animate({opacity:0},600,"easeInQuint");},1000);
console.log(percentToNextRank);
};

/**
 *	updateScore() 
 *	- calculates any rank upgrades and saves in localStorage (need to make it update server w/new rank, etc. too)
 *	- displays score, including buildings, progress bar, stats bar, console
 */
function updateScore(){
	// make sure scoreMarkers have been added
	if (!document.getElementById("score")){	
		addScoreMarkers();
	}
	
	timeStamp(); 

	// the next rank = nextRank-totalScore
	scoreData.toNextRank = (ranksArray[scoreData.rank+1]-scoreData.totalScore);
	saveScoreData();

	// display scores
	showLvlup();
	buildingBuilder();
	updateProgressBar();
	document.getElementById("progressBarTotalScore").innerHTML = scoreData.totalScore;
	document.getElementById("statsTotalLinks").innerHTML = scoreData.totalLinks;
	document.getElementById("statsTotalLikes").innerHTML = scoreData.totalLikes;
	document.getElementById("statsTotalComments").innerHTML = scoreData.totalComments;
	document.getElementById("statsTotalScore").innerHTML = scoreData.totalScore;
	document.getElementById("statsRankNum").innerHTML = scoreData.rank;
	//document.getElementById("toNextRankNum").innerHTML = scoreData.toNextRank;
	
	// logs
	console.log(userData);
	console.log(scoreData);
	console.log(pageData);

}


/**
 *	addScoreMarkers() - Creates HTML to hold score and lvlup
 */
function addScoreMarkers(){
	if (!document.getElementById("SocialScoreContainer")){

		$("#blueBar").stop().animate({top:5},0,"easeOutQuint");	
		$("#globalContainer").stop().animate({top:5},300,"easeOutQuint");

		// create marker in headNav
		var marker = document.getElementById("pagelet_bluebar");
		marker.innerHTML = marker.innerHTML + 
			"<div id='SocialScoreContainer'>"+
			//"<div id='mouseDetector'></div>"+
			//	"<div id='rankContainer' style='background-image:url("+badge+");'>"+
			//	"<div id='rank'>"+scoreData.rank+"</div>"+
			//"</div>" +

		// progressBar
			"<div id='progressBarBg'>"+
				"<div id='progressBar'></div>"+
				"<div id='scoreContainer' style='background-image:url("+badge+");'>"+
					"<div id='score'><span id='progressBarTotalScore'>"+scoreData.totalScore+"</span></div>"+
				"</div>" +
			"</div>"+
			"<div id='lvlup' style='background-image:url("+lvlup+");'></div>"+

			"<div id='dropDown' >"+
				"<div id='buildingContainer' class='foo'>"+
					"<div id='buildings' style='background-image:url("+billboard_bg+");'>"+
"<div id='airport' class='building'></div>"+
"<div id='factory' class='building'></div>"+
"<div id='mall' class='building'></div>"+
"<div id='nightclub' class='building'></div>"+
"<div id='postoffice' class='building'></div>"+
"<div id='recordstore' class='building'></div>"+
"<div id='townhall' class='building'></div>"+







"</div></div>"+
			"<div id='closeDropDown' ><img src='"+closeButton+"'/></div>"+


		
			"<div id='dropDownInfoRow'>"+
		
		// stats (left side)
			"<div id='stats'>"+
			
			  	"<span id='statsLogo'><img src='"+logo_16x16+"'></span>"+
				"<span id='statsWordmark'><a href='http://socialsco.re/' target='_blank'>Socialsco.re</a> <span id='statsTotalScore' class='numberSpan'>"+scoreData.totalScore+"</span></span>"+
				"<span>Rank <span id='statsRankNum' class='numberSpan'>"+scoreData.rank+"</span></span>"+
				
				"<span class='statsDivider'></span>"+
				
				"<span>Links <span id='statsTotalLinks' class='numberSpan'>"+scoreData.totalLinks+"</span></span>"+
				"<span>Likes <span id='statsTotalLikes' class='numberSpan'>"+scoreData.totalLikes+"</span></span>"+
				"<span>Comments <span id='statsTotalComments' class='numberSpan'>"+scoreData.totalComments+"</span></span>"+
				
				/*"<span>Badges <span class='numberSpan'>3</span>"+
					"<img src='"+stalker+"'><img src='"+nightOwl+"'><img src='"+workerBee+"'></span>"+*/
			  
			"</div>"+
			
		// options	(right side)
			"<div id='options'>"+
				"<div><a href='"+optionsPage+"' target='_blank'>Options</a></div>"+
				"<div><a href='http://socialsco.re/leaderBoard' target='_blank'>Leaderboard</a></div>"+
				"<div><a href='http://socialsco.re/leaderBoard' target='_blank'>"+ scoreData['username'] +"</a></div>"+
			"</div>"+

/*
"<div style='background:url("+soundOn+"); background-size:20px 20px;' id='soundToggle' class='options'></div>"+ 
"<div id='plusOneToggle' style='background:url("+plusOneOn+"); background-size:20px 20px;' class='options'></div>"+ 
*/
			"</div>"+
			"</div>";
	}
	buildingBuilder();

	var test=(2000-$(window).width())/2;
	$('#buildingContainer').scrollLeft(test);

	//document.getElementById("rank").innerHTML = scoreData.rank;
	var timeoutDown;
	var timeoutUp;


	// Small Drop down on mouse over
	$("#SocialScoreContainer").mouseover(function(){
			clearTimeout(timeoutUp);
			timeoutDown=setTimeout(function(){
				// only open smallDropDown if bigDropDown is not open
				if(bigDroppedDown==false){
					moveSmallDropDown("open"); 
				};
			},200);
		});
	// Small drop down close on mouse out 
	$("#SocialScoreContainer").mouseout(function(){
			clearTimeout(timeoutDown);
			// leave it open if they choose this in options
			if (userOptions['showStatusBar'] != true){
				timeoutUp=setTimeout(function(){
					if(bigDroppedDown==false){
						// only close smallDropDown if bigDropDown is not open
						moveSmallDropDown("close"); // close
					};
				},500);
			}
		});
	// Big drop down on click 
	$("#SocialScoreContainer").click(function(e){
			if($(e.target).is(".options")){return;}
			if(bigDroppedDown==false){moveBigDropDown("open");};
		});
	// Big drop down closed on click of close button
	$("#closeDropDown").click(function(){
			moveBigDropDown("close");	
			// turn it false temporarily, so current mouseOver it open it back up
			setTimeout(function(){bigDroppedDown=false;},400);
			});

	



// MARKED FOR DELETION	
	/*
	// Resets score on click
	// NOT WORKING NOW. NEEDS TO BE MOVED TO OPTIONS PAGE
	$("#reset").click(function(){
			chrome.extension.sendMessage({'action':'resetCount'}, function(response) {
				scoreData.totalScore = response.value?response.value:0;
				});
			});
	
	// Prevention for clicking toggle too fast
	var soundToggleTimeout;
	$("#soundToggle").click(function(){
			clearTimeout(soundToggleTimeout);
			soundToggleTimeout=setTimeout(function(){

				chrome.extension.sendMessage({'action':'toggleSound'});

				},500);

			});	
	// Listen for sound toggle. 
	// Probably can be changed to just a send message that changes based on response, not a listener for a message	
	chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
			console.log("Sound: "+request.soundCheck);
			var on="url("+soundOn+")";
			var off="url("+soundOff+")";
			if(request.soundCheck==false){
			$("#soundToggle").css('background-image', off);
			};
			if(request.soundCheck==true){
			$("#soundToggle").css('background-image', on);
			};
			});
	// Prevention for clicking toggle too fast
	var plusOneToggleTimeout;
	$("#plusOneToggle").click(function(){
			clearTimeout(plusOneToggleTimeout);
			plusOneToggleTimeout=setTimeout(function(){

				chrome.extension.sendMessage({'action':'togglePlusVisual'});

				},500);
			});
	// Listen for visual toggle. 
	// Probably can be changed to just a send message that changes based on response, not a listener for a message	
	chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
			console.log("visuals: "+request.visualCheck);
			var on="url("+plusOneOn+")";
			var off="url("+plusOneOff+")";
			if(request.visualCheck==false){
			$("#plusOneToggle").css('background-image', off);
			};
			if(request.visualCheck==true){
			$("#plusOneToggle").css('background-image', on);
			};
			});
	// Sets a delay to update score to ensure local data is set before updating in order to display correct score.  
	setTimeout(function(){updateScore();},500);
	*/
	
	

}

/* OLD FUNCTION
function buildingBuilder(){
	var diner={};	
	var hotel={};
	var resturant={};

	//DINER-------------------
	if(diner.id==undefined){
		diner=new building('diner',1,'http://socialsco.re/assets/images/buildings/diner',500,100);
	}

	if(scoreData.rank==1){
		diner.rank=1;	
	}
	if(!$('#diner').length){
		$('#buildings').append("<div id='diner' style='position:relative; top:"+diner.y+"px;left:"+diner.x+"px;width:0px;height:0px;'><img id='dinerIMG' style='width:120.6px;height:65.5px' src='"+diner.image+diner.rank+".png'></div>");
	}
	if(scoreData.rank==2){
		diner.rank=2;
		$('#dinerIMG').attr("src",diner.image+diner.rank+".png");
	}		
	//-----------------------END DINER
	//NIGHTCLUB-----------------------

}
*/
function buildingBuilder(){
$('#airport').css('background-image', 'url(http://connerhill.net/socialScore/airportlvl'+buildingData.airport+'.png)');
$('#factory').css('background-image', 'url(http://connerhill.net/socialScore/factorylvl'+buildingData.factory+'.png)');
$('#mall').css('background-image', 'url(http://connerhill.net/socialScore/malllvl'+buildingData.mall+'.png)');
$('#nightclub').css('background-image', 'url(http://connerhill.net/socialScore/nightclublvl'+buildingData.nightclub+'.png)');
$('#postoffice').css('background-image', 'url(http://connerhill.net/socialScore/postofficelvl'+buildingData.postoffice+'.png)');
$('#recordstore').css('background-image', 'url(http://connerhill.net/socialScore/RecordStorelvl'+buildingData.recordstore+'.png)');
$('#townhall').css('background-image', 'url(http://connerhill.net/socialScore/townhalllvl'+buildingData.townhall+'.png)');

}
var userSettingDropDown;
// Moves the small dropdown to open/close based on what is passed through which
function moveSmallDropDown(which){

	//console.log("'moveSmallDropDown' => bigDroppedDown = "+bigDroppedDown);

	if (which=="open"){
		if(userSettingDropDown!=true){
		//$("#scoreContainer").stop().animate({opacity:1},300,"easeOutQuint");
		$("#dropDown").stop().animate({top:-230},300,"easeOutQuint");
		$("#blueBar").stop().animate({top:30},300,"easeOutQuint");	
		$("#globalContainer").stop().animate({top:30},300,"easeOutQuint");
}
	} else {
		//$("#scoreContainer").stop().animate({opacity:0},300,"easeInQuint");
		$("#dropDown").stop().animate({top:-255},300,"easeInQuint");
		$("#blueBar").stop().animate({top:5},300,"easeInQuint");	
		$("#globalContainer").stop().animate({top:5},300,"easeInQuint");
	}
}
// Moves the big dropdown to open/close bassed on what is passed through which
function moveBigDropDown(which){

	//console.log("'moveBigDropDown()' => bigDroppedDown = "+bigDroppedDown);

	if (which=="open"){
		//	$("#scoreContainer").stop().animate({opacity:100},300,"easeInQuint");
		$("#dropDown").animate({top:-30},500,"easeOutQuint");	
		$("#blueBar").animate({top:230},500,"easeOutQuint");	
		$("#globalContainer").animate({top:235},500,"easeOutQuint");
		bigDroppedDown=true;
	} else {
		//	$("#scoreContainer").stop().animate({opacity:0},300,"easeInQuint");
		$("#dropDown").stop().animate({top:-230},300,"easeInQuint");

		if (userOptions['showStatusBar'] == true){
			//goes before the dropdown for some reason.
			$("#blueBar").stop().animate({top:30},300,"easeOutQuint");	
		} else{ 
			$("#blueBar").stop().animate({top:5},300,"easeInQuint");
		}	
		$("#globalContainer").stop().animate({top:5},300,"easeInQuint");

	}
}




/*
   chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
   if(request.action=="dropDown"){
   moveBigDropDown();
   };
   });
   */

/**
 *	DOMModificationHandler() - Called when DOM is modified (i.e. refresh or new page or AJAX)
 *
 function DOMModificationHandler(){
 $(this).unbind('DOMSubtreeModified');
 setTimeout(function(){
 $('body').bind('DOMSubtreeModified',DOMModificationHandler);
 $(document).mousemove(function(e){
 pageData.mouseX=e.pageX;
 pageData.mouseY=e.pageY;
 click();
 addScoreMarkers();
 }); 
 },
 500);
 }
 */


/**
 *	Return array with domain name and user
 *	@return object 
 */
function idFacebookUser(){
	var str = {};
	str.currentURL = document.URL;
	if (pageData.pastURL != str.currentURL){	
		str.pastURL = str.currentURL;
		str.host = window.location.host.replace('www.','');
		if (str.host === 'facebook.com'){
			if (window.location.pathname != ""){
				str.user = window.location.pathname.replace('/','');
			} 
			if (window.location.title != ""){
				str.name = document.title.replace(/[(0-9)]/gi,"").replace(/^\s+/gi,"");
			}
		} else {
			str.host = window.location.host;
		}
	}
	pageData = str;
	return str;
}


// keep track of mouse position for "+1" 
$(document).mousemove(function(e){
		pageData.mouseX=e.pageX;
		pageData.mouseY=e.pageY;
		});

/**
 *	DOM4 Mutation Observer
 *	OK for Firefox (MutationObserver) and Chrome (WebKitMutationObserver)
 *	https://developer.mozilla.org/en-US/docs/DOM/MutationObserver
 *	http://updates.html5rocks.com/2012/02/Detect-DOM-changes-with-Mutation-Observers
 *
 *	Note: Previously used this. It worked almost as well though slight lagging 
 *		$('body').bind('DOMSubtreeModified', function(){
 */
// create new MutationObserver for either Firefox || Chrome
MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

//if fired var for comments, needs to be outside of observers so it doesn't constantly get set to false
var commentFired=false; 
var statusFired=false; 
// fired when a page mutation occurs
var observer = new MutationObserver(function(mutations, observer) {    
		//console.log(mutations, observer);
		console.log("----------------------------- DOM updated -----------------------------");

		//Comment Detector
		$("textarea[name='add_comment_text_text']").one("keydown", function(e) {
			if(event.keyCode == 13) { //return key
				if(commentFired==false){	
					commentFired=true;
					var contents=$(this).val();
						if(contents!=""){
							console.log("COMMENT: "+($(this).val()));
							scoreData.totalComments+=1;
							scoreData.totalScore+=5;
							chrome.extension.sendMessage({'action':'sendData', linkType:'comment'});
							updateScore();

						}
					}
				}
				setTimeout(function() {commentFired=false;}, 200);
			})
		
		//Status Detector
		$("button[class='_42ft _4jy0 _11b _4jy3 _4jy1 selected']").one("click", function(e) {
				if(statusFired==false){	
					statusFired=true;
					var contents=$(this).val();
						if(contents!=""){
							console.log("COMMENT: "+($(this).val()));
							scoreData.totalStatus+=1;
							scoreData.totalScore+=5;
							chrome.extension.sendMessage({'action':'sendData', linkType:'comment'});
							updateScore();
						}
					}
				setTimeout(function() {statusFired=false;}, 200);
			});

		// show statusBar if they choose this in options
		//Causing big drop downt to go back up when dom is updated.  Won't come back down until refresh.
		
		if (userOptions['showStatusBar'] == true){moveSmallDropDown("open"); userSettingDropDown=true; };
		
		// called for every anchor click
		$('a').click(function(){
			if(!canClickBeSent) return;
		
			// currentURL
			pageData.currentURL = document.URL; // page they are on now
			pageData.newURL = $(this).attr("href"); // page they are going to
			pageData.linkContents = $(this).html();
		
			// LIKE DETECTION
			var patt_like=/Like/i;
			var patt_unlike=/Unlike/i;
		
			// "UnLike"
			if(pageData.linkContents.match(patt_like)&&(pageData.linkContents.match(patt_unlike))){
				showClickVisual('minusTwo',minusTwoImage);
				scoreData.totalLikes--;
				scoreData.totalScore-=2;
				chrome.extension.sendMessage({'action':'sendData', linkType:'unlike'});
				chrome.extension.sendMessage({'action':'playSound', sound:'bading'});
				pageData.clickType="Unlike";
			// "Like" 	
			} else if(pageData.linkContents.match(patt_like)){
				showClickVisual('plusTwo',plusTwoImage);
				chrome.extension.sendMessage({'action':'sendData', linkType:'like'});
				chrome.extension.sendMessage({'action':'playSound', sound:'bading'});
				scoreData.totalLikes++;
				scoreData.totalScore+=2;
				pageData.clickType="Like";
			// All other links
			} else {
				showClickVisual('plusOne',plusOneImage);
				chrome.extension.sendMessage({'action':'sendData', linkType:'link'});
				chrome.extension.sendMessage({'action':'playSound', sound:'bading'});
				scoreData.totalScore++;
				scoreData.totalLinks++;
				//scoreData.totalClicks++;
				pageData.clickType="Link";
			}
		
			updateScore();
			
			/*
			   timeStamps[timeStampArrayPosition]=timeStamp();
			   timeStampArrayPosition++;
			   console.log("_____________\n"+timeStamps.join('\n')+"\n_____________");
			   if(timeStampArrayPosition==undefined||timeStampArrayPosition>100){timeStampArrayPosition=0};
			//chrome.extension.sendMessage({'action':'setArrayPostion', position:timeStampArrayPosition});
			//*/
			canClickBeSent=false;
			setTimeout(function(){canClickBeSent=true;},500);
			
		}); 
		
		
			
		/*
// this may be useful later for finding out if anchors were added
// but I can't get it to work right now...
// look through all mutations that just occured
for(var i=0; i<mutations.length; ++i) {
// look through all added nodes of this mutation
for(var j=0; j<mutations[i].addedNodes.length; ++j) {
console.log("hi - " + mutations[i].addedNodes[j]);
}
} */
	
	
});
// elements to be observed 
observer.observe(document, { subtree: true, childList: true, });















	
/*	Functions
******************************************************************************/


/**
 *	Store and get objects from localStorage
 */
function storeObject(key,obj) {
    window.localStorage.setItem(key,JSON.stringify(obj));
}
function getObject(key) {
    var obj = window.localStorage.getItem(key);
    return obj && JSON.parse(obj);
}
/**
 *	Return current timestamp
 */
function timeStamp(){
	var epoch = Math.round(new Date().getTime()/1000.0);
	var myDate = new Date( epoch*1000);
	//console.log(myDate);
	return myDate.toString();
};


