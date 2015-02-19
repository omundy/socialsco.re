<?php
// get page vars
if (!isset($_GET['page'])){ $page = 'index.php'; } else { $page = $_GET['page']; }
if (isset($_GET['action']) && $action = $_GET['action']);
if (isset($_GET['var1']) && $var1 = $_GET['var1']);
// allow direct access to included scripts
define('DIRECT_ACCESS',TRUE); 


// create user object
include_once('api/inc/class_user.php'); 
$user = new User;
include_once('api/inc/class_auth.php'); 
$auth = new Auth;



if (isset($_COOKIE['token'])) { 
	$token = $_COOKIE['token']; 
	if ($user->verifyUser($token));
}

$content = '';



// what page?
if ($page == 'index.php')
{
	$title = 'hi';
} 
else if ($page == 'createAccount')
{ 
	$title = 'Create an account';
	
	if($user->username){
		// forward them to their page
		header('Location: /users/'. $username);
	} else if ($action != '') { // make sure there is a token
	
		$token = $action;
	
		// verify token
		if (!$auth->verifyToken($token)){
			exit('that token is not authentic');
		}
		$usertype = $user->verifyUser($token);
		if ($usertype == 2){
			$content .= 'A user account is already associated with this token <input>'.$token.'</input> <a href="login">Click here to login to your account</a>';
		} else if ($usertype == 1){
			
			
			$content .= '
			
					
					
					
					<form class="form-horizontal" action="/registerUser" method="post" id="register">
						<input type="hidden" name="token" value="'. $token .'">
						
						<fieldset>
						<legend>Register to earn badges and play competitively</legend>
						<span class="help-block">Creating an account means you can enjoy badges and statistics!</span>
					
						
						<div class="control-group">	
							<label class="control-label for="email">Email</label>
							<div class="controls">
								<input type="text" placeholder="" name="email">
							</div>
						</div>
					
						<div class="control-group">	
							<label class="control-label for="username">Username</label>
							<div class="controls">
								<input type="text" placeholder="No spaces..." name="username">
							</div>												
						</div>
						
						
						<div class="control-group">
							<div class="controls">
								<label class="checkbox">
									<input type="checkbox"> Remember me
								</label>
								<button type="submit" class="btn">Sign in</button>
							</div>
						</div>
						
						</fieldset>
							
					</form>



						
				
					
			
			
					<form class="form-horizontal" action="/welcome" method="post">
						<input type="hidden" name="token" value="'. $token .'">
					
						<fieldset>
							<legend>Or play without registering</legend>
							<span class="help-block">You can play without making an account but you will only be able to see your click score.</span>
							<div class="control-group">
								<div class="controls">
									<button type="submit" class="btn">Continue</button>
								</div>
							</div>
						
						</fieldset>
							
					</form>';
					
		} else {
			exit('that token is not authentic');
		}
	} else {
		exit('no token found');
	}
	
	//print_r($user);
}  
else if ($page == 'registerUser')
{
	if (isset($_POST['email']) && isset($_POST['username']) && isset($_POST['token'])){	
		if($user->registerUser($_POST['token'],$_POST['email'],$_POST['username'])){
			header('Location: /welcome');	
		}
	} else {
		print "blah";
		//header('Location: /createAccount');	
	}
}  
else if ($page == 'login')
{
}  
 
else if ($page == 'leaderBoard')
{
	$title = 'LeaderBoard!';
	$data = $user->leaderBoard();
	print_r($data);
	
	$content .= '<table class="table table-bordered table-hover">';
	$content .= '<tr>';
	$content .= '<th>order</th>';
	$content .= '<th>user</th>';
	$content .= '<th>rank</th>';
	$content .= '<th>links <sup>x 1</sup></th>';
	$content .= '<th>likes <sup>x 2</sup></th>';
	$content .= '<th>comments <sup>x 5</sup></th>';
	$content .= '<th>total points</th>';
	$content .= '<th>total clicks</th>';
	$content .= '<th>clicks per hour</th>';
	$content .= '<th>clicks per day</th>';
	$content .= '</tr>';
	$i = 0;
	foreach($data as $row => $user){
		$content .= '<tr>';
		$content .= '<td>'.++$i.'</td>';
		if ($user['username'] != ''){
			$content .= '<td>'.$user['username'].'</td>';
		} else {
			$content .= '<td style="color:#ccc">anonymous</td>';
		}
		$content .= '<td>'.$user['rank'].'</td>';
		$content .= '<td>'.$user['totalLinks'].'</td>';
		$content .= '<td>'.$user['totalLikes'].'</td>';
		$content .= '<td>'.$user['totalComments'].'</td>';
		$content .= '<td>'.$user['totalScore'].'</td>';
		$content .= '<td>'.($user['totalLinks']+$user['totalLikes']).'</td>';
		$content .= '<td>...</td>';
		$content .= '<td>...</td>';
		$content .= '</tr>';
	}
	$content .= '</table>';
}

else if ($page == 'welcome')
{
	$title = 'Welcome!';
	$content .= 'Thanks for installing! Welcome screen with link to Facebook, reddit, etc... Also link to options page.';
}

$html = array();
$html[] = '<!DOCTYPE html>';
$html[] = '<html lang="en-us">';
$html[] = '<head>';
$html[] = '<meta charset="utf-8">';
$html[] = '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
$html[] = "<title>Socialsco.re - $title</title>";
//$html[] = '<link rel="stylesheet" type="text/css" href="/assets/css/styles.css">';
$html[] = '<link href="/assets/css/bootstrap.min.css" rel="stylesheet" media="screen">';
$html[] = '<link href="/assets/css/bootstrap-responsive.min.css" rel="stylesheet" media="screen">';
$html[] = '</head>';
$html[] = '<body>';
$html[] = '<div class="container">';
$html[] = '<div class="row">';
$html[] = "<h1>Socialsco.re</h1>";
$html[] = "<h2>$title</h2>";
$html[] = $content;
$html[] = '</div>';
$html[] = '</div>'; // /container
$html[] = '<script src="http://code.jquery.com/jquery.js"></script>';
$html[] = '<script src="/assets/js/bootstrap.min.js"></script>';

    
$html[] = '</body>';
$html[] = '</html>';

print implode("\n",$html);

?>