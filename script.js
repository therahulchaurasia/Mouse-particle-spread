const SPAWN_INTERVAL_MS = 50

const GATHER_DISTANCE_MIN = 25
const GATHER_DISTANCE_MAX = 110
const JIGGLE_RANGE = 25
const POP_SCALE_MIN = 0.5
const POP_SCALE_MAX = 1.8

const MIN_PARTICLES_TO_BLAST = 10
const MAX_PARTICLES_TO_BLAST = 100

const RING_MIN_DIAMETER = 120
const RING_MAX_DIAMETER = 260
const BURST_INSET = 12

const SHOCKWAVE_DURATION_MS = 550
const DISMISS_DURATION_MS = 400

const stage = document.getElementById("stage")

const randomBetween = (min, max) => min + Math.random() * (max - min)

const setCssVars = (element, vars) => {
  for (const [name, value] of Object.entries(vars)) {
    element.style.setProperty(name, value)
  }
}

let centerX = 0
let centerY = 0
let spawnInterval = null
let gathering = []

const stopSpawning = () => {
  clearInterval(spawnInterval)
  spawnInterval = null
}

const spawnParticle = () => {
  const angle = randomBetween(0, Math.PI * 2)
  const distance = randomBetween(GATHER_DISTANCE_MIN, GATHER_DISTANCE_MAX)
  const scatterX = centerX + Math.cos(angle) * distance
  const scatterY = centerY + Math.sin(angle) * distance

  const particle = document.createElement("div")
  particle.className = "particle"
  setCssVars(particle, {
    "--hue": randomBetween(0, 360),
    "--center-x": `${centerX}px`,
    "--center-y": `${centerY}px`,
    "--scatter-x": `${scatterX}px`,
    "--scatter-y": `${scatterY}px`,
    "--jiggle-x": `${randomBetween(-JIGGLE_RANGE, JIGGLE_RANGE)}px`,
    "--jiggle-y": `${randomBetween(-JIGGLE_RANGE, JIGGLE_RANGE)}px`,
    "--pop-scale": randomBetween(POP_SCALE_MIN, POP_SCALE_MAX),
  })

  const dot = document.createElement("div")
  dot.className = "particle-dot"
  particle.appendChild(dot)

  stage.appendChild(particle)
  gathering.push(particle)
}

const dismissParticles = (particles) => {
  particles.forEach((particle) => {
    particle.style.transform = getComputedStyle(particle).transform
    particle.classList.add("dismissing")
    setTimeout(() => particle.remove(), DISMISS_DURATION_MS)
  })
}

const spawnShockwave = (className, diameter) => {
  const circle = document.createElement("div")
  circle.className = className
  setCssVars(circle, {
    "--center-x": `${centerX}px`,
    "--center-y": `${centerY}px`,
    "--shockwave-size": `${diameter}px`,
  })
  stage.appendChild(circle)
  setTimeout(() => circle.remove(), SHOCKWAVE_DURATION_MS)
}

const explodeParticle = (particle) => {
  const rect = particle.getBoundingClientRect()
  const fadeDelay = randomBetween(100, 400)
  const fadeDuration = randomBetween(1500, 3000)
  setCssVars(particle, {
    "--release-x": `${rect.left + rect.width / 2}px`,
    "--release-y": `${rect.top + rect.height / 2}px`,
    "--twinkle-min-opacity": randomBetween(0.25, 1),
    "--twinkle-duration": `${randomBetween(100, 200)}ms`,
    "--fade-duration": `${fadeDuration}ms`,
    "--fade-delay": `${fadeDelay}ms`,
  })
  particle.classList.add("releasing")
  setTimeout(() => particle.remove(), fadeDelay + fadeDuration)
}

window.addEventListener("pointerdown", (event) => {
  stopSpawning()

  centerX = event.clientX
  centerY = event.clientY
  spawnInterval = setInterval(spawnParticle, SPAWN_INTERVAL_MS)
})

window.addEventListener("pointerup", () => {
  stopSpawning()

  const gathered = gathering
  gathering = []

  if (gathered.length < MIN_PARTICLES_TO_BLAST) {
    dismissParticles(gathered)
    return
  }

  const exploding = gathered.slice(0, MAX_PARTICLES_TO_BLAST)
  gathered.slice(MAX_PARTICLES_TO_BLAST).forEach((particle) => particle.remove())

  const countFraction =
    (exploding.length - MIN_PARTICLES_TO_BLAST) /
    (MAX_PARTICLES_TO_BLAST - MIN_PARTICLES_TO_BLAST)
  const ringDiameter =
    RING_MIN_DIAMETER + countFraction * (RING_MAX_DIAMETER - RING_MIN_DIAMETER)

  spawnShockwave("burst", ringDiameter - BURST_INSET)
  spawnShockwave("ring", ringDiameter)

  exploding.forEach(explodeParticle)
})

const cancelStream = () => {
  if (!spawnInterval) return
  stopSpawning()
  gathering.forEach((particle) => particle.remove())
  gathering = []
}

window.addEventListener("blur", cancelStream)
window.addEventListener("pointercancel", cancelStream)
