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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    const ambient = new THREE.AmbientLight(0xded7ff, 1.8);
    const violetLight = new THREE.PointLight(0x7c5cff, 16, 18);
    violetLight.position.set(3.5, 2.5, 4);
    const whiteLight = new THREE.DirectionalLight(0xffffff, 2.4);
    whiteLight.position.set(-3, 4, 5);
    scene.add(ambient, violetLight, whiteLight);

    const sculpture = new THREE.Group();
    group.add(sculpture);

    const arcGeometry = new THREE.TorusGeometry(1.28, 0.27, 32, 180, Math.PI * 1.56);
    const darkMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x15151c,
      roughness: 0.24,
      metalness: 0.62,
      clearcoat: 1,
      clearcoatRoughness: 0.16
    });
    const violetMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x6f5bc7,
      roughness: 0.34,
      metalness: 0.4,
      clearcoat: 0.78,
      clearcoatRoughness: 0.24
    });

    const backArc = new THREE.Mesh(arcGeometry, darkMaterial);
    backArc.position.set(-0.5, 0.08, -0.28);
    backArc.rotation.set(0.2, -0.28, Math.PI * 0.23);
    backArc.scale.set(1.08, 1.08, 1.08);

    const frontArc = new THREE.Mesh(arcGeometry, violetMaterial);
    frontArc.position.set(0.52, -0.08, 0.22);
    frontArc.rotation.set(-0.18, 0.3, Math.PI * 0.23);
    frontArc.scale.set(0.94, 0.94, 0.94);
    sculpture.add(backArc, frontArc);

    const syncTheme = () => {
      const dark = document.documentElement.dataset.theme === 'dark';
      darkMaterial.color.setHex(dark ? 0x24232d : 0x15151c);
      violetMaterial.color.setHex(dark ? 0x8874e6 : 0x6f5bc7);
      violetLight.intensity = dark ? 19 : 13;
    };
    syncTheme();
    window.addEventListener('codecrafts:theme', () => {
      syncTheme();
      if (reducedMotion) renderer.render(scene, camera);
    });


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
      sculpture.rotation.z = Math.sin(elapsed * 0.32) * 0.045;
      backArc.rotation.y = -0.28 + Math.sin(elapsed * 0.27) * 0.045;
      frontArc.rotation.y = 0.3 - Math.sin(elapsed * 0.24) * 0.055;
      renderer.render(scene, camera);
    };
    draw();
  } catch {
    canvas.hidden = true;
  }
}
