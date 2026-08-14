/* ===== ADN NUEVA ROMA v3 — geometría Spline (GLB) + motor propio ===== */
(function () {
  const stage = document.getElementById('adnStage');
  if (!stage || typeof THREE === 'undefined') return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 300);
  camera.position.set(0, 0, 60);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
  stage.appendChild(renderer.domElement);

  /* --- Luces iridiscentes --- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  scene.add(new THREE.HemisphereLight(0xb388ff, 0x0a0a12, 0.55));
  const pink = new THREE.PointLight(0xff4fa0, 1.25, 160); pink.position.set(-20, 24, 22); scene.add(pink);
  const cyan = new THREE.PointLight(0x22d3ee, 1.15, 160); cyan.position.set(20, -18, 20); scene.add(cyan);
  const warm = new THREE.PointLight(0xF97316, 0.8, 140); warm.position.set(-14, -24, 16); scene.add(warm);
  const key = new THREE.DirectionalLight(0xffffff, 0.55); key.position.set(10, 14, 24); scene.add(key);

  /* --- Gradiente iridiscente --- */
  const STOPS = [
    [0.00, new THREE.Color(0xff6ec7)],
    [0.35, new THREE.Color(0xb388ff)],
    [0.65, new THREE.Color(0xff9e6a)],
    [1.00, new THREE.Color(0x4dd0e1)]
  ];
  function gradColor(t, target) {
    t = Math.max(0, Math.min(1, t));
    for (let i = 0; i < STOPS.length - 1; i++) {
      const t0 = STOPS[i][0], c0 = STOPS[i][1], t1 = STOPS[i + 1][0], c1 = STOPS[i + 1][1];
      if (t <= t1) return target.copy(c0).lerp(c1, (t - t0) / (t1 - t0));
    }
    return target.copy(STOPS[STOPS.length - 1][1]);
  }

  const dna = new THREE.Group();
  scene.add(dna);

  /* --- Partículas propias --- */
  const COUNT = 650, RADIUS = 7, HEIGHT = 68;
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const palette = [0xF97316, 0x38BDF8, 0xEC4899, 0x22C55E, 0xEF4444, 0x22D3EE].map(c => new THREE.Color(c));
  for (let i = 0; i < COUNT; i++) {
    const t = Math.random(), a = Math.random() * Math.PI * 2;
    const r = RADIUS + 1 + Math.pow(Math.random(), 2) * 10;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = (t - 0.5) * HEIGHT * 1.05;
    pos[i * 3 + 2] = Math.sin(a) * r;
    const c = palette[(Math.random() * palette.length) | 0];
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    size: 0.35, vertexColors: true, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  dna.add(particles);

  /* --- Cargar GLB de Spline + aplicar nuestro material iridiscente --- */
  if (typeof THREE.GLTFLoader !== 'undefined') {
    new THREE.GLTFLoader().load('assets/adn.glb', gltf => {
      const model = gltf.scene;
      /* orientar la hélice vertical (eje Y) */
      const b0 = new THREE.Box3().setFromObject(model);
      const s0 = b0.getSize(new THREE.Vector3());
      if (s0.z >= s0.y && s0.z >= s0.x) model.rotation.x = -Math.PI / 2;
      else if (s0.x >= s0.y && s0.x >= s0.z) model.rotation.z = Math.PI / 2;
      model.updateMatrixWorld(true);
      /* normalizar tamaño (alto 68) y centrar */
      const box = new THREE.Box3().setFromObject(model);
      const sz = box.getSize(new THREE.Vector3());
      const ct = box.getCenter(new THREE.Vector3());
      const sc = 68 / Math.max(sz.y, 0.001);
      model.scale.setScalar(sc);
      model.position.set(-ct.x * sc, -ct.y * sc, -ct.z * sc);
      /* material iridiscente con gradiente vertical */
      const cTmp = new THREE.Color();
      model.traverse(o => {
        if (!o.isMesh) return;
        const geo = o.geometry;
        geo.computeBoundingBox();
        const bb = geo.boundingBox;
        const pa = geo.attributes.position;
        const dx = bb.max.x - bb.min.x, dy = bb.max.y - bb.min.y, dz = bb.max.z - bb.min.z;
        const get = dx >= dy && dx >= dz ? 'getX' : dy >= dz ? 'getY' : 'getZ';
        const min = get === 'getX' ? bb.min.x : get === 'getY' ? bb.min.y : bb.min.z;
        const range = Math.max(dx, dy, dz) || 1;
        const colors = new Float32Array(pa.count * 3);
        for (let i = 0; i < pa.count; i++) {
          gradColor((pa[get](i) - min) / range, cTmp);
          colors[i * 3] = cTmp.r; colors[i * 3 + 1] = cTmp.g; colors[i * 3 + 2] = cTmp.b;
        }
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        o.material = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.92, roughness: 0.22 });
      });
      dna.add(model);
      if (reduceMotion) renderer.render(scene, camera);
    }, undefined, () => console.warn('GLB del ADN no disponible'));
  }

  /* --- Responsive --- */
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    if (w / h > 1.2) { dna.position.x = 14; dna.scale.setScalar(1); }
    else { dna.position.x = 0; dna.scale.setScalar(0.75); }
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  /* --- Parallax --- */
  let mx = 0, my = 0;
  window.addEventListener('pointermove', e => {
    mx = e.clientX / window.innerWidth - 0.5;
    my = e.clientY / window.innerHeight - 0.5;
  });

  /* --- Loop con pausa fuera de pantalla --- */
  const TILT_X = 0.21, TILT_Z = 0.14;
  dna.rotation.set(TILT_X, 0, TILT_Z);
  const clock = new THREE.Clock();
  let raf = null;
  function tick() {
    raf = requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    dna.rotation.y = t * 0.25;
    dna.rotation.x = TILT_X + my * 0.08;
    dna.rotation.z = TILT_Z + mx * 0.08;
    particles.rotation.y = -t * 0.06;
    renderer.render(scene, camera);
  }
  if (reduceMotion) {
    renderer.render(scene, camera);
  } else {
    new IntersectionObserver(es => {
      if (es[0].isIntersecting && !raf) tick();
      if (!es[0].isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
    }, { rootMargin: '100px' }).observe(stage);
  }
})();