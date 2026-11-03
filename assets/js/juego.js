/* =========================================================
   Honeymoon · Juegos de Hony (marco común)
   Pantallas (juegos, instrucciones, partida y fin), clientes con su pedido y su paciencia,
   puntos, vidas, racha, niveles, récords, sonido y efectos.
   Cada juego se registra con HM_JUEGO.registrar({...}) (ver juego-fresas.js y juego-galletas.js):
   - id, nombre, kicker, descripcion, pasos[], claveRecord, portada()
   - preparar(ctx): arma el escenario y los controles de la partida
   - crearPedido(nivel): { chips[], precio, segundos, extra, lector, tienda: { hash, texto } }
   - iniciar(pedido): deja el escenario listo para ese pedido
   - pintarControles(), detener(), primerControl(), textoNivel(n)
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => "$" + Math.round(n).toLocaleString("es-CO");
  const azar = (n) => Math.floor(Math.random() * n);
  const reducido = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const K = "#4a1f48";

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } }
  };

  /* ---------- Sonido (se puede apagar; se recuerda en hm_juego_sonido) ---------- */
  const KEY_SONIDO = "hm_juego_sonido";
  let sonido = store.get(KEY_SONIDO) !== "0";
  let ac = null;
  const SONIDOS = {
    tap: [[740, .04]], capa: [[523, .06]], pop: [[880, .04], [1175, .05]], aviso: [[440, .1]],
    bien: [[523, .08], [659, .08], [784, .08], [1047, .2]], mal: [[311, .14], [233, .26]],
    nivel: [[523, .07], [659, .07], [784, .07], [1047, .07], [1319, .24]], tic: [[1400, .025]],
    horno: [[196, .12], [262, .16]], fin: [[392, .12], [330, .12], [262, .32]]
  };
  function sonar(nombre) {
    const notas = SONIDOS[nombre];
    if (!sonido || !notas) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") ac.resume();
      let t = ac.currentTime + .01;
      notas.forEach(([f, d]) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = "triangle";
        o.frequency.value = f;
        g.gain.setValueAtTime(.0001, t);
        g.gain.exponentialRampToValueAtTime(.16, t + .012);
        g.gain.exponentialRampToValueAtTime(.0001, t + d);
        o.connect(g).connect(ac.destination);
        o.start(t);
        o.stop(t + d + .03);
        t += d * .92;
      });
    } catch (e) { /* sin audio */ }
  }
  function pintarSonido() {
    const b = $("#jSonido");
    b.setAttribute("aria-pressed", String(sonido));
    b.setAttribute("aria-label", sonido ? "Sonido encendido" : "Sonido apagado");
    b.innerHTML = `<i class="bi bi-volume-${sonido ? "up" : "mute"}-fill" aria-hidden="true"></i>`;
  }

  /* ---------- Clientes ---------- */
  const CLIENTES = ["Sofi", "Mateo", "Valen", "Juanjo", "Isa", "Sami", "Dani", "Luci", "Tomi", "Majo", "Santi", "Caro", "Nico", "Gabi", "Emi", "Pau"];
  const PIELES = ["#fbe0cb", "#f1c6a3", "#dba27a", "#b9784f", "#8a5636"];
  const PELOS = ["#3b2219", "#6b3d1f", "#1f1a18", "#b8662a", "#e2b552", "#8d5088"];
  const ROPAS = ["#f6b8c6", "#9fd0f2", "#fdd98c", "#aee0b8", "#d7bdf2", "#ffc49c"];
  const elegir = (lista) => lista[azar(lista.length)];

  function nuevaPersona(anterior) {
    let nombre;
    do { nombre = elegir(CLIENTES); } while (anterior && nombre === anterior.nombre);
    return { nombre, piel: elegir(PIELES), pelo: elegir(PELOS), ropa: elegir(ROPAS), estilo: azar(5) };
  }

  // Cliente dibujado: el ánimo cambia los ojos, las cejas y la boca
  function persona(p, animo) {
    const peinados = [
      { frente: `<path d="M20 36 C18 15 62 15 60 36 C55 26 47 23 40 25 C32 23 25 28 20 36Z" fill="${p.pelo}"/>` },
      { frente: `<circle cx="40" cy="11" r="8.5" fill="${p.pelo}" stroke="${K}" stroke-width="2"/><path d="M20 37 C16 14 64 14 60 37 C54 26 26 26 20 37Z" fill="${p.pelo}"/>` },
      { atras: `<path d="M17 62 C10 32 22 13 40 13 C58 13 70 32 63 62 Z" fill="${p.pelo}" stroke="${K}" stroke-width="2"/>`,
        frente: `<path d="M20 36 C20 18 60 18 60 36 C52 28 34 24 20 36Z" fill="${p.pelo}"/>` },
      { frente: [[24, 25], [31, 18], [40, 15], [49, 18], [56, 25], [21, 33], [59, 33]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7.5" fill="${p.pelo}"/>`).join("") },
      { frente: `<path d="M19 31 C19 14 61 14 61 31 Z" fill="${p.ropa}" stroke="${K}" stroke-width="2.2" stroke-linejoin="round"/>
          <path d="M58 30 L73 31.5 C74 33.5 71 35 69 35 L59 34Z" fill="${p.ropa}" stroke="${K}" stroke-width="2.2" stroke-linejoin="round"/>
          <circle cx="40" cy="15" r="2.4" fill="#fff"/>` }
    ][p.estilo];
    const ojos = animo === "contenta"
      ? `<path d="M29 39 q4 -5 8 0 M43 39 q4 -5 8 0" stroke="${K}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
      : `<g class="hm-ojos"><circle cx="33" cy="39" r="2.7" fill="${K}"/><circle cx="47" cy="39" r="2.7" fill="${K}"/>
          <circle cx="34" cy="38" r=".9" fill="#fff"/><circle cx="48" cy="38" r=".9" fill="#fff"/></g>`;
    const cejas = animo === "preocupada" ? `<path d="M28 32 L36 34 M52 32 L44 34" stroke="${K}" stroke-width="2.2" stroke-linecap="round"/>`
      : animo === "triste" ? `<path d="M29 34 L36 32 M51 34 L44 32" stroke="${K}" stroke-width="2.2" stroke-linecap="round"/>` : "";
    const boca = {
      contenta: `<path d="M32 46 Q40 56 48 46 Z" fill="#fff" stroke="${K}" stroke-width="2.4" stroke-linejoin="round"/>`,
      feliz: `<path d="M33 47 Q40 53 47 47" stroke="${K}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
      normal: `<path d="M34 49 H46" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/>`,
      preocupada: `<path d="M33 51 Q40 45 47 51" stroke="${K}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
      triste: `<path d="M33 52 Q40 45 47 52" stroke="${K}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M50 43 q2 4 0 6 q-2 -2 0 -6Z" fill="#7cc4ef"/>`
    }[animo] || "";
    return `<svg viewBox="0 0 80 90" aria-hidden="true" focusable="false">
      ${peinados.atras || ""}
      <path d="M12 92 C12 70 24 61 40 61 C56 61 68 70 68 92 Z" fill="${p.ropa}" stroke="${K}" stroke-width="2.5"/>
      <path d="M33 62 Q40 70 47 62" stroke="${K}" stroke-width="2" fill="none"/>
      <rect x="35" y="53" width="10" height="10" fill="${p.piel}"/>
      <circle cx="40" cy="38" r="20" fill="${p.piel}" stroke="${K}" stroke-width="2.5"/>
      ${peinados.frente}
      <circle cx="28.5" cy="45" r="3.2" fill="#f49ab0" opacity=".55"/><circle cx="51.5" cy="45" r="3.2" fill="#f49ab0" opacity=".55"/>
      ${cejas}${ojos}${boca}
    </svg>`;
  }

  /* ---------- Registro de juegos ---------- */
  const JUEGOS = {};
  const ORDEN = [];
  window.HM_JUEGO = {
    registrar(def) { JUEGOS[def.id] = def; ORDEN.push(def.id); },
    // Solo lectura (para revisar el juego): nivel, pedidos atendidos y segundos del pedido actual
    info: () => (E && E.pedido ? { juego: J.id, nivel: E.nivel, atendidos: E.atendidos, segundos: E.pedido.segundos } : null)
  };

  const record = {
    get: (j) => +store.get(j.claveRecord) || 0,
    set: (j, v) => store.set(j.claveRecord, String(v))
  };

  let J = null; // juego elegido
  let E = null; // partida
  let reloj = 0;
  const nivelDe = (atendidos) => 1 + Math.floor(atendidos / 3);

  // Lo que cada juego puede usar
  const ctx = {
    get escenario() { return $("#jEscenario"); },
    get controles() { return $("#jControles"); },
    nivel: () => (E ? E.nivel : 1),
    ocupado: () => !E || E.ocupado,
    mensaje, anunciar, sonar, bien, mal, penalizar, reducido, azar, esc, money, barajar,
    flotante: (texto, x, y, clase) => flotante(texto, x, y, clase)
  };

  /* ---------- Pantallas ---------- */
  const PANTALLAS = ["jHub", "jIntro", "jMesa", "jFin"];
  function mostrar(id) {
    PANTALLAS.forEach((p) => ($("#" + p).hidden = p !== id));
    $("#jHud").hidden = id !== "jMesa" && id !== "jFin";
    document.body.dataset.pantalla = id;
    window.scrollTo(0, 0);
  }

  function pintarHub() {
    $("#jJuegos").innerHTML = ORDEN.map((id) => {
      const j = JUEGOS[id], r = record.get(j);
      return `<article class="hm-hub-card">
        <div class="hm-hub-arte" aria-hidden="true">${j.portada()}</div>
        <div class="hm-hub-info">
          <span class="hm-hub-kicker">${esc(j.kicker)}</span>
          <h2>${esc(j.nombre)}</h2>
          <p>${esc(j.descripcion)}</p>
          <div class="hm-hub-pie">
            <a class="btn btn-hm btn-hm-primary" href="#${id}" data-elegir="${id}"><i class="bi bi-play-fill me-1" aria-hidden="true"></i>Jugar</a>
            <span class="hm-hub-record">${r ? `<i class="bi bi-trophy-fill" aria-hidden="true"></i> Récord: ${r.toLocaleString("es-CO")}` : ""}</span>
          </div>
        </div>
      </article>`;
    }).join("");
  }

  function pintarIntro() {
    const r = record.get(J);
    $("#jIntroArte").innerHTML = J.portada();
    $("#jIntroKicker").textContent = J.kicker;
    $("#jIntroTitulo").textContent = J.nombre;
    $("#jIntroPasos").innerHTML = J.pasos.map((p) => `<li>${p}</li>`).join("");
    $("#jRecordInicio").textContent = r ? `Tu récord: ${r.toLocaleString("es-CO")}` : "";
    $("#jTitulo").textContent = J.nombre;
  }

  // #fresas o #galletas abren ese juego; sin nada, la lista de juegos
  function ruta() {
    cancelAnimationFrame(reloj);
    if (J && J.detener) J.detener();
    E = null;
    const id = location.hash.slice(1);
    J = JUEGOS[id] || null;
    if (!J) {
      $("#jTitulo").textContent = "Juegos de Hony";
      pintarHub();
      mostrar("jHub");
      return;
    }
    pintarIntro();
    mostrar("jIntro");
    $("#jIntro h2").focus({ preventScroll: true });
  }

  /* ---------- Partida ---------- */
  function nuevoJuego() {
    if (!J) return;
    E = { puntos: 0, vidas: 3, racha: 0, atendidos: 0, nivel: 1, pedido: null, persona: null, ocupado: false, ultimo: null, n: 0, animo: "" };
    $("#jEscenario").innerHTML = "";
    $("#jControles").innerHTML = "";
    $("#jMesa").dataset.juego = J.id;
    J.preparar(ctx);
    mostrar("jMesa");
    pintarHud();
    siguientePedido();
    const c = J.primerControl();
    if (c) c.focus({ preventScroll: true });
  }

  function siguientePedido() {
    E.n++;
    E.pedido = J.crearPedido(E.nivel);
    E.persona = nuevaPersona(E.persona);
    E.ocupado = false;
    E.animo = "";
    E.inicio = performance.now();
    E.pausa = 0;
    pintarPedido();
    J.iniciar(E.pedido);
    honyMesa("");
    $("#jMsg").className = "hm-burbuja";
    anunciar(`Pedido ${E.n}: ${E.persona.nombre} quiere ${E.pedido.lector}.`);
    cancelAnimationFrame(reloj);
    reloj = requestAnimationFrame(tic);
    // Si el foco quedó en un botón que se desactivó, vuelve al primer control
    const f = document.activeElement;
    if (!f || f === document.body || f.disabled) {
      const c = J.primerControl();
      if (c) c.focus({ preventScroll: true });
    }
  }

  const restante = () => Math.max(0, 1 - (performance.now() - E.inicio - E.pausa) / (E.pedido.segundos * 1000));

  function tic() {
    if (!E || E.ocupado) return;
    if (document.hidden) { reloj = requestAnimationFrame(tic); return; }
    const resta = restante();
    const barra = $("#jPaciencia");
    barra.style.transform = `scaleX(${resta})`;
    barra.classList.toggle("is-poca", resta < .3);
    $("#jPedido").classList.toggle("is-apurado", resta < .3);
    cara(resta > .55 ? "feliz" : resta > .3 ? "normal" : "preocupada");
    if (resta <= 0) {
      if (J.detener) J.detener();
      return mal(`¡${E.persona.nombre} se cansó de esperar!`);
    }
    reloj = requestAnimationFrame(tic);
  }

  // No cuenta el tiempo con la pestaña oculta
  let ocultoDesde = 0;
  document.addEventListener("visibilitychange", () => {
    if (!E) return;
    if (document.hidden) ocultoDesde = performance.now();
    else if (ocultoDesde) { E.pausa += performance.now() - ocultoDesde; ocultoDesde = 0; }
  });

  function penalizar(segundos, texto) {
    if (!E || E.ocupado) return;
    E.pausa -= segundos * 1000;
    const b = $("#jPedido");
    b.classList.remove("is-golpe");
    void b.offsetWidth;
    b.classList.add("is-golpe");
    sonar("aviso");
    if (texto) mensaje(texto, "aviso");
  }

  function cara(animo) {
    if (E.animo === animo) return;
    E.animo = animo;
    $("#jCara").innerHTML = persona(E.persona, animo);
  }

  function pintarHud() {
    $("#jPuntos").textContent = E.puntos.toLocaleString("es-CO");
    $("#jNivel").textContent = E.nivel;
    $("#jVidas").innerHTML = [0, 1, 2].map((i) => `<i class="bi bi-heart${i < E.vidas ? "-fill" : ""}" aria-hidden="true"></i>`).join("");
    $("#jVidas").setAttribute("aria-label", `${E.vidas} ${E.vidas === 1 ? "vida" : "vidas"}`);
    $("#jRacha").textContent = E.racha > 1 ? `Racha x${E.racha}` : "";
    $("#jRacha").classList.toggle("is-on", E.racha > 1);
  }

  function pintarPedido() {
    const ped = E.pedido;
    cara("feliz");
    $("#jCliente").textContent = E.persona.nombre;
    $("#jPrecio").textContent = money(ped.precio);
    $("#jChips").innerHTML = ped.chips.map((c) => `<li class="hm-pedido-chip${c.clase ? " " + c.clase : ""}">${c.icono ? `<span class="hm-pedido-ic">${c.icono}</span>` : ""}<span>${esc(c.texto)}</span></li>`).join("");
    const barra = $("#jPaciencia");
    barra.style.transform = "scaleX(1)";
    barra.classList.remove("is-poca");
    const cl = $("#jClienteWrap");
    cl.classList.remove("is-llega", "is-se-va");
    void cl.offsetWidth;
    cl.classList.add("is-llega");
    $("#jPedido").classList.remove("is-apurado");
  }

  function mensaje(texto, tipo) {
    anunciar(texto);
    const m = $("#jMsg");
    m.textContent = texto;
    m.className = `hm-burbuja is-${tipo || "info"}`;
    void m.offsetWidth;
    m.classList.add("is-ve");
  }
  function anunciar(texto) { $("#jAnuncio").textContent = texto; }

  function honyMesa(estado) {
    const h = $("#jHonyMesa");
    h.className = `hm-mesa-hony${estado ? " is-" + estado : ""}`;
  }

  /* ---------- Efectos ---------- */
  function confeti() {
    if (reducido()) return;
    const cont = $("#jEfectos");
    const colores = ["#c48ebf", "#f6b8c6", "#fdd98c", "#9fd0f2", "#aee0b8", "#e0364f", "#fff"];
    for (let i = 0; i < 22; i++) {
      const s = document.createElement("span");
      s.className = "hm-confeti";
      const ang = (Math.PI * 2 * i) / 22 + Math.random() * .4;
      const dist = 70 + Math.random() * 90;
      s.style.setProperty("--x", `${Math.cos(ang) * dist}px`);
      s.style.setProperty("--y", `${Math.sin(ang) * dist - 40}px`);
      s.style.setProperty("--r", `${azar(540) - 270}deg`);
      s.style.background = elegir(colores);
      s.style.animationDelay = `${Math.random() * 80}ms`;
      cont.appendChild(s);
      setTimeout(() => s.remove(), 1200);
    }
  }
  function flotante(texto, x, y, clase) {
    const s = document.createElement("span");
    s.className = `hm-flotante${clase ? " " + clase : ""}`;
    s.textContent = texto;
    if (x != null) { s.style.left = x + "px"; s.style.top = y + "px"; }
    $("#jEfectos").appendChild(s);
    setTimeout(() => s.remove(), 1300);
  }

  function barajar(lista, distinta) {
    const r = lista.slice();
    for (let n = 0; n < 8; n++) {
      for (let i = r.length - 1; i > 0; i--) { const k = azar(i + 1); [r[i], r[k]] = [r[k], r[i]]; }
      if (!distinta || r.join() !== distinta.join()) break;
    }
    return r;
  }

  /* ---------- Resultado de cada pedido ---------- */
  function bien(texto) {
    if (!E || E.ocupado) return;
    const resta = restante();
    E.racha++;
    E.atendidos++;
    const mult = Math.min(2, 1 + (E.racha - 1) * .1) * (1 + (E.nivel - 1) * .15);
    const ganados = Math.round((100 + (E.pedido.extra || 0) + resta * E.pedido.segundos * 5) * mult);
    E.puntos += ganados;
    E.ultimo = E.pedido;
    cara("contenta");
    honyMesa("feliz");
    confeti();
    flotante(`+${ganados}`);
    sonar("bien");
    $("#jClienteWrap").classList.add("is-se-va");
    terminar(`${texto || "¡Delicioso!"} ${E.persona.nombre} quedó feliz. +${ganados}`, "bien", 1150);
  }

  function mal(texto) {
    if (!E || E.ocupado) return;
    E.vidas--;
    E.racha = 0;
    cara("triste");
    honyMesa("triste");
    sonar("mal");
    const v = $("#jVidas");
    v.classList.remove("is-pierde");
    void v.offsetWidth;
    v.classList.add("is-pierde");
    terminar(`${texto} ${E.vidas ? "Pierdes una vida." : ""}`.trim(), "mal", 1800);
  }

  function terminar(texto, tipo, espera) {
    E.ocupado = true;
    cancelAnimationFrame(reloj);
    pintarHud();
    J.pintarControles();
    mensaje(texto, tipo);
    const partida = E;
    setTimeout(() => {
      if (E !== partida) return; // salió del juego mientras tanto
      if (E.vidas <= 0) return finDelJuego();
      const nv = nivelDe(E.atendidos);
      if (nv > E.nivel) {
        E.nivel = nv;
        pintarHud();
        subirNivel(() => { if (E === partida) siguientePedido(); });
      } else siguientePedido();
    }, reducido() ? Math.min(espera, 900) : espera);
  }

  function subirNivel(luego) {
    const b = $("#jBanner");
    $("#jBannerNivel").textContent = `Nivel ${E.nivel}`;
    $("#jBannerTexto").textContent = J.textoNivel(E.nivel);
    b.hidden = false;
    b.classList.remove("is-ve");
    void b.offsetWidth;
    b.classList.add("is-ve");
    sonar("nivel");
    anunciar(`Nivel ${E.nivel}. ${J.textoNivel(E.nivel)}`);
    setTimeout(() => { b.hidden = true; luego(); }, reducido() ? 1100 : 1700);
  }

  function finDelJuego() {
    const antes = record.get(J);
    const nuevo = E.puntos > antes;
    if (nuevo) record.set(J, E.puntos);
    sonar("fin");
    mostrar("jFin");
    $("#jFinPuntos").textContent = E.puntos.toLocaleString("es-CO");
    $("#jFinAtendidos").textContent = E.atendidos === 1 ? "1 pedido atendido" : `${E.atendidos} pedidos atendidos`;
    $("#jFinNivel").textContent = `nivel ${E.nivel}`;
    $("#jFinRecord").textContent = nuevo ? "¡Nuevo récord!" : `Récord: ${Math.max(antes, E.puntos).toLocaleString("es-CO")}`;
    $("#jFinRecord").classList.toggle("is-nuevo", nuevo);
    const t = E.ultimo ? E.ultimo.tienda : J.tiendaInicial();
    $("#jPedirReal").href = `./#${t.hash}`;
    $("#jPedirTexto").textContent = t.texto;
    $("#jPedirIntro").textContent = E.ultimo ? "Pide el último que entregaste:" : "Pídelo de verdad:";
    $("#jFin h2").focus({ preventScroll: true });
  }

  /* ---------- Eventos ---------- */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("button, a");
    if (!b) return;
    if (b.hasAttribute("data-jugar")) nuevoJuego();
    else if (b.id === "jSonido") {
      sonido = !sonido;
      store.set(KEY_SONIDO, sonido ? "1" : "0");
      pintarSonido();
      sonar("tap");
    }
  });
  window.addEventListener("hashchange", ruta);

  document.addEventListener("DOMContentLoaded", () => {
    const hony = `<svg viewBox="-26 -26 52 52" aria-hidden="true" focusable="false">${window.HM_VASO.hony(0, 0, 24)}</svg>`;
    $$("[data-hony]").forEach((el) => (el.innerHTML = hony));
    pintarSonido();
    ruta();
  });
})();
