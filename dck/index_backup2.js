bs.jeux['dck'] = {
	
	version:'',
	num_cols:10,
	num_rows:10,
	nb_equipes:4,
	nb_bateaux_par_equipe:10,
	configure_curr_equipe:0,
	configure_curr_boat:0,
	board:[],
	status:[],
	d_canvas:false,
	d_context:false,
	d_canvas_p:false,
	d_context_p:false,
	d_started:false,
	d_tmpx:false,
	d_tmpy:false,
	d_color:"#333333",
	sauvegarde:[],
	d_size:2,
	cell_width:56,
	couleurs_equipe:['','bleu','vert','brun','rouge'],

	disp_aide: function() {
		var out='';
		out+='<h1>Dessinez c\'est Kancolle</h1>Contenu de l\'aide';
		return out;
	},
	
	//on charge l'interface et lance le chargement des questions
	start: function() {
		
		if(bs.mode_affichage=='videoproj') {
			if(!bs.open_popup('Dessiner c\'est Kancolle')) {
				bs.disp_liste_jeux();
				return;
			}
		}
		
		//chargement du contenu
		document.getElementById('content_id').innerHTML=
		'<div id="dck_content_id" class="whitebg"></div>';
		
		//chargement de la configuration
		loaded=bs.load_file('./dck/configuration.js');
		if(!loaded) { // n'a pas été chargé car déjà inclus depuis un moment
			this.menu();
		}
		
	},
	
	
	//les questions sont chargés
	load_configuration:function(version,lieux,objets,distances) {
		this.version=version;
		this.menu();
	},
	
	etalonnage:function() {
		if(bs.public_popup.document.getElementById('dck_p_board_id')) {
			
			outp='<div class="bouton_tirer_question" style="position:absolute;left:15px;bottom:15px;background:#880000;color:white;padding:10px;font-size:1.8em" >Dessiner, c’est Kancolle!</div>'+
			'<img src="./dck/image2.png" style="position:absolute;right:15px;bottom:15px;width:200px">';
			
			bs.public_popup.document.getElementsByTagName('body')[0].style.backgroundImage="url('./dck/image1.jpg')";
			bs.public_popup.document.getElementsByTagName('body')[0].innerHTML=outp;
		
		} else {
			bs.public_popup.document.getElementsByTagName('body')[0].style.backgroundImage="none";
			var outp='<div id="dck_p_board_id"></div><div id="dck_p_status_id" style="position:absolute;top:5px;right:5px;"></div>';
			bs.public_popup.document.getElementsByTagName('body')[0].innerHTML=outp;
			this.plateau_public_play();
			this.disp_status();
		}
	},
	//on charge le menu
	menu: function() {
		
		this.configure_curr_equipe=1;
		this.configure_curr_boat=1;
		for(var i=1;i<=this.num_rows;++i) {
			this.board[i]=[];
			for(var j=0;j<=this.num_cols;++j) {
				this.board[i][j]=[0,[]];
			}
		}
		
		outp='<div class="bouton_tirer_question" style="position:absolute;left:15px;bottom:15px;background:#880000;color:white;padding:10px;font-size:1.8em" >Dessiner, c’est Kancolle!</div>'+
		'<img src="./dck/image2.png" style="position:absolute;right:15px;bottom:15px;width:200px">';
		
		
		
		
		outb='<h2>Préparatifs :</h2><ul><li>Staff : 1 au PC, 1 au micro, des graphistes pour dessiner sur leurs tableau à afficher ou via une tablette graphique</li><li>Materiel : PC, videoproj, une feuille par équipe donnant la position de leurs bateaux, et ouvrir le dossier contenant les images à dessiner par les graphistes.</li></ul>'
		outb+='<h2>Configuration :</h2>';
		
		outb+='<h2><span class="bouton" onclick="bs.jeux[\'dck\'].etalonnage();">Étalonner</span></h2><p>F11 pour mettre le popup en plein écran<br>CTRL "-" et CTRL "+" (touche 6 et = sur un clavier azerty) ou CTRL molette de souris pour changer le zoom.</p>';
		
		
		outb+='Nombre d\'équipes:<select onchange="bs.jeux[\'dck\'].change_conf_nb_equipes(this.value);"><option value="2">2</option><option value="3">3</option><option value="4" selected="selected">4</option></select><br>';
		outb+='Nombre de bateaux par équipes (de 1 à 100): <input onchange="bs.jeux[\'dck\'].change_conf_nb_bateaux_par_equipe(this.value);" value="10"/><br>';
		
		
		
		outb+='<h2><span class="bouton" onclick="bs.jeux[\'dck\'].intro2();">Afficher les regles et placer les bateaux</span></h2>';
		
		outb+='<h2><span class="bouton" onclick="bs.jeux[\'dck\'].chargerpartieprec();">Charger la partie précédente</span></h2>';
		
		
		
		bs.public_popup.document.getElementsByTagName('body')[0].style.backgroundImage="url('./dck/image1.jpg')";
		bs.public_popup.document.getElementsByTagName('body')[0].innerHTML=outp;
		
		document.getElementById('dck_content_id').innerHTML=outb;
		
		
		//bs.public_popup.document.getElementById('clicable_id').addEventListener("click", bs.jeux['dck'].intro2, false);
		
		
	},
	change_conf_nb_equipes: function(val) {
		bs.jeux['dck'].nb_equipes=val;
	},
	change_conf_nb_bateaux_par_equipe: function(val) {
		bs.jeux['dck'].nb_bateaux_par_equipe=val;
	},
	intro2: function() {
	
		
		// 0 = vide
		// 1 = vide tiré
		// 2 = bateau
		// 3 = bateau coulé
		// 4 = bateau multi
		// 5 = bateau multi coulé
		// 6 = vide torpille
		// 7 = bateau torpille
		// 8 = bateau multi toprille
		
		var outp='<h2>Dessiner, c’est Kancolle!</h2>'+
		
		'<ul>'+
		'<li>Ce jeu se joue à '+bs.jeux['dck'].nb_equipes+' équipes et avec un maximum de 4 joueurs par équipes.</li>'+
		'<li>Chaque équipe possède '+bs.jeux['dck'].nb_bateaux_par_equipe+' navires qu’elle devront positionner dans le tableau selon leur choix avant le début sur une feuille qui leur seront fournis.</li>'+
		'<li>L\'équipe qui devine en premier le personnages d’animes/manga/jeu-vidéo dessiné pourra indiqué une case à torpiller.</li>'+
		'<li>La dernière équipe à survivre ou celle qui a le plus de navires dans le temps réglementaire gagne.</li>'+
		'<li>Chaque équipe sera représentée par un de ces personnages:</li>'+
		'</ul>'+
		
		
		'<table style="position:absolute;left:15px;right:15px;bottom:15px;width:200px"><tr>'+
		'<td></td>'+
		'<img src="./dck/image3.png" style="width:150px">'+
		'<img src="./dck/image4.png" style="width:150px">'+
		'<img src="./dck/image5.png" style="width:150px">'+
		'<img src="./dck/image6.png" style="width:150px">'+
		'</tr></table>';
		
		
		bs.public_popup.document.getElementsByTagName('body')[0].style.backgroundImage="none";
		bs.public_popup.document.getElementsByTagName('body')[0].innerHTML=outp;
		
		
		var outb='<div id="dck_btop_text_id">Placer les bateaux de l\'équipe '+this.configure_curr_equipe+' ('+bs.jeux['dck'].couleurs_equipe[this.configure_curr_equipe]+')</div>';
		outb+='<div id="dck_btop_board_id"></div>';
		outb+='<span class="bouton" onclick="bs.jeux[\'dck\'].game_disp();">Lancer la partie</span>';
		
		
		outb+='<input type="button" onclick="bs.jeux[\'dck\'].switchcanvas();" value="dessiner">';
		
		document.getElementById('dck_content_id').innerHTML=outb;
		
		this.plateau_prive_configure();
	},
	
	
	chargerpartieprec: function() {
		
		bs.charger('dck','partie');
		if(bs.jeux['dck'].sauvegarde['partie']) {
			sav=JSON.parse(bs.jeux['dck'].sauvegarde['partie']);
			
			bs.jeux['dck'].num_cols=sav[0];
			bs.jeux['dck'].num_rows=sav[1];
			bs.jeux['dck'].nb_equipes=sav[2];
			bs.jeux['dck'].nb_bateaux_par_equipe=sav[3];
			bs.jeux['dck'].configure_curr_equipe=sav[4];
			bs.jeux['dck'].configure_curr_boat=sav[5];
			bs.jeux['dck'].board=sav[6];
			bs.jeux['dck'].status=sav[7];
			
			
			bs.public_popup.document.getElementsByTagName('body')[0].style.backgroundImage="none";
			bs.public_popup.document.getElementsByTagName('body')[0].innerHTML="";
		
			bs.jeux['dck'].game_disp();
		}
	},
	
	sauverpartie: function() {
		var save=[];
		save[0]=bs.jeux['dck'].num_cols;
		save[1]=bs.jeux['dck'].num_rows;
		save[2]=bs.jeux['dck'].nb_equipes;
		save[3]=bs.jeux['dck'].nb_bateaux_par_equipe;
		save[4]=bs.jeux['dck'].configure_curr_equipe;
		save[5]=bs.jeux['dck'].configure_curr_boat;
		save[6]=bs.jeux['dck'].board;
		save[7]=bs.jeux['dck'].status;
		
		bs.sauver('dck','partie',JSON.stringify(save));
		
	
	
	},
	
	
	
	game_disp: function() {
	
		// var collisions=false;
		// for(var i=1;i<=this.num_rows;++i) {
			// for(var j=1;j<=this.num_cols;++j) {
				// if(this.board[i][j][1].length>1) {
					// collisions=true;
				// }
			// }
		// }
		// if(collisions) {
			// alert('Il y a eu des collisions entre les équipes !'); 
		// }
		
		var outp='<div id="dck_p_board_id"></div><div id="dck_p_status_id" style="position:absolute;top:5px;right:5px;"></div>';
		bs.public_popup.document.getElementsByTagName('body')[0].innerHTML=outp;
		
		var outb ='<div id="dck_b_board_id"></div><div id="dck_b_status_id" style="position:absolute;top:25px;right:25px;"></div>';
		document.getElementById('dck_content_id').innerHTML=outb;
		
		this.plateau_prive_play();
		this.plateau_public_play();
		this.disp_status();
		
		bs.jeux['dck'].sauverpartie();
		
	},	
	
	
	
	plateau_top: function() {
		out='<table style="border-collapse: collapse;;border-spacing: 2px;">';
		var a_code = "A".charCodeAt(0);
		out+='<tr>';
		out+='<td class="dck_topleft"></td>';
		for(var j=0;j<this.num_cols;++j) {
			var dispchar=String.fromCharCode(a_code+j)
			out+='<td class="dck_col_label">'+dispchar+'</td>';
		}
		
		return out;
	},
	
	
	// == Affiche le plateau ==
	plateau_prive_configure: function(i,j) {
		var out = this.plateau_top();
		for(var i=1;i<=this.num_rows;++i) {
			out+='<tr>';
			for(var j=0;j<=this.num_cols;++j) {
				if(j==0) {
					out+='<td class="dck_row_label">'+i+'</td>';
				} else {
					//case inconnue
					var imgcell='???';
					//affiche une case vide
					if(this.board[i][j][0]==0) {
						imgcell='<img src="./dck/image8.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px;">';
					}
					//affiche un bateau
					if(this.board[i][j][0]==2) {
						imgcell='<img src="./dck/image'+(2+this.board[i][j][1][0])+'c.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px;">';
					}
					//affiche un multiple
					if(this.board[i][j][0]==4) {
						imgcell='';
						
						if(this.board[i][j][1].length==2) {
								imgcell+='<img src="./dck/image'+(2+this.board[i][j][1][0])+'c.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px;position:absolute;">';
								if(b==1) imgcell+='<br>';
								imgcell+='<img src="./dck/image'+(2+this.board[i][j][1][1])+'d.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px;position:absolute;">';
								if(b==1) imgcell+='<br>';
						
						} else {
						
							for (var b=0;b<this.board[i][j][1].length;++b) {
								imgcell+='<img src="./dck/image'+(2+this.board[i][j][1][b])+'c.png" style="vertical-align: bottom;width:'+(this.cell_width/2)+'px;">';
								if(b==1) imgcell+='<br>';
								
							}
						}
					}
					out+='<td title="'+i+':'+j+'" onclick="bs.jeux[\'dck\'].configure_add_boat('+i+','+j+');" id="priv_conf_cell_'+i+'_'+j+'_id">'+imgcell+'</td>';
				}
			}
			out+='</tr>';
		}
		out+='</table>';
		document.getElementById('dck_btop_board_id').innerHTML=out;
	},
	// == Ajoute un bateau sur le plateau ==
	configure_add_boat: function(i,j) {
		//tant que toutes les équipes n'ont pas ajouté un bateau
		if(this.configure_curr_equipe<=this.nb_equipes) {
		
			//on essaye de placer le bateau
			if(this.board[i][j][1].indexOf(this.configure_curr_equipe)!=-1) {
				alert('Un bateau de la même équipe est déjà présent sur cette case.');
			} else {
		
				//ajout du bateau
				if(this.board[i][j][0]==2 || this.board[i][j][0]==4) {
					this.board[i][j][0]=4;
				} else {
					this.board[i][j][0]=2;
				}
				this.board[i][j][1].push(this.configure_curr_equipe);
				
				//si le suivant est a la prochaine équipe, on place le dernier bateau et on passe à l'équipe suivante
				if(this.configure_curr_boat==this.nb_bateaux_par_equipe) {
					this.configure_curr_boat=1;
					++this.configure_curr_equipe;
					if(this.configure_curr_equipe<=this.nb_equipes) {
						document.getElementById('dck_btop_text_id').innerHTML='Placer les bateaux de l\'équipe '+this.configure_curr_equipe+' ('+bs.jeux['dck'].couleurs_equipe[this.configure_curr_equipe]+')';
					} else {
						document.getElementById('dck_btop_text_id').innerHTML='Tous les bateaux sont positionnés';
					}
					
				//sinon, on passe au bateau suivant de l'équipe en cours
				} else {
					++this.configure_curr_boat;
				}
				
				//MAJ de l'affichage du plateau
				this.plateau_prive_configure();
			}
		} 
	},
	
	
	
	disp_status: function() {
		for(var i=1;i<=this.nb_equipes;++i) {
			this.status[i]=0;
		}
		
		
		for(var i=1;i<=this.num_rows;++i) {
			for(var j=1;j<=this.num_cols;++j) {
				if(this.board[i][j][0]==2) {
					var equipenum=this.board[i][j][1][0];
					++this.status[equipenum];
				}
				if(this.board[i][j][0]==4) {
					for (var b=0;b<this.board[i][j][1].length;++b) {
						var equipenum=this.board[i][j][1][b];
						++this.status[equipenum];
					}
				}
			}
		}
		var out=''
		for(var i=1;i<=this.nb_equipes;++i) {
			out+='<img src="./dck/image'+(2+i)+'b.png" style="width:100px;"> <span style="font-size:3em;">'+this.status[i]+'</span><br><br>';
		}
		
		if(bs.public_popup.document.getElementById('dck_p_status_id')) {
			bs.public_popup.document.getElementById('dck_p_status_id').innerHTML=out;
		}	
			
		if(document.getElementById('dck_b_status_id')) {
			document.getElementById('dck_b_status_id').innerHTML=out;
		}
	},
	
	//console.log(xxxxxxxxx.toSource());
	fire: function(i,j) {
		
		
		switch(this.board[i][j][0]) {
			case 0:
				this.board[i][j][0]=6; //torpille posé sur case vide
				break;
			case 1:
				alert('vous tirez dans une case vide');
				break;
			case 2:
				this.board[i][j][0]=7; //torpille sur beaetau
				break;
			case 3:
				alert('vous tirez dans un bateau déjà coulé');
				break;
			case 4:
				this.board[i][j][0]=8; //torpille sur plusieursbeaetau
				break;
			case 5:
				alert('vous tirez dans des bateaux déjà coulés');
				break;
			case 6:
				this.board[i][j][0]=1; //plouf
				break;
			case 7:
				this.board[i][j][0]=3; //BOOM
				break;
			case 8:
				this.board[i][j][0]=5; //MEGA BOOM
				break;
		}
		
		this.plateau_prive_play();
		this.plateau_public_play();
		this.disp_status();
		
		bs.jeux['dck'].sauverpartie();
	},
	
	plateau_prive_play: function() {
		var out = this.plateau_top()
		for(var i=1;i<=this.num_rows;++i) {
			out+='<tr>';
			for(var j=0;j<=this.num_cols;++j) {
				if(j==0) {
					out+='<td class="dck_row_label">'+i+'</td>';
				} else {
					//case inconnue
					var imgcell='???';
					//affiche une case vide
					if(this.board[i][j][0]==0) {
						imgcell='<img src="./dck/image8.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px;">';
					}
					//affiche une case vide tirée
					if(this.board[i][j][0]==1) {
						imgcell='<img src="./dck/image8.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px; opacity: 0.5;">';
					}
					//affiche un bateau
					if(this.board[i][j][0]==2) {
						imgcell='<img src="./dck/image8.png" style="width:'+(this.cell_width)+'px;position:absolute;">';
						imgcell+='<img src="./dck/image'+(2+this.board[i][j][1][0])+'c.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px; opacity: 0.5;">';
					}
					//affiche un bateau coulé
					if(this.board[i][j][0]==3) {
						imgcell='<img src="./dck/image'+(2+this.board[i][j][1][0])+'c.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px;">';
					}
					//affiche un bateau multi
					if(this.board[i][j][0]==4) {
						imgcell='<img src="./dck/image8.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px;position:absolute;">';
						
						
						if(this.board[i][j][1].length==2) {
								imgcell+='<img src="./dck/image'+(2+this.board[i][j][1][0])+'c.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px;position:absolute;opacity: 0.5;">';
								if(b==1) imgcell+='<br>';
								imgcell+='<img src="./dck/image'+(2+this.board[i][j][1][1])+'d.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px;position:absolute;opacity: 0.5;">';
								if(b==1) imgcell+='<br>';
						} else {
						
						
							for (var b=0;b<this.board[i][j][1].length;++b) {
								imgcell+='<img src="./dck/image'+(2+this.board[i][j][1][b])+'c.png" style="vertical-align: bottom;width:'+(this.cell_width/2)+'px;opacity: 0.5;">';
								if(b==1) imgcell+='<br>';
							}
						
						}
					}
					//affiche un bateau multi coulé
					if(this.board[i][j][0]==5) {
						imgcell='';
						if(this.board[i][j][1].length==2) {
								imgcell+='<img src="./dck/image'+(2+this.board[i][j][1][0])+'c.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px;position:absolute;">';
								if(b==1) imgcell+='<br>';
								imgcell+='<img src="./dck/image'+(2+this.board[i][j][1][1])+'d.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px;position:absolute;">';
								if(b==1) imgcell+='<br>';
						} else {
							
							for (var b=0;b<this.board[i][j][1].length;++b) {
								imgcell+='<img src="./dck/image'+(2+this.board[i][j][1][b])+'c.png" style="vertical-align: bottom;width:'+(this.cell_width/2)+'px;">';
								if(b==1) imgcell+='<br>';
							}
						}
					}
					
					//vide torpille
					if(this.board[i][j][0]==6) {
						imgcell='<img src="./dck/image8.png" style="width:'+(this.cell_width)+'px;position:absolute;">';
						imgcell+='<img src="./dck/image7.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px; opacity: 0.5;">';
					}
					//affiche un bateau
					if(this.board[i][j][0]==7) {
						imgcell='<img src="./dck/image8.png" style="width:'+(this.cell_width)+'px;position:absolute;">';
						imgcell+='<img src="./dck/image'+(2+this.board[i][j][1][0])+'c.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px; opacity: 0.5;position:absolute;">';
						imgcell+='<img src="./dck/image7.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px; opacity: 0.5;">';
					}
					if(this.board[i][j][0]==8) {
						imgcell='';
						if(this.board[i][j][1].length==2) {
								imgcell+='<img src="./dck/image'+(2+this.board[i][j][1][0])+'c.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px;position:absolute;">';
								if(b==1) imgcell+='<br>';
								imgcell+='<img src="./dck/image'+(2+this.board[i][j][1][1])+'d.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px;position:absolute;">';
								if(b==1) imgcell+='<br>';
						} else {
							
							for (var b=0;b<this.board[i][j][1].length;++b) {
								imgcell+='<img src="./dck/image'+(2+this.board[i][j][1][b])+'c.png" style="vertical-align: bottom;width:'+(this.cell_width/2)+'px;">';
								if(b==1) imgcell+='<br>';
							}
						}
						imgcell+='<img src="./dck/image7.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px; opacity: 0.5;">';
					}
					
					out+='<td title="'+i+':'+j+'" onclick="bs.jeux[\'dck\'].fire('+i+','+j+');" id="prive_play_cell_'+i+'_'+j+'_id">'+imgcell+'</td>';
				}
			}
			out+='</tr>';
		}
		out+='</table>';
		out+='<input type="button" onclick="bs.jeux[\'dck\'].switchcanvas();" value="dessiner">';
		out+='<input type="button" onclick="bs.jeux[\'dck\'].cancelfire();" value="ANNULER TIR">';
		document.getElementById('dck_b_board_id').innerHTML=out;
	},
	
	cancelfire: function() {
		// 0 = vide
		// 1 = vide tiré
		// 2 = bateau
		// 3 = bateau coulé
		// 4 = bateau multi
		// 5 = bateau multi coulé
		// 6 = vide torpille
		// 7 = bateau torpille
		// 8 = bateau multi toprille
	
			for(var i=1;i<=this.num_rows;++i) {
				for(var j=1;j<=this.num_cols;++j) {
					//console.log(this.board[i][j][0]);
					if(this.board[i][j][0]==6) {
						this.board[i][j][0]=0;
					}
					if(this.board[i][j][0]==7) {
						this.board[i][j][0]=2;
					}
					if(this.board[i][j][0]==8) {
						this.board[i][j][0]=4;
					}
				}
			}
		this.plateau_prive_play();
		this.plateau_public_play();
		this.disp_status();
		
		bs.jeux['dck'].sauverpartie();
	},
	
	// http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app
	// http://dev.opera.com/articles/html5-canvas-painting/
	
	switchcanvas: function() {
	
		var outp='<canvas id="canvas_p_id" width="640" height="400" style="border:1px solid red;"></canvas>';
		bs.public_popup.document.getElementsByTagName('body')[0].innerHTML=outp;
	
		var outb='<canvas id="canvas_id" width="640" height="400" style="border:1px solid red;"></canvas><br>';
		outb+='<input type="button" onclick="bs.jeux[\'dck\'].game_disp();" value="retour"> - ';
		outb+='<input type="button" onclick="bs.jeux[\'dck\'].d_style(1,1);" value="1px">';
		outb+='<input type="button" onclick="bs.jeux[\'dck\'].d_style(1,1);" value="1px">';
		outb+='<input type="button" onclick="bs.jeux[\'dck\'].d_style(1,2);" value="2px">';
		outb+='<input type="button" onclick="bs.jeux[\'dck\'].d_style(1,3);" value="3px">';
		outb+='<input type="button" onclick="bs.jeux[\'dck\'].d_style(1,4);" value="4px">';
		outb+='<input type="button" onclick="bs.jeux[\'dck\'].d_style(1,5);" value="5px">';
		outb+='<input type="button" onclick="bs.jeux[\'dck\'].d_style(2,\'black\');" value="noir" style="background-color:black;color:white;">';
		outb+='<input type="button" onclick="bs.jeux[\'dck\'].d_style(2,\'red\');" value="rouge" style="background-color:red;">';
		outb+='<input type="button" onclick="bs.jeux[\'dck\'].d_style(2,\'yellow\');" value="jaune" style="background-color:yellow;">';
		outb+='<input type="button" onclick="bs.jeux[\'dck\'].d_style(2,\'blue\');" value="bleu" style="background-color:blue;">';
		outb+='<input type="button" onclick="bs.jeux[\'dck\'].d_style(2,\'green\');" value="vert" style="background-color:green;">';
		document.getElementById('dck_content_id').innerHTML=outb;
		
		this.d_started=false;
		this.d_canvas = document.getElementById('canvas_id');
		this.d_context= this.d_canvas.getContext("2d");
		
		this.d_canvas_p = bs.public_popup.document.getElementById('canvas_p_id');
		this.d_context_p= this.d_canvas_p.getContext("2d");
		
		
		
		
		if (!this.d_canvas) {
		  alert('Error: I cannot find the canvas element!');return;
		}
		if (!this.d_canvas.getContext) {
		  alert('Error: no canvas.getContext!');return;
		}
			
		if (!this.d_context) {
		  alert('Error: no this.d_context!');return;
		}
			
		
		this.d_canvas.addEventListener('mousedown', this.d_mousedown, false);
		this.d_canvas.addEventListener('mousemove', this.d_mousemove, false);
		this.d_canvas.addEventListener('mouseup',   this.d_mouseup, false);
		this.d_canvas.addEventListener('mouseout',   this.d_mouseup, false);
			
		
		
	
	},
	
	d_style: function(style,val) {
		if(style==1) {
			bs.jeux['dck'].d_size = val;
		}
		if(style==2) {
			bs.jeux['dck'].d_color = val;
		}
	},
	
	d_mousedown: function(ev) {
		ev._x = ev.layerX - bs.jeux['dck'].d_canvas.offsetLeft
		ev._y = ev.layerY - bs.jeux['dck'].d_canvas.offsetTop
		
		bs.jeux['dck'].d_context.strokeStyle = bs.jeux['dck'].d_color;
		bs.jeux['dck'].d_context.lineJoin = "round";
		bs.jeux['dck'].d_context.lineWidth = bs.jeux['dck'].d_size;

		bs.jeux['dck'].d_context_p.strokeStyle = bs.jeux['dck'].d_color;
		bs.jeux['dck'].d_context_p.lineJoin = "round";
		bs.jeux['dck'].d_context_p.lineWidth = bs.jeux['dck'].d_size;

		bs.jeux['dck'].d_tmpx=ev._x;
		bs.jeux['dck'].d_tmpy=ev._y;
		
		
        bs.jeux['dck'].d_started = true;
	},
	d_mousemove: function(ev) {
		//console.log(ev.button)
		
		ev._x = ev.layerX - bs.jeux['dck'].d_canvas.offsetLeft
		ev._y = ev.layerY - bs.jeux['dck'].d_canvas.offsetTop
		
	
		if (bs.jeux['dck'].d_started) {
			
			bs.jeux['dck'].d_context.beginPath();
			bs.jeux['dck'].d_context.moveTo(bs.jeux['dck'].d_tmpx, bs.jeux['dck'].d_tmpy);
			bs.jeux['dck'].d_context.lineTo(ev._x, ev._y);
			bs.jeux['dck'].d_context.closePath();
			bs.jeux['dck'].d_context.stroke();
			
			bs.jeux['dck'].d_context_p.beginPath();
			bs.jeux['dck'].d_context_p.moveTo(bs.jeux['dck'].d_tmpx, bs.jeux['dck'].d_tmpy);
			bs.jeux['dck'].d_context_p.lineTo(ev._x, ev._y);
			bs.jeux['dck'].d_context_p.closePath();
			bs.jeux['dck'].d_context_p.stroke();
			
			
			bs.jeux['dck'].d_tmpx=ev._x;
			bs.jeux['dck'].d_tmpy=ev._y;
			
		}
	},
	d_mouseup: function(ev) {
		if (bs.jeux['dck'].d_started) {
			bs.jeux['dck'].d_started = false;
		}
	},
	
	
	
	
	
	plateau_public_play: function() {
		var out = this.plateau_top()
		for(var i=1;i<=this.num_rows;++i) {
			out+='<tr>';
			for(var j=0;j<=this.num_cols;++j) {
				if(j==0) {
					out+='<td class="dck_row_label">'+i+'</td>';
				} else {
					//case inconnue
					var imgcell='???';
					//affiche une case vide
					if(this.board[i][j][0]==0) {
						imgcell='<img src="./dck/image8.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px;">';
					}
					//affiche une case vide tirée
					if(this.board[i][j][0]==1) {
						imgcell='<img src="./dck/image8.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px; opacity: 0.5;">';
					}
					//affiche un bateau (pas en publique :D)
					if(this.board[i][j][0]==2) {
						imgcell='<img src="./dck/image8.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px;">';
					}
					//affiche un bateau coulé
					if(this.board[i][j][0]==3) {
						imgcell='<img src="./dck/image'+(2+this.board[i][j][1][0])+'c.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px;">';
					}
					//affiche des bateaux (pas en publique :D)
					if(this.board[i][j][0]==4) {
						imgcell='<img src="./dck/image8.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px;">';
					}
					
					//affiche des bateaux coulé
					if(this.board[i][j][0]==5) {
						imgcell='';
						
						
						
						if(this.board[i][j][1].length==2) {
								imgcell+='<img src="./dck/image'+(2+this.board[i][j][1][0])+'c.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px;position:absolute;">';
								if(b==1) imgcell+='<br>';
								imgcell+='<img src="./dck/image'+(2+this.board[i][j][1][1])+'d.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px;position:absolute;">';
								if(b==1) imgcell+='<br>';
						} else {
						
							
							for (var b=0;b<this.board[i][j][1].length;++b) {
								imgcell+='<img src="./dck/image'+(2+this.board[i][j][1][b])+'c.png" style="vertical-align: bottom;width:'+(this.cell_width/2)+'px;">';
								if(b==1) imgcell+='<br>';
								
							}
						
						}
					}
					
					
					// 6 = vide torpille
					if(this.board[i][j][0]==6) {
						imgcell='<img src="./dck/image7.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px;">';
					}
					// 7 = bateau torpille
					if(this.board[i][j][0]==7) {
						imgcell='<img src="./dck/image7.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px;">';
					}
					// 8 = bateau multi toprille
					if(this.board[i][j][0]==8) {
						imgcell='<img src="./dck/image7.png" style="vertical-align: bottom;width:'+(this.cell_width)+'px;">';
					}
					
					
		
					
					
					
					
					out+='<td title="'+i+':'+j+'" id="public_play_cell_'+i+'_'+j+'_id">'+imgcell+'</td>';
				}
			}
			out+='</tr>';
		}
		out+='</table>';
		bs.public_popup.document.getElementById('dck_p_board_id').innerHTML=out;
	},
	
	
	
	
	//nouvelle partie
	nouvelle_partie: function() {
	
		//this.dist_villes(2,3);
		

		// document.getElementById('dck_content_id').innerHTML=
		// '<h2>Nommer les équipes :</h2><ul id="swel_content_id_liste_equipes_inputs">'+
		// '<li><span class="input_tirer_question bouton_tirer_questioT" style="background:#00FFFF">Equipe 1: <input type="text"></span></li>'+
		// '</ul>'+
		// '<p><span class="bouton" onclick="bs.jeux[\'dck\'].lancer_partie();">Ok</span></p>'

		/*
		
		pop='<div class="questpub"><h1>Mime</h1>';		
		pop+='<h3>'+bs.jeux['otaku_adventure'].liste_categories[type].titre+'</h3>';		
		pop+='<h2>Devinez de quelle série il s\'agit</h2></div>';		
		if(bs.mode_affichage=='videoproj') 
			bs.public_popup.document.getElementById('publicoppup_id').innerHTML=pop;
		*/
		
		// document.getElementById('popup_html_id').getElementsByTagName('body')[0].style.background='#880000';
		//document.getElementById('popup_html_id').getElementsByTagName('body')[0].innerHTML='TEST';
		alert(document.getElementById('popup_html_id'))
		
				
		
		// publicoppup_id
		bs.sauver('dck','partie','');
		this.reprendre_partie();
	},
		
	//reprendre partie
	reprendre_partie: function() {
		bs.charger('dck','partie');
		//this.afficher_liste_questions();
	},
	
	
	

	
};bs.jeux['dck'].start();;