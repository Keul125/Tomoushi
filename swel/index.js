bs.jeux['swel'] = {
	
	liste_version:'',
	liste_lieux:[],
	liste_objets:[],
	liste_distances:[],
	sauvegarde:[],
	etat_equipes:[],

	disp_aide: function() {
		var out='';
		out+='<h1>SpiceAndWolf Epices et Louve</h1>Contenu de l\'aide';
		return out;
	},
	
	
	//on charge l'interface et lance le chargement des questions
	start: function() {
		
		if(bs.mode_affichage=='videoproj') {
			// if(!bs.open_popup('Otaku Adventure')) {
				// bs.disp_liste_jeux();
				// return;
			// }
		}
		
		//chargement du contenu
		document.getElementById('content_id').innerHTML=
		'<div id="swel_content_id" class="whitebg"></div>';
		
		//chargement de la configuration
		bs.load_file('./swel/configuration.js');
		if(!loaded) { // n'a pas été chargé car déjà inclus depuis un moment
			bs.jeux['swel'].menu();
		}
		
	},
	
	//les questions sont chargés
	load_configuration:function(version,lieux,objets,distances) {
		bs.jeux['swel'].liste_version=version;
		bs.jeux['swel'].liste_lieux=lieux;
		bs.jeux['swel'].liste_objets=objets;
		bs.jeux['swel'].liste_distances=distances;
		bs.jeux['swel'].menu();
	},
	
	//on charge le menu
	menu: function() {
		document.getElementById('swel_content_id').innerHTML=
		'<h2>Préparatifs :</h2><ul>'+
		'<li>Staff : 1 maitre de jeu </span></li>'+
		'<li>Materiel : Plateau, cartes, le PC/tablette</span></li>'+
		'</ul>'+
		
		'<h2>Règles :</h2><ul>'+
		'<p>Faites du commerce!</p>'+
		''+
		((bs.verifier('swel','partie'))?
		'<p><span class="bouton" onclick="bs.jeux[\'swel\'].reprendre_partie();">Reprendre la partie précédente</span></p>':'')+
		'<p><span class="bouton" onclick="bs.jeux[\'swel\'].nouvelle_partie();">Démarrer une nouvelle partie</span></p>';
	},
	
	
	
	//nouvelle partie
	nouvelle_partie: function() {
	
		bs.jeux['swel'].dist_villes(2,3);
		

		document.getElementById('swel_content_id').innerHTML=
		'<h2>Nommer les équipes :</h2><ul id="swel_content_id_liste_equipes_inputs">'+
		'<li><span class="input_tirer_question bouton_tirer_questioT" style="background:#00FFFF">Equipe 1: <input type="text"></span></li>'+
		'<li><span class="input_tirer_question bouton_tirer_questioT" style="background:#00CC00">Equipe 2: <input type="text"></span></li>'+
		'<li><span class="input_tirer_question bouton_tirer_questioT" style="background:#cccc00">Equipe 3: <input type="text"></span></li>'+
		'<li><span class="input_tirer_question bouton_tirer_questioT" style="background:#FF00FF">Equipe 4: <input type="text"></span></li>'+
		'<li><span class="input_tirer_question bouton_tirer_questioT" style="background:#ff8800">Equipe 5: <input type="text"></span></li>'+
		'<li><span class="input_tirer_question bouton_tirer_questioT" style="background:#FF8888">Equipe 6: <input type="text"></span></li>'+
		'<li><span class="input_tirer_question bouton_tirer_questioT" style="background:#884400">Equipe 7: <input type="text"></span></li>'+
		'</ul>'+
		'<p><span class="bouton" onclick="bs.jeux[\'swel\'].lancer_partie();">Ok</span></p>'


	

	bs.sauver('swel','partie','');
		bs.jeux['swel'].reprendre_partie();
	},
		
	//reprendre partie
	reprendre_partie: function() {
		bs.charger('swel','partie');
		bs.jeux['swel'].afficher_liste_questions();
	},
	
	
	
	
	
	dist_villes:  function(a, b) {
	
		lieux=bs.jeux['swel'].liste_lieux;
		distances=bs.jeux['swel'].liste_distances;
		distances2=[];
		lieux_a_calculer=[];
		lieux_poids=[];
		
		//gestion du sens contraire pour les distances
		for (key in distances) {
			distances2.push([distances[key][0],distances[key][1],distances[key][2]]);
			distances2.push([distances[key][1],distances[key][0],distances[key][2]]);
		}
		
		
		// METHODE INDEX

		//liste des villes à calculer
		for (key in lieux) {
			lieux_a_calculer.push(lieux[key][0]);
		}
		
		//initialisation de la première ville
		lieux_poids[a]=0;
		
		
		out='lieux_a_calculer:'+ "\n";
		for (key in lieux_a_calculer) {
			out+= key + ' => ' + lieux_a_calculer[key] + "\n";
		}
		alert(out)
		out='lieux_poids:'+ "\n";
		for (key in lieux_poids) {
			out+= key + ' => ' + lieux_poids[key] + "\n";
		}
		alert(out)
		
		//on maintiens une liste de lieux à calculer
		i=0;
		while (lieux_a_calculer.length > 0 && i<100) { ++i;
			for (lk in lieux_a_calculer) {
				var lieu_actuel=lieux_a_calculer[lk];
				//si un des lieux à calculer à un poids défini, on défini ses cibles
				if (lieu_actuel in lieux_poids) {
					alert(lieu_actuel);
					
					for (dk in distances2) {
						if(distances2[dk][0] == lieux_a_calculer[lk]) {
							dest=distances2[dk][1];
							dist=distances2[dk][2];
							
							
							//on regarde si la destination a un poids
							if(dest in lieux_poids) {
								lieux_poids[dest];
								
								
							//la destination n'a pas de poids
							} else {
								lieux_poids[dest]=dist;
								if(lieux_a_calculer.indexOf(dist) == -1) {
									lieux_a_calculer.push(dist);
								}
								
								
								
							}
							
							
							i=999;
							
						}
					}
				}
			}
		}
		
		//lieux_a_calculer.splice(lieux_a_calculer.indexOf(a),1);
		
		
		out='lieux_a_calculer:'+ "\n";
		for (key in lieux_a_calculer) {
			out+= key + ' => ' + lieux_a_calculer[key] + "\n";
		}
		alert(out)
		out='lieux_poids:'+ "\n";
		for (key in lieux_poids) {
			out+= key + ' => ' + lieux_poids[key] + "\n";
		}
		alert(out)
		
		
		// METHODE NO INDEX
		/*
		
		//liste des villes à calculer
		for (key in lieux) {
			lieux_a_calculer.push(lieux[key][0]);
		}
		
		//initialisation de la première ville
		lieux_poids.push([a,0]);
		for (key in lieux_a_calculer) {
			if(lieux_a_calculer[key]==a)
				//lieux_a_calculer.splice(key);
		}
		
		i=0;
		while (lieux_a_calculer.length > 0 && i<100) { ++i;
			for (key in lieux_a_calculer) {
				//id d'une ville à calculer
				id_ville=lieux_a_calculer[key];
			
				for (key in lieux_a_calculer) {
					//si son poids existe
					if(lieux_a_calculer[key]==id_ville) {
					
						//on calcule le poids à toutes les villes connectées
					
					
					}
				}
			}
		}
		
		out='';
		for (key in lieux_poids) {
			out+= lieux_poids[key][0] + ' => ' + lieux_poids[key][1] + "\n";
		}
		alert(out)
		
		*/
		
		//retourner le poids de la ville b
		
		return ' ';
	},
	
	
	
	
	
	set_etat_diff: function (element) {
		bs.jeux['swel'].etat_difficultee[element.id]=element.checked;
	},
	set_type_questions: function (element) {
		bs.jeux['swel'].type_questions[element.id]=element.checked;
	},
	//affiche les différents type de questions qu'on peux tirer
	afficher_liste_equipes: function() {
		pop='';		
		if(bs.mode_affichage=='videoproj') 
		bs.public_popup.document.getElementById('publicoppup_id').innerHTML=pop;

		
		out='<strong>Difficultée</strong> : ';
		for (key in bs.jeux['swel'].liste_difficultee) {
			var currdif='diff_'+bs.jeux['swel'].liste_difficultee[key];
		
			if(bs.jeux['swel'].etat_difficultee[currdif]==false) {
				out+=
				'<input type="checkbox" id="'+currdif+'" value="1"'+
				'onclick="bs.jeux[\'swel\'].set_etat_diff(this);">'+
				bs.jeux['swel'].liste_difficultee[key]+
				' ';
			} else {
				out+=
				'<input type="checkbox" id="'+currdif+'" value="1" checked="checked"'+
				'onclick="bs.jeux[\'swel\'].set_etat_diff(this);">'+
				bs.jeux['swel'].liste_difficultee[key]+
				' ';
			}
		}
		out+='<br><strong>Type</strong> : ';
		if(bs.jeux['swel'].type_questions['type_quizz']==false) {
			out+='<input type="checkbox" id="type_quizz" value="1"'+
			'onclick="bs.jeux[\'swel\'].set_type_questions(this);">Questions ';
		} else {
			out+='<input type="checkbox" id="type_quizz" value="1" checked="checked"'+
			'onclick="bs.jeux[\'swel\'].set_type_questions(this);">Questions ';
		}
		if(bs.jeux['swel'].type_questions['type_mime']==false) {
			out+='<input type="checkbox" id="type_mime" value="1"'+
			'onclick="bs.jeux[\'swel\'].set_type_questions(this);">Mime ';
		} else {
			out+='<input type="checkbox" id="type_mime" value="1" checked="checked"'+
			'onclick="bs.jeux[\'swel\'].set_type_questions(this);">Mime ';
		}
		if(bs.jeux['swel'].type_questions['type_musique']==false) {
			out+='<input type="checkbox" id="type_musique" value="1"'+
			'onclick="bs.jeux[\'swel\'].set_type_questions(this);">Musique ';
		} else {
			out+='<input type="checkbox" id="type_musique" value="1" checked="checked"'+
			'onclick="bs.jeux[\'swel\'].set_type_questions(this);">Musique ';
		}
			

		out+='<br>Tirer une queston de catégorie : <ul>';
		for (key in bs.jeux['swel'].liste_categories) {
			out+='<li><span style="background:'+bs.jeux['swel'].liste_categories[key].couleur+'" class="input_tirer_question bouton_tirer_questioT" onclick="bs.jeux[\'swel\'].tirer_question('+key+');">'+
			bs.jeux['swel'].liste_categories[key].bouton+
			'</span></span></li>';
		}
		
		
		out+='</ul><p><span class="bouton" onclick="bs.jeux[\'swel\'].afficher_historique_questions();">Historique</span></p>';
		document.getElementById('swel_content_id').innerHTML=out;
	},
	
	
	tirer_question: function(type) {
		//on liste les questions
		var historique=bs.jeux['swel'].sauvegarde['historique'].split(',');
		var listquestions=new Array();
		for (key in bs.jeux['swel'].liste_questions) {
			
			if(
				bs.jeux['swel'].liste_questions[key].categorie==bs.jeux['swel'].liste_categories[type].cat //dans la bonne catégorie
				&& 
				(
					( bs.jeux['swel'].liste_questions[key].type=='Musique' && document.getElementById('type_musique').checked ) //type Musique
					|| ( bs.jeux['swel'].liste_questions[key].type=='Quizz' && document.getElementById('type_quizz').checked ) //type Quizz
					|| ( bs.jeux['swel'].liste_questions[key].type=='Mime' && document.getElementById('type_mime').checked ) //type Mime
				)
				&& document.getElementById('diff_'+bs.jeux['swel'].liste_questions[key].difficultee)
				&& document.getElementById('diff_'+bs.jeux['swel'].liste_questions[key].difficultee).checked //dans le niveau de difficultée sélectionné 
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
		bs.sauver('swel','historique',historique);
						
		//affichage de la question de type quizz
		if(bs.jeux['swel'].liste_questions[selectedquestion].type=='Quizz') {
		
			pop='<div class="questpub"><h1 class="intitule_question">Quizz</h1>';		
			pop+='<h3>'+bs.jeux['swel'].liste_categories[type].titre+'</h3>';		
			pop+='<h2 class="intitule_question">Série</h2><h3>'+bs.jeux['swel'].liste_questions[selectedquestion].serie+'</h3>';		
			pop+='<h2 class="intitule_question">Question</h2><h3>'+bs.jeux['swel'].liste_questions[selectedquestion].question+'</h3></div>';		
			out='<p><span class="bouton" onclick="bs.jeux[\'swel\'].afficher_liste_questions();">Retour à la liste</span></p>';
			out+='<h2>- Quizz - </h2>Difficultée<h2>'+bs.jeux['swel'].liste_questions[selectedquestion].difficultee+'</h2>';			
			out+='Série<h2>'+bs.jeux['swel'].liste_questions[selectedquestion].serie+'</h2>';			
			out+='Question<h2>'+bs.jeux['swel'].liste_questions[selectedquestion].question+'</h2>';	

			if(bs.mode_affichage=='videoproj') {
				bs.public_popup.document.getElementById('publicoppup_id').innerHTML=pop;
				out+='Réponse<h2>'+bs.jeux['swel'].liste_questions[selectedquestion].reponse+'</h2>';	
			}
			
			if(bs.mode_affichage=='tablette') {
				out+='Réponse';
				out+='<h2><span class="bouton" onclick="document.getElementById(\'reponse_disp_id\').style.display=\'\'">Afficher</span> ';
				out+='<span class="bouton" onclick="document.getElementById(\'reponse_disp_id\').style.display=\'none\'">Masquer</span></h2>';
				out+='<h2 style="display:none;" id="reponse_disp_id">'+bs.jeux['swel'].liste_questions[selectedquestion].reponse+'</h2>';	
			
			}
				
		}
		
		//affichage de la question de type musique
		if(bs.jeux['swel'].liste_questions[selectedquestion].type=='Musique') {

			pop='<div class="questpub"><h1>Musique</h1>';		
			pop+='<h3>'+bs.jeux['swel'].liste_categories[type].titre+'</h3>';		
			pop+='<h2>Devinez de quelle série provient la musique</h2></div>';		
			if(bs.mode_affichage=='videoproj') 
				bs.public_popup.document.getElementById('publicoppup_id').innerHTML=pop;


			out='<p><span class="bouton" onclick="bs.jeux[\'swel\'].afficher_liste_questions();">Retour à la liste</span></p>';
			out+='<h2>- Musique - </h2><h2>Difficultée</h2>'+bs.jeux['swel'].liste_questions[selectedquestion].difficultee;		
			

			if(bs.mode_affichage=='videoproj') {
				out+='<h2>Musique</h2>'+bs.jeux['swel'].liste_questions[selectedquestion].question+'</h3>';	
				out+='<h2>Série</h2>'+bs.jeux['swel'].liste_questions[selectedquestion].serie+'</h3>';
				out+='<h2>Fichier</h2>'+bs.jeux['swel'].liste_questions[selectedquestion].reponse;		
			}
			if(bs.mode_affichage=='tablette') {
				out+='<h2><span class="bouton" onclick="document.getElementById(\'reponse_disp_id\').style.display=\'\'">Afficher</span>';
				out+='<span class="bouton" onclick="document.getElementById(\'reponse_disp_id\').style.display=\'none\'">Masquer</span></h2>';
				out+='<span style="display:none;" id="reponse_disp_id"><h2>Musique</h2>'+bs.jeux['swel'].liste_questions[selectedquestion].question+'</h3>';	
				out+='<h2>Série</h2>'+bs.jeux['swel'].liste_questions[selectedquestion].serie+'</h3>';	
				out+='<h2>Fichier</h2>'+bs.jeux['swel'].liste_questions[selectedquestion].reponse+'</span>';		
			}
				
			out+='<h2>Lecteur</h2><audio controls src="'+
						bs.jeux['swel'].music_path+bs.jeux['swel'].liste_questions[selectedquestion].reponse+'"></audio>';	
			
		}
		
		//affichage de la question de type mime
		if(bs.jeux['swel'].liste_questions[selectedquestion].type=='Mime') {
				
			pop='<div class="questpub"><h1>Mime</h1>';		
			pop+='<h3>'+bs.jeux['swel'].liste_categories[type].titre+'</h3>';		
			pop+='<h2>Devinez de quelle série il s\'agit</h2></div>';		
			if(bs.mode_affichage=='videoproj') 
				bs.public_popup.document.getElementById('publicoppup_id').innerHTML=pop;

			
			
			
			out='<p><span class="bouton" onclick="bs.jeux[\'swel\'].afficher_liste_questions();">Retour à la liste</span></p>';
			out+='<h2>- Mime - </h2><h2>Difficultée</h2>'+bs.jeux['swel'].liste_questions[selectedquestion].difficultee;		
			if(bs.mode_affichage=='videoproj') {
				out+='<h2>Série</h2>'+bs.jeux['swel'].liste_questions[selectedquestion].serie;		
				out+='<h2>Mime</h2>'+bs.jeux['swel'].liste_questions[selectedquestion].question;		
			}
			if(bs.mode_affichage=='tablette') {
				out+='Musique';
				out+='<h2><span class="bouton" onclick="document.getElementById(\'reponse_disp_id\').style.display=\'\'">Afficher</span>';
				out+='<span class="bouton" onclick="document.getElementById(\'reponse_disp_id\').style.display=\'none\'">Masquer</span></h2>';
				out+='<span style="display:none;" id="reponse_disp_id"><h2>Série</h2>'+bs.jeux['swel'].liste_questions[selectedquestion].serie;		
				out+='<h2>Mime</h2>'+bs.jeux['swel'].liste_questions[selectedquestion].question+'</span>';	
			}
			
					
		}
		document.getElementById('swel_content_id').innerHTML=out;		
	},
	
	//affichage de l'historique
	afficher_historique_questions: function() {
		historique=bs.jeux['swel'].sauvegarde['historique'];
		historique=historique.substring(1).split(',').reverse();
		
		var tableau='<span class="bouton" onclick="bs.jeux[\'swel\'].afficher_liste_questions();">Retour à la partie précédente...</span>'+
			'<h1>Historique</h1>(dernières questions affichées en premier)'+
			'<table border="1" id="swel_questions_id">'+
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
			'<td>'+bs.jeux['swel'].liste_questions[key].categorie+'</td>'+
			'<td>'+bs.jeux['swel'].liste_questions[key].difficultee+'</td>'+
			'<td>'+bs.jeux['swel'].liste_questions[key].type+'</td>'+
			'<td>'+bs.jeux['swel'].liste_questions[key].serie+'</td>'+
			'<td>'+bs.jeux['swel'].liste_questions[key].question+'</td>'+
			'<td>'+bs.jeux['swel'].liste_questions[key].reponse+'</td>'+
			'</tr>';
		}
		tableau += '</table>';
		document.getElementById('swel_content_id').innerHTML=tableau;
	},
	

	
};bs.jeux['swel'].start();