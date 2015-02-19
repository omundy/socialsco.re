<?php

/**
 *	api/process.php
 *	The main page of the API
 *	1. Receives all connections from extension
 *	2. Issues tokens for newly installed extensions
 *	3. Accepts data coming from APIs
 *	4. Returns JSON
 */

header('Content-Type: application/json');

// testing: everything the server can tell us
//print_r($_SERVER);

// rules in seconds
$rules = array('createUser'=>120,
			   'addScore'=>1
			   );
// 100 times in 60 seconds => blacklist level 1


// 1. we receive a connection
if (!isset($_GET['action'])){
	exit('no directive given');
} else {
	// allow direct access to included scripts
	define('DIRECT_ACCESS',TRUE); 

			
	// create new Auth object
	include_once('inc/class_auth.php'); 
	$auth = new Auth;

	$action = $_GET['action'];
	
	// 2. is there a token?
	if (!isset($_GET['token'])){
		
		// 2a. if not then does the action say to create a user?
		if ($action == 'createUser'){
			// assign one / create user
			print $auth->createUser();
		} else {
			exit('message: no token');
		}
		
	} else {
		
		// 2b. if there is a token, does it have correct prefix?
		$token = $_GET['token'];
		if (!$auth->verifyToken($token)){
			exit('invalid token');
		}
		
		// create and verify user
		// this should be combined later into user->__construct()
		include_once('inc/class_user.php'); 
		$user = new User;
		if (!$user->verifyUser($token)){
			exit('invalid user');
		}
		
		// sendData()
		if ($action == 'sendData'){
			
			if (isset($_GET['type']) && $type = $_GET['type']){
				if ($data = $user->sendData($token,$type)){
					print $data;
				}
			} else {
				exit("type not defined");
			}
		} 
		// returnUser()
		else if ($action == 'returnUser'){
			print $user->returnUser($token);
		}
		// just for testing
		else if ($action == 'testing'){
			print $user->updateUserTotals($token,'totalScore');
		}
		
	
		
	}
}






?>