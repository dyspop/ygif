const artistData = [
  {
    "name": "Minnie Julia Riperton Rudolph",
    "id": 1,
    "aliases": [],
    "dateOfBirth": "1947-11-08",
    "dateOfDeceased": "1979-07-12",
    "placeOfBirth": "Chicago, USA",
    "yearsActive": ["1962", "1979"],
    "workedWith": [2,3,9],
    "placesActive": [],
    "roles": ["singer", "songwriter"],
    "genres": ["soul", "R&B"],
    "bio": "Minnie Julia Riperton Rudolph (November 8, 1947 – July 12, 1979) was an American singer-songwriter best known for her 1975 single \"Lovin' You\"...",
    "imageUrl": "https://images.squarespace-cdn.com/content/v1/6211e215ec462b03b8e911cf/126422ec-072c-40d6-b9c4-136d2bd2b59d/p1479.jpg?format=750w"
  },
  // ... rest of your artist data ...
];

let scene, camera, renderer, controls;
let nodes = {};
let edges = [];
let selectedNodes = [];

// Initialize Scene
function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 10;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);

  loadNetwork();
  animate();
}

// Load Network Data
function loadNetwork() {
  artistData.forEach(artist => {
    const texture = new THREE.TextureLoader().load(artist.imageUrl);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);

    sprite.position.set(
      Math.random() * 10 - 5,
      Math.random() * 10 - 5,
      Math.random() * 10 - 5
    );
    sprite.scale.set(1.5, 1.5, 1.5);
    sprite.userData = { id: artist.id, name: artist.name };

    scene.add(sprite);
    nodes[artist.id] = sprite;
  });

  artistData.forEach(artist => {
    artist.workedWith.forEach(partnerId => {
      if (nodes[partnerId]) {
        createEdge(nodes[artist.id], nodes[partnerId]);
      }
    });
  });
}

// Create Edge Between Nodes
function createEdge(node1, node2) {
  const material = new THREE.LineBasicMaterial({ color: 0x888888 });
  const points = [node1.position, node2.position];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);

  scene.add(line);
  edges.push({ line, node1, node2 });
}

// Hover & Click Interactions
window.addEventListener("mousemove", onMouseMove);
window.addEventListener("click", onClick);

function onMouseMove(event) {
  const intersects = getIntersects(event);
  edges.forEach(edge => {
    edge.line.material.color.set(0x888888);
  });

  if (intersects.length > 0) {
    const hovered = intersects[0].object;
    hovered.material.opacity = 0.8;
    edges.forEach(edge => {
      if (edge.node1 === hovered || edge.node2 === hovered) {
        edge.line.material.color.set(0xffffff);
      }
    });
  }
}

function onClick(event) {
  const intersects = getIntersects(event);
  if (intersects.length > 0) {
    const clicked = intersects[0].object;
    handleSelection(clicked);
  }
}

function handleSelection(node) {
  if (selectedNodes.length === 0) {
    selectedNodes.push(node);
    node.position.set(0, 0, 0);
  } else if (selectedNodes.length === 1 && selectedNodes[0] !== node) {
    selectedNodes.push(node);
    selectedNodes[1].position.set(2, 0, 0);
    displayConnectionText(selectedNodes[0], selectedNodes[1]);
  } else {
    selectedNodes = [];
  }
}

// Get Mouse Intersects
function getIntersects(event) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  return raycaster.intersectObjects(Object.values(nodes));
}

// Display Relationship Text
function displayConnectionText(node1, node2) {
  const fontLoader = new THREE.FontLoader();
  fontLoader.load(
    "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
    function (font) {
      const textGeometry = new THREE.TextGeometry(
        `${node1.userData.name} & ${node2.userData.name}`,
        {
          font: font,
          size: 0.5,
          height: 0.1,
        }
      );
      const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);

      textMesh.position.set(-1, 1, 0);
      scene.add(textMesh);
    }
  );
}

// Animate Loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// Handle Resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
