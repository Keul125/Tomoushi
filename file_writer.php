<?php 
die();
//vérifications de base
ini_set ('magic_quotes_gpc', 0);
if (get_magic_quotes_gpc()) {
    function strip_array($var) {
        return is_array($var)? array_map("strip_array", $var):stripslashes($var);
    }
    $_GET = strip_array($_GET);
    $_POST = strip_array($_POST);
    $_COOKIE = strip_array($_COOKIE);
    $_SESSION = strip_array($_SESSION);
}





$data = $_POST['attribut1'];

//$data
file_put_contents('./otaku_adventure/questions.js',$data);



?>