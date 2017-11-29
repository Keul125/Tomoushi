bs.jeux['blind_test'] = {
	
	liste_version:'',
	liste_lieux:[],
	liste_objets:[],
	liste_distances:[],
	sauvegarde:[],
	etat_equipes:[],

	disp_aide: function() {
		var out='';
		out+='<h1>Blind tests</h1>Contenu de l\'aide';
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
		'<div id="blind_test_content_id" class="whitebg"></div>';
		
		//chargement de la configuration
		bs.load_file('./blind_test/configuration.js');
	},
	
	//les questions sont chargés
	load_configuration:function(version,lieux,objets,distances) {
		bs.jeux['blind_test'].liste_version=version;
		bs.jeux['blind_test'].liste_lieux=lieux;
		bs.jeux['blind_test'].liste_objets=objets;
		bs.jeux['blind_test'].liste_distances=distances;
		bs.jeux['blind_test'].menu();
	},
	
	//on charge le menu
	menu: function() {
		document.getElementById('blind_test_content_id').innerHTML=
		'<h2>Préparatifs :</h2><ul>'+
		'<li>Staff : 1 maitre de jeu </span></li>'+
		'<li>Materiel : Plateau, cartes, le PC/tablette</span></li>'+
		'</ul>'+
		
		'<h2>Règles :</h2><ul>'+
		'<p>Faites du commerce!</p>'+
		''+
		((bs.verifier('blind_test','partie'))?
		'<p><span class="bouton" onclick="bs.jeux[\'blind_test\'].reprendre_partie();">Reprendre la partie précédente</span></p>':'')+
		'<p><span class="bouton" onclick="bs.jeux[\'blind_test\'].nouvelle_partie();">Démarrer une nouvelle partie</span></p>';
	},
	
	
	
	//nouvelle partie
	nouvelle_partie: function() {
	
		bs.jeux['blind_test'].dist_villes(2,3);
		

		document.getElementById('blind_test_content_id').innerHTML=
		'<h2>Nommer les équipes :</h2><ul id="swel_content_id_liste_equipes_inputs">'+
		'<li><span class="input_tirer_question bouton_tirer_questioT" style="background:#00FFFF">Equipe 1: <input type="text"></span></li>'+
		'</ul>'+
		'<p><span class="bouton" onclick="bs.jeux[\'blind_test\'].lancer_partie();">Ok</span></p>'


	

	bs.sauver('blind_test','partie','');
		bs.jeux['blind_test'].reprendre_partie();
	},
		
	//reprendre partie
	reprendre_partie: function() {
		bs.charger('blind_test','partie');
		//bs.jeux['blind_test'].afficher_liste_questions();
	},
	
	
	

	
};bs.jeux['blind_test'].start();