<?php

require('../vendor/autoload.php');
use Symfony\Component\HttpFoundation\Request;
//session start goes here?
session_start();
//app and var decs

$app = new Silex\Application();
$app['debug'] = true;
//$app['debug'] = false;

// Register the monolog logging service
$app->register(new Silex\Provider\MonologServiceProvider(), array(
  'monolog.logfile' => 'php://stderr',
));

//connect to pgsl db
$dbopts = parse_url(getenv('DATABASE_URL'));
$app->register(new Csanquer\Silex\PdoServiceProvider\Provider\PDOServiceProvider('pdo'),
         array(
          'pdo.server' => array(
             'driver'   => 'pgsql',
             'user' => $dbopts["user"],
             'password' => $dbopts["pass"],
             'host' => $dbopts["host"],
             'port' => $dbopts["port"],
             'dbname' => ltrim($dbopts["path"],'/')
             )
         )
);

//upload image
$app->post(
  '/upload-image/',
  function ( Request $request ) use($app)
  {
    $responseData = array();

    $contentType = isset($_SERVER['CONTENT_TYPE'])
      ? trim($_SERVER['CONTENT_TYPE'])
      : ""
    ;

    if (
      strcasecmp($contentType, "application/json") != 0
    ) {
      throw new Exception("Content type must be application/json");
    }


    $requestBody = json_decode(
      $request->getContent(),
      true
    );


      $st = $app['pdo']->prepare( "INSERT INTO uploadinfo ( url, username, title, description, tag1, tag2, tag3 )
                                  VALUES ( :url , :user, :title, :description, :tag1, :tag2, :tag3 )" );
      $st->bindParam(':url', $url);
      $st->bindParam(':user', $_SESSION['username']);
      $st->bindParam(':title', $title);
      $st->bindParam(':description',$description);
      $st->bindParam(':tag1',$tag1);
      $st->bindParam(':tag2',$tag2);
      $st->bindParam(':tag3',$tag3);

      $url = $requestBody['info']['secure_url'];
      //this needs to be set to current logged in user's username
      $title = $requestBody['imageDetails']['imageTitle'];
      $description = $requestBody['imageDetails']['imageDescription'];
      $tag1 = $requestBody['imageDetails']['tag1'];
      $tag2 = $requestBody['imageDetails']['tag2'];
      $tag3 = $requestBody['imageDetails']['tag3'];
      $st->execute();
      //grab uid
      $st = $app['pdo']->prepare('SELECT uid FROM accountinfo WHERE username = :username');
      $st->bindParam(':username', $_SESSION['username']);
      $st->execute();
      $uid = $st->fetch(PDO::FETCH_ASSOC);
      //grab imgid
      $st = $app['pdo']->prepare('SELECT id FROM uploadinfo WHERE url = :url');
      $st->bindParam(':url', $url);
      $st->execute();
      $imgid = $st->fetch(PDO::FETCH_ASSOC);
      //user automatically gives is one upvote
      $st = $app['pdo']->prepare('INSERT INTO votes (imgid, vote, userid) VALUES (:imgid, :vote, :userid)');
      $st->bindParam(':imgid',$imgid['id']);
      $st->bindParam(':vote',$vote);
      $st->bindParam(':userid',$uid['uid']);
      $vote = 1;
      $st->execute();
    return 'image uploaded, url: ' . $requestBody['info']['secure_url'];

  }
);

//front page
$app->get('/fp/', function() use($app){
  $st = $app['pdo']->prepare('SELECT uploadinfo.id, uploadinfo.url, uploadinfo.username, uploadinfo.title, sum(votes.vote) as upvotes
    FROM uploadinfo, votes WHERE uploadinfo.id = votes.imgid and votes.vote = 1 group by uploadinfo.id order by upvotes desc');
  $st->execute();

  $images = array();
  while ($row = $st->fetch(PDO::FETCH_ASSOC)) {
    $images[] = $row;
  }


  return $app->json(array('images' => $images));
});


//user registration
$app->post('/create/', function( Request $request ) use ($app){
  $responseData = array();
  $messages = array();
  $contentType = isset($_SERVER['CONTENT_TYPE'])
    ? trim($_SERVER['CONTENT_TYPE'])
    : "";
  if (
    strcasecmp($contentType, "application/json") != 0
  ) {
    throw new Exception("Content type must be application/json");
  }

  $requestBody = json_decode(
    $request->getContent(),
    true
  );

  //check to see if username or displayName already exists in datase and return errors
  $st = $app['pdo']->prepare('SELECT * FROM accountinfo WHERE username = :username');
  $st->bindParam(':username', $username);
  $username = $requestBody['username'];
  $st->execute();
  $userExists = $st->fetch(PDO::FETCH_ASSOC);

  if( $userExists == 0 || $userExists == '0' ){
    //----------------------------- MAKE SURE THEIR INFO IS NOT VALID!!!!---------------------------------------------------------------------------
    //insert user into db, START SESSION and ROUTE TO ACCOUNT DETAILS
    $st = $app['pdo']->prepare('INSERT INTO accountinfo (username, password, bio, displayname) VALUES (:username, :password, :bio, :displayname)');
    $st->bindParam(':username',$requestBody['username']);
    $st->bindParam(':password',$requestBody['password']);
    $st->bindParam(':bio',$requestBody['bio']);
    $st->bindParam(':displayname',$requestBody['displayName']);
    $st->execute();

    $st = $app['pdo']->prepare('SELECT * FROM accountinfo WHERE username = :username AND password = :password');
    $st->bindParam(':username', $requestBody['username']);
    $st->execute();
    $result = $st->fetch(PDO::FETCH_ASSOC);

    $_SESSION['username'] = $requestBody['username'];

      return json_encode(array(
          "uid"=>$result['uid'],
          "username"=>$result['username'],
          "bio"=>$result['bio'],
          "displayname"=>$result['displayname']
      ));
  }
  else{  //otherwise return success or route to account details
    return false;
  }
//return $app->json($userExists);
});

//--------------------user login-----------------------------
$app->post('/login/', function(Request $request) use($app){
  $responseData = array();
  $messages = array();
  $contentType = isset($_SERVER['CONTENT_TYPE'])
    ? trim($_SERVER['CONTENT_TYPE'])
    : "";
  if (
    strcasecmp($contentType, "application/json") != 0
  ) {
    throw new Exception("Content type must be application/json");
  }

  $requestBody = json_decode(
    $request->getContent(),
    true
  );

  $st = $app['pdo']->prepare('SELECT * FROM accountinfo WHERE username = :username AND password = :password');
  $st->bindParam(':username', $requestBody['username']);
  $st->bindParam(':password', $requestBody['password']);
  $st->execute();
  $result = $st->fetch(PDO::FETCH_ASSOC);

  if($result == 0 || $result == '0'){
    return false;
  }else{
    $_SESSION['username'] = $result['username'];
    return json_encode(array(
        "uid"=>$result['uid'],
        "username"=>$result['username'],
        "bio"=>$result['bio'],
        "displayname"=>$result['displayname']
    ));
  }
});

//---------------account details server call---------------
$app->get('/account-details/{user}', function($user) use($app) {
  $st = $app['pdo']->prepare('SELECT * FROM accountinfo WHERE username = :user');
  //$st->bindParam(':user', $user);
  $st->bindParam(':user', $_SESSION['username']);
  $st->execute();
  $userinfo = $st->fetch(PDO::FETCH_ASSOC);
  //now grab pics
  $st = $app['pdo']->prepare('SELECT * FROM uploadinfo WHERE username = :user');
  //$st->bindParam(':user', $user);
  $st->bindParam(':user', $_SESSION['username']);
  $st->execute();
  $images = array();
  while ($row = $st->fetch(PDO::FETCH_ASSOC)) {
    //$app['monolog']->addDebug('Row ' . $row['id']);
    $images[] = $row;
  }


  if($userinfo == 0 || $userinfo == '0'){
    return "Could Not Find User " . $user . " In Database";
  }else{
    return json_encode(array(
        "uid"=>$userinfo['uid'],
        "username"=>$userinfo['username'],
        "bio"=>$userinfo['bio'],
        "displayname"=>$userinfo['displayname'],
        "images"=>$images
    ));
  }
});


/* ----------------------Personal account editing? ----------------------------*/
$app->post('/account-update/', function( Request $request ) use($app){
  $contentType = isset($_SERVER['CONTENT_TYPE'])
    ? trim($_SERVER['CONTENT_TYPE'])
    : "";
  if (
    strcasecmp($contentType, "application/json") != 0
  ) {
    throw new Exception("Content type must be application/json");
  }
  $requestBody = json_decode(
    $request->getContent(),
    true
  );

  //check to see which thing they are trying to update and run sql accordingly
  if( $requestBody['field'] == 'password' ){
    $st = $app['pdo']->prepare('UPDATE accountinfo SET password = :password WHERE username = :username');
    $st->bindParam(':password', $requestBody['newvalue']);
    $st->bindParam(':username', $_SESSION['username']);

    return 'changed password for user ' . $_SESSION['username'];
  }
  else if( $requestBody['field'] == 'displayname' ){
    $st = $app['pdo']->prepare('UPDATE accountinfo SET displayname = :displayname WHERE username = :username');
    $st->bindParam(':displayname', $requestBody['newvalue']);
    $st->bindParam(':username', $_SESSION['username']);
    $st->execute();

    return 'changed display name to ' . $requestBody['newvalue'];
  }
  else if( $requestBody['field'] == 'delete' ){
    $st = $app['pdo']->prepare('DELETE FROM accountinfo WHERE username = :username');
    $st->bindParam(':username', $_SESSION['username']);
    $st->execute();
    $_SESSION = array();
    session_destroy();
    return 'account deleted';
  }
  else {return 'Update Field Not Valid';}

});

//------------------upvote/downvote--------------//
$app->post('/vote/', function( Request $request) use ($app){
  //check if theyre logged in, if not logged in return error or REDIRECt
  if( is_null($_SESSION['username']) ){
    return $app->redirect('/account-pages/account/login.html');
  }
  //get json
  $contentType = isset($_SERVER['CONTENT_TYPE'])
    ? trim($_SERVER['CONTENT_TYPE'])
    : "";
  if (
    strcasecmp($contentType, "application/json") != 0
  ) {
    throw new Exception("Content type must be application/json");
  }
  $requestBody = json_decode(
    $request->getContent(),
    true
  );

  //check to see if they have upvoted, if they have return false?
  //grab uid
  $st = $app['pdo']->prepare('SELECT uid FROM accountinfo where username = :username');
  $st->bindParam(':username',$_SESSION['username']);
  $st->execute();
  $uid = $st->fetch(PDO::FETCH_ASSOC);
  //check to see if they have voted, if null then put in vote
  $st = $app['pdo']->prepare('SELECT imgid, vote FROM votes WHERE userid = :uid');
  $st->bindParam(':uid', $uid['uid']);
  $img = $st->fetch(PDO::FETCH_ASSOC);
  if( $img['imgid'] != $_SESSION['temp'] || $img['vote'] != $requestBody['vote'] ){
    //put in their upvote
    $st = $app['pdo']->prepare('INSERT INTO votes (imgid, vote, userid) VALUES (:imgid, :vote, :userid)');
    $st->bindParam(':imgid',$_SESSION['temp']);
    $st->bindParam(':vote',$requestBody['vote']);
    $st->bindParam('userid',$uid['uid']);
    $st->execute();
    //return total upvotes and downvotes
    //
    return 'vote successful';
  }
  else if( $img['imgid'] == $_SESSION['temp'] ){
    //theyve already upvoted
    return 'you have already voted on this image';
  }
  else{
    return 'there was an error';
  }

});

$app->get('/image-view/{id}', function($id) use ($app){
  $_SESSION['temp'] = $id;
  return $app->redirect('/image-pages/image/view.html');
});

//get image INFO
$app->get('/image-pages/', function() use($app){
  $st = $app['pdo']->prepare('SELECT * FROM uploadinfo WHERE id = :id');
  $st->bindParam(':id', $_SESSION['temp']);
  $st->execute();
  $img = $st->fetch(PDO::FETCH_ASSOC);

  //upvotes
  $st = $app['pdo']->prepare('SELECT sum(vote) AS upvotes FROM votes WHERE imgid = :id AND vote = 1');
  $st->bindParam(':id', $_SESSION['temp']);
  $st->execute();
  $up = $st->fetch(PDO::FETCH_ASSOC);
  //downvotes
  $st = $app['pdo']->prepare('SELECT sum(vote) AS downvotes FROM votes WHERE imgid = :id AND vote = -1');
  $st->bindParam(':id', $_SESSION['temp']);
  $st->execute();
  $down = $st->fetch(PDO::FETCH_ASSOC);



  return $app->json(array(
    "imageId"=>$img['id'],
    "url"=>$img['url'],
    "uploaderUsername"=>$img['username'],
    "imageDescription"=>$img['description'],
    "upvotes"=>$up['upvotes'],
    "downvotes"=>$down['downvotes']
  ));
});

//------------------------------------------------------------get image upvotes and downvotes---------------------------------------------------------------------------------------
$app->post('/getvotes/', function( Request $request ) use ($app){
  $contentType = isset($_SERVER['CONTENT_TYPE'])
    ? trim($_SERVER['CONTENT_TYPE'])
    : "";
  if (
    strcasecmp($contentType, "application/json") != 0
  ) {
    throw new Exception("Content type must be application/json");
  }
  $requestBody = json_decode(
    $request->getContent(),
    true
  );
  //upvotes
  $st = $app['pdo']->prepare('SELECT sum(vote) AS upvotes FROM votes WHERE imgid = :id AND vote = 1');
  $st->bindParam(':id', $requestBody['id']);
  $st->execute();
  $up = $st->fetch(PDO::FETCH_ASSOC);
  //downvotes
  $st = $app['pdo']->prepare('SELECT sum(vote) AS downvotes FROM votes WHERE imgid = :id AND vote = -1');
  $st->bindParam(':id', $requestBody['id']);
  $st->execute();
  $down = $st->fetch(PDO::FETCH_ASSOC);

  return $app->json(array(
    "upvotes"=>$up['upvotes'],
    "downvotes"=>$down['downvotes']
  ));
});

$app->get('/logout/', function() use ($app){
  $_SESSION = array();
  session_destroy();
  return $app->redirect('/frontpage.html');
});

//---------------------------------------------------------------------------REDIRECTS---------------------------------------------------------------
//account details, find their posts

//direct to login or account details
$app->get('/account/', function() use ($app){
  //if no session go to login.php
  if( is_null($_SESSION['username']) ){
    return $app->redirect('../account-pages/account/login.html');
  }
  return $app->redirect('../account-pages/account/details.html');
  //otherwise go to accountDetails

});

//upload redirect

$app->get('/upload/', function () use ($app){
  if( is_null($_SESSION['username']) ){
    return $app->redirect('/account-pages/account/login.html');
  }
  return $app->redirect('/upload.html');
});


//fp redirect
$app->get(
  '/',
  function() use($app) {
    $app['monolog']->addDebug( 'request to /' );

    return $app->redirect(
      './frontpage.html'
    );
  }
);



$app->run();
