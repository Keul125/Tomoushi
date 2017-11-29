bs.jeux['otaku_adventure'] = {
	//music_path:prompt('Chemin du dossier contenant les musiques',''),
	
	http_music_path:'http://www.haruhi.fr//',
	file_music_path:'./OtakuAdventureMusiques/',
	
	music_path:'',
	liste_version:'',
	liste_categories:[],
	liste_difficultee:[],
	liste_questions:[],
	sauvegarde:[],
	etat_difficultee:[],
	type_questions:[],
	board:[],
	pions:[],
	plateau_width:10,
	plateau_height:8,
	cases:[],

	disp_aide: function() {
		var out='';
		out+='<h1>Otaku Adventure aide</h1>Contenu de l\'aide';
		return out;
	},
	
	
	//on charge l'interface et lance le chargement des questions
	start: function() {
	
		bs.jeux['otaku_adventure'].music_path=(bs.online)?bs.jeux['otaku_adventure'].http_music_path:bs.jeux['otaku_adventure'].file_music_path;

		if(bs.mode_affichage=='videoproj') {
			if(!bs.open_popup('Otaku Adventure')) {
				bs.disp_liste_jeux();
				return;
			}
		}
		
		//chargement du contenu
		document.getElementById('content_id').innerHTML=
		'<div id="otaku_adventure_content_id" class="whitebg"></div>';
		
		//chargement des questions
		loaded=bs.load_file('./otaku_adventure/questions.js');
		if(!loaded) { // n'a pas été chargé car déjà inclus depuis un moment
			bs.jeux['otaku_adventure'].menu();
		}
		
		
		
		
		
		
	},
	
	//les questions sont chargés
	load_questions:function(version,categories,difficultee,questions) {
		bs.jeux['otaku_adventure'].liste_version=version;
		bs.jeux['otaku_adventure'].liste_categories=categories;
		bs.jeux['otaku_adventure'].liste_difficultee=difficultee;
		bs.jeux['otaku_adventure'].liste_questions=questions;
		bs.jeux['otaku_adventure'].menu();
	},
	
	//on charge le menu
	menu: function() {
		document.getElementById('otaku_adventure_content_id').innerHTML=
		'<h2>Préparatifs :</h2><ul>'+
		'<li>Staff : 1 au PC, 1 au micro, 1 qui dirige le plateau, 1 </li>'+
		'<li>Materiel : Plateau, dé, 5 pions, cartes chance, le PC, page avec code couleurs</li>'+
		'</ul>'+
		''+
		((bs.verifier('otaku_adventure','historique'))?
		'<p><span class="bouton" onclick="bs.jeux[\'otaku_adventure\'].reprendre_partie();">Reprendre la partie précédente</span></p>':'')+
		'<p><span class="bouton" onclick="bs.jeux[\'otaku_adventure\'].nouvelle_partie();">Démarrer une nouvelle partie</span></p>';
	},
	
	// Generation du tableau
	generer_structure_plateau: function(width, height, clockwise , fromCenter , startDirection) {
		var position=[0,0],
			direction=[0,0],
			board=[],
			cellPosition=[],
			board_noborder=[],
			nextno_border='';
		for (y=0 ; y<height; ++y) {
			for (x=0 ; x<width; ++x) {
				if(!board[x]) board[x]=[];
				if(!board_noborder[x]) board_noborder[x]=[];
				board[x][y]=0;
			}
		}
		
		//init of direction
		if(startDirection=='right') direction[0]=1;
		if(startDirection=='left') direction[0]=-1;
		if(startDirection=='up') direction[1]=-1;
		if(startDirection=='down') direction[1]=1;
		
		//init of starting position
		if(clockwise) {
			position[0]=(startDirection=='right' || startDirection=='up')?0:width-1;
			position[1]=(startDirection=='right' || startDirection=='down')?0:height-1;
		} else {
			position[0]=(startDirection=='down' || startDirection=='right')?0:width-1;
			position[1]=(startDirection=='down' || startDirection=='left')?0:height-1;
		}
		
		//loop for each cell
		for (i=0 ; i<width*height; ++i) {
			//save current position
			cellPosition[i]=[position[0],position[1]];
			board[position[0]][position[1]]=i+1;
			
			
			//if next cell go out of board or in another defined cell
			//we change direction
			if(position[0]+direction[0] < 0 ||
			   position[1]+direction[1] < 0 ||
			   position[0]+direction[0] >= width ||
			   position[1]+direction[1] >= height ||
			   board[position[0]+direction[0]][position[1]+direction[1]]!=0) {
				if(clockwise) {
					buffer=direction[0];
					direction[0]=-direction[1];
					direction[1]=buffer;
				} else {
					buffer=direction[1];
					direction[1]=-direction[0];
					direction[0]=buffer;
				}
			}
			
			//set the noborder sides
			if(direction[0]==1) { board_noborder[position[0]][position[1]]='border-right:0;'+nextno_border; nextno_border='border-left:0;';}
			if(direction[0]==-1) { board_noborder[position[0]][position[1]]='border-left:0;'+nextno_border; nextno_border='border-right:0;'; }
			if(direction[1]==1) { board_noborder[position[0]][position[1]]='border-bottom:0;'+nextno_border; nextno_border='border-top:0;'; }
			if(direction[1]==-1) { board_noborder[position[0]][position[1]]='border-top:0;'+nextno_border; nextno_border='border-bottom:0;'; }
			
			//set new position
			position[0]+=direction[0];
			position[1]+=direction[1];
		}
		
		//we just reverse order (startDirection does not work in this mode, and becomes reverseEndDirection)
		if(fromCenter) {
			cellPosition.reverse();
			for (y=0 ; y<height; ++y) {
				for (x=0 ; x<width; ++x) {
					board[x][y]=(width*height)-board[x][y]+1;
				}
			}
		}
		return [board,cellPosition,board_noborder];
	},
	
	
	//nouvelle partie
	nouvelle_partie: function() {
		bs.sauver('otaku_adventure','historique','');
		
		bs.jeux['otaku_adventure'].pions=new Array();
		bs.sauver('otaku_adventure','pions','[]');
		
		
		
		bs.jeux['otaku_adventure'].reprendre_partie();
	},
		
		
	//reprendre partie
	reprendre_partie: function() {
		bs.charger('otaku_adventure','historique');
		
		bs.charger('otaku_adventure','pions');
		bs.jeux['otaku_adventure'].pions=JSON.parse(bs.jeux['otaku_adventure'].sauvegarde['pions']);
		
		
		bs.jeux['otaku_adventure'].type_questions['type_musique']=false;
		
		
		clockwise=true;
		fromCenter=false;
		startDirection='right'; //right up left down
		bs.jeux['otaku_adventure'].board=bs.jeux['otaku_adventure'].generer_structure_plateau(bs.jeux['otaku_adventure'].plateau_width,bs.jeux['otaku_adventure'].plateau_height,clockwise,fromCenter,startDirection);
		
		
		//     ff-val   => intr/2   => ff - intr/2
		// 88 => 77         3B              c4
		// 00    ff         7f              80
		// 44    bb         5D              A2
		// cc    33         19              E6
		
		bs.jeux['otaku_adventure'].cases=[
			["background-color:#ffc480;",'shonen'],
			["background-color:#FFc4c4;",'shojo'],
			["background-color:#FF80FF;",'jeuvideo'],
			["background-color:#c4A280;",'oldies'],
			["background-color:#80FFFF;",'mecha'],
			["background-color:#80E680;",'animes'],
			["background-color:#e6e6a0;",'chance'],
		];
		
	
		
		
		bs.jeux['otaku_adventure'].afficher_liste_questions();
	},
	
	set_etat_diff: function (element) {
		bs.jeux['otaku_adventure'].etat_difficultee[element.id]=element.checked;
	},
	set_type_questions: function (element) {
		bs.jeux['otaku_adventure'].type_questions[element.id]=element.checked;
	},
	//affiche les différents type de questions qu'on peux tirer
	afficher_liste_questions: function() {
		pop='';		
		if(bs.mode_affichage=='videoproj') 
		bs.public_popup.document.getElementById('publicoppup_id').innerHTML=pop;

		
		out='<strong>Difficultée</strong> : ';
		for (key in bs.jeux['otaku_adventure'].liste_difficultee) {
			var currdif='diff_'+bs.jeux['otaku_adventure'].liste_difficultee[key];
		
			if(bs.jeux['otaku_adventure'].etat_difficultee[currdif]==false) {
				out+=
				'<input type="checkbox" id="'+currdif+'" value="1"'+
				'onclick="bs.jeux[\'otaku_adventure\'].set_etat_diff(this);">'+
				bs.jeux['otaku_adventure'].liste_difficultee[key]+
				' ';
			} else {
				out+=
				'<input type="checkbox" id="'+currdif+'" value="1" checked="checked"'+
				'onclick="bs.jeux[\'otaku_adventure\'].set_etat_diff(this);">'+
				bs.jeux['otaku_adventure'].liste_difficultee[key]+
				' ';
			}
		}
		out+='<br><strong>Type</strong> : ';
		if(bs.jeux['otaku_adventure'].type_questions['type_quizz']==false) {
			out+='<input type="checkbox" id="type_quizz" value="1"'+
			'onclick="bs.jeux[\'otaku_adventure\'].set_type_questions(this);">Questions ';
		} else {
			out+='<input type="checkbox" id="type_quizz" value="1" checked="checked"'+
			'onclick="bs.jeux[\'otaku_adventure\'].set_type_questions(this);">Questions ';
		}
		if(bs.jeux['otaku_adventure'].type_questions['type_mime']==false) {
			out+='<input type="checkbox" id="type_mime" value="1"'+
			'onclick="bs.jeux[\'otaku_adventure\'].set_type_questions(this);">Mime ';
		} else {
			out+='<input type="checkbox" id="type_mime" value="1" checked="checked"'+
			'onclick="bs.jeux[\'otaku_adventure\'].set_type_questions(this);">Mime ';
		}
		if(bs.jeux['otaku_adventure'].type_questions['type_musique']==false) {
			out+='<input type="checkbox" id="type_musique" value="1"'+
			'onclick="bs.jeux[\'otaku_adventure\'].set_type_questions(this);">Musique ';
		} else {
			out+='<input type="checkbox" id="type_musique" value="1" checked="checked"'+
			'onclick="bs.jeux[\'otaku_adventure\'].set_type_questions(this);">Musique ';
		}
			

		out+='<br>Tirer une queston de catégorie : ';
		for (key in bs.jeux['otaku_adventure'].liste_categories) {
			out+='<span style="background:'+bs.jeux['otaku_adventure'].liste_categories[key].couleur+'" class="bouton_tirer_question bouton_tirer_questioT" onclick="bs.jeux[\'otaku_adventure\'].tirer_question('+key+');">'+
			bs.jeux['otaku_adventure'].liste_categories[key].bouton+
			'</span>';
		}
		
		
		out+='<p><span class="bouton" onclick="bs.jeux[\'otaku_adventure\'].afficher_historique_questions();">Historique</span>';
		
		
		out+='<span class="bouton" onclick="bs.jeux[\'otaku_adventure\'].ajouter_pion();">Ajouter un pion</span></p>';
		
		
		plateau=bs.jeux['otaku_adventure'].afficher_plateau(true);
		
		out+='<div id="otaku_adventure_plateau_prive">'+plateau+'</div>';
		
		document.getElementById('otaku_adventure_content_id').innerHTML=out;
		
		
		
		for (y=0 ; y<bs.jeux['otaku_adventure'].plateau_height; ++y) {
			for (x=0 ; x<bs.jeux['otaku_adventure'].plateau_width; ++x) {
				bs.jeux['otaku_adventure'].dndHandler.applyDropEvents(document.getElementById('cell_'+bs.jeux['otaku_adventure'].board[0][x][y]));
			}
		}

		for (p=0 ; p<bs.jeux['otaku_adventure'].pions.length; ++p) {
			bs.jeux['otaku_adventure'].dndHandler.applyDragEvents(document.getElementById('pion_'+bs.jeux['otaku_adventure'].pions[p][0]));
		}

		
		outproj="";
		plateau=bs.jeux['otaku_adventure'].afficher_plateau(false);
		outproj+='<div id="otaku_adventure_plateau_public">'+plateau+'</div>';
		bs.public_popup.document.getElementById('publicoppup_id').innerHTML=outproj;
		
		
	},
	
	ajouter_pion: function() {
		var pos=bs.jeux['otaku_adventure'].pions.length;
		var pionlist=[
			["A","#ff0000"],
			["B","#00ff00"],
			["C","#0000ff"],
			["D","#ffff00"],
			["E","#ff00ff"],
			["F","#00ffff"],
			["G","#ff8800"],
			];
		if(pos<7) {
			bs.jeux['otaku_adventure'].pions.push([pionlist[pos][0],0,pionlist[pos][1]]);
		}
		
		bs.sauver('otaku_adventure','pions',JSON.stringify(bs.jeux['otaku_adventure'].pions));
		
		
		
		bs.jeux['otaku_adventure'].afficher_liste_questions();
	},
	
	pions_update: function(draggedElement_id,target_id) {
		for (p=0 ; p<bs.jeux['otaku_adventure'].pions.length; ++p) {
			if('pion_'+bs.jeux['otaku_adventure'].pions[p][0]==draggedElement_id) {
				console.log(draggedElement_id+'>>>'+target_id);
				pos=target_id.split('cell_');
				if(pos[1]) {
					pos=pos[1];
					pos=parseInt(pos)-1;
					bs.jeux['otaku_adventure'].pions[p][1]=pos;
				} else {
					target_id=document.getElementById(target_id).parentNode.id
					console.log(draggedElement_id+'>>>parentcell:'+target_id);
					pos=target_id.split('cell_');
					if(pos[1]) {
						pos=pos[1];
						pos=parseInt(pos)-1;
						bs.jeux['otaku_adventure'].pions[p][1]=pos;
					}
					
					
					
				}
				
				
				
				
			}
		}
		bs.sauver('otaku_adventure','pions',JSON.stringify(bs.jeux['otaku_adventure'].pions));
		
		bs.jeux['otaku_adventure'].afficher_liste_questions();
	},
	
	
	// affichage du plateau
	afficher_plateau: function(for_admin) {
		var board2=bs.jeux['otaku_adventure'].board;
		var out3="";
		var pions=bs.jeux['otaku_adventure'].pions;
		
		var cases=bs.jeux['otaku_adventure'].cases;
		var clen=cases.length;
		
		if(for_admin) {
			out3+='<table class="okp_board">';
			for (y=0 ; y<bs.jeux['otaku_adventure'].plateau_height; ++y) {
				out3+='<tr>';
				for (x=0 ; x<bs.jeux['otaku_adventure'].plateau_width; ++x) {
				
					var color=((board2[0][x][y]-1)%clen);
				
				
					out3+='<td id="cell_'+board2[0][x][y]+'" class="okp_case" style="'+board2[2][x][y]+';'+cases[color]+'">';
					
					for (p=0 ; p<pions.length; ++p) {
						if((pions[p][1]+1)==board2[0][x][y]) {
							out3+='<div id="pion_'+pions[p][0]+'" class="okp_pion" style="background-color:'+pions[p][2]+';">'+pions[p][0]+'</div>';
						}
					}
					
					out3+='</td>';
				}
				out3+='</tr>';
			}
			out3+='</table>';
			
		} else {
			out3+='<table class="okp_board">';
			for (y=0 ; y<bs.jeux['otaku_adventure'].plateau_height; ++y) {
				out3+='<tr>';
				for (x=0 ; x<bs.jeux['otaku_adventure'].plateau_width; ++x) {
					var color=((board2[0][x][y]-1)%clen);
					out3+='<td id="pub_cell_'+board2[0][x][y]+'" class="okp_case" style="'+board2[2][x][y]+';'+cases[color]+'">';
					for (p=0 ; p<pions.length; ++p) {
						if((pions[p][1]+1)==board2[0][x][y]) {
							out3+='<div id="pub_pion_'+pions[p][0]+'" class="okp_pion" style="background-color:'+pions[p][2]+';">'+pions[p][0]+'</div>';
						}
					}
					out3+='</td>';
				}
				out3+='</tr>';
			}
			out3+='</table>';
		}
		
		return out3;
	},
	
	
	tirer_question: function(type) {
		//on liste les questions
		var historique=bs.jeux['otaku_adventure'].sauvegarde['historique'].split(',');
		var listquestions=new Array();
		for (key in bs.jeux['otaku_adventure'].liste_questions) {
			
			if(
				bs.jeux['otaku_adventure'].liste_questions[key].categorie==bs.jeux['otaku_adventure'].liste_categories[type].cat //dans la bonne catégorie
				&& 
				(
					( bs.jeux['otaku_adventure'].liste_questions[key].type=='Musique' && false ) //type Musique
					|| ( bs.jeux['otaku_adventure'].liste_questions[key].type=='Quizz' && document.getElementById('type_quizz').checked ) //type Quizz
					|| ( bs.jeux['otaku_adventure'].liste_questions[key].type=='Mime' && document.getElementById('type_mime').checked ) //type Mime
				)
				&& document.getElementById('diff_'+bs.jeux['otaku_adventure'].liste_questions[key].difficultee)
				&& document.getElementById('diff_'+bs.jeux['otaku_adventure'].liste_questions[key].difficultee).checked //dans le niveau de difficultée sélectionné 
				&& historique.indexOf(key)==-1 //et n'apparait pas dans l'historique
			){ 
				listquestions.push(key);
			}		
		}
		if(listquestions.length==0) {
			alert('plus de question disponible');
			return;
		}
	
		//tirage de la question
		selectedquestion=listquestions[Math.floor(Math.random()*listquestions.length)];
	
		
		//ajout dans l'historique
		historique.push(selectedquestion);
		historique=historique.join(',');
		bs.sauver('otaku_adventure','historique',historique);
						
		//affichage de la question de type quizz
		if(bs.jeux['otaku_adventure'].liste_questions[selectedquestion].type=='Quizz') {
		
			pop='<div class="questpub"><h1 class="intitule_question">Quizz</h1>';		
			pop+='<h3>'+bs.jeux['otaku_adventure'].liste_categories[type].titre+'</h3>';		
			pop+='<h2 class="intitule_question">Série</h2><h3>'+bs.jeux['otaku_adventure'].liste_questions[selectedquestion].serie+'</h3>';		
			pop+='<h2 class="intitule_question">Question</h2><h3>'+bs.jeux['otaku_adventure'].liste_questions[selectedquestion].question+'</h3></div>';		
			out='<p><span class="bouton" onclick="bs.jeux[\'otaku_adventure\'].afficher_liste_questions();">Retour à la liste</span></p>';
			out+='<h2>- Quizz - </h2>Difficultée<h2>'+bs.jeux['otaku_adventure'].liste_questions[selectedquestion].difficultee+'</h2>';			
			out+='Série<h2>'+bs.jeux['otaku_adventure'].liste_questions[selectedquestion].serie+'</h2>';			
			out+='Question<h2>'+bs.jeux['otaku_adventure'].liste_questions[selectedquestion].question+'</h2>';	

			if(bs.mode_affichage=='videoproj') {
				bs.public_popup.document.getElementById('publicoppup_id').innerHTML=pop;
				out+='Réponse<h2>'+bs.jeux['otaku_adventure'].liste_questions[selectedquestion].reponse+'</h2>';	
			}
			
			if(bs.mode_affichage=='tablette') {
				out+='Réponse';
				out+='<h2><span class="bouton" onclick="document.getElementById(\'reponse_disp_id\').style.display=\'\'">Afficher</span> ';
				out+='<span class="bouton" onclick="document.getElementById(\'reponse_disp_id\').style.display=\'none\'">Masquer</span></h2>';
				out+='<h2 style="display:none;" id="reponse_disp_id">'+bs.jeux['otaku_adventure'].liste_questions[selectedquestion].reponse+'</h2>';	
			
			}
				
		}
		
		//affichage de la question de type musique
		if(bs.jeux['otaku_adventure'].liste_questions[selectedquestion].type=='Musique') {

			pop='<div class="questpub"><h1>Musique</h1>';		
			pop+='<h3>'+bs.jeux['otaku_adventure'].liste_categories[type].titre+'</h3>';		
			pop+='<h2>Devinez de quelle série provient la musique</h2></div>';		
			if(bs.mode_affichage=='videoproj') 
				bs.public_popup.document.getElementById('publicoppup_id').innerHTML=pop;


			out='<p><span class="bouton" onclick="bs.jeux[\'otaku_adventure\'].afficher_liste_questions();">Retour à la liste</span></p>';
			out+='<h2>- Musique - </h2><h2>Difficultée</h2>'+bs.jeux['otaku_adventure'].liste_questions[selectedquestion].difficultee;		
			

			if(bs.mode_affichage=='videoproj') {
				out+='<h2>Musique</h2>'+bs.jeux['otaku_adventure'].liste_questions[selectedquestion].question+'</h3>';	
				out+='<h2>Série</h2>'+bs.jeux['otaku_adventure'].liste_questions[selectedquestion].serie+'</h3>';
				out+='<h2>Fichier</h2>'+bs.jeux['otaku_adventure'].liste_questions[selectedquestion].reponse;		
			}
			if(bs.mode_affichage=='tablette') {
				out+='<h2><span class="bouton" onclick="document.getElementById(\'reponse_disp_id\').style.display=\'\'">Afficher</span>';
				out+='<span class="bouton" onclick="document.getElementById(\'reponse_disp_id\').style.display=\'none\'">Masquer</span></h2>';
				out+='<span style="display:none;" id="reponse_disp_id"><h2>Musique</h2>'+bs.jeux['otaku_adventure'].liste_questions[selectedquestion].question+'</h3>';	
				out+='<h2>Série</h2>'+bs.jeux['otaku_adventure'].liste_questions[selectedquestion].serie+'</h3>';	
				out+='<h2>Fichier</h2>'+bs.jeux['otaku_adventure'].liste_questions[selectedquestion].reponse+'</span>';		
			}
				
			out+='<h2>Lecteur</h2><audio controls src="'+
						bs.jeux['otaku_adventure'].music_path+bs.jeux['otaku_adventure'].liste_questions[selectedquestion].reponse+'"></audio>';	
			
		}
		
		//affichage de la question de type mime
		if(bs.jeux['otaku_adventure'].liste_questions[selectedquestion].type=='Mime') {
				
			pop='<div class="questpub"><h1>Mime</h1>';		
			pop+='<h3>'+bs.jeux['otaku_adventure'].liste_categories[type].titre+'</h3>';		
			pop+='<h2>Devinez de quelle série il s\'agit</h2></div>';		
			if(bs.mode_affichage=='videoproj') 
				bs.public_popup.document.getElementById('publicoppup_id').innerHTML=pop;

			
			
			
			out='<p><span class="bouton" onclick="bs.jeux[\'otaku_adventure\'].afficher_liste_questions();">Retour à la liste</span></p>';
			out+='<h2>- Mime - </h2><h2>Difficultée</h2>'+bs.jeux['otaku_adventure'].liste_questions[selectedquestion].difficultee;		
			if(bs.mode_affichage=='videoproj') {
				out+='<h2>Série</h2>'+bs.jeux['otaku_adventure'].liste_questions[selectedquestion].serie;		
				out+='<h2>Mime</h2>'+bs.jeux['otaku_adventure'].liste_questions[selectedquestion].question;		
			}
			if(bs.mode_affichage=='tablette') {
				out+='Musique';
				out+='<h2><span class="bouton" onclick="document.getElementById(\'reponse_disp_id\').style.display=\'\'">Afficher</span>';
				out+='<span class="bouton" onclick="document.getElementById(\'reponse_disp_id\').style.display=\'none\'">Masquer</span></h2>';
				out+='<span style="display:none;" id="reponse_disp_id"><h2>Série</h2>'+bs.jeux['otaku_adventure'].liste_questions[selectedquestion].serie;		
				out+='<h2>Mime</h2>'+bs.jeux['otaku_adventure'].liste_questions[selectedquestion].question+'</span>';	
			}
			
					
		}
		document.getElementById('otaku_adventure_content_id').innerHTML=out;		
	},
	
	//affichage de l'historique
	afficher_historique_questions: function() {
		historique=bs.jeux['otaku_adventure'].sauvegarde['historique'];
		historique=historique.substring(1).split(',').reverse();
		
		var tableau='<span class="bouton" onclick="bs.jeux[\'otaku_adventure\'].afficher_liste_questions();">Retour à la partie précédente...</span>'+
			'<h1>Historique</h1>(dernières questions affichées en premier)'+
			'<table border="1" id="otaku_adventure_questions_id">'+
			'<tr>'+
			'<td>catégories</td>'+
			'<td>difficultée</td>'+
			'<td>type</td>'+
			'<td>serie</td>'+
			'<td>question</td>'+
			'<td>réponse</td>'+
			'</tr>';
		for (ref in historique) {
			key=historique[ref];
			tableau += 
			'<tr>'+
			'<td>'+bs.jeux['otaku_adventure'].liste_questions[key].categorie+'</td>'+
			'<td>'+bs.jeux['otaku_adventure'].liste_questions[key].difficultee+'</td>'+
			'<td>'+bs.jeux['otaku_adventure'].liste_questions[key].type+'</td>'+
			'<td>'+bs.jeux['otaku_adventure'].liste_questions[key].serie+'</td>'+
			'<td>'+bs.jeux['otaku_adventure'].liste_questions[key].question+'</td>'+
			'<td>'+bs.jeux['otaku_adventure'].liste_questions[key].reponse+'</td>'+
			'</tr>';
		}
		tableau += '</table>';
		document.getElementById('otaku_adventure_content_id').innerHTML=tableau;
	},
	
	dndHandler : {
		draggedElement: null, // Propriété pointant vers l'élément en cours de déplacement
		
		applyDragEvents: function(element) {
			element.draggable = true;
			var dndHandler = this; // Cette variable est nécessaire pour que l'événement « dragstart » ci-dessous accède facilement au namespace « dndHandler »
			element.addEventListener('dragstart', function(e) {
				//e.target.focus();
				//document.getElementById("someObject").blur();
				dndHandler.draggedElement = e.target; // On sauvegarde l'élément en cours de déplacement
				e.dataTransfer.setData('text/plain', ''); // Nécessaire pour Firefox
			}, false);
			
		},

		applyDropEvents: function(dropper) {
			dropper.addEventListener('dragover', function(e) {
				if(dndHandler.draggedElement) {
					e.preventDefault(); // On autorise le drop d'éléments
					this.classList.add("drop_hover"); // Et on applique le style adéquat à notre zone de drop quand un élément la survole
				}
			}, false);
			dropper.addEventListener('dragleave', function() {
				this.classList.remove("drop_hover"); // On revient au style de base lorsque l'élément quitte la zone de drop
			});
			var dndHandler = this; // Cette variable est nécessaire pour que l'événement « drop » ci-dessous accède facilement au namespace « dndHandler »
			dropper.addEventListener('drop', function(e) {
			
				var target = e.target,
					draggedElement = dndHandler.draggedElement, // Récupération de l'élément concerné
					clonedElement = draggedElement.cloneNode(true); // On créé immédiatement le clone de cet élément
				this.classList.remove("drop_hover");
				
				
				
				bs.jeux['otaku_adventure'].pions_update(draggedElement.id,target.id);
				
				
				//while (target.className.indexOf('dropper') == -1) { // Cette boucle permet de remonter jusqu'à la zone de drop parente
				//	target = target.parentNode;
				//}
				//target.className = 'dropper'; // Application du style par défaut
				clonedElement = target.appendChild(clonedElement); // Ajout de l'élément cloné à la zone de drop actuelle
				dndHandler.applyDragEvents(clonedElement); // Nouvelle application des événements qui ont été perdus lors du cloneNode()
				draggedElement.parentNode.removeChild(draggedElement); // Suppression de l'élément d'origine
				dndHandler.draggedElement = null;
			});
		}
	}
};bs.jeux['otaku_adventure'].start();