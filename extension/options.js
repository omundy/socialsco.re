
// object to hold user options
var userOptions = {};

/** 
 *	getUserOptions()
 *	retrieves userOptions from localStorage in background.js
 */
function getUserOptions() {
	
	chrome.extension.sendMessage({'action':'getUserOptions'}, function(response) { 
			console.log(response.userOptions); 
			userOptions = response.userOptions;
		
			// show playSound and plusVisual radio button(s)
			document.getElementById('playSound').checked = userOptions['playSound'];
			document.getElementById("plusVisual").checked = userOptions['plusVisual'];
			document.getElementById("showStatusBar").checked = userOptions['showStatusBar'];
		}	
	);
	
	
	
	/*
	// these may be useful sometime
	var favorite = localStorage["favorite_color"];
	if (!favorite) {
		return;
	}
	var select = document.getElementById("color");
	for (var i = 0; i < select.children.length; i++) {
		var child = select.children[i];
		if (child.value == favorite) {
			child.selected = "true";
			break;
		}
	}
	var username = localStorage["username"];
	document.getElementById("username").value = username;
	*/
}



/** 
 *	saveUserOptions()
 *	saves options to userOptions object and localStorage inside background.js
 */
function saveUserOptions() {
	
	userOptions['playSound'] = document.getElementById('playSound').checked;
	userOptions["plusVisual"] = document.getElementById("plusVisual").checked;
	userOptions["showStatusBar"] = document.getElementById("showStatusBar").checked;
	

	/*
	// color: dropdown example
	var select = document.getElementById("color");
	var color = select.children[select.selectedIndex].value;
	localStorage["favorite_color"] = color;
	
	// username: text area example
	var username = document.getElementById("username").value;
	localStorage["username"] = username;
	*/
	
  	// saveUserOptions in background.js
	chrome.extension.sendMessage({'action':'saveUserOptions','userOptions':userOptions}, function(response) { 
			console.log(response); // display success message 
			showStatus("saveStatus","Options have been saved");
		}	
	);
}

document.addEventListener('DOMContentLoaded', getUserOptions);
document.querySelector('#save').addEventListener('click', saveUserOptions);
//document.getElementById('#reset').click(resetScore);

// show status
function showStatus(id,msg){
  // Update status to let user know options were saved.
  var status = document.getElementById(id);
  status.innerHTML = msg;
  setTimeout(function() {
    status.innerHTML = "";
	
  }, 1250);
}


$("#close").click(function(){
	window.close();
});

$("#reset").click(function(){
	chrome.extension.sendMessage({action: "resetScore"}, function(response) { 
			console.log(response); // display success message 
  			showStatus("resetStatus","Score has been reset");
		}	
	);
});