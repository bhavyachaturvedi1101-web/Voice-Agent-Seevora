// ============================================================
//  SEEVORA — 3D Metric Card Visualizer (Light Theme)
// ============================================================

export function initCardViz(containerId, type = 'wave') {
  const container = document.getElementById(containerId);
  if (!container || !window.THREE) return null;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.z = 10;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  let meshes = [];

  if (type === 'wave') {
    // Soundwave visualization
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x38bdf8, 
      transparent: true, 
      opacity: 0.6,
      wireframe: true 
    });
    for (let i = 0; i < 15; i++) {
      const height = 1 + Math.random() * 3;
      const geo = new THREE.CylinderGeometry(0.1, 0.1, height, 8);
      const mesh = new THREE.Mesh(geo, material);
      mesh.position.x = (i - 7) * 0.4;
      mesh.userData = { baseHeight: height, speed: 0.05 + Math.random() * 0.1, offset: Math.random() * Math.PI * 2 };
      meshes.push(mesh);
      group.add(mesh);
    }
    group.rotation.x = 0.2;
    group.rotation.y = -0.2;
  } else if (type === 'core') {
    // Holographic neural core
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      transmission: 0.9,
      opacity: 1,
      transparent: true,
      roughness: 0.2,
      thickness: 1.0,
      clearcoat: 1.0
    });
    const geo = new THREE.IcosahedronGeometry(2.5, 1);
    const mesh = new THREE.Mesh(geo, material);
    
    // Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.3 });
    const wireMesh = new THREE.Mesh(geo, wireMat);
    wireMesh.scale.set(1.02, 1.02, 1.02);
    
    meshes.push(mesh);
    group.add(mesh);
    group.add(wireMesh);
    
    // Light for physical material
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 1));
  } else if (type === 'rings') {
    // Orbital rings
    const colors = [0x10b981, 0x0ea5e9, 0x8b5cf6];
    for(let i=0; i<3; i++) {
      const geo = new THREE.TorusGeometry(1.5 + i*0.8, 0.03, 16, 64);
      const mat = new THREE.MeshBasicMaterial({ color: colors[i], transparent: true, opacity: 0.7 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.userData = { rx: Math.random() * 0.02, ry: Math.random() * 0.02 };
      meshes.push(mesh);
      group.add(mesh);
    }
  }

  // Animation Loop
  let animationId;
  let time = 0;
  const animate = () => {
    animationId = requestAnimationFrame(animate);
    time += 0.02;

    if (type === 'wave') {
      meshes.forEach((mesh, i) => {
        const scale = 1 + Math.sin(time * mesh.userData.speed * 10 + mesh.userData.offset) * 0.5;
        mesh.scale.y = scale;
      });
      group.rotation.y += 0.005;
    } else if (type === 'core') {
      group.rotation.x += 0.005;
      group.rotation.y += 0.008;
    } else if (type === 'rings') {
      meshes.forEach(mesh => {
        mesh.rotation.x += mesh.userData.rx;
        mesh.rotation.y += mesh.userData.ry;
      });
      group.rotation.y += 0.002;
    }

    renderer.render(scene, camera);
  };
  animate();

  const onResize = () => {
    if(!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener('resize', onResize);

  return {
    destroy: () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      if(renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      renderer.dispose();
    }
  };
}
