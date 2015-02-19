<?php if (!defined('DIRECT_ACCESS')) exit('No direct script access allowed');

//include_once('inc/config.php'); // db connect details
include_once('Mysqlidb.php');

/**
 *	User
 */
class User
{	
	public $token, $username, $email, $totalScore;
	public $date, $ip, $userAgent;
	
	public $typeColumns = array('like'=>'totalLikes','link'=>'totalLinks','comment'=>'totalComments','totalScore'=>'totalScore');
	
	public $db; 
	
	
	public function __construct(){
		$this->date = date("Y-m-d H:i:s");
		$this->ip = $_SERVER['REMOTE_ADDR'];
		$this->userAgent = $_SERVER['HTTP_USER_AGENT'];
		include('config.php');
		$this->db = new Mysqlidb($db_connect['host'],$db_connect['user'],$db_connect['pass'],$db_connect['name']);
	}
	
	/*
	 *	Return all a user's details (for building the game)
	 */
	public function returnUser($token){
		$params = array($token);
		$sql = "SELECT username,totalLinks,totalLikes,totalComments,totalScore,rank FROM userData WHERE token = ?";
		$results = $this->db->rawQuery($sql,$params);	
		$data = $results[0];
		$data['name']='scoreData';
		//print_r($results);
		return json_encode($data);
	}
	
	
	/**
	 *	sendData()
	 *	Receive all data sent from JS
	 */
	public function sendData($token,$type){

		// what type?
		switch ($type) {
			case 'link':
				$value=1;
				break;
			case 'like':
				$value=2;
				break;
			case 'unlike':
				$value=-2;
				break;
			case 'comment':
				$value=5;
				break;
		}
		// data to insert
		$insertData = array(
			'id' => NULL,
			'token' => $token,
			'type' => $type,
			'created' => $this->date,
			'value' => $value,
		);
		
		if($this->db->insert('clickData', $insertData)) {
			$message = array('clickData'=>1);
			// re-calculate total of this 'type'
			if ($this->updateUserTotals($token,$type)){
				$message['updateUserTotals'] = 1;
			}
			// recalculate all totals for th euser
			if ($this->updateUserTotalsAll($token)){
				$message['updateUserTotalsAll'] = 1;
			}
			// return data
			$data = array('message'=>$message);
		} else {
			$data = array('message'=>'error in sendData()');
		}
		return json_encode($data);
	}
	
	
	/**
	 * 	updateUserTotals()
	 *	testing: http://socialsco.re/api/process.php?token=socsco_mjGgh1Ytwdq66b1YtCwpMGMxFj&action=sendData&type=link
	 */
	public function updateUserTotals($token,$type){
		
		// count occurances inside clickData
		$params = array($token,$type);
		$sql = "SELECT * FROM clickData WHERE token = ? AND type = ?";
		if ($results = $this->db->rawQuery($sql,$params)){		
			$count = count($results);
			
			// update database
			$updateData = array(
				$this->typeColumns[$type] => $count
			);
			$this->db->where('token', $token);
			if ($results = $this->db->update('userData', $updateData)){
				//print_r($results);
				return 1;
			} else {
				return 0;
			}
		} else {
			return 0;
		}
	}
	// add up and store all totals
	public function updateUserTotalsAll($token){
		$params = array($token);
		$sql = "SELECT totalLinks + totalLikes + totalComments AS totalScore FROM userData WHERE token = ?";
		if ($results = $this->db->rawQuery($sql,$params)){	
			//print_r($results[0]);
			// update database
			$updateData = array(
				'totalScore' => $results[0]['totalScore']
			);
			$this->db->where('token', $token);
			if ($results = $this->db->update('userData', $updateData)){
				//print_r($results);
				return 1;
			} else {
				return 0;
			}
		}
	}
	
	
	public function countTotals($type,$token=NULL){
		$params = array($type);
		$sql = "SELECT clickData.token, COUNT(clickData.type) 
				FROM clickData 
				WHERE clickData.type = ?
				GROUP BY clickData.token";
		return $this->db->rawQuery($sql,$params);
	}
	
	
	public function leaderBoard()
    {
		$data = array();
		/**
		 *	LEFT JOIN userData to an alias (foo) 
		 *	which user SUM() to totalScore for DISTINCT tokens in clickData
		 *	
		 *	READ MORE
		 *	http://www.codinghorror.com/blog/2007/10/a-visual-explanation-of-sql-joins.html
		 */
		//$params = array($type);
		$sql = "SELECT 
					userData.username,
					userData.totalLinks,
					userData.totalLikes,
					userData.totalComments,
					userData.totalScore,
					userData.rank,
					foo.token,SUM(foo.value) AS totalClicks
				FROM ( 
					SELECT clickData.token, clickData.value
					FROM clickData
				) AS foo
				LEFT OUTER JOIN userData
				ON foo.token = userData.token
				GROUP BY foo.token
				ORDER BY SUM(foo.value) DESC";
		if ($result = $this->db->rawQuery($sql)){
			//print_r($result);
			return $result;
		}
		 
		/*
		$sql = "SELECT userData.username,foo.token,SUM(foo.value)
				FROM ( 
					SELECT clickData.token, clickData.value
					FROM clickData
				) AS foo
				LEFT OUTER JOIN userData
				ON foo.token = userData.token
				GROUP BY foo.token
				ORDER BY SUM(foo.value) DESC";
				
		$result = doQueryi($sql);		
		if ($result > 0){		
			while($row = $result->fetch_assoc()){
				//print_r($row);
				$data[$row['token']] = array('token'=>$row['token'],
								'username'=>$row['username'],	
								'value'=>$row['SUM(foo.value)']);						
			}	
		}
		// count likes	
		if ($result = $this->countTotals('like')){		
			while($row = $result->fetch_assoc()){
				$data[$row['token']]['likes'] = $row['COUNT(clickData.type)'];						
			}	
		}
		// count links		
		if ($result = $this->countTotals('link')){		
			while($row = $result->fetch_assoc()){
				$data[$row['token']]['links'] = $row['COUNT(clickData.type)'];						
			}	
		}
		// count comments
		if ($result = $this->countTotals('comment')){		
			while($row = $result->fetch_assoc()){
				$data[$row['token']]['comments'] = $row['COUNT(clickData.type)'];						
			}	
		}
		*/
		
	}
					
	/**
	 *	verifyUser()
	 *	Make sure a user exists in the database
	 */
    public function verifyUser($token)
    {
		if ($token){
			
			// check to see if token exists
			$params = array($token);
			$sql = "SELECT * FROM userData WHERE token = ?";
			if (!$results = $this->db->rawQuery($sql,$params)){
				exit('There was an error [' . $db->error . ']'); 
			}
			$email = $results['email'];
			// reset last active datetime
			$updateData = array(
				'lastActive' => $this->date
			);
			$this->db->where('token', $token);
			if ($results = $this->db->update('userData', $updateData)){
				if ($email != ''){
					return 2;
				} else {
					return 1;
				}
			} else {
				return 0;
			}
			
			/*
			
----			
			$row = $result->fetch_assoc();
			//print $row['email'];
			$sql = "UPDATE userData
					SET 
										
					WHERE token = '$token'";
			if (!$result = doQueryi($sql));		
			if ($row['email'] != ''){
				return 2;
			} else {
				return 1;
			}
			*/
			
		} else {
			return 0;
		}
    }
	
	/**
	 *	registerUser() 
	 */
	public function registerUser($token,$email,$username){

		// generate a password
		$password = hash("sha256", uniqid());
		
		$updateData = array(
			'username' => $username,
			'email' => $email,
			'password' => $password
		);
		$this->db->where('token', $token);
		if ($results = $this->db->update('userData', $updateData)){
			return 1;
		} else {
			return 0;
		}
	}
	
	
	
	
	
	
	
}

?>