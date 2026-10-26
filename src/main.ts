import './style.css'

const appElement = document.querySelector<HTMLDivElement>('#app')

if (!appElement) {
  throw new Error('App root not found')
}

const app = appElement

if (window.location.pathname === '/stool' || window.location.pathname === '/stool/') {
  renderStoolPage()
} else {
  renderHomePage()
}

function renderHomePage() {
  document.title = '3D Modeling for a Creative Practice'
  app.innerHTML = `
    <main class="home">
      <h1>3D Modeling for a Creative Practice</h1>

      <p>
        This course examines how emerging technologies shape creative experiences through the production of artwork using 3D modeling and virtual representation. Students will learn to construct digital forms, apply textures, and employ realistic lighting techniques to animate their models. These models will subsequently be used to develop interactive and navigable environments, such as those found in video games and virtual reality applications, or combined with photographic imagery. The curriculum emphasizes individual project development and creative exploration, encouraging students to expand the boundaries of their artistic practice.
      </p>

      <nav aria-label="Course pages">
        <a href="/stool">View stool study</a>
      </nav>
    </main>
  `
}

async function renderStoolPage() {
  const [THREE, { GLTFLoader }] = await Promise.all([
    import('three'),
    import('three/addons/loaders/GLTFLoader.js'),
  ])

  document.title = 'Stool — 3D Study'
  app.innerHTML = `
    <main class="stool-page">
      <div class="viewer" aria-label="A slowly rotating 3D model of a stool">
        <canvas></canvas>
        <p class="loading-status" role="status">Loading model…</p>
      </div>
    </main>
  `

  const viewer = app.querySelector<HTMLDivElement>('.viewer')
  const canvas = app.querySelector<HTMLCanvasElement>('canvas')
  const status = app.querySelector<HTMLParagraphElement>('.loading-status')

  if (!viewer || !canvas || !status) {
    throw new Error('Stool viewer could not be created')
  }

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)

  const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100)
  camera.position.set(3, 2.2, 4)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d8d8, 2.2))

  const keyLight = new THREE.DirectionalLight(0xffffff, 4)
  keyLight.position.set(3, 5, 4)
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0xffffff, 1.5)
  fillLight.position.set(-4, 2, -2)
  scene.add(fillLight)

  const modelPivot = new THREE.Group()
  const clayMaterial = new THREE.MeshStandardMaterial({
    color: 0xb9785d,
    roughness: 0.86,
    metalness: 0,
  })
  scene.add(modelPivot)

  let modelRadius = 1
  let modelLoaded = false

  new GLTFLoader().load(
    '/models/merged.glb',
    ({ scene: model }) => {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.computeVertexNormals()
          child.material = clayMaterial
        }
      })

      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      modelRadius = Math.max(size.x, size.y, size.z) / 2
      model.position.sub(center)
      modelPivot.add(model)

      const distance = modelRadius / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
      camera.position.set(distance * 0.8, distance * 0.45, distance * 1.25)
      camera.near = Math.max(modelRadius / 100, 0.01)
      camera.far = distance * 10
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()

      status.classList.add('is-hidden')
      modelLoaded = true
    },
    undefined,
    () => {
      status.textContent = 'The model could not be loaded.'
      status.classList.add('has-error')
    },
  )

  const resize = () => {
    const { width, height } = viewer.getBoundingClientRect()
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(viewer)
  resize()

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let previousTime = performance.now()

  const animate = () => {
    const currentTime = performance.now()
    const delta = Math.min((currentTime - previousTime) / 1000, 0.1)
    previousTime = currentTime

    if (modelLoaded && !reduceMotion) {
      modelPivot.rotation.y += delta * 0.22
    }
    renderer.render(scene, camera)
  }

  renderer.setAnimationLoop(animate)

  window.addEventListener('pagehide', () => {
    resizeObserver.disconnect()
    renderer.setAnimationLoop(null)
    clayMaterial.dispose()
    renderer.dispose()
  }, { once: true })
}
