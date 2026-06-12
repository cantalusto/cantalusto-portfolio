/* ════════════════════════════════════════════
   HERO WEBGL — particle field (Three.js)
   warm-dark noise wave, mouse-reactive
   ════════════════════════════════════════════ */

import * as THREE from "three";

const canvas = document.getElementById("webgl");
if (canvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  try {
    initScene();
  } catch (err) {
    // WebGL unavailable — site works fine without the particle field
    canvas.remove();
    console.warn("WebGL indisponível, hero estático:", err.message);
  }
}

function initScene() {
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 2.2, 7.5);
  camera.lookAt(0, 0, 0);

  /* ── particle grid ── */
  const COLS = 220;
  const ROWS = 120;
  const W = 26;
  const H = 14;
  const count = COLS * ROWS;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  let i = 0;
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      positions[i * 3 + 0] = (x / (COLS - 1) - 0.5) * W;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = (y / (ROWS - 1) - 0.5) * H;
      seeds[i] = Math.random();
      i++;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(99, 99) }, // world xz of pointer
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uColorA: { value: new THREE.Color("#ece7e1") }, // bone white
    uColorB: { value: new THREE.Color("#e3342f") }, // blood red
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uPixelRatio;
      attribute float aSeed;
      varying float vElev;
      varying float vMouse;
      varying float vSeed;

      //  simplex-ish cheap noise (two rotated sines layered)
      float noise(vec2 p) {
        return sin(p.x) * sin(p.y);
      }
      float fbm(vec2 p) {
        float v = 0.0;
        v += 0.55 * noise(p);
        p = p * 2.04 + 1.7;
        v += 0.28 * noise(p);
        p = p * 1.97 + 4.2;
        v += 0.17 * noise(p);
        return v;
      }

      void main() {
        vec3 pos = position;

        float t = uTime * 0.35;
        float elev = fbm(vec2(pos.x * 0.42 + t, pos.z * 0.55 - t * 0.7));
        elev += 0.25 * sin(pos.x * 1.4 + uTime * 0.9 + aSeed * 6.28);

        // mouse ripple: lift particles near the pointer
        float d = distance(pos.xz, uMouse);
        float influence = smoothstep(3.2, 0.0, d);
        elev += influence * 1.15 * sin(uTime * 2.2 - d * 2.4);

        pos.y = elev;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;

        float size = (1.1 + aSeed * 1.3 + influence * 2.2) * uPixelRatio;
        gl_PointSize = size * (6.0 / -mv.z);

        vElev = elev;
        vMouse = influence;
        vSeed = aSeed;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying float vElev;
      varying float vMouse;
      varying float vSeed;

      void main() {
        // round soft point
        float d = length(gl_PointCoord - 0.5);
        float alpha = smoothstep(0.5, 0.18, d);

        // mostly dim bone-white dust; red blooms on crests + near mouse
        float redness = smoothstep(0.35, 1.1, vElev) * 0.6 + vMouse * 0.9;
        redness += step(0.965, vSeed) * 0.85; // a few always-red embers
        vec3 color = mix(uColorA, uColorB, clamp(redness, 0.0, 1.0));

        float brightness = 0.16 + 0.22 * smoothstep(-0.6, 1.2, vElev) + vMouse * 0.5;
        gl_FragColor = vec4(color, alpha * brightness);
      }
    `,
  });

  const points = new THREE.Points(geometry, material);
  points.position.y = -1.4;
  scene.add(points);

  /* ── pointer → world plane ── */
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1.4);
  const ndc = new THREE.Vector2(99, 99);
  const hit = new THREE.Vector3();
  const targetMouse = new THREE.Vector2(99, 99);

  window.addEventListener("pointermove", (e) => {
    ndc.x = (e.clientX / window.innerWidth) * 2 - 1;
    ndc.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    if (raycaster.ray.intersectPlane(plane, hit)) {
      targetMouse.set(hit.x, hit.z);
    }
  });

  /* camera drift with pointer */
  const camTarget = { x: 0, y: 2.2 };
  window.addEventListener("pointermove", (e) => {
    camTarget.x = ((e.clientX / window.innerWidth) - 0.5) * 0.8;
    camTarget.y = 2.2 + ((e.clientY / window.innerHeight) - 0.5) * -0.5;
  });

  /* ── resize ── */
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  /* ── loop (paused when hero off-screen) ── */
  let visible = true;
  new IntersectionObserver(
    ([entry]) => (visible = entry.isIntersecting),
    { threshold: 0 }
  ).observe(canvas);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uMouse.value.lerp(targetMouse, 0.08);
    camera.position.x += (camTarget.x - camera.position.x) * 0.05;
    camera.position.y += (camTarget.y - camera.position.y) * 0.05;
    camera.lookAt(0, -0.5, 0);
    renderer.render(scene, camera);
  });
}
