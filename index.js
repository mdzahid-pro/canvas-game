const canvas = document.querySelector("#element");
const c = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector("#scoreEl")
const startGameBtn = document.querySelector("#startGame")
const modalEl = document.querySelector("#modalEl")
const bigScoreEl = document.querySelector("#big-scoreEl")

class Player{
    constructor(x,y,radius,color){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw(){
        c.beginPath()
        c.arc(this.x , this.y , this.radius , 0 , Math.PI * 2 , false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile {
    constructor(x,y,radius,color,velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw(){
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI * 2,false)
        c.fillStyle = this.color
        c.fill()
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enimy {
    constructor(x,y,radius,color,velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw(){
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI * 2,false)
        c.fillStyle = this.color
        c.fill()
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.99

class Particle {
    constructor(x,y,radius,color,velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw(){
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI * 2,false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    update(){
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x * 1.5
        this.y = this.y + this.velocity.y * 1.5
        this.alpha -= 0.01
    }
}

let player = new Player(canvas.width /2,canvas.height / 2,10,"white")
let projecttiles = []
let enimys = []
let particles = []
let speedTime = 2000

function inite(){
    player = new Player(canvas.width / 2,canvas.height / 2,10,"white")
    projecttiles = []
    enimys = []
    particles = []
    score = 0
    scoreEl.innerHTML = score
    bigScoreEl.innerHTML = score
}

function spawnAnimy(){
	//console.log(speedTime -= 100)
	function checkfunc(time){
		setInterval(()=>{
			checkfunc(time-=100)
		},1000)
		
		
		return time
	}
	
	//console.log(checkfunc(1000))
	
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4
        let x ,y

        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        }else{
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
            
        const color = `hsl(${Math.random() * 360}, 50% ,50%)`
        const angle = Math.atan2(canvas.height / 2 - y , canvas.width / 2 - x)
        const velocity = {x: Math.cos(angle),y: Math.sin(angle)}
        enimys.push(new Enimy(x,y,radius,color,velocity))
    },1500)//checkfunc(1000))
}

let animationId
let score = 0

function animate(){
    animationId = requestAnimationFrame(animate)
    c.fillStyle = "rgba(0,0,0,0.09)"
    c.fillRect(0,0,canvas.width,canvas.height)
    player.draw()

    particles.forEach((Particle,index) => {
        if(Particle.alpha <= 0){
            particles.splice(index,1)
        }else{
            Particle.update()
        }
    })

    projecttiles.forEach((projectile,index) => {
        projectile.update()
        // Remove From Edge Screen
        if(projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y - projectile.radius < 0 || projectile - projectile.radius > canvas.width){
            setTimeout(() => {
                projecttiles.splice(index,1)
            })
        }
    })

    enimys.forEach((Enimy,index) => {
        
        Enimy.update()
        const dist = Math.hypot(player.x -Enimy.x,player.y - Enimy.y)
        //End The Game
        if(dist - Enimy.radius - player.radius < 1){
            cancelAnimationFrame(animationId)
            modalEl.style.display="flex"
            bigScoreEl.innerHTML = score
        }

        projecttiles.forEach((projectile,projectileIndex) => {
            const dist = Math.hypot(projectile.x - Enimy.x,projectile.y - Enimy.y)
            // whene projectiles Tuch Enimy
            if(dist - Enimy.radius - projectile.radius < 1){
                //Create Explosions
                for(let i = 0;i < Enimy.radius * 4;i++){
                    particles.push(new Particle(projectile.x,projectile.y,Math.random() * 2,Enimy.color,{x:(Math.random() * 0.5) * (Math.random() * 10) ,y:(Math.random() * 0.5) * (Math.random() * 8)}))
                }
                //
                if(Enimy.radius - 10 > 5){
                    gsap.to(Enimy,{radius: Enimy.radius -= 10})
                    score += 100
                    scoreEl.innerHTML = score

                    setTimeout(() => {
                        projecttiles.splice(projectileIndex, 1)
                    })
                }else{
                    score += 250
                    scoreEl.innerHTML = score

                    setTimeout(() => {
                        enimys.splice(index,1)
                        projecttiles.splice(projectileIndex , 1)
                    },0)
                }
                
            }
        })
    })
}

const x = canvas.width / 2;
const y = canvas.height / 2

window.addEventListener("click", (event) => {
    const angle = Math.atan2(event.clientY - canvas.height / 2 , event.clientX - canvas.width / 2)
    const velocity = {x: Math.cos(angle) * 5,y: Math.sin(angle) * 5}

    projecttiles.push(
        new Projectile(canvas.width / 2,canvas.height / 2 ,Math.PI * 2 , "red" ,velocity)
    )
})

startGameBtn.addEventListener("click",() => {
    inite()
    spawnAnimy()
    animate()
    modalEl.style.display = 'none'
})