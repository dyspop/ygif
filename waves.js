// Three.js code remains unchanged...
let scene, camera, renderer;
let geometry, material, mesh;
let clock;
let raycaster, mouse;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(5, 5, 10);
  camera.lookAt(-5, 2, -10);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const width = 70,
    height = 100,
    widthSegments = 100,
    heightSegments = 100;
  geometry = new THREE.PlaneGeometry(
    width,
    height,
    widthSegments,
    heightSegments
  );
  material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
  mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  scene.add(mesh);

  clock = new THREE.Clock();
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  window.addEventListener("mousemove", onMouseMove, false);
  window.addEventListener("resize", onWindowResize, false);
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();
  updateMeshVertices(time);
  renderer.render(scene, camera);
}

function updateMeshVertices(time) {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(mesh);
  let mouse3D = null;
  if (intersects.length > 0) {
    mouse3D = intersects[0].point.clone();
    const mouseOffset = 15;
    mouse3D.z += mouseOffset;
  }
  const smoothingFactor = 0.1;
  const position = geometry.attributes.position;

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const waveHeight = Math.sin((x + time) * 0.5) * Math.cos((y + time) * 0.5);
    let gravityOffset = 0;
    if (mouse3D) {
      const dx = x - mouse3D.x;
      const dy = y - mouse3D.z;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const influenceRadius = 10;
      const maxEffect = 5;
      if (dist < influenceRadius) {
        gravityOffset = (1 - dist / influenceRadius) * maxEffect;
      }
    }
    const targetZ = waveHeight + gravityOffset;
    const currentZ = position.getZ(i);
    const smoothZ = THREE.MathUtils.lerp(currentZ, targetZ, smoothingFactor);
    position.setZ(i, smoothZ);
  }
  position.needsUpdate = true;
}

init();
animate();
