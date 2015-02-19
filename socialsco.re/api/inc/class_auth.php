<?php if (!defined('DIRECT_ACCESS')) exit('No direct script access allowed');

//include_once('inc/config.php'); // db connect details
include_once('Mysqlidb.php');

/**
 *	Auth
 *	For creating new users, authenticating tokens and users
 */
class Auth
{
	public $date, $ip, $userAgent, $db; 
	
	public function __construct(){
		$this->date = date("Y-m-d H:i:s");
		$this->ip = $_SERVER['REMOTE_ADDR'];
		$this->userAgent = $_SERVER['HTTP_USER_AGENT'];
		include('config.php');
		$this->db = new Mysqlidb($db_connect['host'],$db_connect['user'],$db_connect['pass'],$db_connect['name']);
	}
	
	/**
	 *	verifyToken()
	 *	Just make sure a token's format is valid
	 */
	public function verifyToken($incomingtoken){
		if (substr($incomingtoken, 0, 7) === "socsco_"){
			return 1;
		} else {
			return 0; 
		}
	}
	
	
	/**
	 *	createUser()
	 *	testing: /api/process.php?action=createUser
	 *	
	 *	1. Generate a new token
	 *	2. Insert new user in userData
	 *	3. Return JSON w/token
	 */
	public function createUser(){
		
		// make sure the ip address and useragent aren't already 
		// in the db (would be evident if someone was hacking)
		$params = array($this->ip,$this->userAgent);
		$sql = "SELECT * FROM userData WHERE createdIpAddress = ? AND createdUserAgent = ?";
		if ($this->db->rawQuery($sql,$params)){	
		
			// if that match up exists make sure it's been more than 2 minutes
			$data = array('message'=>'that ip exists!');
			
		} else {
			
			// make new token
			$token = 'socsco_' . self::randString(26);
			
			// put in db
			$insertData = array(
				'token' => $token,
				'username' => NULL,
				'email' => NULL,
				'password' => NULL,
				'created' => $this->date,
				'lastActive' => $this->date,
				'createdIpAddress' => $this->ip,
				'createdUserAgent' => $this->userAgent
			);
			
			if($results = $this->db->insert('userData', $insertData)) {
				// print_r($results); // contains insert row #
				$data = array('token'=>$token);
			} else {
				$data = array('error'=>'in create_user()');
			}
		}
		return json_encode($data);
	}
	
	/**
	 *	Generate a random string (for creating new token)
	 */
	private function randString($length, $charset='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')
	{
		$str = '';
		$count = strlen($charset);
		while ($length--) {
			$str .= $charset[mt_rand(0, $count-1)];
		}
		return $str;
	}
	
}


?>