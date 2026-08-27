import * as THREE from './assets/vendor/three.module.min.js';

const canvas = document.querySelector('.hero-webgl');
const host = document.querySelector('.hero-art');

if (canvas && host) {
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const group = new THREE.Group();
    scene.add(group);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const ambient = new THREE.AmbientLight(0xded7ff, 1.8);
    const violetLight = new THREE.PointLight(0x7c5cff, 16, 18);
    violetLight.position.set(3.5, 2.5, 4);
    const whiteLight = new THREE.DirectionalLight(0xffffff, 2.4);
    whiteLight.position.set(-3, 4, 5);
    scene.add(ambient, violetLight, whiteLight);

    const shell = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.35, 0.34, 160, 20, 2, 3),
      new THREE.MeshStandardMaterial({ color: 0x8062ff, roughness: 0.28, metalness: 0.42, transparent: true, opacity: 0.38 })
    );
    shell.position.set(0.35, 0.05, -1.7);
    shell.scale.set(1.18, 1.18, 1.18);
    group.add(shell);

    const wireShell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.05, 2),
      new THREE.MeshBasicMaterial({ color: 0x7c5cff, wireframe: true, transparent: true, opacity: 0.1 })
    );
    wireShell.position.copy(shell.position);
    group.add(wireShell);

    const syncTheme = () => {
      const dark = document.documentElement.dataset.theme === 'dark';
      shell.material.color.setHex(dark ? 0xa991ff : 0x8062ff);
      shell.material.opacity = dark ? 0.55 : 0.38;
      wireShell.material.color.setHex(dark ? 0xb7a5ff : 0x7c5cff);
      wireShell.material.opacity = dark ? 0.18 : 0.1;
      violetLight.intensity = dark ? 22 : 16;
    };
    syncTheme();
    window.addEventListener('codecrafts:theme', () => {
      syncTheme();
      if (reducedMotion) renderer.render(scene, camera);
    });

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.25, 0.018, 8, 120),
      new THREE.MeshBasicMaterial({ color: 0x0c0c0f, transparent: true, opacity: 0.12 })
    );
    ring.position.set(-0.15, 0.05, -1.8);
    ring.rotation.set(1.05, 0.2, -0.35);
    group.add(ring);

    const particleCount = 72;
    const positions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 8.5;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 5.4;
      positions[index * 3 + 2] = (Math.random() - 0.5) * 3 - 1.5;
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      particlesGeometry,
      new THREE.PointsMaterial({ color: 0x7c5cff, size: 0.025, transparent: true, opacity: 0.45, sizeAttenuation: true })
    );
    group.add(particles);

    const pointer = { x: 0, y: 0 };
    host.addEventListener('pointermove', (event) => {
      const bounds = host.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.35;
      pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.25;
    });
    host.addEventListener('pointerleave', () => { pointer.x = 0; pointer.y = 0; });

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (reducedMotion) renderer.render(scene, camera);
    };
    new ResizeObserver(resize).observe(canvas);
    resize();

    let inViewport = true;
    let pageVisible = !document.hidden;
    new IntersectionObserver(([entry]) => { inViewport = entry.isIntersecting; }, { threshold: 0.02 }).observe(host);
    document.addEventListener('visibilitychange', () => { pageVisible = !document.hidden; });

    const clock = new THREE.Clock();
    const draw = () => {
      if (reducedMotion) {
        renderer.render(scene, camera);
        return;
      }
      requestAnimationFrame(draw);
      if (!inViewport || !pageVisible) return;
      const elapsed = clock.getElapsedTime();
      group.rotation.y += (pointer.x - group.rotation.y) * 0.035;
      group.rotation.x += (-pointer.y - group.rotation.x) * 0.035;
      shell.rotation.y = elapsed * 0.11;
      shell.rotation.x = elapsed * 0.065;
      wireShell.rotation.y = -elapsed * 0.04;
      wireShell.rotation.z = elapsed * 0.025;
      ring.rotation.z = -0.35 + Math.sin(elapsed * 0.35) * 0.08;
      particles.rotation.y = elapsed * 0.018;
      renderer.render(scene, camera);
    };
    draw();
  } catch {
    canvas.hidden = true;
  }
}
