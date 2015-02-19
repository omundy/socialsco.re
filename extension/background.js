/**
 *	background.js
 *	- runs instantly when extension is installed
 *	- can be accessed from contentscript.js et al
 *	- console.log() can only be seen in inspection view (link in chrome://extensions)
 */

// 1. Confirm user exists
if (getVar('socsco_hello') != 'true' && verifyToken(getVar('socsco_token'))) {
	//alert('fail');
	createUser();
}

// 2. Confirm userOptions exist
//localStorage.removeItem('userOptions'); // reset
if (getObject('userOptions')){
	var userOptions = getObject('userOptions');
	console.log(userOptions);
} else {
	var userOptions = {
		'name':'userOptions',
		'playSound':true,
		'plusVisual':true,
		'showStatusBar':true
	};
	storeObject('userOptions',userOptions);
}
var userData = {};
var scoreData = {};


// Listen for messages in order to receive/pass data to the content script
chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
		
	// ##################### THESE ARE IN USE ##################################	
		
		// relays data to main sendData() function
		if (request.action=='sendData'){
			sendData(request.linkType);
		}
		// playSound
		else if (request.action == "playSound"){
			playSound(request.sound);
		}
		
	// userOptions	
		// return userOptions
		else if (request.action == "getUserOptions"){
			sendResponse({'userOptions':userOptions});
		}
		// save userOptions
		else if (request.action == "saveUserOptions"){
			userOptions = request.userOptions;		// update object
			storeObject('userOptions',userOptions);	// store in localStorage
			sendResponse({'message':1});			// send success response
		}
	
	// userData
		// return userData
		else if (request.action == "getUserData"){
			userData = {
				'name':'userData',
				'token':getVar('socsco_token')
			};
			sendResponse({'userData':userData});
		}
		
	// scoreData	
		// return scoreData
		else if (request.action == "getScoreData"){
			getScoreData();
			sendResponse({'scoreData':scoreData});
		}
		// save saveScoreData
		else if (request.action == "saveScoreData"){
			scoreData = request.scoreData;		// update object
			storeObject('scoreData',scoreData);	// store in localStorage
			sendResponse({'message':1});		// send success response
		}

			
			
			
			




	// #################### MARKED FOR DELETION #################################	
		
		/*
		// Sets total clicks and likes
		else if (request.action=='setScore'){
			scoreData.totalScore += request.increaseBy;			// increment
			if(scoreData.totalScore<0){scoreData.totalScore=0};	// zero if <0
			storage.set({'totalScore': scoreData.totalScore});	// set score
			sendResponse({'totalScore': scoreData.totalScore}); // respond
		}
		// Store Likes/Unlikes 
		else if (request.action=='setLike'){
			scoreData.totalLikes += request.increaseBy;			// increment
			if(scoreData.totalLikes<0){scoreData.totalLikes=0};	// zero if <0
			storage.set({'totalLikes': scoreData.totalLikes});	// set score
			sendResponse({'totalLikes': scoreData.totalLikes}); // respond
		}
		// if totalScore reaches threshold then increment rank
		else if (request.action=='setRank'){
			scoreData.rank += request.increaseBy;
			storage.set({'rank': scoreData.rank});
			sendResponse({'rank': scoreData.rank}); 
		}
		
		// toggle sound
		else if(request.action=='toggleSound'){
			if(userOptions['playSound'] == true){
				userOptions['playSound'] = false;
			} else { 
				userOptions['playSound'] = true;
			}
			storeObject('userOptions',userOptions);
			
			// CONNER: What does this do?
			chrome.tabs.getSelected(null, function (tab) {
					chrome.tabs.sendMessage(tab.id, { soundCheck: userOptions['playSound'] });
					});
		}
		// toggle plus visual
		else if(request.action=='togglePlusVisual'){
			if(userOptions['plusVisual'] == true){
				userOptions['plusVisual'] = false;
			} else {
				userOptions['plusVisual'] = true;
			}
			storeObject('userOptions',userOptions);
			
			// CONNER: What does this do?
			chrome.tabs.getSelected(null, function (tab) {
					chrome.tabs.sendMessage(tab.id, { visualCheck: userOptions['plusVisual']});
					});
		}
		*/
		
		
		
		
	// #################### NOT SURE ABOUT THESE #################################	
	
		// return userData object
		//else if (request.action == "getUserData"){ sendResponse(userData); }
		// return pageData object
		//else if (request.action == "getPageData"){ sendResponse(pageData); }
		// return scoreData object	
		//else if (request.action == "getScoreData"){ sendResponse(scoreData); }
		
		// reset score
		// this should be done on the server
		else if(request.action=='resetScore'){
			resetScoreData();
			sendResponse({'reset': 'done'});
		}
		
});

//Shows page_action icon
function checkForValidUrl(tabId, changeInfo, tab) {
	// If the tabs url starts with "http://specificsite.com"...
	if (tab.url.indexOf('www.facebook.com') <= 8&&tab.url.indexOf('www.facebook.com')>0){
		// ... show the page action.
		chrome.pageAction.show(tabId);
		chrome.pageAction.onClicked.addListener(function(){
				chrome.tabs.getSelected(null, function (tab) {
					chrome.tabs.sendMessage(tab.id, { action: "dropDown" });
					});
				}); 
	};
};
// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);





	
/*	AJAX server functions
******************************************************************************/

/**
 *	createUser()
 *	1. Generate a new token 
 *	2. Take new user to createAccount page
 */
function createUser(){
	var xhr = new XMLHttpRequest();
	var url="http://socialsco.re/api/process.php?action=createUser";
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var reply = JSON.parse(xhr.responseText);
			// save token
			var socsco_token = reply.token;
			storeVar('socsco_token', reply.token);
			// forward user to createAccount page
			if (getVar('socsco_hello') != 'true') {
				storeVar('socsco_hello', 'true');
				chrome.tabs.create({
					url: 'http://socialsco.re/createAccount/'+socsco_token
				});
			}
		}
	}
	xhr.send();
}
/**
 *	sendData()
 *	1. Send data to server
 */
function sendData(linkType){
	
	var xhr = new XMLHttpRequest();	
	var url = "http://socialsco.re/api/process.php?token=" + getVar('socsco_token') + "&action=sendData&type="+linkType;
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var reply = JSON.parse(xhr.responseText);
			if (reply.message >= 1){
				console.log('sendData() response:'+reply.message);
			} else {	
				console.log('sendData() response (failed):'+reply.message);
			}
		}
	}
	xhr.send();
}
/**
 *	getScoreData()
 *	1. Get score data from server
 */
function getScoreData(){
	var xhr = new XMLHttpRequest();	
	var url = "http://socialsco.re/api/process.php?token=" + getVar('socsco_token') + "&action=returnUser";
	console.log(url);
	xhr.open("GET", url, false);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var reply = JSON.parse(xhr.responseText);
			if (reply){
				console.log('getData() response was successful');
				scoreData = reply;
				return 1;
			} else {	
				console.log('getData() response failed:'+reply);
				resetScoreData();
				return 0;
			}
		}
	}
	xhr.send();
}





	
/*	Functions
******************************************************************************/



/**
 *	Store/get <objects || vars> in/from localStorage
 */
function storeObject(key,obj) {
    window.localStorage.setItem(key,JSON.stringify(obj));
}
function getObject(key) {
    var obj = window.localStorage.getItem(key);
    return obj && JSON.parse(obj);
}
function storeVar(key) {
    window.localStorage.setItem(key);
}
function getVar(key) {
    var data = window.localStorage.getItem(key);
    return data;
}


/**
 *	playSound(sound)
 *	Must be in background script to work
 */
function playSound(sound){	
	if (userOptions['playSound'] == true){
		console.log(userOptions);
		var audio = new Audio(sound + ".wav");
		audio.play();
	}
}


/**
 *	verifyToken(token)
 *	Verify that a token is correct
 */
function verifyToken(token){
	if (token.substr(0,7) == "socsco_"){
		return 1;
	} else {
		return 0;
	}
}
/**
 *	resetScoreData()
 *	Reset or initialize scoreData
 */
function resetScoreData(){
	scoreData = {
		'name':'scoreData',
		'username':'',
		'rank':0,
		'toNextRank':0,
		'totalScore':0,
		'totalLikes':0,
		'totalComments':0,
		'totalStatus':0,
	}
}
