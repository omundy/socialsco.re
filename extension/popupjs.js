var counter;

$(document).ready(function(){
		$("#reset").click(function(){
			chrome.extension.sendMessage({action:'resetCount'}, function(response) {
				counter = response.counterValue?response.counterValue:0;
				});
			});
		$("#soundToggle").click(function(){
			chrome.extension.sendMessage({action:'toggleSound'});
			});	
		$("#plusOneToggle").click(function(){
			chrome.extension.sendMessage({action:'togglePlusVisual'});
			});
		});
