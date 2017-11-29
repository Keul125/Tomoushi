<?php
define('CFG_DB_TYPE', 'mysql');
define('CFG_DB_HOST', 'localhost');
define('CFG_DB_PORT', '3306');
define('CFG_DB_USER', 'tomoushi');
define('CFG_DB_PASS', 'xxxxxxxxxxxxxxxxxxxxxxx');
define('CFG_DB_DBNAME', 'tomoushi');
define('CFG_TIMEZONE', 'Europe/Paris');


define('CVS_SEPARATOR_LINE',"\n");
define('CVS_SEPARATOR_CELL',",");
define('CVS_SEPARATOR_STRING','"');
define('CVS_SEPARATOR_ESCAPEDCHAR','""');





function Getunits($bytes) {
  if ($bytes<=0) return '0';
  $s=array('o', 'Ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo');
  $e=floor(log($bytes,1024));
  return round($bytes/pow(1024,$e),2).''.$s[$e];
}

//gestion du téléchargement de l'archive en zip
if(isset($_GET['download'])) 
{
	//initialisation
	set_time_limit(1200);
	if (ob_get_level() == 0) ob_start();
	ini_set('output_buffering','off');
	ini_set('zlib.output_compression', 0);
	ob_implicit_flush(); 
	echo str_pad('',4096)."\n"; 

	// compression du répertoire Tomoushi
	$folders_data='/home/dropbox/Dropbox/Activites/Tomoushi/';
	$cmd.='cd '.$folders_data.';'.PHP_EOL;
	$cmd.='zip -0 -r tomoushi.zip *;'.PHP_EOL;

	// compression dudes musiques
	$folders_music='/home/www/xxxxxxxxxxxxxxxxx/files/Activites_Archives/OtakuAdventureFiles/';
	$cmd.='mv '.$folders_data.'tomoushi.zip '.$folders_music.';'.PHP_EOL;
	$cmd.='cd '.$folders_music.';'.PHP_EOL;
	$cmd.='zip -0 -r tomoushi.zip *;'.PHP_EOL;

	//déplacement dans le dossier de stocage
	$folders_store='/home/www/xxxxxxxxxxxxxx/files/Activites_Archives/';
	$cmd.='mv '.$folders_music.'tomoushi.zip '.$folders_store.';'.PHP_EOL;

	//affichage de la page
	?><!DOCTYPE html>
	<html lang="fr">
		<head>
			<meta charset="UTF-8">
		</head>
		<body>
		<h1>Téléchargement</h1>
	Génération de l'archive en cours...<br>
	L'operation peux prendre une minute...<br>
	<?php 
	ob_flush();flush();
	
	//lancement de la compression
	shell_exec($cmd);

	//téléchargement
	echo 'Archive générée<br>Téléchargement lancé<br>Taille du fichier : ';
	echo Getunits(filesize('/home/www/xxxxxxxxxxxxxxxx/files/Activites_Archives/tomoushi.zip')); 
	ob_flush();flush();
	
	?><script>
	window.location='http://xxxxxxxxxx/Activites_Archives/tomoushi.zip';
	</script><?php 
	ob_flush();flush();
	die();
}



//gestion du téléchargement de l'archive en zip
if(isset($_GET['download_light'])) 
{

	//initialisation
	set_time_limit(1200);
	if (ob_get_level() == 0) ob_start();
	ini_set('output_buffering','off');
	ini_set('zlib.output_compression', 0);
	ob_implicit_flush(); 
	echo str_pad('',4096)."\n"; 

	// compression du répertoire Tomoushi
	$folders_data='/home/www/xxxxxxxxxxxxxxxxx/';
	$cmd.='cd '.$folders_data.';'.PHP_EOL;
	$cmd.='rm tomoushi_light.zip;'.PHP_EOL;
	$cmd.='zip --exclude tomoushi_light.zip --exclude logs/\* -0 -r tomoushi_light.zip *;'.PHP_EOL;


	//affichage de la page
	?><!DOCTYPE html>
	<html lang="fr">
		<head>
			<meta charset="UTF-8">
		</head>
		<body>
		<h1>Téléchargement</h1>
	Génération de l'archive en cours...<br>
	L'operation peux prendre une minute...<br>
	<?php 
	ob_flush();flush();
	
	//lancement de la compression
	shell_exec($cmd);

	//téléchargement
	echo 'Archive générée<br>Téléchargement lancé<br>Taille du fichier : ';
	echo Getunits(filesize('/home/www/xxxxxxxxxxxxx/tomoushi_light.zip')); 
	ob_flush();flush();
	
	?><script>
	window.location='http://xxxxxxxxxxxx/tomoushi_light.zip';
	</script><?php 
	ob_flush();flush();
	die();
}
?>