// rocket launch position
let launchX = 90;
let launchY = 80;

// Rocket speed in vw/vh per frame
let rocketSpeed = 0.8;

// Score tracker - updates score when an enemy is removed
let score = 0;


// Track game state
let isGameOver = false;

// Function to handle the end of the game
function triggerGameOver() {
    if (isGameOver) return; // Prevent it from triggering multiple times
    isGameOver = true;

    // Show the game over popup
    document.getElementById("game-over-popup").style.display = "flex";
    
    // Display the final score
    document.getElementById("final-score").innerText = "Final Score: " + score;

    // Remove all remaining enemies and rockets from the screen
    document.querySelectorAll('.enemy').forEach(e => e.remove());
    document.querySelectorAll('.rocket').forEach(e => e.remove());
}

const player = document.getElementById("player");
   let speed = 0.12; // pixels per frame

function updatePosition(pl, nx, ny) {
 pl.style.left = nx + "vw";
 pl.style.top = ny + "vh";
}

// distance between object and point
function odist(obj1,px,py){
  dx = parseFloat(obj1.style.left) - px;
  dy = parseFloat(obj1.style.top) - py;
  return Math.sqrt(dx * dx + dy * dy);
}
// distance between 2 objects
function objdist(obj1,obj2){
  dx = parseFloat(obj1.style.left) - parseFloat(obj2.style.left);
  dy = parseFloat(obj1.style.top) - parseFloat(obj2.style.top);
  return Math.sqrt(dx * dx + dy * dy);
}

//find the nearest enemy to a point (mouse click)
function nearest_enemy(enemies,mx,my){
near = 150;
  enemies.forEach(enemy =>{
if (odist(enemy,mx,my)<near){near = odist(enemy,mx,my);nEnemy = enemy;}
});
if (near<10)return nEnemy;
}



// Score display element
let scoreDisplay = document.getElementById("score");

scoreDisplay.style.position = "absolute";
scoreDisplay.style.top = "20px";
scoreDisplay.style.left = "20px";
scoreDisplay.style.color = "White";
scoreDisplay.style.fontSize = "30px";
scoreDisplay.style.zIndex = "10";


function moveToEarth(pl) {
  let hasExplodedAtEarth = false; 

  let px = parseFloat(pl.style.left) || 0; //starting x
  let py = parseFloat(pl.style.top) || 0;  //starting y
 
  let fx = 90; //final x (earth)
  let fy = 80; //final y (earth)

  let nx=px;
  let ny=py; //next position

  function animate() {
      // --- KILLS THE BACKGROUND LOOP IF GAME IS OVER ---
      if (isGameOver) return; 

      // If the asteroid was destroyed by a rocket and removed from the game, STOP the math!
      if (!document.body.contains(pl)) return;

      dx = fx - nx;
      dy = fy - ny;
      dist = Math.sqrt(dx * dx + dy * dy);

      if (dist>1) { // Removed 'moving' variable since it's global and buggy

          if (nx< fx) nx +=(speed*dx/dist);
          if (ny< fy) ny +=(speed*dy/dist);
         
          updatePosition(pl,nx,ny);
          pl.style.transform = "rotate("+nx*10+"deg)";
          
          // --- GAME OVER & EXPLOSION LOGIC ---
          if (!hasExplodedAtEarth && odist(pl, 90, 80) < 5) {
              hasExplodedAtEarth = true;
              pl.remove(); 
              
              let exp = document.createElement("img");
              exp.src = "../Resources/explosion.gif";
              exp.style.position = "absolute";
              exp.style.left = "80vw";
              exp.style.top = "60vh";
              exp.style.width = "500px";
              document.body.appendChild(exp);
              setTimeout(() => {
                  exp.remove();
              }, 800);
              
              triggerGameOver();
              
              return; 
          }

          requestAnimationFrame(animate);
      }     
  }
 
  requestAnimationFrame(animate);
}

function moveTotarget(plo, plt) {
  function animate() {
    let px = parseFloat(plo.style.left) || 0;
  let py = parseFloat(plo.style.top) || 0;

  let fx = parseFloat(plt.style.left) || 0;
  let fy = parseFloat(plt.style.top) || 0;
    let dx = fx - px;
    let dy = fy - py;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0.5) {
      px += (rocketSpeed * dx) / dist;
      py += (rocketSpeed * dy) / dist;

      updatePosition(plo, px, py);
      let angle = Math.atan2(dy, dx) * 180 / Math.PI;
      plo.style.transform = "rotate(" + (angle+35) + "deg)";

      requestAnimationFrame(animate);
    } else {
      updatePosition(plo, fx, fy);
    }

  // Check for collision with the target enemy
  if (objdist(plo,plt)<0.1){
    let exp = document.createElement("img");
    exp.src = "../Resources/explosion.gif";
    exp.style.position = "absolute";
    exp.style.left = plt.style.left;
    exp.style.top = plt.style.top;
    exp.style.width = "150px";

    if (plt && !plt.dataset.dead) {
        // Check if it's a boss with health
        if (plt.dataset.health) {
            let hp = parseInt(plt.dataset.health) - 1;
            plt.dataset.health = hp; // Update the health
            
            if (hp <= 0) {
                plt.dataset.dead = "true";
                score += 5; // Bosses give 5 points!
                plt.remove();
            } else {
                // Boss took damage but survived! Flash it red briefly
                plt.style.filter = "brightness(50%) sepia(100) saturate(100) hue-rotate(330deg)";
                setTimeout(() => { if (plt) plt.style.filter = "none"; }, 150);
            }
        } else {
            // It's a regular asteroid (1 hit)
            plt.dataset.dead = "true";   
            score++;
            plt.remove();
        }
        scoreDisplay.innerHTML = "Score: " + score;
    }  
    
    plo.remove(); // The rocket always explodes

    // Add explosion visual
    document.body.appendChild(exp);
    setTimeout(() => {
        exp.remove();
    }, 800);
    
    return; // stops the animation loop
}
}
  animate();
}

//create enemy
function createObject(ox, oy) { 
   let obj = document.createElement("img");
   obj.src = "../resources/base.png";
   obj.style.position = "absolute";
   obj.className = "enemy";
   obj.style.left = ox + "vw";
   obj.style.top = oy + "vh";
   obj.style.width = "100px";
   obj.style.height = "100px";

   document.body.appendChild(obj);
   return obj;
 }

// create a rocket
 function createRocket(ox, oy) {
   let obj = document.createElement("img");
   obj.src = "../resources/rocket.gif";
   obj.style.position = "absolute";
   obj.className = "rocket";
   obj.style.left = ox + "vw";
   obj.style.top = oy + "vh";
   obj.style.width = "100px";
   

   document.body.appendChild(obj);
   return obj;
 }
  

   document.addEventListener("keydown", function(e) {
     if (e.key === "m") moveToEarth(player);
     if (e.key === "i") createObject(0, 0);
     if (e.key === "o") {moveToEarth(createObject(-20, Math.random()*150 - 50));}
   });


// --- ROCKET---
  // let gun = document.createElement("img");
  // gun.src = "Resources/laser_gun.png";
  // gun.style.position = "absolute";
  // gun.style.width = "20vw";
  // gun.style.height= "40vh"
  
  // gun.style.left = "40vw"
  // gun.style.top = "62vh"

  // gun.style.zIndex = "1000";
  // document.body.appendChild(gun);
   
// Rocket code
document.addEventListener("click", function(e){
// ---- let rocket = createRocket(100,0);
let clickX = e.clientX * 100 / window.innerWidth;
let clickY = e.clientY * 100 / window.innerHeight;

let enemies = document.querySelectorAll(".enemy");
let targetEnemy = nearest_enemy(enemies, clickX, clickY);

// If a target enemy is found, create a rocket and move it towards the target
if (targetEnemy) {

    let rocket = createRocket(launchX, launchY);

    moveTotarget(rocket, targetEnemy);

}
});


// Loop for generating normal enemies
function randenemy(){
  if (isGameOver) return; // stops the loop

  setTimeout(function() {
    // Check ONE MORE TIME before actually spawning the asteroid
    if (isGameOver) return; 

    // Spawns at X: -20 (left wall), Y: between 10 and 90 (visible screen height)
    moveToEarth(createObject(-20, Math.random() * 80 + 10));
    randenemy();
  }, 1500);
}

// Array of your generated boss asteroid images
const bossImages = [
  "../Resources/boss.png",
  "../Resources/shot.png",
];

// Create a tough asteroid (Boss)
function createBoss(ox, oy) { 
 let obj = document.createElement("img");
 // Pick a random image from the array
 obj.src = bossImages[Math.floor(Math.random() * bossImages.length)];
 obj.style.position = "absolute";
 obj.className = "enemy"; // Keep class "enemy" so rockets can track it!
 obj.dataset.health = "3"; // IT TAKES 3 HITS!
 
 obj.style.left = ox + "vw";
 obj.style.top = oy + "vh";
 obj.style.width = "180px"; // Make them bigger than normal asteroids
 obj.style.height = "180px";

 document.body.appendChild(obj);
 return obj;
}

// Loop for generating bosses
function randBoss(){
  if (isGameOver) return; 

  setTimeout(function() {
    if (isGameOver) return; 
    
    // Spawns boss at X: -20 (left wall), Y: between 10 and 90
    moveToEarth(createBoss(-20, Math.random() * 80 + 10));
    
    // Bosses spawn a bit slower, every 4 seconds
    randBoss(); 
  }, 4000);
}


// New function to start the game
// New function to start the game
function startGame() {
  // Hide the initial instruction popup
  document.getElementById('instruction-popup').style.display = 'none';
  
  // Start spawning the normal asteroids immediately
  randenemy();
  
  // WARNING: INCOMING BOSSES! (Starts after 15 seconds)
  setTimeout(() => {
      if (!isGameOver) {
          console.log("Boss asteroids incoming!");
          randBoss();
      }
  }, 15000);
}


// When the user clicks, create a laser effect from the rocket to the click position
//    document.addEventListener("click", function(e) {
//    let laser = document.createElement("div");
   
//    // Get the rocket's position
//    let rocketX = 50;
//    let rocketY = 75;
    
//    // Get the click position
//    let clickX = e.clientX*100/window.innerWidth; //follows the width of the screen instead of pixles
//    let clickY = e.clientY*100/window.innerHeight;

//    // Calculate the distance and angle from the rocket to the click position
//    let dx = (clickX - rocketX);
//    let dy = (clickY - rocketY)*window.innerHeight/window.innerWidth;
//    let distance = Math.sqrt(dx * dx + dy * dy);

//    // Calculate the angle in degrees
//    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
//    // Set the laser's position, size, and rotation
//    rocketX = 50 ;
//    rocketY = 75;
//    laser.style.position = "absolute";
//   //  laser.style.backgroundColor = "red";
//    laser.style.left = rocketX  + "vw";
//    laser.style.top = rocketY + "vh";
//    laser.style.width = distance*window.innerWidth/window.innerHeight + "vh";
//    laser.style.height = "15vh";
//    laser.style.backgroundImage = "url('Resources/laser.gif')";
//    laser.style.transformOrigin = "0 50%";
//    laser.style.backgroundRepeat = "no-repeat";
//    laser.style.backgroundSize = "100% 100%";
//    laser.style.transform = "rotate(" + angle + "deg)";
//    gun.style.transform = "rotate(" + (angle+90) + "deg)";

//    // Add the laser to the document body
//    document.body.appendChild(laser);

//    // Remove the laser after a short delay
//    setTimeout(function() {
//      laser.remove();
//    }, 1500);

//    // Check if the clicked element is an enemy and remove it
//    let clickedElement = e.target;

//    // Check if the clicked element has the class "enemy" and remove it if it does
//    if (clickedElement.classList.contains("enemy")) {
//    clickedElement.remove();
//    // Increment the score and log it to the console
//    score = score + 1;
//    if (clickedElement.classList.contains("enemy")) {
//  clickedElement.remove();
//  score = score + 1;
//  scoreDisplay.innerHTML = "Score: " + score;
// };
//  }
// });