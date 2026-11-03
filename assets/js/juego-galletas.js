/* =========================================================
   Honeymoon · Juego "Galletas al horno"
   1. Pon el papel en la bandeja. 2. Pon una masa en cada punto que marca el papel
   (si tocas fuera, pierdes 2 segundos). 3. Mete la bandeja al horno y ponlo a la temperatura
   del pedido. 4. Hornea y saca las galletas cuando estén doradas: ni crudas ni quemadas.
   Cada nivel trae más puntos, formas más difíciles, menos tiempo y un horno más rápido.
   ========================================================= */
(function () {
  "use strict";

  const P = window.HM_MENU.find((p) => p.id === "galletas");
  const K = "#4a1f48";
  const TEMP_MIN = 150, TEMP_MAX = 220;

  /* ---------- Formas del papel (puntos en un cuadrado de 0 a 1) ---------- */
  const FORMAS = {
    cuadricula: { nombre: "cuadrícula", puntos: (n) => {
      const cols = n <= 4 ? 2 : n === 8 || n >= 10 ? 4 : 3, filas = Math.ceil(n / cols);
      return Array.from({ length: n }, (_, i) => [cols === 1 ? .5 : (i % cols) / (cols - 1), filas === 1 ? .5 : Math.floor(i / cols) / (filas - 1)]);
    } },
    zigzag: { nombre: "zigzag", puntos: (n) => Array.from({ length: n }, (_, i) => [i / (n - 1), i % 2 ? .85 : .15]) },
    circulo: { nombre: "círculo", puntos: (n) => Array.from({ length: n }, (_, i) => {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2;
      return [.5 + .5 * Math.cos(a), .5 + .5 * Math.sin(a)];
    }) },
    corazon: { nombre: "corazón", puntos: (n) => normalizar(Array.from({ length: n }, (_, i) => {
      const t = (Math.PI * 2 * i) / n;
      return [16 * Math.pow(Math.sin(t), 3), -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))];
    })) },
    // Luna creciente: arco de afuera y arco de adentro
    luna: { nombre: "luna", puntos: (n) => {
      const fuera = Math.ceil(n * .6), dentro = n - fuera;
      const a = Array.from({ length: fuera }, (_, i) => { const g = (70 + (220 * i) / (fuera - 1)) * Math.PI / 180; return [Math.cos(g), Math.sin(g)]; });
      const b = Array.from({ length: dentro }, (_, i) => { const g = (118 + (124 * (i + 1)) / (dentro + 1)) * Math.PI / 180; return [.42 + .72 * Math.cos(g), .72 * Math.sin(g)]; });
      return normalizar(a.concat(b));
    } },
    equis: { nombre: "X", puntos: (n) => {
      const lado = Math.ceil((n + 1) / 2);
      const pts = Array.from({ length: lado }, (_, i) => [i / (lado - 1), i / (lado - 1)]);
      for (let i = 0; i < lado; i++) { const p = [i / (lado - 1), 1 - i / (lado - 1)]; if (!pts.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < .05)) pts.push(p); }
      return pts.slice(0, n);
    } }
  };
  function normalizar(pts) {
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    return pts.map(([x, y]) => [(x - x0) / (x1 - x0 || 1), (y - y0) / (y1 - y0 || 1)]);
  }

  // Formas por nivel y tamaño del punto (% del ancho del papel)
  const NIVELES = [
    null,
    { formas: [["cuadricula", 4]], d: 17 },
    { formas: [["cuadricula", 6], ["zigzag", 6], ["circulo", 6]], d: 15.5 },
    { formas: [["cuadricula", 9], ["circulo", 8], ["zigzag", 8]], d: 14 },
    { formas: [["corazon", 10], ["luna", 9], ["equis", 9], ["circulo", 10]], d: 13 },
    { formas: [["corazon", 12], ["luna", 11], ["cuadricula", 12], ["equis", 11]], d: 12 }
  ];
  // Papel de 4×3: los puntos no se tocan
  const separados = (pts, d) => pts.every((a, i) => pts.every((b, k) => k <= i || Math.hypot((a[0] - b[0]) * 4, (a[1] - b[1]) * 3) >= (d / 100) * 4 * 1.15));

  /* ---------- Dibujos ---------- */
  const ICONO = {
    puntos: `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><rect x="5" y="8" width="30" height="24" rx="3" fill="#f6ead2" stroke="${K}" stroke-width="2"/>${[[13, 16], [20, 16], [27, 16], [13, 24], [20, 24], [27, 24]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="none" stroke="#c98a3c" stroke-width="1.6" stroke-dasharray="2 1.4"/>`).join("")}</svg>`,
    termometro: `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><rect x="16" y="5" width="8" height="22" rx="4" fill="#fff" stroke="${K}" stroke-width="2"/><circle cx="20" cy="30" r="6" fill="#e0364f" stroke="${K}" stroke-width="2"/><rect x="18.5" y="14" width="3" height="14" fill="#e0364f"/></svg>`,
    papel: `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M7 9 H33 V29 Q28 33 20 29 Q12 25 7 29Z" fill="#f6ead2" stroke="${K}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="15" cy="17" r="2.6" fill="none" stroke="#c98a3c" stroke-width="1.5" stroke-dasharray="2 1.4"/><circle cx="25" cy="17" r="2.6" fill="none" stroke="#c98a3c" stroke-width="1.5" stroke-dasharray="2 1.4"/></svg>`,
    horno: `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><rect x="5" y="7" width="30" height="27" rx="4" fill="#fff" stroke="${K}" stroke-width="2.2"/><rect x="5" y="7" width="30" height="7" rx="3" fill="#c48ebf" stroke="${K}" stroke-width="2.2"/><rect x="10" y="17" width="20" height="13" rx="2.5" fill="#3a2338" stroke="${K}" stroke-width="2"/><path d="M13 26 H27" stroke="#ffb347" stroke-width="2" stroke-linecap="round"/></svg>`
  };

  const portada = () => `<svg viewBox="0 0 200 160" aria-hidden="true" focusable="false">
    <ellipse cx="100" cy="146" rx="84" ry="8" fill="${K}" opacity=".12"/>
    <rect x="18" y="38" width="164" height="104" rx="14" fill="#b9bec4" stroke="${K}" stroke-width="3"/>
    <rect x="28" y="47" width="144" height="86" rx="6" fill="#f6ead2" stroke="#d9c4a0" stroke-width="2"/>
    ${[[56, 72], [100, 72], [144, 72], [56, 110], [100, 110], [144, 110]].map(([x, y], i) => `<g transform="translate(${x} ${y})">
      <circle r="17" fill="${i === 4 ? "#f3d9a4" : "#e2a85a"}" stroke="${K}" stroke-width="2.4"/>
      ${[[-7, -6], [5, -8], [8, 4], [-4, 7], [0, -1]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="2.6" fill="#4a2414"/>`).join("")}</g>`).join("")}
    <g transform="translate(150 22) rotate(12)"><path d="M0 0 H34 L30 40 H4Z" fill="#fff" fill-opacity=".7" stroke="${K}" stroke-width="2.4" stroke-linejoin="round"/>
      <circle cx="17" cy="22" r="9" fill="#c48ebf" stroke="#fff" stroke-width="1.6"/></g>
  </svg>`;

  /* ---------- Estado ---------- */
  let ctx = null, ped = null;
  let fase = "vacia"; // vacia → papel → horno → horneando
  let masas = new Set();
  let temp = TEMP_MIN;
  let horneo = null; // { inicio, dur, f, enZona, raf }

  const q = (sel) => ctx.escenario.querySelector(sel) || ctx.controles.querySelector(sel);

  function preparar(c) {
    ctx = c;
    ctx.escenario.innerHTML = `
      <div class="hm-hornear">
        <div class="hm-bandeja" id="gBandeja">
          <div class="hm-papel" id="gPapelZona" hidden></div>
          <p class="hm-mesa-vacia" id="gVacia"><i class="bi bi-arrow-down-circle" aria-hidden="true"></i>Pon el papel en la bandeja</p>
        </div>
        <div class="hm-horno" id="gHorno" hidden>
          <div class="hm-horno-svg" id="gHornoSvg"></div>
          <div class="hm-coccion" id="gCoccion" aria-hidden="true">
            <span class="hm-coccion-zona" id="gZonaDorada"></span>
            <span class="hm-coccion-aguja" id="gAguja"></span>
          </div>
          <div class="hm-coccion-etq" aria-hidden="true"><span>Crudas</span><span>Doradas</span><span>Quemadas</span></div>
        </div>
      </div>`;
    ctx.controles.innerHTML = `
      <div class="hm-ctrl-wrap" id="gCtrl">
        <div class="hm-ctrl">
          <h2 class="hm-ctrl-tit">1 · Bandeja <small>papel y una masa en cada punto</small></h2>
          <div class="hm-ctrl-btns is-2">
            <button type="button" class="hm-jbtn" id="gPapel"><span class="hm-jbtn-ic">${ICONO.papel}</span><span>Papel</span></button>
            <button type="button" class="hm-jbtn" id="gAlHorno"><span class="hm-jbtn-ic">${ICONO.horno}</span><span>Al horno</span></button>
          </div>
        </div>
        <div class="hm-ctrl">
          <h2 class="hm-ctrl-tit">2 · Temperatura <small>la del pedido</small></h2>
          <div class="hm-temp">
            <button type="button" class="hm-jbtn is-temp" id="gMenos" aria-label="Bajar la temperatura"><i class="bi bi-dash-lg" aria-hidden="true"></i></button>
            <output class="hm-temp-valor" id="gTemp" aria-live="polite">${TEMP_MIN} °C</output>
            <button type="button" class="hm-jbtn is-temp" id="gMas" aria-label="Subir la temperatura"><i class="bi bi-plus-lg" aria-hidden="true"></i></button>
          </div>
        </div>
        <div class="hm-ctrl-acciones">
          <button type="button" class="btn btn-hm btn-hm-paper" id="gBotar"><i class="bi bi-trash3 me-1" aria-hidden="true"></i>Botar</button>
          <button type="button" class="btn btn-hm btn-hm-primary" id="gHornear"><i class="bi bi-fire me-1" aria-hidden="true"></i><span>Hornear</span></button>
        </div>
      </div>`;
    ctx.controles.querySelector("#gCtrl").addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b || b.disabled) return;
      if (b.id === "gPapel") ponerPapel();
      else if (b.id === "gAlHorno") alHorno();
      else if (b.id === "gMenos") cambiarTemp(-1);
      else if (b.id === "gMas") cambiarTemp(1);
      else if (b.id === "gHornear") (fase === "horneando" ? sacar() : hornear());
      else if (b.id === "gBotar") botar();
    });
    ctx.escenario.querySelector("#gPapelZona").addEventListener("click", tocarPapel);
  }

  const paso = () => (ctx.nivel() >= 4 ? 5 : 10);

  function crearPedido(nv) {
    const N = NIVELES[Math.min(nv, NIVELES.length - 1)];
    let [forma, n] = N.formas[ctx.azar(N.formas.length)];
    let pts = FORMAS[forma].puntos(n);
    while (!separados(pts, N.d) && n > 4) pts = FORMAS[forma].puntos(--n);
    // Desde el nivel 6 los puntos se corren un poquito
    if (nv >= 6) pts = pts.map(([x, y]) => [Math.min(1, Math.max(0, x + (Math.random() - .5) * .06)), Math.min(1, Math.max(0, y + (Math.random() - .5) * .06))]);
    const temps = nv >= 4 ? [155, 160, 165, 170, 175, 180, 185, 190, 195] : [160, 170, 180, 190];
    const objetivo = temps[ctx.azar(temps.length)];
    const ancho = Math.max(.09, .24 - (nv - 1) * .03);
    const centro = .42 + ancho / 2 + Math.random() * (.4 - ancho);
    const precio = P.tamanos[0].precio;
    return {
      forma, puntos: pts.map(([x, y]) => [12 + x * 76, 14 + y * 72]), d: N.d, temp: objetivo,
      zona: [centro - ancho / 2, centro + ancho / 2],
      dur: Math.max(1500, 4200 * Math.pow(.88, nv - 1)),
      precio,
      segundos: Math.max(14, 34 * Math.pow(.88, nv - 1)) + pts.length * .9,
      extra: pts.length * 8 + (nv >= 4 ? 20 : 0),
      lector: `galletas: ${pts.length} masas en forma de ${FORMAS[forma].nombre} y el horno a ${objetivo} grados`,
      chips: [
        { texto: `${pts.length} en ${FORMAS[forma].nombre}`, icono: ICONO.puntos },
        { texto: `Horno ${objetivo} °C`, icono: ICONO.termometro, clase: "is-temp" }
      ],
      tienda: { hash: `pedir=${P.id}`, texto: `Galletas mini · ${P.tamanos[0].nombre} · ${ctx.money(precio)}` }
    };
  }

  function iniciar(p) {
    detener();
    ped = p;
    fase = "vacia";
    masas = new Set();
    temp = TEMP_MIN;
    q("#gPapelZona").hidden = true;
    q("#gPapelZona").innerHTML = "";
    q("#gVacia").hidden = false;
    q("#gBandeja").hidden = false;
    q("#gBandeja").className = "hm-bandeja";
    q("#gHorno").hidden = true;
    q("#gHorno").classList.remove("is-prendido");
    pintarTemp();
    pintarControles();
  }

  function pintarControles() {
    const listo = !ctx.ocupado();
    const set = (id, ok) => (q(id).disabled = !listo || !ok);
    set("#gPapel", fase === "vacia");
    set("#gAlHorno", fase === "papel" && masas.size > 0);
    set("#gMenos", fase !== "horneando" && temp > TEMP_MIN);
    set("#gMas", fase !== "horneando" && temp < TEMP_MAX);
    set("#gHornear", fase === "horno" || fase === "horneando");
    set("#gBotar", fase !== "vacia");
    const h = q("#gHornear");
    h.querySelector("span").textContent = fase === "horneando" ? "Sacar" : "Hornear";
    h.querySelector("i").className = `bi bi-${fase === "horneando" ? "hand-index-thumb" : "fire"} me-1`;
    h.classList.toggle("is-sacar", fase === "horneando");
  }

  function pintarTemp() {
    q("#gTemp").textContent = `${temp} °C`;
    const t = ctx.escenario.querySelector("#gHornoTxt");
    if (t) t.textContent = `${temp}°`;
  }

  /* ---------- Acciones ---------- */
  function ponerPapel() {
    if (ctx.ocupado() || fase !== "vacia") return;
    fase = "papel";
    const papel = q("#gPapelZona");
    papel.innerHTML = ped.puntos.map(([x, y], i) => `
      <button type="button" class="hm-punto" data-punto="${i}" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%;width:${ped.d}%" aria-label="Poner masa en el punto ${i + 1} de ${ped.puntos.length}"></button>`).join("");
    papel.hidden = false;
    papel.classList.remove("is-pone");
    void papel.offsetWidth;
    papel.classList.add("is-pone");
    q("#gVacia").hidden = true;
    ctx.sonar("tap");
    pintarControles();
    papel.querySelector(".hm-punto").focus({ preventScroll: true });
  }

  function tocarPapel(e) {
    if (ctx.ocupado() || fase !== "papel") return;
    const punto = e.target.closest(".hm-punto");
    if (punto) {
      const i = +punto.dataset.punto;
      if (masas.has(i)) return;
      masas.add(i);
      punto.classList.add("is-lleno");
      punto.setAttribute("aria-disabled", "true");
      punto.setAttribute("aria-label", `Punto ${i + 1}: con masa`);
      punto.innerHTML = `<span class="hm-masa"></span>`;
      ctx.sonar("pop");
      if (masas.size === ped.puntos.length) {
        ctx.anunciar("¡Todas las masas listas! Ahora al horno.");
        q("#gAlHorno").focus({ preventScroll: true });
      }
      pintarControles();
      return;
    }
    // Tocó fuera de un punto: la masa se cae y se pierde tiempo
    const papel = e.currentTarget, r = papel.getBoundingClientRect();
    const s = document.createElement("span");
    s.className = "hm-masa-caida";
    s.style.left = `${((e.clientX - r.left) / r.width) * 100}%`;
    s.style.top = `${((e.clientY - r.top) / r.height) * 100}%`;
    papel.appendChild(s);
    setTimeout(() => s.remove(), 900);
    ctx.penalizar(2, "¡Fuera del punto! Pierdes 2 segundos.");
  }

  function alHorno() {
    if (ctx.ocupado() || fase !== "papel" || !masas.size) return;
    fase = "horno";
    q("#gBandeja").hidden = true;
    const horno = q("#gHorno");
    q("#gHornoSvg").innerHTML = hornoSVG();
    q("#gZonaDorada").style.left = `${ped.zona[0] * 100}%`;
    q("#gZonaDorada").style.width = `${(ped.zona[1] - ped.zona[0]) * 100}%`;
    q("#gAguja").style.left = "0%";
    q("#gCoccion").classList.remove("is-zona");
    horno.hidden = false;
    horno.className = "hm-horno is-entra";
    ctx.sonar("horno");
    pintarTemp();
    pintarControles();
    q("#gHornear").focus({ preventScroll: true });
  }

  function cambiarTemp(dir) {
    if (ctx.ocupado() || fase === "horneando") return;
    temp = Math.min(TEMP_MAX, Math.max(TEMP_MIN, temp + dir * paso()));
    ctx.sonar("tic");
    pintarTemp();
    pintarControles();
  }

  function hornear() {
    if (ctx.ocupado() || fase !== "horno") return;
    fase = "horneando";
    // Más caliente, se hornea más rápido; más frío, más lento
    horneo = { inicio: performance.now(), dur: ped.dur * (ped.temp / temp), f: 0, enZona: false, raf: 0 };
    q("#gHorno").classList.add("is-prendido");
    ctx.sonar("horno");
    pintarControles();
    horneo.raf = requestAnimationFrame(cocinar);
  }

  // Color de la galleta: masa → dorada → quemada
  const mezclar = (a, b, t) => {
    const ha = a.match(/\w\w/g).map((x) => parseInt(x, 16)), hb = b.match(/\w\w/g).map((x) => parseInt(x, 16));
    return "#" + ha.map((v, i) => Math.round(v + (hb[i] - v) * Math.min(1, Math.max(0, t))).toString(16).padStart(2, "0")).join("");
  };
  function colorGalleta(f) {
    const [z0, z1] = ped.zona;
    if (f < z0) return mezclar("f3d9a4", "e6ae5e", f / z0);
    if (f <= z1) return "#d9963a";
    return mezclar("d9963a", "4a2a14", (f - z1) / (1 - z1));
  }

  function cocinar(ahora) {
    if (!horneo || fase !== "horneando" || ctx.ocupado()) return;
    if (document.hidden) { horneo.inicio += 16; horneo.raf = requestAnimationFrame(cocinar); return; }
    const f = Math.min(1, (ahora - horneo.inicio) / horneo.dur);
    horneo.f = f;
    q("#gAguja").style.left = `${f * 100}%`;
    const color = colorGalleta(f);
    ctx.escenario.querySelectorAll(".hm-gh").forEach((g) => g.setAttribute("fill", color));
    const enZona = f >= ped.zona[0] && f <= ped.zona[1];
    if (enZona !== horneo.enZona) {
      horneo.enZona = enZona;
      q("#gCoccion").classList.toggle("is-zona", enZona);
      if (enZona) { ctx.anunciar("¡Doradas! Sácalas ya."); ctx.sonar("tic"); }
    }
    if (f >= 1) {
      fase = "horno";
      horneo = null;
      return ctx.mal("¡Se quemaron las galletas!");
    }
    horneo.raf = requestAnimationFrame(cocinar);
  }

  function sacar() {
    if (ctx.ocupado() || fase !== "horneando" || !horneo) return;
    const f = horneo.f;
    detener();
    fase = "horno";
    q("#gHorno").classList.remove("is-prendido");
    const faltan = ped.puntos.length - masas.size;
    const error = faltan ? `Faltaron ${faltan === 1 ? "1 masa" : faltan + " masas"} en el papel.`
      : temp !== ped.temp ? `El horno debía estar a ${ped.temp} °C (estaba a ${temp} °C).`
      : f < ped.zona[0] ? "Quedaron crudas: sácalas cuando estén doradas."
      : f > ped.zona[1] ? "Se pasaron de horno."
      : "";
    if (error) ctx.mal(error);
    else ctx.bien("¡Galletas perfectas!");
  }

  function botar() {
    if (ctx.ocupado() || fase === "vacia") return;
    const t = temp;
    iniciar(ped);
    temp = t; // el horno no se enfría
    pintarTemp();
    pintarControles();
    ctx.mensaje("Bandeja a la basura. ¡Empieza otra vez!", "info");
    q("#gPapel").focus({ preventScroll: true });
  }

  function detener() {
    if (horneo) cancelAnimationFrame(horneo.raf);
    horneo = null;
  }

  // Horno de frente: en la ventana se ven las galletas que se pusieron
  function hornoSVG() {
    const galletas = ped.puntos.map(([x, y], i) => masas.has(i)
      ? `<ellipse class="hm-gh" cx="${(64 + ((x - 12) / 76) * 172).toFixed(1)}" cy="${(104 + ((y - 14) / 72) * 34).toFixed(1)}" rx="${Math.max(7, ped.d * .62).toFixed(1)}" ry="${Math.max(4, ped.d * .34).toFixed(1)}" fill="#f3d9a4" stroke="${K}" stroke-width="1.6"/>` : "").join("");
    return `<svg viewBox="0 0 300 200" aria-hidden="true" focusable="false">
      <defs><radialGradient id="gLuz" cx="50%" cy="60%" r="70%"><stop offset="0" stop-color="#ffb347" stop-opacity=".95"/><stop offset="1" stop-color="#ff7a3c" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="150" cy="194" rx="130" ry="6" fill="${K}" opacity=".12"/>
      <rect x="12" y="8" width="276" height="182" rx="20" fill="#fff" stroke="${K}" stroke-width="3"/>
      <path d="M12 46 V28 Q12 8 32 8 H268 Q288 8 288 28 V46Z" fill="#c48ebf" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="112" y="16" width="76" height="24" rx="7" fill="#2a1a29" stroke="${K}" stroke-width="2"/>
      <text id="gHornoTxt" x="150" y="34.5" text-anchor="middle" font-family="Montserrat, system-ui, sans-serif" font-weight="800" font-size="16" fill="#ffb347">${temp}°</text>
      ${[48, 252].map((x) => `<circle cx="${x}" cy="27" r="10" fill="#fff" stroke="${K}" stroke-width="2.4"/><path d="M${x} 20 V27" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/>`).join("")}
      <rect x="70" y="54" width="160" height="7" rx="3.5" fill="${K}"/>
      <rect x="38" y="68" width="224" height="106" rx="14" fill="#2d1b2c" stroke="${K}" stroke-width="3"/>
      <rect class="hm-horno-luz" x="41" y="71" width="218" height="100" rx="12" fill="url(#gLuz)"/>
      <path d="M52 146 H248 L240 156 H60Z" fill="#9aa0a6" stroke="${K}" stroke-width="2" stroke-linejoin="round"/>
      ${galletas}
      <path d="M52 80 L76 80" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".25"/>
    </svg>`;
  }

  window.HM_JUEGO.registrar({
    id: "galletas",
    nombre: "Galletas al horno",
    kicker: "Hornea las mini galletas",
    descripcion: "Pon el papel, una masa en cada punto, la temperatura justa y sácalas doradas.",
    claveRecord: "hm_juego_galletas_record",
    pasos: [
      "<strong>Pon el papel</strong> en la bandeja.",
      "<strong>Pon una masa en cada punto</strong> que marca el papel. Si tocas fuera de un punto, pierdes 2 segundos.",
      "<strong>Mete la bandeja al horno</strong> y ponlo a la temperatura del pedido.",
      "<strong>Hornea y saca las galletas</strong> cuando la aguja esté en <em>Doradas</em>: ni crudas ni quemadas."
    ],
    portada,
    preparar,
    crearPedido,
    iniciar,
    pintarControles,
    detener,
    primerControl: () => ctx.controles.querySelector("#gPapel"),
    textoNivel: (n) => (n === 4 ? "Formas nuevas y el horno sube de 5 en 5 grados." : n === 6 ? "Los puntos ya no están derechitos." : "Más galletas, menos tiempo y un horno más rápido."),
    tiendaInicial: () => ({ hash: `pedir=${P.id}`, texto: `Galletas mini · ${P.tamanos[0].nombre} · ${ctx.money(P.tamanos[0].precio)}` })
  });
})();
