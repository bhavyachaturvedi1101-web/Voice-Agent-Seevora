// ============================================================
//  SEEVORA — 3D Ultra-Premium Particle Wave (Light Theme)
// ============================================================

export function initThreeParticleWave(containerId) {
  const container = document.getElementById(containerId);
  if (!container || !window.THREE) return null;

  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf8fafc); // Light slate background
  scene.fog = new THREE.FogExp2(0xf8fafc, 0.002);

  // Camera setup
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 1, 1000);
  camera.position.set(0, 100, 200);
  camera.lookAt(0, 0, 0);

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // 1. Particle Wave Geometry
  const SEPARATION = 40, AMOUNTX = 60, AMOUNTY = 60;
  const numParticles = AMOUNTX * AMOUNTY;
  
  const positions = new Float32Array(numParticles * 3);
  const scales = new Float32Array(numParticles);
  
  let i = 0, j = 0;
  for (let ix = 0; ix < AMOUNTX; ix++) {
    for (let iy = 0; iy < AMOUNTY; iy++) {
      positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2); // x
      positions[i + 1] = 0; // y
      positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2); // z
      scales[j] = 1;
      i += 3;
      j++;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

  // Custom Shader Material for elegant dots
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0x0ea5e9) } // Professional Cyan
    },
    vertexShader: `
      attribute float scale;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = scale * (150.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      void main() {
        if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
        gl_FragColor = vec4(color, 0.6);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // 2. Elegant connecting lines (Wireframe overlay for high-tech feel)
  const lineMaterial = new THREE.LineBasicMaterial({ 
    color: 0x38bdf8, 
    transparent: true, 
    opacity: 0.1 
  });
  
  const planeGeo = new THREE.PlaneGeometry(AMOUNTX * SEPARATION, AMOUNTY * SEPARATION, AMOUNTX - 1, AMOUNTY - 1);
  planeGeo.rotateX(-Math.PI / 2);
  const grid = new THREE.LineSegments(new THREE.WireframeGeometry(planeGeo), lineMaterial);
  scene.add(grid);

  // Interaction variables
  let mouseX = 0;
  let mouseY = 0;
  const windowHalfX = container.clientWidth / 2;
  const windowHalfY = container.clientHeight / 2;
  let count = 0;

  const onMouseMove = (event) => {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
  };
  document.addEventListener('mousemove', onMouseMove);

  // Resize handler
  const onResize = () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener('resize', onResize);

  // Animation Loop
  let animationId;
  const animate = () => {
    animationId = requestAnimationFrame(animate);

    // Smooth Camera Parallax
    camera.position.x += (mouseX * 0.2 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.2 + 100 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    // Wave animation
    const positions = particles.geometry.attributes.position.array;
    const scales = particles.geometry.attributes.scale.array;
    
    let i = 0, j = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        // Complex wave math for organic feel
        const yPos = (Math.sin((ix + count) * 0.3) * 30) + (Math.sin((iy + count) * 0.5) * 30);
        
        positions[i + 1] = yPos;
        scales[j] = (Math.sin((ix + count) * 0.3) + 1) * 6 + (Math.sin((iy + count) * 0.5) + 1) * 6;
        
        i += 3;
        j++;
      }
    }
    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.scale.needsUpdate = true;

    count += 0.03;

    renderer.render(scene, camera);
  };
  animate();

  // Cleanup
  return {
    destroy: () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('mousemove', onMouseMove);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      planeGeo.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    }
  };
}
