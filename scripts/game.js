var width = 640, height=480;

var ship;

var bullets;
var asteroids;

var bulletBmp;
var asteroidBmp;

var gameOver = false;
var gameStarted = false;

var score = 0;
var enginesSound;
var laserSound;

function draw()
{   
	if(!gameStarted)
	{
		textout_centre(canvas,font,"ASTEROIDS",SCREEN_W/2,SCREEN_H/2-50,24,makecol(255,255,255));
		textout_centre(canvas,font,"LPM - shoot"+ score,SCREEN_W/2,SCREEN_H/2,14,makecol(255,255,255));
		textout_centre(canvas,font,"MOUSE - aim",SCREEN_W/2,SCREEN_H/2+20,14,makecol(255,255,255));
		textout_centre(canvas,font,"SPACE - move",SCREEN_W/2,SCREEN_H/2 +40,14,makecol(255,255,255));
		textout_centre(canvas,font,"Press SPACE to start",SCREEN_W/2,SCREEN_H/2 +80,14,makecol(255,255,255));
		
	}else{
		if(!gameOver){
			//draw_sprite(canvas, ship.bmp, ship.x, ship.y);
			bullets.forEach(function (value){
				draw_sprite(canvas, value.bmp, value.x, value.y);
			});
			asteroids.forEach(function (value){
				scaled_sprite(canvas, value.bmp, value.x, value.y, value.scale, value.scale);
			});
			rotate_sprite(canvas,ship.enginesOn?ship.bmpEng:ship.bmp,ship.x,ship.y,DEG(Math.atan2(mouse_y-ship.y,mouse_x-ship.x)));
			textout_centre(canvas,font,"SCORE: "+score,SCREEN_W/2,15,14,makecol(255,255,255));
		} else {
			textout_centre(canvas,font,"GAME OVER",SCREEN_W/2,SCREEN_H/2,24,makecol(255,255,255));
			textout_centre(canvas,font,"Your SCORE is: "+ score,SCREEN_W/2,SCREEN_H/2+50,14,makecol(255,255,255));
			textout_centre(canvas,font,"press SPACE to restart",SCREEN_W/2,SCREEN_H/2+80,14,makecol(255,255,255));
		}
	}	
}

function update()
{	
	if(!gameOver && gameStarted){
	
		if(ship.enginesOn){
			ship.v = (ship.v <= 2 )?(ship.v + 0.02):(2);
		}else{
			ship.v = (ship.v >= 0.02)?(ship.v - 0.02):(0);
		}
	
		var d = distance(mouse_x, mouse_y , ship.x, ship.y); 

		if(d>5){
			ship.x += ship.v*((mouse_x-ship.x)/d);
			ship.y += ship.v*((mouse_y-ship.y)/d);
		}else{
			ship.v = 0;
		}
		   
		var asteroidsToAdd = new Set();
		   
		bullets.forEach(function (value){
			value.x += value.vx;
			value.y += value.vy;
			asteroids.forEach(function (asteroid){
				if(distance(value.x, value.y, asteroid.x, asteroid.y) < 12){
					score += 100;
					bullets.delete(value);
					if(asteroid.scale > 0.25){
						for(var i = 0; i<rand()%5; i++){
							asteroidsToAdd.add({
								bmp: asteroidBmp,
								x: asteroid.x+rand()%5 - 10,
								y: asteroid.y+rand()%5 - 10, 
								vx: rand()%6 - 3,
								vy: rand()%6 - 3,
								scale: asteroid.scale - 0.25
							});
						}
					} 
					asteroids.delete(asteroid);
				}
			});
		});
		
		asteroidsToAdd.forEach(function(value){ 
			asteroids.add(value) 
		});
		
		asteroids.forEach(function (asteroid) {
			asteroid.x = (asteroid.x + asteroid.vx);
			asteroid.y = (asteroid.y + asteroid.vy);
			
			if(asteroid.x > width){
				asteroid.x = 0;
			}else if(asteroid.x < 0){
				asteroid.x = width;
			}
			
			if(asteroid.y > height){
				asteroid.y = 0;
			}else if(asteroid.y < 0){
				asteroid.y = height;
			}
			
			
		});
	}
}

function controls ()
{
	if(!gameOver && gameStarted){
		if(pressed[KEY_SPACE]){
			play_sample(enginesSound);
			ship.enginesOn = true;
		}
		if(released[KEY_SPACE]){
			stop_sample(enginesSound);
			ship.enginesOn = false;
		}
		
		var d = distance(mouse_x, mouse_y , ship.x, ship.y);
		
		if(mouse_pressed){
			bullets.add({
				bmp: bulletBmp,
				x: ship.x,
				y: ship.y,
				vx: 10*((mouse_x-ship.x)/d),
				vy: 10*((mouse_y-ship.y)/d)
			});
			play_sample(laserSound);
		} 
	}else{
		if(pressed[KEY_SPACE] && gameStarted){
			load_elements();
			score = 0;
			gameOver = false;
		}else if(pressed[KEY_SPACE]){
			gameStarted = true;
		}
	}
}

function events()
{
	if(!gameOver && gameStarted) {
		if(Math.random() >= 0.99){
			asteroids.add({
				bmp: asteroidBmp,
				x: rand()%width,
				y: rand()%height,
				vx: rand()%6 - 3,
				vy: rand()%6 - 3,
				scale: 1.0
			});
		}
		
		asteroids.forEach(function (asteroid){
			if(distance(ship.x, ship.y, asteroid.x, asteroid.y) < 15){
				stop_sample(enginesSound);
				gameOver = true;
			}
		});
	}
	
}

function dispose ()
{
	bullets.forEach(function(value){
		if(value.x < 0 || value.x > width || value.y < 0 || value.y > height){
			bullets.delete(value);
		}
	});
}

function main()
{
    enable_debug('debug');
    allegro_init_all("game_canvas", width, height);
	load_elements();
	
	ready(function(){
        loop(function(){
            clear_to_color(canvas,makecol(0,0,0));
			dispose();
			controls();
            update();
			events();
            draw();
        },BPS_TO_TIMER(60));
    });
    return 0;
}
END_OF_MAIN();

function load_elements()
{
	ship = {bmp: load_bmp('images/ship.png'), bmpEng: load_bmp('images/ship_engines.png'), x: 320, y:240, v: 0, enginesOn: false};
	
	bulletBmp = load_bmp('images/bullet.png');
	asteroidBmp = load_bmp('images/asteroid.png');
	
	bullets = new Set();
	asteroids = new Set();
	
	enginesSound = load_sample("sounds/engines.wav");
	laserSound = load_sample("sounds/laser.wav");
	
	set_volume(0.5);
}