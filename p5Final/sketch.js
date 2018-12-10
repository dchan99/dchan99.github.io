//Image assets credits: https://hexadecimalwtf.itch.io/space-pixels
//Made modification to size of image as well as combining images to create animations

//Sound assets credits: https://freesound.org/

var timeStart
var sequenceBackground
var sequenceSpaceship

var bulletImg

var singleBullet
var singleBulletImg
var collision = true
var fired = false
var deadly = false

var asteroidImg
var minionImg
var bossImg

var ricochet
var explosion
var asteroidCollide
var enemyDeath

var bulletPatterns = {}

var gameStart = false
var gameOver = false
var level = 0
var enemiesDefeated = 0

function preload() {
  sequenceBackground = loadAnimation(
    'assets/animatedSpace/space (1).png','assets/animatedSpace/space (5).png','assets/animatedSpace/space (9).png',
    'assets/animatedSpace/space (13).png','assets/animatedSpace/space (17).png','assets/animatedSpace/space (21).png',
    'assets/animatedSpace/space (25).png','assets/animatedSpace/space (29).png','assets/animatedSpace/space (33).png',
    'assets/animatedSpace/space (37).png','assets/animatedSpace/space (41).png',
  )

  sequenceSpaceship = loadAnimation('assets/animatedSpaceship/spaceship.png','assets/animatedSpaceship/spaceship (1).png','assets/animatedSpaceship/spaceship (2).png',
    'assets/animatedSpaceship/spaceship (3).png','assets/animatedSpaceship/spaceship (4).png','assets/animatedSpaceship/spaceship (5).png')

  bulletImg = loadImage('assets/bullet/pixel_laser_small_red.png')
  singleBulletImg = loadImage('assets/bullet/pixel_laser_small_blue.png')

  asteroidImg = loadImage('assets/enemy/asteroid_grey.png')
  minionImg = loadImage('assets/enemy/pixel_ship_red_small_2.png')
  bossImg = loadImage('assets/enemy/pixel_station_red.png')

  ricochet = loadSound("assets/ricochet.wav")
  explosion = loadSound("assets/explosion.wav")
  asteroidCollide = loadSound("assets/asteroidCollide.wav")
  enemyDeath = loadSound("assets/enemyDeath.wav")
}

function setup() {
  createCanvas(1000, 1000)

  // var backgroundSprite = createSprite(0,0,width,height)
  // backgroundSprite.addAnimation('background',sequenceBackground)
  // backgroundSprite.addAnimation('assets/animatedSpace/space (1).png','assets/animatedSpace/space (5).png','assets/animatedSpace/space (9).png',
  //   'assets/animatedSpace/space (13).png','assets/animatedSpace/space (17).png','assets/animatedSpace/space (21).png',
  //   'assets/animatedSpace/space (25).png','assets/animatedSpace/space (29).png','assets/animatedSpace/space (33).png',
  //   'assets/animatedSpace/space (37).png','assets/animatedSpace/space (41).png')

  spaceship = createSprite(width/2,height-100)
  // spaceship.addAnimation('assets/animatedSpaceship/spaceship.png','assets/animatedSpaceship/spaceship (1).png','assets/animatedSpaceship/spaceship (2).png',
  //   'assets/animatedSpaceship/spaceship (3).png','assets/animatedSpaceship/spaceship (4).png','assets/animatedSpaceship/spaceship (5).png')
  spaceship.addAnimation('spaceshipAnimation',sequenceSpaceship)
  spaceship.setCollider('circle', 0, 0, 8);
  spaceship.immovable = true

  bullets = new Group()
  asteroids = new Group()
  minions = new Group()
  bosses = new Group()

}

var startButton
var startButton2
function drawButton(type) {
  if (!startButton) {
    if (type == 'start') {
      startButton = createButton('Start Game!');
      startButton.position(width/2-100, 600)
      startButton.addClass('startButton')
      startButton.mousePressed(() => start())
    }
    if (type == 'next') {
      startButton = createButton('Next Level!');
      startButton.position(width/2-100, 800)
      startButton.addClass('startButton')
      startButton.mousePressed(() => advanceLevel())
    }
    if (type == 'restart') {
      startButton = createButton('Play Again!');
      startButton.position(width/2-100, 800)
      startButton.addClass('startButton')
      startButton.mousePressed(() => restart())
    }
  }
  if (type == 'startHelpers') {
    if (!startButton2) {
      startButton2 = createButton('Start Game With Hit Box Helpers!');
      startButton2.position(width/2-260, 700)
      startButton2.addClass('startButton')
      startButton2.mousePressed(() => start(true))
    }
  }
}

var hitboxes
function start(helpers) {
  timeStart = millis()

  hitboxes = helpers
  startButton.remove()
  startButton2.remove()
  spawn('asteroid',helpers)
  spawn('minion',helpers)
  spawn('boss',helpers)
  gameStart = true
  startButton = null
  startButton2 = null
}

function advanceLevel() {
  level += 1
  timeStart = millis()

  if (singleBullet) {
    singleBullet.remove()
    fired = false
  }

  startButton.remove()
  spawn('asteroid',hitboxes)
  spawn('minion',hitboxes)
  spawn('boss',hitboxes)
  startButton = null
}

function restart() {
  explode.remove()

  singleBullet.remove()
  asteroids.removeSprites()
  minions.removeSprites()
  bosses.removeSprites()
  bullets.removeSprites()
  for (i in bulletPatterns) {
    bulletPatterns[i].removeSprites()
  }

  collision = true
  fired = false
  deadly = false
  gameStart = false
  gameOver = false
  enemiesDefeated = 0
  bulletPatterns = {}
  level = 0

  startButton.remove()
  startButton = null
}

function draw() {
  background(0)

  animation(sequenceBackground, 0, 0);  

  if (!gameStart) {
    textSize(32)
    fill(255)
    textAlign(CENTER,CENTER)
    text("Press W or UP to move spaceship forward", width/2, 100)
    text("Press S or DOWN to stop spaceship", width/2, 150)
    text("Click mouse to fire your SINGLE bullet", width/2, 200)
    text("If you miss, you must fly over it to reload", width/2, 250)
    text("If bullet hits, a new one will respawn somewhere on the map", width/2, 300)
    text("Avoid enemy spaceships, space stations, and asteroid!", width/2, 350)
    text("Avoid all enemy bullets!", width/2, 400)
    text("You will only die if the CENTER of the spaceship is hit", width/2, 450)
    text("Test movement and firing before starting!", width/2, 500)
    drawButton('start')
    drawButton('startHelpers')
  }

  if (gameOver) {
    minions.forEach(minion => {
      minion.velocity.x = 0
      minion.velocity.y = 0
    })
    bosses.forEach(boss => {
      boss.velocity.x = 0
      boss.velocity.y = 0
    })

    textSize(64)
    fill(255,0,0)
    textAlign(CENTER,CENTER)
    text("You DIED", width/2, 450)
    text("You defeated: " + enemiesDefeated + " enemies", width/2, 550)
    drawButton('restart')
  }

  if (gameStart && !gameOver) {
    textAlign(RIGHT,BOTTOM)
    textSize(16)
    fill(255)
    text("Enemies defeated: " + enemiesDefeated,width,height)

    asteroids.displace(asteroids,asteroidBounce)
    asteroids.collide(spaceship,death)
    asteroids.forEach(asteroid => {
      if (asteroid.position.y > height || asteroid.position.y < 0 || asteroid.position.x > width || asteroid.position.x < 0) {
        asteroid.remove()
      }
      asteroid.position.x += Math.random() < 0.5 ? -1 : 1
      asteroid.position.y += Math.random() < 0.5 ? -1 : 1
    })

    var everyS = false
    var interval = (10 - level) / 2
    if (interval <= 3) {
      interval = 3
    }
    if (millis() - timeStart > interval*1000) {
      everyS = true
      timeStart = millis()
    }
    minions.collide(spaceship,death)
    minions.displace(minions)
    minions.forEach(minion => {
      if (deadly && minion.collide(singleBullet)) {
        singleBullet.velocity.y = 0
        singleBullet.velocity.x = 0
        singleBullet.position.x = random (100,width-100)
        singleBullet.position.y = random (100,height-100)
        deadly = false

        enemyDeath.play()
        minion.remove()
        enemiesDefeated += 1
      }
      var x = spaceship.position.x - minion.position.x
      var y = spaceship.position.y - minion.position.y
      var direction = Math.atan2(y, x) * 180 / Math.PI

      minion.setSpeed(Math.ceil(level/2) + 1, direction)
      if (everyS) {
        generateBullet(minion.position.x,minion.position.y)
      }
    })

    bosses.collide(spaceship,death)
    bosses.displace(bosses)
    bosses.forEach(boss => {
      if (deadly && boss.collide(singleBullet)) {
        singleBullet.velocity.y = 0
        singleBullet.velocity.x = 0
        singleBullet.position.x = random (100,width-100)
        singleBullet.position.y = random (100,height-100)
        deadly = false

        enemyDeath.play()
        boss.remove()
        enemiesDefeated += 1
      }
      var x = spaceship.position.x - boss.position.x
      var y = spaceship.position.y - boss.position.y
      var direction = Math.atan2(y, x) * 180 / Math.PI

      boss.setSpeed((level/5) + 0.5, direction)
      if (everyS) {
        var choices = ['spiral','spread','shotgun']
        var pick = choices[Math.floor(Math.random() * choices.length)];
        generatePattern(pick,boss.position.x,boss.position.y)
      }
    })

    for (i in bulletPatterns) {
      bulletPatterns[i].collide(spaceship,death)
      if (i == 'spiral') {
        bulletPatterns[i].forEach(bullet => {
          bullet.setSpeed(5, bullet.rotation+1)
          if (bullet.position.y >= height || bullet.position.y <= 0) {
            bullet.remove()
          }
          if (bullet.position.x >= width || bullet.position.x <= 0) {
            bullet.remove()
          }
        })
      }
    }

    bullets.bounce(bullets,bounceCallback)
    bullets.collide(spaceship,death)
    bullets.forEach(bullet => {
      if (bullet.position.y > height || bullet.position.y < 0) {
        bullet.velocity.y *= -1
      }
      if (bullet.position.x > width || bullet.position.x < 0) {
        bullet.velocity.x *= -1
      }
    })

    if (minions.length == 0 && bosses.length == 0) {
      asteroids.removeSprites()
      bullets.removeSprites()
      for (i in bulletPatterns) {
        bulletPatterns[i].removeSprites()
      }
      drawButton('next')
    }
  }

  if (!gameOver) {
    if (singleBullet) {
      if (singleBullet.position.y > height || singleBullet.position.y < 0 || singleBullet.position.x > width || singleBullet.position.x < 0) {
        singleBullet.velocity.y = 0
        singleBullet.velocity.x = 0
        deadly = false
      }
      if (singleBullet.position.y > height) {
        singleBullet.position.y -= 5
      }
      if (singleBullet.position.y < 0) {
        singleBullet.position.y += 5
      }
      if (singleBullet.position.x > width) {
        singleBullet.position.x -= 5
      }
      if (singleBullet.position.x < 0) {
        singleBullet.position.x += 5
      }

      if (!singleBullet.collide(spaceship)) {
        collision = false
      }
      if (collision == false && singleBullet.collide(spaceship) && singleBullet.velocity.x == 0) {
        singleBullet.remove()
        fired = false
      }
    }

    if (abs(spaceship.position.x - mouseX) > 10 && abs(spaceship.position.y - mouseY) > 10) {
      var x = spaceship.position.x - mouseX
      var y = spaceship.position.y - mouseY
      var angle = Math.atan2(y, x) * 180 / Math.PI
      spaceship.rotation = angle + 180
    }
    if (forward) {
      spaceship.setSpeed(Math.ceil(level/2) + 4, spaceship.rotation);
    }
    if (backward) {
      spaceship.velocity.x = 0
      spaceship.velocity.y = 0
    }
    if (spaceship.position.y > height) {
      spaceship.position.y = height
    }
    if (spaceship.position.y < 0) {
      spaceship.position.y = 0
    }
    if (spaceship.position.x > width) {
      spaceship.position.x = width
    }
    if (spaceship.position.x < 0) {
      spaceship.position.x = 0
    }
  }
  drawSprites()
  if (!gameOver) {
    ellipse(spaceship.position.x,spaceship.position.y,16,16)
  }
}

function bounceCallback() {
  ricochet.play()
}

function asteroidBounce() {
  asteroidCollide.play()
}

function death() {
  explosion.play()
  explode = createSprite(spaceship.position.x,spaceship.position.y)
  spaceship.velocity.x = 0
  spaceship.velocity.y = 0

  explode.addAnimation('assets/animatedSpaceship/explode (1).png','assets/animatedSpaceship/explode (2).png','assets/animatedSpaceship/explode (3).png')

  gameOver = true
}

function spawn(name,helpers) {
  if (name == 'asteroid') {
    for (var i = 0; i < Math.ceil(level/2)+1; ++i) {
      asteroid = createSprite(random(100,width-100),random(100,height/2))
      asteroid.addImage(asteroidImg)
      asteroid.setCollider('circle',0,0,35)
      asteroid.setSpeed(1,90)
      asteroid.debug = helpers
      asteroids.add(asteroid)
    }
  }
  if (name == 'minion') {
    for (var i = 0; i < level+1; ++i) {
      minion = createSprite(random(100,width-100),0)
      minion.addImage(minionImg)
      minion.setCollider('circle',0,0,15)
      minion.rotateToDirection = true
      minion.debug = helpers
      minions.add(minion)
    }
  }
  if (name == 'boss') {
    for (var i = 0; i < Math.floor(level/3); ++i) {
      boss = createSprite(random(100,width-100),0)
      boss.addImage(bossImg)
      boss.setCollider('rectangle', 0, 0, 80,160)
      boss.debug = helpers
      bosses.add(boss)
    }
  }
}

function generateBullet(x,y) {
  bullet = createSprite(x, y)
  bullet.addImage(bulletImg)

  bullet.setCollider('circle', 0, 0, 5)

  var x = spaceship.position.x - bullet.position.x
  var y = spaceship.position.y - bullet.position.y
  var direction = Math.atan2(y, x) * 180 / Math.PI
  bullet.setSpeed(Math.ceil(level/2) + 2, direction)
  bullet.rotateToDirection = true
  bullet.life = 500;

  bullets.add(bullet)
}

function generatePattern(name,x,y) {
  var patternName = new Group()

  var n = random(8,16)
  speed = Math.ceil(level/2) + 1
  
  if (name == 'spiral' || name == 'spread') {
    var spacer = 360/n
    var direction = 0
    for (var i = 0; i < n; ++i) {
      bullet = createSprite(x,y)
      bullet.addImage(bulletImg)
      bullet.setCollider('circle', 0, 0, 5)
      bullet.setSpeed(speed, direction)
      bullet.rotateToDirection = true
      patternName.add(bullet)
      direction += spacer
    }
  } else if (name == 'shotgun') {
    var tx = spaceship.position.x - x
    var ty = spaceship.position.y - y
    var sdirection = Math.atan2(ty, tx) * 180 / Math.PI

    var spacer = 30
    var direction = sdirection - 30
    if (n % 3 == 1) {
      n+=2
    } else if (n % 3 == 2) {
      n+=1
    }
    for (var i = 0; i < n; ++i) {
      bullet = createSprite(x,y)
      bullet.addImage(bulletImg)
      bullet.setCollider('circle', 0, 0, 5)
      bullet.setSpeed(speed, direction)
      bullet.rotateToDirection = true
      patternName.add(bullet)
      direction += spacer
      if (direction > sdirection + 30) {
        direction = sdirection - 30;
      }
      if (i % 3 == 2) {
        speed += 1
      }
    }
  }

  bulletPatterns[name] = patternName
}

var forward = false
var backward = false
function keyPressed() {
  if (key == 'w' || keyCode == UP_ARROW || key == 'z') {
    forward = true;
  }
  if (key == 's' || keyCode == DOWN_ARROW || key == 'x') {
    backward = true;
  }

  if (keyCode == 32) {
    if (!fired && !gameOver) {
      singleBullet = createSprite(spaceship.position.x, spaceship.position.y)
      singleBullet.addImage(singleBulletImg)

      singleBullet.setCollider('circle', 0, 0, 5)
      singleBullet.rotateToDirection = true

      singleBullet.setSpeed(5, spaceship.rotation)

      fired = true
      deadly = true
    }
  }
}

function keyReleased() {
  if (key == 'w' || keyCode == UP_ARROW || key == 'z') {
    forward = false;
  }
  if (key == 's' || keyCode == DOWN_ARROW || key == 'x') {
    backward = false;
  }
}