var width = 640, height=480;

var ship;

var bullets;
var asteroids;

var bulletBmp;
var asteroidBmp;

var gameOver = false;

function draw()
{    
	if(!gameOver){
		//draw_sprite(canvas, ship.bmp, ship.x, ship.y);
		bullets.forEach(function (value){
			draw_sprite(canvas, value.bmp, value.x, value.y);
		});
		asteroids.forEach(function (value){
			draw_sprite(canvas, value.bmp, value.x, value.y);
		});
		rotate_sprite(canvas,ship.enginesOn?ship.bmpEng:ship.bmp,ship.x,ship.y,DEG(Math.atan2(mouse_y-ship.y,mouse_x-ship.x)));
	} else {
		textout_centre(canvas,font,"GAME OVER",SCREEN_W/2,SCREEN_H/2,24,makecol(0,0,0));
	} 
}

function update()
{		
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
		   
		bullets.forEach(function (value){
			value.x += value.vx;
			value.y += value.vy;
			asteroids.forEach(function (asteroid){
				if(distance(value.x, value.y, asteroid.x, asteroid.y) < 12){
					bullets.delete(value);
					asteroids.delete(asteroid);
				}
			});
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

function controls ()
{
		if(pressed[KEY_SPACE]){
			ship.enginesOn = true;
		}
		if(released[KEY_SPACE]){
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
		} 
}

function events()
{
	if(Math.random() >= 0.99){
		asteroids.add({
			bmp: asteroidBmp,
			x: rand()%width,
			y: rand()%height,
			vx: rand()%6 - 3,
			vy: rand()%6 - 3
		});
	}
	
	asteroids.forEach(function (asteroid){
		if(distance(ship.x, ship.y, asteroid.x, asteroid.y) < 15){
			gameOver = true;
		}
	});
	
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
            clear_to_color(canvas,makecol(255,255,255));
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
}