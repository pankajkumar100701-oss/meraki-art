"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Small deterministic value noise so the cave walls look carved, not smooth.
function hash(x: number, y: number, z: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const c = (dx: number, dy: number, dz: number) => hash(xi + dx, yi + dy, zi + dz);
  return lerp(
    lerp(lerp(c(0, 0, 0), c(1, 0, 0), u), lerp(c(0, 1, 0), c(1, 1, 0), u), v),
    lerp(lerp(c(0, 0, 1), c(1, 0, 1), u), lerp(c(0, 1, 1), c(1, 1, 1), u), v),
    w,
  );
}
function fbm(x: number, y: number, z: number) {
  return (
    noise(x, y, z) * 0.55 +
    noise(x * 2.3, y * 2.3, z * 2.3) * 0.25 +
    noise(x * 5.1, y * 5.1, z * 5.1) * 0.13 +
    noise(x * 11.3, y * 11.3, z * 11.3) * 0.07
  );
}

// Fine plaster grain as a tangent-space normal map, so walls catch light like
// the hand-sculpted ceiling in the photos instead of looking like smooth plastic.
function rockNormalMap(size: number) {
  const height = new Float32Array(size * size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      // Tileable by sampling noise on a torus.
      const a = (x / size) * Math.PI * 2, b = (y / size) * Math.PI * 2;
      height[y * size + x] = fbm(Math.cos(a) * 3 + 10, Math.sin(a) * 3 + Math.cos(b) * 3, Math.sin(b) * 3 + 20);
    }
  const data = new Uint8Array(size * size * 4);
  const h = (x: number, y: number) => height[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * 6, dy = (h(x, y + 1) - h(x, y - 1)) * 6;
      const n = new THREE.Vector3(-dx, -dy, 1).normalize();
      const i = (y * size + x) * 4;
      data[i] = (n.x * 0.5 + 0.5) * 255;
      data[i + 1] = (n.y * 0.5 + 0.5) * 255;
      data[i + 2] = (n.z * 0.5 + 0.5) * 255;
      data[i + 3] = 255;
    }
  const tex = new THREE.DataTexture(data, size, size);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(190, 9);
  tex.anisotropy = 8;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.needsUpdate = true;
  return tex;
}

// Soft radial glow for the lamps.
function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,214,150,1)");
  grad.addColorStop(0.25, "rgba(255,160,70,0.45)");
  grad.addColorStop(1, "rgba(255,120,40,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const RADIUS = 5;

export default function CaveScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const section = document.querySelector<HTMLElement>("[data-cave]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 760 || window.matchMedia("(pointer: coarse)").matches;
    const TUBULAR = mobile ? 380 : 1300;
    const RADIAL = mobile ? 36 : 96;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !mobile, powerPreference: "high-performance" });
    } catch {
      return; // no WebGL: the CSS fallback gradient stays visible
    }
    renderer.setPixelRatio(mobile ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#120c08");
    scene.fog = new THREE.FogExp2("#120c08", 0.055);

    const camera = new THREE.PerspectiveCamera(68, 1, 0.1, 120);

    // The cave path: a long, gently winding tunnel the whole page travels through.
    const path = new THREE.CatmullRomCurve3(
      Array.from({ length: 20 }, (_, i) => new THREE.Vector3(Math.sin(i * 0.9) * 4, Math.cos(i * 0.7) * 1.2, -i * 12)),
    );

    const tube = new THREE.TubeGeometry(path, TUBULAR, RADIUS, RADIAL, false);
    const pos = tube.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const stone = new THREE.Color("#f3eadb");
    const crevice = new THREE.Color("#8a7458");
    const tile = new THREE.Color("#c9b496");
    const tmp = new THREE.Color();
    const p = new THREE.Vector3();
    const center = new THREE.Vector3();
    for (let k = 0; k < pos.count; k++) {
      const ring = Math.floor(k / (RADIAL + 1));
      path.getPointAt(ring / TUBULAR, center);
      p.fromBufferAttribute(pos, k);
      const dir = p.clone().sub(center);
      const n = fbm(p.x * 0.28, p.y * 0.28, p.z * 0.28);
      dir.multiplyScalar(0.7 + n * 0.6);
      p.copy(center).add(dir);
      // Flat, walkable floor like the restaurant's tiled aisle.
      const floor = center.y - 2.6;
      const onFloor = p.y <= floor;
      p.y = Math.max(p.y, floor);
      pos.setXYZ(k, p.x, p.y, p.z);
      // Recesses (low n = pushed outward) read darker: cheap baked ambient occlusion.
      if (onFloor) tmp.copy(tile).multiplyScalar(0.8 + noise(p.x * 3, 0, p.z * 3) * 0.2);
      else tmp.copy(crevice).lerp(stone, THREE.MathUtils.smoothstep(n, 0.25, 0.7));
      colors[k * 3] = tmp.r;
      colors[k * 3 + 1] = tmp.g;
      colors[k * 3 + 2] = tmp.b;
    }
    tube.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    tube.computeVertexNormals();

    const normalMap = rockNormalMap(256);
    const caveMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.92,
      metalness: 0,
      normalMap: mobile ? null : normalMap,
      normalScale: new THREE.Vector2(0.45, 0.45),
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(tube, caveMat));
    scene.add(new THREE.HemisphereLight("#fff0dc", "#2a1a10", 0.25));

    // Rattan pendant lamps hanging from the ceiling, each a warm point light.
    const lampGeo = new THREE.SphereGeometry(0.4, 32, 24);
    const cageGeo = new THREE.SphereGeometry(0.52, 18, 12);
    const lampMat = new THREE.MeshStandardMaterial({ color: "#ffd9a0", emissive: "#ffa040", emissiveIntensity: 3.2 });
    const cageMat = new THREE.MeshStandardMaterial({ color: "#7a4e24", wireframe: true });
    const cordMat = new THREE.LineBasicMaterial({ color: "#2b1d12" });
    const glow = glowTexture();
    const glowMat = new THREE.SpriteMaterial({
      map: glow,
      color: "#ffb060",
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const lamps: { group: THREE.Group; halo: THREE.Sprite; t: number }[] = [];
    const lampCount = mobile ? 12 : 20;
    for (let i = 0; i < lampCount; i++) {
      const t = 0.04 + i * (0.94 / lampCount);
      const c = path.getPointAt(t);
      const side = i % 2 === 0 ? -1.4 : 1.4;
      const g = new THREE.Group();
      g.position.set(c.x + side, c.y + 1.6, c.z);
      g.add(new THREE.Mesh(lampGeo, lampMat));
      g.add(new THREE.Mesh(cageGeo, cageMat));
      g.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.4, 0), new THREE.Vector3(0, 3, 0)]),
          cordMat,
        ),
      );
      const halo = new THREE.Sprite(glowMat);
      halo.scale.setScalar(3.4);
      g.add(halo);
      scene.add(g);
      lamps.push({ group: g, halo, t });
    }
    // Only the lamps around the camera cast real light; the pool hops ahead as you travel.
    const lights = Array.from({ length: mobile ? 3 : 6 }, () => {
      const l = new THREE.PointLight("#ffc283", 16, 20, 1.6);
      scene.add(l);
      return l;
    });

    // Bougainvillea petals drifting through the cave.
    const petalCount = mobile ? 60 : 420;
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, -0.08);
    petalShape.quadraticCurveTo(0.09, -0.02, 0.06, 0.06);
    petalShape.quadraticCurveTo(0, 0.1, -0.06, 0.06);
    petalShape.quadraticCurveTo(-0.09, -0.02, 0, -0.08);
    const petalGeo = new THREE.ShapeGeometry(petalShape, 6);
    const petalMat = new THREE.MeshStandardMaterial({
      color: "#d81b60",
      emissive: "#5a0a26",
      roughness: 0.55,
      side: THREE.DoubleSide,
    });
    const petals = new THREE.InstancedMesh(petalGeo, petalMat, petalCount);
    const seeds = Array.from({ length: petalCount }, () => ({
      t: Math.random() * 0.97,
      ox: (Math.random() - 0.5) * 6,
      oy: Math.random() * 6 - 2.5,
      speed: 0.25 + Math.random() * 0.5,
      spin: Math.random() * Math.PI * 2,
    }));
    const petalCenters = seeds.map((s) => path.getPointAt(s.t));
    scene.add(petals);
    const dummy = new THREE.Object3D();

    // Warm dust motes catching the lamplight.
    const dustCount = mobile ? 250 : 2800;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      path.getPointAt(Math.random() * 0.97, center);
      dustPos[i * 3] = center.x + (Math.random() - 0.5) * 7;
      dustPos[i * 3 + 1] = center.y + (Math.random() - 0.5) * 5;
      dustPos[i * 3 + 2] = center.z + (Math.random() - 0.5) * 4;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      map: glow,
      color: "#ffcf90",
      size: 0.06,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w < h ? 82 : 68;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove);

    // Camera follows the whole page scroll; the hero text fades on its own section's progress.
    let progress = 0, smooth = 0;
    const readScroll = () => {
      const doc = document.documentElement;
      progress = Math.min(1, Math.max(0, window.scrollY / (doc.scrollHeight - window.innerHeight || 1)));
      if (!section) return;
      const r = section.getBoundingClientRect();
      const hero = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight || 1)));
      section.style.setProperty("--p", hero.toFixed(4));
      section.toggleAttribute("data-past", hero > 0.38);
    };
    readScroll();
    window.addEventListener("scroll", readScroll, { passive: true });


    // The 3D ring gallery covers the screen; pause the cave there so phones stay smooth.
    let paused = false;
    const ring = document.querySelector(".ring-stage");
    const io = new IntersectionObserver(([e]) => (paused = e.intersectionRatio > 0.6), { threshold: [0, 0.6, 1] });
    if (ring) io.observe(ring);

    const camPos = new THREE.Vector3();
    const look = new THREE.Vector3();
    const clock = new THREE.Clock();
    let raf = 0;
    // Phones: cap at 30fps, and once scrolling settles stop drawing entirely so
    // the GPU is idle while someone is reading.
    let lastDraw = 0, lastScroll = performance.now();
    const onScrollTime = () => (lastScroll = performance.now());
    window.addEventListener("scroll", onScrollTime, { passive: true });

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (document.hidden || paused) return;
      if (mobile) {
        const now = performance.now();
        if (now - lastDraw < 33) return;
        if (now - lastScroll > 1200 && Math.abs(progress - smooth) < 0.0005 && lastDraw > 0) return;
        lastDraw = now;
      }
      const time = clock.getElapsedTime();
      smooth += (progress - smooth) * 0.06;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      const drift = reduceMotion ? 0 : Math.sin(time * 0.15) * 0.006;
      const t = Math.max(0.005, 0.012 + smooth * 0.93 + drift);
      path.getPointAt(t, camPos);
      path.getPointAt(Math.min(t + 0.025, 1), look);
      camera.position.set(camPos.x + mouse.x * 0.5, camPos.y - 0.4 - mouse.y * 0.3, camPos.z);
      look.x += mouse.x * 1.4;
      look.y += -0.2 - mouse.y * 0.8;
      camera.lookAt(look);

      const firstAhead = Math.max(0, lamps.findIndex((l) => l.t > t - 0.03));
      lights.forEach((light, k) => {
        const lamp = lamps[Math.min(firstAhead + k, lamps.length - 1)];
        lamp.group.getWorldPosition(light.position);
        light.intensity = 16 * (1 + Math.sin(time * 3 + k * 2) * 0.05 + Math.sin(time * 7.3 + k) * 0.02);
      });
      lamps.forEach(({ group, halo }, i) => {
        group.rotation.z = Math.sin(time * 0.8 + i) * 0.04;
        halo.material.opacity = 0.85 + Math.sin(time * 3 + i * 2) * 0.05;
      });

      for (let i = 0; i < petalCount; i++) {
        const s = seeds[i];
        const fall = reduceMotion ? 0 : time * s.speed;
        const y = ((s.oy - fall + 100 * 6) % 6) - 2.5;
        const center = petalCenters[i];
        dummy.position.set(center.x + s.ox + Math.sin(time * 0.6 + s.spin) * 0.4, center.y + y, center.z);
        dummy.rotation.set(time * 0.9 + s.spin, time * 0.6 + s.spin, s.spin);
        dummy.updateMatrix();
        petals.setMatrixAt(i, dummy.matrix);
      }
      petals.instanceMatrix.needsUpdate = true;
      if (!reduceMotion) dust.rotation.z = Math.sin(time * 0.05) * 0.02;

      renderer.render(scene, camera);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("scroll", onScrollTime);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Line || o instanceof THREE.Points) o.geometry.dispose();
      });
      [caveMat, lampMat, cageMat, cordMat, petalMat, glowMat, dustMat].forEach((m) => m.dispose());
      [normalMap, glow].forEach((t) => t.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="cave-bg" style={{ position: "fixed", inset: 0, zIndex: 0 }} aria-hidden />;
}
