/* =========================================================
   Honeymoon · Escenas 3D de los juegos (Three.js, assets/vendor/three)
   Estilo caricatura: sombreado por escalones (toon) y contornos ciruela como la marca.
   - HM_3D.soporta(): ¿el navegador tiene WebGL 2?
   - HM_3D.fresas(contenedor): vaso que se llena con capas y recibe toppings que caen
   - HM_3D.galletas(contenedor): bandeja con papel, masas y un horno con puerta, luz y temperatura
   Si no hay WebGL, los juegos usan sus dibujos 2D.
   ========================================================= */
import * as THREE from "../vendor/three/three.module.min.js";

const K = 0x4a1f48;
const reducido = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function soporta() {
  try { return !!document.createElement("canvas").getContext("webgl2"); } catch (e) { return false; }
}

/* ---------- Materiales ---------- */
const ESCALONES = (() => {
  const t = new THREE.DataTexture(new Uint8Array([120, 195, 255]), 3, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();
const mats = new Map();
const toon = (color, extra) => {
  const k = color + (extra ? JSON.stringify(extra) : "");
  if (!mats.has(k)) mats.set(k, new THREE.MeshToonMaterial({ color, gradientMap: ESCALONES, ...(extra || {}) }));
  return mats.get(k);
};
const toonPropio = (color, extra) => new THREE.MeshToonMaterial({ color, gradientMap: ESCALONES, ...(extra || {}) });
const plano = (color) => toon(color);
const BASICO_K = new THREE.MeshBasicMaterial({ color: K });

// Contorno empujando los vértices por su normal (para formas redondas)
const bordes = new Map();
function matBorde(g) {
  if (!bordes.has(g)) {
    const m = new THREE.MeshBasicMaterial({ color: K, side: THREE.BackSide });
    m.onBeforeCompile = (s) => { s.vertexShader = s.vertexShader.replace("#include <begin_vertex>", `vec3 transformed = position + normal * ${g.toFixed(4)};`); };
    m.customProgramCacheKey = () => "borde" + g;
    bordes.set(g, m);
  }
  return bordes.get(g);
}
function conBorde(mesh, g = .022) { mesh.add(new THREE.Mesh(mesh.geometry, matBorde(g))); return mesh; }
// Contorno de una caja (escalada un poquito más grande)
function caja(w, h, d, mat, g = .022) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  if (g) {
    const b = new THREE.Mesh(m.geometry, new THREE.MeshBasicMaterial({ color: K, side: THREE.BackSide }));
    b.scale.set(1 + 2 * g / w, 1 + 2 * g / h, 1 + 2 * g / d);
    m.add(b);
  }
  return m;
}
const sombra = (o) => { o.traverse((x) => { if (x.isMesh && x.material !== BASICO_K && !(x.material && x.material.side === THREE.BackSide)) x.castShadow = true; }); return o; };

/* ---------- Texturas dibujadas en canvas ---------- */
function lienzo(w, h, dibujar) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  dibujar(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
function texturaSvg(svg, w, h, alListo) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const img = new Image();
  img.onload = () => { c.getContext("2d").drawImage(img, 0, 0, w, h); t.needsUpdate = true; if (alListo) alListo(); };
  img.src = svg.startsWith("<") ? "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg) : svg;
  return t;
}
const texturaHony = () => texturaSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-26 -26 52 52">${window.HM_VASO ? window.HM_VASO.hony(0, 0, 24) : ""}</svg>`, 256, 256);

const EASE = {
  suave: (t) => t * t * (3 - 2 * t),
  sale: (t) => 1 - Math.pow(1 - t, 3),
  rebote: (t) => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; },
  atras: (t) => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
};

/* ---------- Motor: renderizador, cámara, luces y cocina ---------- */
function motor(cont, { fov = 32 } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.className = "hm-3d-canvas";
  canvas.setAttribute("aria-hidden", "true");
  cont.prepend(canvas);

  const escena = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(fov, 1, .1, 60);
  const mira = new THREE.Vector3();
  escena.add(new THREE.HemisphereLight(0xffffff, 0xd9bcd6, 1.2));
  const sol = new THREE.DirectionalLight(0xffffff, 1.65);
  sol.position.set(1.2, 7, 3.5);
  sol.castShadow = true;
  sol.shadow.mapSize.set(1024, 1024);
  Object.assign(sol.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 });
  sol.shadow.bias = -.002;
  sol.shadow.radius = 5;
  sol.shadow.intensity = .38;
  escena.add(sol);
  cocina(escena);

  const tweens = new Set(), cada = new Set(), oyentes = new Set();
  let ancho = 0, alto = 0, vivo = true, raf = 0;
  function medir() {
    const r = cont.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (w === ancho && h === alto) return;
    ancho = w; alto = h;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
    oyentes.forEach((f) => f());
  }
  const ro = new ResizeObserver(medir);
  ro.observe(cont);
  medir();
  function cuadro(ahora) {
    if (!vivo) return;
    raf = requestAnimationFrame(cuadro);
    if (document.hidden) return;
    tweens.forEach((tw) => {
      const t = Math.min(1, (ahora - tw.t0) / tw.dur);
      tw.fn(tw.ease(t));
      if (t >= 1) { tweens.delete(tw); if (tw.fin) tw.fin(); }
    });
    cada.forEach((f) => f(ahora));
    cam.lookAt(mira);
    renderer.render(escena, cam);
  }
  raf = requestAnimationFrame(cuadro);

  return {
    escena, cam, mira, renderer, canvas,
    animar(dur, fn, op = {}) {
      if (reducido() || dur <= 0) { fn(1); if (op.fin) op.fin(); return null; }
      const tw = { t0: performance.now() + (op.espera || 0), dur, fn, ease: op.ease || EASE.suave, fin: op.fin };
      tweens.add(tw);
      return tw;
    },
    cadaCuadro(f) { cada.add(f); },
    alCambiar(f) { oyentes.add(f); },
    tam: () => ({ ancho, alto }),
    proyectar(v) {
      cam.lookAt(mira);
      cam.updateMatrixWorld();
      const p = v.clone().project(cam);
      return { x: (p.x + 1) / 2 * ancho, y: (1 - p.y) / 2 * alto };
    },
    rayo(cx, cy, objetos) {
      const r = canvas.getBoundingClientRect();
      const v = new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
      cam.lookAt(mira);
      cam.updateMatrixWorld();
      const rc = new THREE.Raycaster();
      rc.setFromCamera(v, cam);
      return rc.intersectObjects(objetos, true)[0] || null;
    },
    destruir() {
      vivo = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      escena.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
      renderer.dispose();
      canvas.remove();
    }
  };
}

// Cocina: mesón lila con listones, pared con puntitos, repisa con frascos y el logo
function cocina(escena) {
  const puntos = lienzo(64, 64, (g) => { g.fillStyle = "#fbf2f9"; g.fillRect(0, 0, 64, 64); g.fillStyle = "rgba(196,142,191,.38)"; g.beginPath(); g.arc(32, 32, 3.2, 0, 7); g.fill(); });
  puntos.wrapS = puntos.wrapT = THREE.RepeatWrapping;
  puntos.repeat.set(22, 11);
  const pared = new THREE.Mesh(new THREE.PlaneGeometry(22, 11), new THREE.MeshBasicMaterial({ map: puntos }));
  pared.position.set(0, 3, -3.4);
  escena.add(pared);
  const listones = lienzo(128, 64, (g) => { g.fillStyle = "#ead2e7"; g.fillRect(0, 0, 128, 64); g.fillStyle = "#dcbcd8"; g.fillRect(124, 0, 4, 64); g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(0, 0, 128, 6); });
  listones.wrapS = THREE.RepeatWrapping;
  listones.repeat.set(20, 1);
  const tope = toon(0xf6e6f4);
  const meson = new THREE.Mesh(new THREE.BoxGeometry(20, 2, 6.4), [tope, tope, tope, tope, new THREE.MeshToonMaterial({ map: listones, gradientMap: ESCALONES }), tope]);
  meson.position.set(0, -1, -.4);
  meson.receiveShadow = true;
  escena.add(meson);
  const filo = new THREE.Mesh(new THREE.BoxGeometry(20, .05, .05), BASICO_K);
  filo.position.set(0, 0, 2.8);
  escena.add(filo);
  // Repisa con frascos
  const repisa = caja(2.4, .1, .5, toon(0xb77fb2));
  repisa.position.set(-2.7, 1.75, -3.1);
  escena.add(repisa);
  [[0xf6b8c6, .55], [0xfdd98c, .75], [0x9fd0f2, .5], [0xaee0b8, .62]].forEach(([c, h], i) => {
    const f = conBorde(new THREE.Mesh(new THREE.CylinderGeometry(.17, .17, h, 20), toon(c)), .018);
    f.position.set(-3.45 + i * .5, 1.8 + h / 2, -3.05);
    const tapa = conBorde(new THREE.Mesh(new THREE.CylinderGeometry(.19, .19, .08, 20), toon(0xffffff)), .015);
    tapa.position.y = h / 2 + .04;
    f.add(tapa);
    escena.add(f);
  });
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 1.25), new THREE.MeshBasicMaterial({ map: texturaSvg("assets/img/logo-honeymoon.svg", 456, 393), transparent: true, opacity: .35 }));
  logo.position.set(2.75, 2.05, -3.38);
  escena.add(logo);
}

/* =========================================================
   Fresas con crema: vaso de plástico con capas y toppings
   ========================================================= */
const PESO = { crema: 1, fresas: 1, salsas: 1.02, oreo: .42 };
const TOTAL = PESO.crema + PESO.fresas + PESO.salsas + PESO.oreo;

function fresas(cont) {
  const m = motor(cont, { fov: 30 });
  m.cam.position.set(0, 2.35, 5.7);
  m.mira.set(0, 1.2, 0);
  let vaso = null;
  const tiempo0 = performance.now();
  m.cadaCuadro((t) => { if (vaso && !reducido()) vaso.giro.rotation.y = Math.sin((t - tiempo0) / 1400) * .5; });

  const perfil = (grande) => ({ H: grande ? 2.05 : 1.6, rb: .56, rt: grande ? .88 : .82 });
  const radio = (p, y) => p.rb + (p.rt - p.rb) * (y / p.H);

  function crearVaso(grande) {
    const p = perfil(grande);
    const grupo = new THREE.Group(), giro = new THREE.Group();
    grupo.add(giro);
    // Plástico transparente
    const lado = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0, 0), new THREE.Vector2(p.rb, 0), new THREE.Vector2(p.rt, p.H)], 56),
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .2, roughness: .08, metalness: 0, side: THREE.DoubleSide, depthWrite: false }));
    lado.renderOrder = 2;
    grupo.add(lado);
    // Contornos: borde de arriba, base y silueta (el vaso es redondo: la silueta no cambia al girar)
    const aro = new THREE.Mesh(new THREE.TorusGeometry(p.rt, .032, 10, 72), BASICO_K);
    aro.rotation.x = Math.PI / 2;
    aro.position.y = p.H;
    const base = new THREE.Mesh(new THREE.TorusGeometry(p.rb, .026, 10, 64), BASICO_K);
    base.rotation.x = Math.PI / 2;
    base.position.y = .01;
    grupo.add(aro, base);
    const L = Math.hypot(p.H, p.rt - p.rb), incl = Math.atan((p.rt - p.rb) / p.H);
    [-1, 1].forEach((s) => {
      const lin = new THREE.Mesh(new THREE.CylinderGeometry(.026, .026, L, 8), BASICO_K);
      lin.position.set(s * (p.rb + p.rt) / 2, p.H / 2, 0);
      lin.rotation.z = -s * incl;
      grupo.add(lin);
    });
    // Brillo del plástico
    const brillo = new THREE.Mesh(new THREE.PlaneGeometry(.07, p.H * .78), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .55, depthWrite: false }));
    brillo.position.set(-(p.rb + p.rt) / 2 + .16, p.H * .5, (p.rb + p.rt) / 2 * .55);
    brillo.rotation.set(0, -.5, -incl);
    brillo.renderOrder = 3;
    grupo.add(brillo);
    // Sticker de Hony en el frente
    const yS = p.H * .38;
    const sticker = new THREE.Mesh(new THREE.CircleGeometry(.27, 40), new THREE.MeshBasicMaterial({ map: texturaHony(), transparent: true }));
    sticker.position.set(0, yS, radio(p, yS) + .012);
    sticker.rotation.x = -incl;
    sticker.renderOrder = 4;
    giro.add(sticker);
    m.escena.add(grupo);
    return { grupo, giro, p, grande, altura: .03, capas: [], tops: new Map(), orden: [] };
  }

  function quitarVaso() {
    if (!vaso) return;
    m.escena.remove(vaso.grupo);
    vaso.grupo.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
    vaso = null;
  }

  function banda(g, p, y0, a, b, color) {
    const geo = new THREE.CylinderGeometry(radio(p, y0 + b) - .04, radio(p, y0 + a) - .04, b - a, 48);
    geo.translate(0, (a + b) / 2, 0);
    const me = new THREE.Mesh(geo, toon(color));
    me.castShadow = true;
    g.add(me);
    return me;
  }

  function agregarCapa(tipo, animar) {
    const p = vaso.p;
    const y0 = vaso.altura;
    const h = ((PESO[tipo] || .5) / TOTAL) * (p.H - .16);
    const y1 = Math.min(p.H - .02, y0 + h), hh = Math.max(.05, y1 - y0);
    const g = new THREE.Group();
    g.position.y = y0;
    if (tipo === "crema") {
      banda(g, p, y0, 0, hh, 0xfff4e2);
    } else if (tipo === "fresas") {
      banda(g, p, y0, 0, hh, 0xf9cdd5);
      const n = 9;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + (vaso.capas.length % 2) * .35;
        const yy = hh * (.35 + (i % 2) * .3);
        const rr = radio(p, y0 + yy) - .09;
        const f = new THREE.Mesh(new THREE.SphereGeometry(.13, 16, 12), toon(0xe0364f));
        f.scale.set(1, .85, .5);
        f.position.set(Math.cos(a) * rr, yy, Math.sin(a) * rr);
        f.lookAt(Math.cos(a) * 9, yy + y0, Math.sin(a) * 9);
        const centro = new THREE.Mesh(new THREE.SphereGeometry(.07, 12, 8), toon(0xf7a1ac));
        centro.position.z = .08;
        f.add(centro);
        g.add(f);
      }
    } else if (tipo === "salsas") {
      banda(g, p, y0, 0, hh / 3, 0xfffaf1);
      banda(g, p, y0, hh / 3, hh * 2 / 3, 0xc98a3c);
      banda(g, p, y0, hh * 2 / 3, hh, 0xd42a46);
    } else if (tipo === "oreo") {
      banda(g, p, y0, 0, hh, 0x3a2e2b);
      for (let i = 0; i < 16; i++) {
        const r = Math.sqrt(Math.random()) * (radio(p, y1) - .14), a = Math.random() * 7;
        const c = new THREE.Mesh(new THREE.BoxGeometry(.07, .03, .06), toon(i % 3 ? 0x5c4a45 : 0xf4ede4));
        c.position.set(Math.cos(a) * r, hh + .012, Math.sin(a) * r);
        c.rotation.set(Math.random(), Math.random() * 3, Math.random());
        g.add(c);
      }
    } else {
      banda(g, p, y0, 0, hh, 0xffffff);
    }
    vaso.giro.add(g);
    vaso.capas.push(g);
    vaso.altura = y1;
    if (animar) { g.scale.y = .01; m.animar(380, (t) => (g.scale.y = .01 + .99 * t), { ease: EASE.sale }); }
  }

  /* Toppings 3D */
  function topping(tipo) {
    const g = new THREE.Group();
    if (tipo === "queso") {
      for (let i = 0; i < 14; i++) {
        const tira = new THREE.Mesh(new THREE.BoxGeometry(.17, .035, .035), toon(i % 3 ? 0xfffdf4 : 0xf3e6c4));
        const r = Math.random() * .16, a = Math.random() * 7;
        tira.position.set(Math.cos(a) * r, .03 + (.16 - r) * .5 + Math.random() * .04, Math.sin(a) * r);
        tira.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        g.add(tira);
      }
      const monton = conBorde(new THREE.Mesh(new THREE.SphereGeometry(.17, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(0xfffaf0)), .016);
      monton.scale.y = .55;
      g.add(monton);
    } else if (tipo === "chocoramo") {
      const choco = toon(0x4a2414), bizcocho = toon(0xf2c46d);
      const c = new THREE.Mesh(new THREE.BoxGeometry(.38, .24, .3), [bizcocho, choco, choco, choco, choco, choco]);
      const b = new THREE.Mesh(c.geometry, new THREE.MeshBasicMaterial({ color: K, side: THREE.BackSide }));
      b.scale.set(1.08, 1.1, 1.1);
      c.add(b);
      c.position.y = .12;
      c.rotation.y = .5;
      g.add(c);
    } else if (tipo === "piazza") {
      [[-.06, .07, .3], [.07, .16, -.25]].forEach(([x, y, r]) => {
        const rollo = conBorde(new THREE.Mesh(new THREE.CylinderGeometry(.065, .065, .48, 18), toon(0xe8c27a)), .014);
        rollo.rotation.set(0, r, Math.PI / 2);
        rollo.position.set(x, y, 0);
        [-1, 1].forEach((s) => {
          const punta = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .02, 14), toon(0x6b3a22));
          punta.position.y = s * .245;
          rollo.add(punta);
        });
        g.add(rollo);
      });
    } else if (tipo === "oreo") {
      const galleta = new THREE.Group();
      [[.035, 0x2b2422, .2, .045], [-.035, 0x2b2422, .2, .045], [0, 0xfbf7ef, .18, .035]].forEach(([y, c, r, h]) => {
        const d = conBorde(new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 28), toon(c)), .014);
        d.position.y = y;
        galleta.add(d);
      });
      galleta.rotation.set(1.15, 0, .2);
      galleta.position.y = .2;
      g.add(galleta);
    }
    return sombra(g);
  }
  const PUESTOS = [[0, .06], [-.34, .12], [.34, .12], [0, -.3], [-.24, -.26], [.24, -.26]];

  function pintar(estado) {
    if (!estado) { quitarVaso(); return; }
    if (!vaso || vaso.grande !== !!estado.grande) {
      quitarVaso();
      vaso = crearVaso(!!estado.grande);
      const g = vaso.grupo;
      g.position.y = 2.4;
      m.animar(480, (t) => (g.position.y = 2.4 * (1 - t)), { ease: EASE.atras });
    }
    const capas = estado.capas || [];
    while (vaso.capas.length < capas.length) agregarCapa(capas[vaso.capas.length], true);
    // Toppings: las porciones que ya estaban se quedan; las nuevas caen
    const claves = [];
    Object.entries(estado.toppings || {}).forEach(([tipo, n]) => { for (let i = 0; i < n; i++) claves.push(`${tipo}-${i}`); });
    vaso.orden = vaso.orden.filter((k) => claves.includes(k));
    [...vaso.tops.keys()].forEach((k) => { if (!claves.includes(k)) { vaso.giro.remove(vaso.tops.get(k)); vaso.tops.delete(k); } });
    claves.filter((k) => !vaso.tops.has(k)).forEach((k) => {
      const i = vaso.orden.length;
      vaso.orden.push(k);
      const obj = topping(k.split("-")[0]);
      obj.scale.setScalar(1.3);
      const [x, z] = PUESTOS[i % PUESTOS.length];
      const y = vaso.altura - .02 + Math.floor(i / PUESTOS.length) * .14 + (i === 3 ? .12 : 0);
      obj.position.set(x, y + 3, z);
      vaso.giro.add(obj);
      vaso.tops.set(k, obj);
      const r0 = Math.random() * 3;
      m.animar(650, (t) => { obj.position.y = y + 3 * (1 - t); obj.rotation.y = r0 * (1 - t); }, { ease: EASE.rebote });
    });
  }

  function entregar(ok) {
    if (!vaso) return;
    const g = vaso.grupo;
    if (ok) m.animar(900, (t) => { g.position.x = 5 * t * t; g.position.y = Math.sin(Math.min(1, t * 2) * Math.PI) * .5; g.rotation.z = -.3 * t; }, { ease: (t) => t });
    else m.animar(520, (t) => { g.rotation.z = Math.sin(t * Math.PI * 6) * .14 * (1 - t); g.position.x = Math.sin(t * Math.PI * 6) * .15 * (1 - t); }, { ease: (t) => t });
  }

  return { pintar, entregar, destruir: () => { quitarVaso(); m.destruir(); } };
}

/* =========================================================
   Galletas al horno: bandeja, papel con marcas, masas y horno
   ========================================================= */
function galletas(cont) {
  const m = motor(cont, { fov: 34 });
  const TOMA_A = { pos: new THREE.Vector3(0, 3.45, 2.6), mira: new THREE.Vector3(0, 0, .3) };
  const TOMA_B = { pos: new THREE.Vector3(0, 1.7, 3.75), mira: new THREE.Vector3(0, .82, -.9) };
  const BANDEJA_A = new THREE.Vector3(0, .02, .42), BANDEJA_B = new THREE.Vector3(0, .5, -1.6);
  const PW = 2.2, PD = 1.65; // papel de 4×3
  m.cam.position.copy(TOMA_A.pos);
  m.mira.copy(TOMA_A.mira);

  /* Bandeja */
  const bandeja = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0xc6cbd1, metalness: .55, roughness: .38 });
  const fondo = caja(2.5, .07, 1.95, metal, .02);
  fondo.receiveShadow = true;
  bandeja.add(fondo);
  [[0, .06, .975, 2.56, .12, .07], [0, .06, -.975, 2.56, .12, .07], [1.25, .06, 0, .07, .12, 1.95], [-1.25, .06, 0, .07, .12, 1.95]].forEach(([x, y, z, w, h, d]) => {
    const r = caja(w, h, d, metal, .018);
    r.position.set(x, y, z);
    bandeja.add(r);
  });
  sombra(bandeja);
  bandeja.position.copy(BANDEJA_A);
  m.escena.add(bandeja);

  /* Papel con las marcas de los puntos */
  const papel = new THREE.Group();
  const pergamino = lienzo(512, 384, (g, w, h) => {
    g.fillStyle = "#f6ead2"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(160,120,60,${Math.random() * .035})`; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 20 + Math.random() * 60, 0, 7); g.fill(); }
    g.strokeStyle = "rgba(160,120,60,.25)"; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
  });
  const hoja = new THREE.Mesh(new THREE.PlaneGeometry(PW, PD), toonPropio(0xffffff, { map: pergamino }));
  hoja.rotation.x = -Math.PI / 2;
  hoja.receiveShadow = true;
  papel.add(hoja);
  const marcasCanvas = document.createElement("canvas");
  marcasCanvas.width = 1024; marcasCanvas.height = 768;
  const marcasTex = new THREE.CanvasTexture(marcasCanvas);
  marcasTex.colorSpace = THREE.SRGBColorSpace;
  marcasTex.anisotropy = 4;
  const marcas = new THREE.Mesh(new THREE.PlaneGeometry(PW, PD), new THREE.MeshBasicMaterial({ map: marcasTex, transparent: true, depthWrite: false }));
  marcas.rotation.x = -Math.PI / 2;
  marcas.position.y = .003;
  papel.add(marcas);
  const masas = new THREE.Group();
  papel.add(masas);
  papel.position.y = .045;
  papel.visible = false;
  bandeja.add(papel);

  /* Horno: cuerpo, panel con temperatura, puerta de vidrio con bisagra y luz adentro */
  const horno = new THREE.Group();
  horno.position.set(0, 0, -1.6);
  const blanco = toon(0xffffff), lila = toon(0xb07aab), oscuro = toonPropio(0x3a2338, { emissive: 0x000000 });
  const W = 2.6, H = 1.95, D = 1.75, ab = { x0: -1.02, x1: 1.02, y0: .24, y1: 1.32 };
  [[0, H - .05, 0, W, .1, D], [0, .05, 0, W, .1, D], [-W / 2 + .05, H / 2, 0, .1, H, D], [W / 2 - .05, H / 2, 0, .1, H, D], [0, H / 2, -D / 2 + .05, W, H, .1]].forEach(([x, y, z, w, h, d]) => {
    const p = caja(w, h, d, blanco, .022);
    p.position.set(x, y, z);
    horno.add(p);
  });
  // Marco del frente alrededor de la puerta
  const zf = D / 2 - .04;
  [[0, (ab.y1 + H) / 2, (H - ab.y1), W, lila], [0, ab.y0 / 2, ab.y0, W, blanco], [(ab.x0 - W / 2) / 2, (ab.y0 + ab.y1) / 2, ab.y1 - ab.y0, W / 2 + ab.x0, blanco], [(ab.x1 + W / 2) / 2, (ab.y0 + ab.y1) / 2, ab.y1 - ab.y0, W / 2 - ab.x1, blanco]]
    .forEach(([x, y, h, w, mat]) => { const p = caja(w, h, .1, mat, .022); p.position.set(x, y, zf); horno.add(p); });
  // Interior oscuro que se ilumina al hornear
  const dentro = new THREE.Mesh(new THREE.BoxGeometry(W - .22, H - .22, D - .2), oscuro);
  dentro.material.side = THREE.BackSide;
  dentro.position.set(0, H / 2, -.02);
  horno.add(dentro);
  const rejilla = new THREE.Mesh(new THREE.BoxGeometry(W - .3, .02, D - .4), toon(0x8a8f96));
  rejilla.position.set(0, BANDEJA_B.y - .04, 0);
  horno.add(rejilla);
  const luz = new THREE.PointLight(0xff8a3c, 0, 4, 1.4);
  luz.position.set(0, 1.05, 0);
  horno.add(luz);
  // Pantalla con la temperatura y perillas
  const pantallaCanvas = document.createElement("canvas");
  pantallaCanvas.width = 256; pantallaCanvas.height = 96;
  const pantallaTex = new THREE.CanvasTexture(pantallaCanvas);
  pantallaTex.colorSpace = THREE.SRGBColorSpace;
  const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(.92, .34), new THREE.MeshBasicMaterial({ map: pantallaTex }));
  pantalla.position.set(0, (ab.y1 + H) / 2, D / 2 + .015);
  horno.add(pantalla);
  [-.88, .88].forEach((x) => {
    const p = conBorde(new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .08, 24), blanco), .018);
    p.rotation.x = Math.PI / 2;
    p.position.set(x, (ab.y1 + H) / 2, D / 2 + .04);
    const raya = new THREE.Mesh(new THREE.BoxGeometry(.03, .1, .02), BASICO_K);
    raya.position.set(0, .045, -.03);
    raya.rotation.x = -Math.PI / 2;
    p.add(raya);
    horno.add(p);
  });
  // Puerta con bisagra a la izquierda
  const bisagra = new THREE.Group();
  bisagra.position.set(ab.x0, ab.y0, D / 2 + .03);
  const pw = ab.x1 - ab.x0, ph = ab.y1 - ab.y0;
  [[pw / 2, .07, pw, .14], [pw / 2, ph - .07, pw, .14], [.07, ph / 2, .14, ph], [pw - .07, ph / 2, .14, ph]].forEach(([x, y, w, h]) => {
    const p = caja(w, h, .07, blanco, .02);
    p.position.set(x, y, 0);
    bisagra.add(p);
  });
  const vidrio = new THREE.Mesh(new THREE.PlaneGeometry(pw - .26, ph - .26), new THREE.MeshStandardMaterial({ color: 0x2d1b2c, transparent: true, opacity: .42, roughness: .05, metalness: .2, depthWrite: false }));
  vidrio.position.set(pw / 2, ph / 2, .01);
  vidrio.renderOrder = 2;
  bisagra.add(vidrio);
  const reflejo = new THREE.Mesh(new THREE.PlaneGeometry(.06, ph - .4), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .35, depthWrite: false }));
  reflejo.position.set(.35, ph / 2, .02);
  reflejo.rotation.z = -.5;
  reflejo.renderOrder = 3;
  bisagra.add(reflejo);
  const manija = conBorde(new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, pw * .6, 14), toon(0xc48ebf)), .016);
  manija.rotation.z = Math.PI / 2;
  manija.position.set(pw / 2, ph + .02, .1);
  bisagra.add(manija);
  horno.add(bisagra);
  sombra(horno);
  m.escena.add(horno);

  /* Estado de la orden */
  let puntos = [], diam = 15, matMasa = toonPropio(0xebc283), temp = 150;
  const objetos = new Map();

  function dibujarPantalla() {
    const g = pantallaCanvas.getContext("2d");
    g.fillStyle = "#2a1a29"; g.fillRect(0, 0, 256, 96);
    g.fillStyle = "#ffb347"; g.font = "800 58px Montserrat, system-ui, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(`${temp}°`, 128, 52);
    pantallaTex.needsUpdate = true;
  }
  dibujarPantalla();

  function dibujarMarcas() {
    const g = marcasCanvas.getContext("2d"), w = 1024, h = 768;
    g.clearRect(0, 0, w, h);
    puntos.forEach(([x, y]) => {
      const cx = (x / 100) * w, cy = (y / 100) * h, r = (diam / 100) * w / 2 - 6;
      g.fillStyle = "rgba(201,138,60,.13)"; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
      g.setLineDash([22, 14]); g.lineWidth = 9; g.strokeStyle = "#c98a3c"; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
    });
    marcasTex.needsUpdate = true;
  }

  const local = ([x, y]) => new THREE.Vector3((x / 100 - .5) * PW, 0, (y / 100 - .5) * PD);
  const rDiam = () => (diam / 100) * PW;

  function masa(i, animar = true) {
    if (objetos.has(i)) return;
    const r = rDiam() * .4;
    const bola = conBorde(new THREE.Mesh(new THREE.SphereGeometry(r, 22, 16), matMasa), .014);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + Math.random(), e = .3 + Math.random() * .9;
      const chip = new THREE.Mesh(new THREE.SphereGeometry(r * .17, 8, 6), toon(0x4a2414));
      chip.position.set(Math.cos(a) * r * .55, r * Math.sin(e) * .75, Math.sin(a) * r * .55);
      bola.add(chip);
    }
    const g = new THREE.Group();
    g.add(bola);
    g.position.copy(local(puntos[i]));
    g.position.y = r * .55;
    g.scale.set(1, .72, 1);
    sombra(g);
    masas.add(g);
    objetos.set(i, g);
    if (animar) m.animar(320, (t) => g.scale.set(t, .72 * t, t), { ease: EASE.atras });
  }

  // Tocó el papel fuera de un punto: la masa cae, se aplasta y desaparece
  function caida(cx, cy) {
    if (!papel.visible) return false;
    const hit = m.rayo(cx, cy, [hoja]);
    if (!hit) return false;
    const p = papel.worldToLocal(hit.point.clone());
    const mat = toonPropio(0xebc283, { transparent: true });
    const b = conBorde(new THREE.Mesh(new THREE.SphereGeometry(rDiam() * .32, 16, 12), mat), .012);
    b.position.set(p.x, .1, p.z);
    masas.add(b);
    m.animar(800, (t) => { b.scale.set(1 + t * .5, Math.max(.08, 1 - t * 1.2), 1 + t * .5); b.position.y = .1 * (1 - t); mat.opacity = 1 - t; }, { ease: (t) => t, fin: () => masas.remove(b) });
    return true;
  }

  function moverCamara(toma, dur) {
    const p0 = m.cam.position.clone(), q0 = m.mira.clone();
    m.animar(dur, (t) => { m.cam.position.lerpVectors(p0, toma.pos, t); m.mira.lerpVectors(q0, toma.mira, t); });
  }

  return {
    reiniciar() {
      masas.clear();
      objetos.clear();
      matMasa = toonPropio(0xebc283);
      papel.visible = false;
      marcas.material.opacity = 1;
      bandeja.position.copy(BANDEJA_A);
      bisagra.rotation.y = 0;
      luz.intensity = 0;
      oscuro.emissive.setHex(0x000000);
      horno.position.x = 0;
      m.cam.position.copy(TOMA_A.pos);
      m.mira.copy(TOMA_A.mira);
    },
    papel(pts, d) {
      puntos = pts;
      diam = d;
      dibujarMarcas();
      papel.visible = true;
      papel.position.y = 1.2;
      papel.rotation.z = -.15;
      m.animar(420, (t) => { papel.position.y = 1.2 - (1.2 - .045) * t; papel.rotation.z = -.15 * (1 - t); }, { ease: EASE.sale });
    },
    masa(i) { masa(i); },
    caida,
    ocultarMarcas(dur) { const mat = marcas.material; m.animar(dur, (t) => (mat.opacity = 1 - t)); },
    // Puntos en pantalla (px dentro del contenedor) con la bandeja y la cámara en su lugar inicial
    puntosPantalla() {
      const pos = m.cam.position.clone(), mi = m.mira.clone();
      m.cam.position.copy(TOMA_A.pos);
      m.mira.copy(TOMA_A.mira);
      const base = BANDEJA_A.clone().add(new THREE.Vector3(0, .05, 0));
      const lista = puntos.map((pt) => {
        const c = base.clone().add(local(pt));
        const a = m.proyectar(c), b = m.proyectar(c.clone().add(new THREE.Vector3(rDiam() / 2, 0, 0)));
        return { x: a.x, y: a.y, d: Math.abs(b.x - a.x) * 2 };
      });
      const esquinas = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz]) => m.proyectar(base.clone().add(new THREE.Vector3(sx * PW / 2, 0, sz * PD / 2))));
      const caja2d = { x0: Math.min(...esquinas.map((e) => e.x)), x1: Math.max(...esquinas.map((e) => e.x)), y0: Math.min(...esquinas.map((e) => e.y)), y1: Math.max(...esquinas.map((e) => e.y)) };
      m.cam.position.copy(pos);
      m.mira.copy(mi);
      return { puntos: lista, papel: caja2d };
    },
    alCambiar: m.alCambiar,
    alHorno() {
      moverCamara(TOMA_B, 900);
      m.animar(320, (t) => (bisagra.rotation.y = -1.75 * t));
      const p0 = bandeja.position.clone();
      m.animar(560, (t) => {
        bandeja.position.x = 0;
        bandeja.position.y = p0.y + (BANDEJA_B.y - p0.y) * Math.min(1, t * 2.2);
        bandeja.position.z = p0.z + (BANDEJA_B.z - p0.z) * EASE.suave(Math.max(0, (t - .2) / .8));
      }, { espera: 260, ease: (t) => t });
      m.animar(320, (t) => (bisagra.rotation.y = -1.75 * (1 - t)), { espera: 840 });
    },
    temp(t) { temp = t; dibujarPantalla(); },
    prender(on) {
      const i0 = luz.intensity, i1 = on ? 9 : 0;
      m.animar(350, (t) => { luz.intensity = i0 + (i1 - i0) * t; oscuro.emissive.setRGB(.45 * (on ? t : 1 - t), .16 * (on ? t : 1 - t), .04 * (on ? t : 1 - t)); });
    },
    // f: avance del horneado (0 a 1); color: el de la galleta
    hornear(f, color, aplastar) {
      matMasa.color.set(color);
      const p = Math.min(1, aplastar);
      objetos.forEach((g) => g.scale.set(1 + .16 * p, .72 - .36 * p, 1 + .16 * p));
    },
    entregar(ok) {
      this.prender(false);
      if (!ok) m.animar(520, (t) => (horno.position.x = Math.sin(t * Math.PI * 6) * .12 * (1 - t)), { ease: (t) => t });
    },
    destruir() { m.destruir(); }
  };
}

window.HM_3D = { soporta, fresas, galletas };
