<?php

define('OTAQUEST_GSHEET_WEBURL',"https://docs.google.com/spreadsheets/d/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/pubhtml");
define('OTAQUEST_GSHEET_URL',"https://docs.google.com/spreadsheets/d/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/edit#gid=0");


//récuperation des infos de config à la BDD
include('../config.php');
//correctiond des magic quotes
ini_set ('magic_quotes_gpc', 0);
if (get_magic_quotes_gpc()) {
    function strip_array($var) {
        return is_array($var)? array_map("strip_array", $var):stripslashes($var); }
    $_GET = strip_array($_GET);
	$_POST = strip_array($_POST);
    $_COOKIE = strip_array($_COOKIE);
	$_SESSION = strip_array($_SESSION);
}
if(isset($_POST['user'])) {
	setcookie('user', $_POST['user'], time()+365*24*3600);
	$_COOKIE['user']=$_POST['user'];
}


$user=isset($_COOKIE['user'])?$_COOKIE['user']:'Pseudo?';


//connexion à la BDD
mysql_connect(CFG_DB_HOST.':'.CFG_DB_PORT,CFG_DB_USER,CFG_DB_PASS) or die ('['.__FILE__.' ('.__LINE__.') - '.mysql_error().']');
mysql_select_db(CFG_DB_DBNAME) or die ('['.__FILE__.' ('.__LINE__.') - '.mysql_error().']');
mysql_query("SET CHARACTER SET utf8") or die ('['.__FILE__.' ('.__LINE__.') - '.mysql_error().']');


//page d'accueil
/*****************************/
if($user=='Pseudo?' || $user=='') {

$contenu='<p><form action="?setpseudo" method="post"><input type="text" name="user" value="'.htmlspecialchars($user).'" required /> <input class="bouton2" type="submit" value="OK"></form></p>';

} else  {

$contenu='<form action="?setpseudo" method="post"><input type="text" name="user" value="'.htmlspecialchars($user).'" required /> <input class="bouton2" type="submit" value="Changer"></form><br><br>';

	$contenu.='
	<span class="bouton2"><a href="?gsheet">Importer depuis le gsheet</a></span> (<a href="'.OTAQUEST_GSHEET_URL.'" style="color:blue;">ghseet ici</a>) (<a href="'.OTAQUEST_GSHEET_WEBURL.'" style="color:blue;">version web importée</a>)<br>
	ATTENTION: lors la modification du gdoc prends 5 à 6min à être récpercutée sur la version web importée, attendez 5-10min s\'il y a eu une modif récente
	<br><br>
	
	
	<span class="bouton2"><a href="?dispquestions">Afficher les questions</a></span><br><br>

	<span class="bouton2"><a href="?disphistorique" disabled>Afficher l\'historique</a></span>(voir l\'histo du gdoc)<br><br>

	<span class="bouton2"><a href="?editquestions"></a>Modifier les questions</span><br><br>

	<form action="?downloadcsv" method="post"><input type="submit" class="bouton2" value="télécharger les questions">(aide)</form><br><br>

	<form action="?importfile" method="post" enctype="multipart/form-data">
	<input type="hidden" name="MAX_FILE_SIZE" value="1048576000">
	<input class="bouton2" name="file_element" type="file"/>
	<input class="bouton2" type="submit" value="Importer les questions" disabled></form>

	<hr>';
}



function google_spreadsheet_to_array_v3($url=NULL) {
	// make sure we have a URL
		if (is_null($url)) {
			return array();
		}
	// initialize curl
		$curl = curl_init();
	// set curl options
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_HEADER, 0);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
	// get the spreadsheet data using curl
		$google_sheet = curl_exec($curl);
	// close the curl connection
		curl_close($curl);
	// parse out just the html table
		preg_match('/(<table[^>]+>)(.+)(<\/table>)/', $google_sheet, $matches);
		$data = $matches['0'];
	// Convert the HTML into array (by converting into HTML, then JSON, then PHP array
		$cells_xml = new SimpleXMLElement($data);
		$cells_json = json_encode($cells_xml);
		$cells = json_decode($cells_json, TRUE);
	// Create the array
		$array = array();
		foreach ($cells['tbody']['tr'] as $row_number=>$row_data) {
			foreach ($row_data['td'] as $column_index=>$column) {
				
				if(is_array($column) && isset($column['div'])) {
					$column=$column['div'];
				}
				if(is_array($column)) {
					$column='';
				}
				
				
				$array[($row_number+1)][($column_index+1)] = $column;
			}
		}
	return array($google_sheet, $array);
}




// import depuis ghseet
/*****************************/
if(isset($_GET['gsheet'])) {
	$data=google_spreadsheet_to_array_v3(OTAQUEST_GSHEET_WEBURL);
	//echo '<pre>['.print_r($data[0],true).']</pre>';
	// echo '<pre>['.print_r($data[1],true).']</pre>';
	
	$new_questions=array();
	
	foreach($data[1] as $line => $cont) {
		
		
		if($cont[1]!='categorie' && $cont[1]) {
			
			$hash=sha1($cont[4].$cont[5]);
			
			$new_questions[$hash]=array(
				'categorie'=>$cont[1],
				'type'=>$cont[2],
				'difficultee'=>$cont[3],
				'serie'=>$cont[4],
				'question'=>$cont[5],
				'reponse'=>$cont[6],
			
			);
		}
	}
	
	
	$old_questions = db_load_questions();
	$diff= questions_diff($old_questions,$new_questions);
	
	if(count($diff)>0) {
		
		questions_import_hist($diff);
		questions_import_table($new_questions);
		questions_import_js($new_questions);
		
		echo '<pre>'.print_r($diff,true).'</pre>';
		// echo '<pre>'.print_r($new_questions,true).'</pre>';
		
		
		$contenu='<h3>Importaton effectuée</h3>'.$contenu;
	} else {
		$contenu='<h3>Pas de modifications</h3>'.$contenu;
	}
		
	$contenu.=dispdiff($diff);
}

//affichage des questions
/*****************************/
if(isset($_GET['dispquestions'])) {
	$contenu.='<br><br><table border="1">';
	
	$query ='SELECT * FROM otaku_adventure_questions WHERE categorie!="CATEGORY" AND  categorie!="VERSION" ORDER BY categorie, serie, type ASC';
	$result=mysql_query($query) or die ('['.__FILE__.' ('.__LINE__.') - '.mysql_error().' - '.$query.']');
	while ($results = mysql_fetch_array($result)) {
		$contenu.='<tr>';
		$contenu.='<td>'.$results['categorie'].'</td>';
		$contenu.='<td>'.$results['type'].'</td>';
		$contenu.='<td>'.$results['difficultee'].'</td>';
		$contenu.='<td>'.$results['serie'].'</td>';
		$contenu.='<td>'.$results['question'].'</td>';
		$contenu.='<td>'.$results['reponse'].'</td>';
		$contenu.='</tr>';
	}
	$contenu.='</table>';
}

//affichage de l'historique
/*****************************/
if(isset($_GET['disphistorique'])) {

	$query ='SELECT * FROM otaku_adventure_historique GROUP BY datetime ORDER BY datetime ASC';
	$result=mysql_query($query) or die ('['.__FILE__.' ('.__LINE__.') - '.mysql_error().' - '.$query.']');
	$contenu.='<br><br><table border="1">';
	while ($results = mysql_fetch_array($result)) {
		$contenu.='<tr>';
		$contenu.='<td><a href="?disphistorique&datetime='.urlencode($results['datetime']).'">'.$results['datetime'].'</a></td>';
		$contenu.='<td><a href="?disphistorique&userlist='.urlencode($results['user']).'">'.$results['user'].'</a></td>';
		$contenu.='<td><a href="?downloadcsv&datetime='.urlencode($results['datetime']).'">(download csv)</a></td>';
		$contenu.='</tr>';
	}
	$contenu.='</table>';
	
	if(isset($_GET['datetime'])) {
		$query = sprintf('SELECT * FROM otaku_adventure_historique WHERE datetime="%s"',
				mysql_real_escape_string($_GET['datetime']));
		$result=mysql_query($query) or die ('['.__FILE__.' ('.__LINE__.') - '.mysql_error().' - '.$query.']');
		$contenu.='<br><br><table border="2">';
		while ($results = mysql_fetch_array($result)) {
			$contenu.='<tr>';
			$contenu.='<td>'.$results['datetime'].'</td>';
			$contenu.='<td>'.$results['user'].'</td>';
			$contenu.='<td>'.$results['action'].'</td>';
			$contenu.='<td>'.$results['categorie'].'</td>';
			$contenu.='<td>'.$results['type'].'</td>';
			$contenu.='<td>'.$results['difficultee'].'</td>';
			$contenu.='<td>'.$results['serie'].'</td>';
			$contenu.='<td>'.$results['question'].'</td>';
			$contenu.='<td>'.$results['reponse'].'</td>';
			$contenu.='</tr>';
		}
		$contenu.='</table>';
	}
		
	if(isset($_GET['userlist'])) {
		$query = sprintf('SELECT * FROM otaku_adventure_historique WHERE user="%s"',
				mysql_real_escape_string($_GET['userlist']));
		$result=mysql_query($query) or die ('['.__FILE__.' ('.__LINE__.') - '.mysql_error().' - '.$query.']');
		$contenu.='<br><br><table border="2">';
		while ($results = mysql_fetch_array($result)) {
			$contenu.='<tr>';
			$contenu.='<td>'.$results['datetime'].'</td>';
			$contenu.='<td>'.$results['user'].'</td>';
			$contenu.='<td>'.$results['action'].'</td>';
			$contenu.='<td>'.$results['categorie'].'</td>';
			$contenu.='<td>'.$results['type'].'</td>';
			$contenu.='<td>'.$results['difficultee'].'</td>';
			$contenu.='<td>'.$results['serie'].'</td>';
			$contenu.='<td>'.$results['question'].'</td>';
			$contenu.='<td>'.$results['reponse'].'</td>';
			$contenu.='</tr>';
		}
		$contenu.='</table>';
	}
	
}


//modification des questions
/*****************************/
if(isset($_GET['editquestions'])) {
	$contenu.='(enregistrez avant de changer de catégorie)<table border="1">';
	$currentcat='';
	
	$query ='SELECT question FROM otaku_adventure_questions WHERE categorie="CATEGORY"';
	$result=mysql_query($query) or die ('['.__FILE__.' ('.__LINE__.') - '.mysql_error().' - '.$query.']');
	$contenu.='<br><table border="1"><tr>';
	while ($results = mysql_fetch_array($result)) {
		$catname=$results['question'];
		$catname=substr($catname,strpos($catname,'cat:\'')+5);
		$catname=substr($catname,0,strpos($catname,'\','));
		if(isset($_GET['cat']) && $_GET['cat']==$catname) {
			$currentcat=$catname;
		}
		
		$contenu.='<td><a href="?editquestions&cat='.urlencode($catname).'&record=ok">'.$catname.'</a></td>';
	}
	$contenu.='</tr></table>';
	
	
	if(isset($_GET['cat'])) {
		//liste des différentes difficultées disponibles
		$difficultees=array();
		$query = 'SELECT DISTINCT difficultee FROM otaku_adventure_questions WHERE difficultee!=""';
		$result=mysql_query($query) or die ('['.__FILE__.' ('.__LINE__.') - '.mysql_error().' - '.$query.']');
		while ($results = mysql_fetch_array($result)) {
			$difficultees[]=$results['difficultee'];
		}
		
		//liste des types possibles
		$type=array('Quizz','Mime','Musique');
		
		
		$contenu.='<form action="?editquestionsok&cat='.urlencode($currentcat).'" method="post"><table  border="0" style="width:100%">';
		$contenu.='<tr>
			<td style="width:100px;">Type</td>
			<td style="width:100px;">Difficultée</td>
			<td style="width:100px;">Série</td>
			<td style="width:auto;">Question</td>
			<td style="width:auto;">Réponse</td>
			</tr>';
		$query = sprintf('SELECT * FROM otaku_adventure_questions WHERE categorie!="CATEGORY" AND categorie="%s" ORDER BY serie, type ASC',
			mysql_real_escape_string($_GET['cat']));
		$result=mysql_query($query) or die ('['.__FILE__.' ('.__LINE__.') - '.mysql_error().' - '.$query.']');
		
		$classbg='pair';
		$idnum=0;
		while ($results = mysql_fetch_array($result)) {
			$classbg=($classbg=='pair')?'impair':'pair';
			
			$contenu.='<tr class="'.$classbg.'">';
			
			//type
			$contenu.='<td><select name="type_'.$idnum.'" style="width:100%" >';
			foreach($type as $typ) {
				if(mb_strtolower($typ)==mb_strtolower($results['type'])) {
					$contenu.='<option selected="selected" value="'.$typ.'">'.$typ.'</option>';
				} else {
					$contenu.='<option value="'.$typ.'">'.$typ.'</option>';
				}
			}
			$contenu.='</select></td>';
			
			//difficultee
			$contenu.='<td><select name="difficultee_'.$idnum.'" style="width:100%" onchange="changediffautre(this,'.$idnum.')">';
			foreach($difficultees as $diff) {
				if(mb_strtolower($diff)==mb_strtolower($results['difficultee'])) {
					$contenu.='<option selected="selected" value="'.$diff.'">'.$diff.'</option>';
				} else {
					$contenu.='<option value="'.$diff.'">'.$diff.'</option>';
				}
			}
			$contenu.='<option value="Autre">- Autre -</option>';
			$contenu.='</select></td>';
			
			//reste			
			$contenu.='<td><input name="serie_'.$idnum.'" type="text" style="width:100%" value="'.$results['serie'].'"></td>';
			$contenu.='<td><input name="question_'.$idnum.'" type="text" style="width:100%" value="'.$results['question'].'"></td>';
			$contenu.='<td><input name="reponse_'.$idnum.'" type="text" style="width:100%" value="'.$results['reponse'].'"></td>';
			$contenu.='</tr>';
			++$idnum;
		}
		for($i=0;$i<5;++$i) {
			$classbg=($classbg=='pair')?'impair':'pair';
			$contenu.='<tr class="'.$classbg.'">';

			//type
			$contenu.='<td><select name="type_'.$idnum.'" style="width:100%" >';
			foreach($type as $typ) {
				$contenu.='<option value="'.$typ.'">'.$typ.'</option>';
			}
			$contenu.='</select></td>';
			
			//difficultee
			$contenu.='<td><select name="difficultee_'.$idnum.'" style="width:100%" onchange="changediffautre(this,'.$idnum.')">';
			foreach($difficultees as $diff) {
				$contenu.='<option value="'.$diff.'">'.$diff.'</option>';
			}
			$contenu.='<option value="Autre">- Autre -</option>';
			$contenu.='</select></td>';
			
			
			$contenu.='<td><input name="serie_'.$idnum.'" type="text" style="width:100%" value=""></td>';
			$contenu.='<td><input name="question_'.$idnum.'" type="text" style="width:100%" value=""></td>';
			$contenu.='<td><input name="reponse_'.$idnum.'" type="text" style="width:100%" value=""></td>';
			$contenu.='</tr>';
			
		}
		
		
		$contenu.='<input type="hidden" name="idnummax" value="'.$idnum.'"></td>';
		$contenu.='</table><input type="submit" value="Enregistrer"></form>';
	}
}


//enregistrement de la modif des questions
/*****************************/
if(isset($_GET['editquestionsok'])) {
		$new_questions= db_load_questions();
	
	for($i=0;$i<=$_POST['idnummax'];++$i) {		
		$hash=sha1($_POST['serie_'.$i].$_POST['question_'.$i]);	
		if($_POST['serie_'.$i]!='' && $_POST['question_'.$i]!='') {
			$new_questions[$hash]=array(
				'categorie' => $_GET['cat'],
				'type' => $_POST['type_'.$i],
				'difficultee' => $_POST['difficultee_'.$i],
				'serie' => $_POST['serie_'.$i],
				'question' => $_POST['question_'.$i],
				'reponse' => $_POST['reponse_'.$i]
			);
		} else {
			unset($new_questions[$hash]);
		}
	}
	
	
	$old_questions = db_load_questions();
	$diff= questions_diff($old_questions,$new_questions);

	$contenu.=dispdiff($diff);
	
	
	//importation
	if(count($diff)>0) {
		questions_import_hist($diff);
		questions_import_table($new_questions);
		questions_import_js($new_questions);
		
		$contenu='<h3>Importaton effectuée</h3>'.$contenu;
	} else {
		$contenu='<h3>Pas de modifications</h3>'.$contenu;
	}
	
	//retour
	$contenu.='<p><span class="bouton2"><a href="?editquestions">Retour</a></span></p>';
	
}




//selection de fichier à importer
/*****************************/
if(isset($_GET['importfile'])) {
	$filecontent=file_get_contents($_FILES['file_element']['tmp_name']);
	
	$new_questions = csv_extract($filecontent);
	$old_questions = db_load_questions();
	$diff= questions_diff($old_questions,$new_questions);

	/*
	echo '<pre>'.print_r($_FILES,true).'</pre>';
	echo '<pre>'.print_r($filecontent,true).'</pre>';
	echo '<pre>'.print_r($new_questions,true).'</pre>';die("OK");
					*/
		
		
	if($diff['version_diff']) {
		$contenu= '<strong>Il y a eu une modification des questions depuis votre dernier téléchargement datant du '.$diff['newversion'].'
		(quelqu\'un a soumis une nouvelle version le '.$diff['version'].')</strong><br><br>';
	} else {
		$contenu='Voulez-vous importer vos modifications?';
		
		$contenu.='<p><form enctype="multipart/form-data" action="?importfileok" method="post">'.
			'<input type="hidden" name="file_element_raw" value="'.base64_encode($filecontent).'" />'.
			'<input type="hidden" name="user" value="'.addslashes($user).'" />'.
			'<input class="bouton2" type="submit" value="Importer">'.
			'</form>';
		
		$contenu.='<form enctype="multipart/form-data" action="?" method="post">'.
			'<input class="bouton2" type="submit" value="Annuler">'.
			'</form></p>';
	}
	

		
	$contenu.=dispdiff($diff);
	
}
//validation de l'importation
if(isset($_GET['importfileok'])) {
	
	$filecontent=base64_decode($_POST['file_element_raw']);
	
	$new_questions = csv_extract($filecontent);
	
	
	
	$old_questions = db_load_questions();
	$diff= questions_diff($old_questions,$new_questions);
	
	if($diff['version_diff']) {
		$contenu= '<strong>Il y a eu une modification des questions depuis votre dernier téléchargement datant du '.$diff['newversion'].'
		(quelqu\'un a soumis une nouvelle version le '.$diff['version'].')- IMPORTATION ANNULÉE</strong>';die();
	} else {
		if(count($diff)>0) {
			/*
			questions_import_hist($diff);
			questions_import_table($new_questions);
			questions_import_js($new_questions);
			*/
			echo '<pre>'.print_r($diff,true).'</pre>';
			echo '<pre>'.print_r($new_questions,true).'</pre>';
			echo '<pre>'.print_r($new_questions,true).'</pre>';
			
			
			$contenu='<h3>Importaton effectuée</h3>'.$contenu;
		} else {
			$contenu='<h3>Pas de modifications</h3>'.$contenu;
		}
	}
}



//download du .csv
/*****************************/
if(isset($_GET['downloadcsv'])) {

	//récuperation du CSV dans la base
	$csv=array();
	$csv[]=array('categorie','type','difficultee','serie','question','reponse');
	
	$questions=array();
	$query ='SELECT * FROM otaku_adventure_questions ORDER BY categorie, serie, type ASC';
	$result=mysql_query($query) or die ('['.__FILE__.' ('.__LINE__.') - '.mysql_error().' - '.$query.']');
	while ($results = mysql_fetch_array($result)) {
		
		if($results['categorie']=='VERSION') {
			$cat='VERSION';
		} elseif ($results['categorie']=='CATEGORY') {
			$cat='CATEGORY';
		} else {
			$cat='AUTRE';
		}
		$questions[$cat][]=array(
			$results['categorie'],
			$results['type'],
			$results['difficultee'],
			$results['serie'],
			$results['question'],
			$results['reponse'],
		);
	}
	foreach($questions['VERSION'] as $question) {
		$csv[]=$question;
		$version=$question['question'];
	}
	foreach($questions['CATEGORY'] as $question) {
		$csv[]=$question;
	}
	foreach($questions['AUTRE'] as $question) {
		$csv[]=$question;
	}
	
	//recuperation d'un historique
	if(isset($_GET['datetime'])) {
		$csv=array();
		$csv[]=array('categorie','type','difficultee','serie','question','reponse');
		
		//récuperation des questions
		$questions_hist=array();
		$query = sprintf('SELECT * FROM otaku_adventure_historique WHERE datetime<="%s" ORDER BY datetime ASC',
			mysql_real_escape_string($_GET['datetime']));
		$result=mysql_query($query) or die ('['.__FILE__.' ('.__LINE__.') - '.mysql_error().' - '.$query.']');
		while ($results = mysql_fetch_array($result)) {
			if($results['categorie']=='CATEGORY') {
				$catname=$results['question'];
				$catname=substr($catname,strpos($catname,'cat:\'')+5);
				$catname=substr($catname,0,strpos($catname,'\','));
				$results['hash']=sha1($catname);
			}
			if($results['action']=='add' || $results['action']=='edit') {
				$questions_hist[$results['hash']]=$results;
			} elseif($results['action']=='del') {
				unset($questions_hist[$results['hash']]);
			}
		}
	
		//tri par catégories
		$questions=array();
		foreach($questions_hist as $question_hist) {
			//echo '<pre>'.print_r($question_hist['categorie'],true).'</pre>';
			if($question_hist['categorie']=='VERSION') {
				$cat='VERSION';
			} elseif ($question_hist['categorie']=='CATEGORY') {
				$cat='CATEGORY';
			} else {
				$cat='AUTRE';
			}
			$questions[$cat][]=array(
				$question_hist['categorie'],
				$question_hist['type'],
				$question_hist['difficultee'],
				$question_hist['serie'],
				$question_hist['question'],
				$question_hist['reponse'],
			);
		}
		
		//intégration
		$version='Version EXTRAITE du: '.date('H:i:s d/m/Y',strtotime($_GET['datetime']));
		$csv[]=array(
			'VERSION',
			'',
			'',
			'NE PAS TOUCHER',
			$version,
			'',
		);
		
		foreach($questions['CATEGORY'] as $question) {
			$csv[]=$question;
		}
		foreach($questions['AUTRE'] as $question) {
			$csv[]=$question;
		}
	}
		
	
	//conversion du tableau en lignes CSV
	$outlines=array();
	foreach($csv as $line){
		$outcell=array();
		foreach($line as $cell) {
			if(	strpos($cell,CVS_SEPARATOR_CELL)!==false ||
				strpos($cell,CVS_SEPARATOR_LINE)!==false ||
				strpos($cell,CVS_SEPARATOR_STRING)!==false ) {
				
				$outcell[]='"'.str_replace(CVS_SEPARATOR_STRING,CVS_SEPARATOR_ESCAPEDCHAR,$cell).'"';
			} else {
				$outcell[]=$cell;
			}
		}
		$outlines[]=implode(CVS_SEPARATOR_CELL,$outcell);
	}
	$outlines=implode(CVS_SEPARATOR_LINE,$outlines);
	
	header('Content-Disposition: attachment; filename="questions.csv"');
	header('Content-type: text/csv');
	echo utf8_decode($outlines);
	die();
}




//on extrait les données de la chaine CSV
/*****************************/
function csv_extract($contenu) {

	//retours à la ligne, conversion au format unix et utf-8
	$contenu=str_replace("\r\n","\n",$contenu);
	$contenu=str_replace("\r","\n",$contenu);
	$contenu=utf8_encode($contenu); 
	
	//traitement des caractères spéciaux entre quotes
	$datalist=explode(CVS_SEPARATOR_STRING,$contenu);
	$pair=1;
	foreach($datalist as $key => $val) {
		if(++$pair%2) {
			$datalist[$key]=str_replace(CVS_SEPARATOR_CELL,'CSV_CHAR_DELIMITER',$datalist[$key]);
			$datalist[$key]=str_replace(CVS_SEPARATOR_LINE,'CSV_CHAR_NEWLINE',$datalist[$key]);
		} 		
	}
	$contenu=implode(CVS_SEPARATOR_STRING,$datalist);
	
	//extraction réelle du tableau
	$new_questions=array();
	$contenu=explode(CVS_SEPARATOR_LINE,$contenu);
	
	$headers=array_shift($contenu);
	$headers=explode(CVS_SEPARATOR_CELL,$headers);
	foreach($headers as $numcell => $datacell) {
		if(substr($datacell,0,1)==CVS_SEPARATOR_STRING) {
			$datacell=substr($datacell,1,-1);
			$headers[$numcell]=str_replace(CVS_SEPARATOR_ESCAPEDCHAR,CVS_SEPARATOR_STRING,$datacell);
		}
	}

	foreach($contenu as $keyline => $line) {
		$linedata=explode(CVS_SEPARATOR_CELL,$line);
		foreach($linedata as $keycell => $cell) {
			if(substr($cell,0,1)==CVS_SEPARATOR_STRING) {
				$cell=substr($cell,1,-1);
				$cell=str_replace(CVS_SEPARATOR_ESCAPEDCHAR,CVS_SEPARATOR_STRING,$cell);
			}
			$cell=str_replace('CSV_CHAR_DELIMITER',CVS_SEPARATOR_CELL,$cell);
			$cell=str_replace('CSV_CHAR_NEWLINE',CVS_SEPARATOR_LINE,$cell);
			//echo '<pre>@@@'.print_r($cell,true).'</pre>';
			$linedata[$headers[$keycell]]=$cell;
			unset($linedata[$keycell]);
		}
		
		$hash=sha1($linedata['serie'].$linedata['question']);
		if(!empty($linedata['serie']) && !empty($linedata['question'])) $new_questions[$hash]=$linedata;
	}
	return $new_questions;
}


//on charge les anciennes questions
/*****************************/
function db_load_questions() {
	$old_questions=array();
	$query = mysql_query("SELECT * FROM otaku_adventure_questions") or die ('['.__FILE__.' ('.__LINE__.') - '.mysql_error().']');
	while ($result = mysql_fetch_array($query)) {
		$old_questions[$result['hash']]=$result;
	}
	return $old_questions;
}

//on calcule la différence
/*****************************/
function questions_diff($old_questions,$new_questions) {

	$diff=array();
	
	
	foreach($new_questions as $hash => $line) {
		if($line['categorie']=='VERSION') {
			unset($new_questions[$hash]);
		}
	}
	foreach($old_questions as $hash => $line) {
		if($line['categorie']=='VERSION') {
			unset($old_questions[$hash]);
		}
	}
	/*
	$diff['version_diff']=false;
	
	$version='';
	foreach($old_questions as $hash => $line) {
		if($line['categorie']=='VERSION') {
			$version=$line['question'];
			unset($old_questions[$hash]);
		}
	}
	$newversion='';
	foreach($new_questions as $hash => $line) {
		if($line['categorie']=='VERSION') {
			$newversion=$line['question'];
			unset($new_questions[$hash]);
		}
	}
	$diff['newversion']=$newversion;
	$diff['version']=$version;
		
		
	if(($version=='' || $newversion=='') && strpos($newversion,'EXTRAITE')===false) die('fichier corrompu');
	if(($version != $newversion) && strpos($newversion,'EXTRAITE')===false) {
		$diff['version_diff']=true;
	}
	*/
	
	foreach($new_questions as $hash => $line) {
		if(!array_key_exists ($hash,$old_questions)) {
			// on ajoute la question
			$diff['add'][$hash]=$new_questions[$hash];
		} else {
			if($line['categorie'] != $old_questions[$hash]['categorie'] ||
			$line['type'] != $old_questions[$hash]['type'] ||
			$line['difficultee'] != $old_questions[$hash]['difficultee'] ||
			$line['reponse'] != $old_questions[$hash]['reponse']) {
				//on modifie une question
				$diff['edit'][$hash]=$new_questions[$hash];
				$diff['edit'][$hash]['categorie_old']=$old_questions[$hash]['categorie'];
				$diff['edit'][$hash]['type_old']=$old_questions[$hash]['type'];
				$diff['edit'][$hash]['difficultee_old']=$old_questions[$hash]['difficultee'];
				$diff['edit'][$hash]['reponse_old']=$old_questions[$hash]['reponse'];
			}
		}
	}
	foreach($old_questions as $hash => $line) {
		if(!array_key_exists ($hash,$new_questions)) {
			//on retire la question
			$diff['del'][$hash]=$old_questions[$hash];
		}
	}
	return $diff;
}


//on affiche la différence
/*****************************/
function dispdiff($diff) {
	$out='';

	if(isset($diff['add']))
		{
		$out.='Nouvelles questions:<br>';
		$out.= '<table border="1">';
		$out.='<tr>
			<td>categorie</td>
			<td>type</td>
			<td>difficultee</td>
			<td>serie</td>
			<td>question</td>
			<td>reponse</td></tr>';
		foreach($diff['add'] as $val) {
			$out.='<tr>
				<td>'.$val['categorie'].'</td>
				<td>'.$val['type'].'</td>
				<td>'.$val['difficultee'].'</td>
				<td>'.$val['serie'].'</td>
				<td>'.$val['question'].'</td>
				<td>'.$val['reponse'].'</td>
			</tr>';
		}
		$out.='</table>';
	}
	
	if(isset($diff['edit']))
		{
		$out.='Questions modifiées:<br>';
		$out.= '<table border="1">';
		$out.='<tr>
			<td>categorie</td>
			<td>type</td>
			<td>difficultee</td>
			<td>serie</td>
			<td>question</td>
			<td>reponse</td></tr>';
		foreach($diff['edit'] as $val) {
			$out.='<tr>
				<td>'.$val['categorie'].'</td>
				<td>'.$val['type'].'</td>
				<td>'.$val['difficultee'].'</td>
				<td>'.$val['serie'].'</td>
				<td>'.$val['question'].'</td>
				<td>'.$val['reponse'].'</td>
			</tr>';
			$out.='<tr>
				<td>'.$val['categorie_old'].'</td>
				<td>'.$val['type_old'].'</td>
				<td>'.$val['difficultee_old'].'</td>
				<td colspan="2"><b>Anciennement:</b></td>
				<td>'.$val['reponse_old'].'</td>
			</tr>';
		}
		$out.='</table>';
	}
	
	if(isset($diff['del']))
		{
		$out.='Questions supprimées:<br>';
		$out.= '<table border="1">';
		$out.='<tr>
			<td>categorie</td>
			<td>type</td>
			<td>difficultee</td>
			<td>serie</td>
			<td>question</td>
			<td>reponse</td></tr>';
		foreach($diff['del'] as $val) {
			$out.='<tr>
				<td>'.$val['categorie'].'</td>
				<td>'.$val['type'].'</td>
				<td>'.$val['difficultee'].'</td>
				<td>'.$val['serie'].'</td>
				<td>'.$val['question'].'</td>
				<td>'.$val['reponse'].'</td>
			</tr>';
		}
		$out.='</table>';
	}
	return $out;
}



//importation dans la table historique
/*****************************/
function questions_import_hist($diff,$sitedate='') {
	global $user;
	$queries=array();
	
	$dateMySQL=($sitedate!='')?$sitedate:date('Y-m-d G:i:s');
	$iphost=$_SERVER["REMOTE_ADDR"].' - '.gethostbyaddr($_SERVER["REMOTE_ADDR"]);
	
	if(isset($diff['add'])) {
		foreach($diff['add'] as $hash => $question) {
			$queries[] = sprintf('("%s","%s","%s","%s","%s","%s","%s","%s","%s","%s","%s")',
				$dateMySQL,
				mysql_real_escape_string($iphost),
				mysql_real_escape_string($user),
				'add',
				mysql_real_escape_string($hash),
				mysql_real_escape_string($question['categorie']),
				mysql_real_escape_string($question['type']),
				mysql_real_escape_string($question['difficultee']),
				mysql_real_escape_string($question['serie']),
				mysql_real_escape_string($question['question']),
				mysql_real_escape_string($question['reponse']));
		}
	}
	if(isset($diff['edit'])) {
		foreach($diff['edit'] as $hash => $question) {
			$queries[] = sprintf('("%s","%s","%s","%s","%s","%s","%s","%s","%s","%s","%s")',
				$dateMySQL,
				mysql_real_escape_string($iphost),
				mysql_real_escape_string($user),
				'edit',
				mysql_real_escape_string($hash),
				mysql_real_escape_string($question['categorie']),
				mysql_real_escape_string($question['type']),
				mysql_real_escape_string($question['difficultee']),
				mysql_real_escape_string($question['serie']),
				mysql_real_escape_string($question['question']),
				mysql_real_escape_string($question['reponse']));
		}
	}
	if(isset($diff['del'])) {
		foreach($diff['del'] as $hash => $question) {
			$queries[] = sprintf('("%s","%s","%s","%s","%s","%s","%s","%s","%s","%s","%s")',
				$dateMySQL,
				mysql_real_escape_string($iphost),
				mysql_real_escape_string($user),
				'del',
				mysql_real_escape_string($hash),
				mysql_real_escape_string($question['categorie']),
				mysql_real_escape_string($question['type']),
				mysql_real_escape_string($question['difficultee']),
				mysql_real_escape_string($question['serie']),
				mysql_real_escape_string($question['question']),
				mysql_real_escape_string($question['reponse']));
		}
	}
		
	$query ='INSERT INTO otaku_adventure_historique
			(`datetime`, `ip-host`, `user`, `action`, `hash`, `categorie`, `type`, `difficultee`, `serie`, `question`, `reponse`)
			VALUES '.implode(',',$queries);
	
	mysql_query($query) or die ('['.__FILE__.' ('.__LINE__.') - '.mysql_error().' - '.$query.']');
}

//importation dans la table des questions
/*****************************/
function questions_import_table($new_questions) {
	$query ='TRUNCATE otaku_adventure_questions';
	mysql_query($query) or die ('['.__FILE__.' ('.__LINE__.') - '.mysql_error().' - '.$query.']');

	foreach($new_questions as $hash => $line) {
		if($line['categorie']=='VERSION') {
			unset($new_questions[$hash]);
		}
	}
	
	$queries=array();
	$queries[] = '("nohashversion","VERSION","","","NE PAS TOUCHER","Version: '.date('H:i:s d/m/Y').'","")';
	foreach($new_questions as $hash => $question) {
		$queries[] = sprintf('("%s","%s","%s","%s","%s","%s","%s")',
			mysql_real_escape_string($hash),
			mysql_real_escape_string($question['categorie']),
			mysql_real_escape_string($question['type']),
			mysql_real_escape_string($question['difficultee']),
			mysql_real_escape_string($question['serie']),
			mysql_real_escape_string($question['question']),
			mysql_real_escape_string($question['reponse']));
	}
	$query ='INSERT INTO otaku_adventure_questions
		(`hash`, `categorie`, `type`, `difficultee`, `serie`, `question`, `reponse`)
		VALUES '.implode(',',$queries);
	
	mysql_query($query) or die ('['.__FILE__.' ('.__LINE__.') - '.mysql_error().' - '.$query.']');
}


//importation dans le fichier javascript
/*****************************/
function questions_import_js($new_questions) {
	$difficultees=array();
	$categories=array();
	$questions=array();
	
	foreach($new_questions as $question) {
		if($question['categorie']=='CATEGORY') {
			$categories[]=$question['question'];
		} elseif($question['categorie']=='VERSION') {
			$version=$question['question'];
		} else {
			$questions[]=$question;
			$difficultees[]=mb_convert_case($question['difficultee'], MB_CASE_LOWER, "UTF-8");
		}
	}
	
	
	$difficultees=array_unique($difficultees);
	$categories=array_unique($categories);
		
	$jsout="bs.jeux['otaku_adventure'].load_questions( \n //NE MODIFIEZ PAS CE FICHIER!!! Passez par l'interface d'administration! \n '".$version."', \n\n";
 
 
	$jsout.="//les catégories\n";
	$jsout.="[\n";
	foreach($categories as $categorie) {
		$categorie=trim($categorie,',');
		$jsout.= "".$categorie.",\n";
	}
	$jsout.= "],\n\n";
	
	
	$jsout.= "//les difficultées\n";
	$jsout.= "[\n";
	foreach($difficultees as $difficultee) {
		$jsout.= "'".addslashes($difficultee)."',\n";
	}
	$jsout.= "],\n\n";
	
	
	$jsout.= "//les questions\n";
	$jsout.= "[\n";
	foreach($questions as $question) {
	$jsout.= "{
	categorie:'".addslashes($question['categorie'])."',
	type:'".addslashes($question['type'])."',
	difficultee:'".addslashes(mb_convert_case($question['difficultee'], MB_CASE_LOWER, "UTF-8"))."',
	serie:'".addslashes($question['serie'])."',
	question:'".addslashes($question['question'])."',
	reponse:'".addslashes($question['reponse'])."',
	},\n\n";
	}
	$jsout.= "]\n\n";
	
	$jsout.= ");";
	
	file_put_contents('questions.js',$jsout);
}	

	
//affichage du contenu
?><!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<link rel="stylesheet" type="text/css" href="../style.css"/>
<script type="text/javascript">
function changediffautre(element,idnum) {
	if(element.value=='Autre') {
		element.parentNode.innerHTML='<input type="text" name="difficultee_'+idnum+'" style="width:100%" value="" />';
	}
		//
}
</script>
<body class="admin">

<h1 class="center">Administration</h1>
<span style="position:absolute;left:10px;top:10px;"><a style="white-space: nowrap;" class="bouton2 img_house" href="../"><strong>Accueil</strong></a></span>

<?php echo $contenu; ?>

</body></html>