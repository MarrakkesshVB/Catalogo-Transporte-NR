/* ===== GLOBO DE RUTAS — scroll experience (motor propio Three.js r128) =====
   Canvas fixed bajo el ADN. Los arcos se encienden con los hitos del scroll. */
(function () {
  if (typeof THREE === 'undefined') return;
  const adn = document.getElementById('adnSection');
  const main = document.getElementById('hitos');
  if (!adn || !main) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.createElement('canvas');
  canvas.id = 'globeCanvas';
  document.body.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
  camera.position.set(0, 0, 34);

  const world = new THREE.Group();
  scene.add(world);
  const R = 10;

  /* Cuerpo oscuro (oculta puntos de la cara lejana) + halo */
  world.add(new THREE.Mesh(
    new THREE.SphereGeometry(R * 0.995, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x08122b })
  ));
  world.add(new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.06, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.06, side: THREE.BackSide })
  ));

  function ll2v(lat, lon, r) {
    const phi = (90 - lat) * Math.PI / 180;
    const th = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
  }

  /* --- Puntos de continentes (máscara desde textura; fallback uniforme) --- */
  function buildDots(mask) {
    const pts = [];
    const STEP = 1.4;
    for (let lat = -60; lat <= 75; lat += STEP) {
      for (let lon = -180; lon < 180; lon += STEP) {
        if (mask) {
          const x = Math.floor((lon + 180) / 360 * mask.width);
          const y = Math.floor((90 - lat) / 180 * mask.height);
          const i = (y * mask.width + x) * 4;
          if (mask.data[i] + mask.data[i + 1] < 30) continue; // océano
        }
        pts.push(ll2v(lat + Math.random() * 0.6, lon + Math.random() * 0.6, R));
      }
    }
    world.add(new THREE.Points(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.PointsMaterial({ color: 0x38BDF8, size: 0.14, transparent: true, opacity: 0.85, depthWrite: false })
    ));
  }

  new THREE.TextureLoader().setCrossOrigin('anonymous').load(
    'https://unpkg.com/three-globe/example/img/earth-night.jpg',
    tex => {
      const c = document.createElement('canvas');
      c.width = 360; c.height = 180;
      const ctx = c.getContext('2d');
      ctx.drawImage(tex.image, 0, 0, 360, 180);
      buildDots(ctx.getImageData(0, 0, 360, 180));
    },
    undefined,
    () => buildDots(null)
  );

  /* --- Ciudades + arcos por hito --- */
  const CITIES = {
    rafaela: [-31.25, -61.48], rosario: [-32.95, -60.65], bsas: [-34.6, -58.4],
    cordoba: [-31.42, -64.19], mendoza: [-32.89, -68.85], salta: [-24.79, -65.41]
  };
  Object.values(CITIES).forEach(([la, lo]) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xF97316 }));
    m.position.copy(ll2v(la, lo, R * 1.01));
    world.add(m);
  });

  const ARC_DEFS = [
    ['rafaela', 'rosario', 0.10],   /* 2004 */
    ['rafaela', 'bsas', 0.35],      /* 2012 */
    ['rosario', 'cordoba', 0.60],   /* 2019 */
    ['bsas', 'mendoza', 0.80],      /* hoy */
    ['rafaela', 'salta', 0.88]      /* hoy */
  ];
  const arcs = ARC_DEFS.map(([a, b, t0]) => {
    const A = ll2v(CITIES[a][0], CITIES[a][1], R);
    const B = ll2v(CITIES[b][0], CITIES[b][1], R);
    const mid = A.clone().add(B).multiplyScalar(0.5).normalize().multiplyScalar(R * 1.45);
    const curve = new THREE.QuadraticBezierCurve3(A, mid, B);
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 40, 0.06, 8, false),
      new THREE.MeshBasicMaterial({ color: 0xF97316, transparent: true, opacity: 0 })
    );
    const spark = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xFFD9A0, transparent: true, opacity: 0 })
    );
    world.add(mesh, spark);
    return { curve, mesh, spark, t0 };
  });

  /* --- Responsive --- */
  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    const wide = window.innerWidth / window.innerHeight > 1.1;
    world.position.x = wide ? 9 : 0;
    world.scale.setScalar(wide ? 1 : 0.7);
  }
  window.addEventListener('resize', resize);
  resize();

  /* --- Parallax --- */
  let mx = 0, my = 0;
  window.addEventListener('pointermove', e => {
    mx = e.clientX / window.innerWidth - 0.5;
    my = e.clientY / window.innerHeight - 0.5;
  });

  /* --- Loop: rotación = auto + scroll; arcos por umbral de hito --- */
  function range() {
    const start = adn.offsetTop + adn.offsetHeight;
    const end = main.offsetTop + main.offsetHeight - window.innerHeight * 0.5;
    return [start, Math.max(end, start + 1)];
  }

  const clock = new THREE.Clock();
  function tick() {
    requestAnimationFrame(tick);
    const [start, end] = range();
    const ih = window.innerHeight;
    const fadeIn = Math.min(1, Math.max(0, (window.scrollY - (start - ih * 0.35)) / (ih * 0.35)));
    const fadeOut = Math.min(1, Math.max(0, ((end + ih * 0.5) - window.scrollY) / (ih * 0.5)));
    const vis = fadeIn > 0 && fadeOut > 0;
    canvas.style.opacity = Math.min(fadeIn, fadeOut).toFixed(2);
    if (!vis) return; /* ahorra batería fuera de rango */

    const p = Math.min(1, Math.max(0, (window.scrollY - start) / (end - start)));
    const t = clock.getElapsedTime();
    world.rotation.y = (reduceMotion ? 1.4 : t * 0.03) + p * Math.PI * 1.6 + mx * 0.15;
    world.rotation.x = 0.25 + my * 0.06;

    arcs.forEach(a => {
      const k = Math.min(1, Math.max(0, (p - a.t0) / 0.12));
      a.mesh.material.opacity = k * 0.95;
      a.spark.material.opacity = k;
      if (k > 0 && !reduceMotion) a.spark.position.copy(a.curve.getPoint((t * 0.35) % 1));
      else if (k > 0) a.spark.position.copy(a.curve.getPoint(0.5));
    });
    renderer.render(scene, camera);
  }
  tick();
})();