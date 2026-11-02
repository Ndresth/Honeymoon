/* =========================================================
   Honeymoon · Juego "Hony en la cocina"
   Llegan pedidos de fresas con crema: pon el vaso del tamaño pedido, arma las capas en orden
   (crema → fresas → salsas → Oreo), agrega los toppings y entrégalo antes de que el cliente
   pierda la paciencia. Usa los tamaños, toppings y límites reales de menu.js.
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => "$" + Math.round(n).toLocaleString("es-CO");
  const azar = (n) => Math.floor(Math.random() * n);
  const reducido = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  const P = window.HM_MENU.find((p) => p.id === "fresas-con-crema");
  const G = window.HM_ADICIONES[P.adiciones];
  const TAMANOS = P.tamanos;
  const RECETA = ["crema", "fresas", "salsas", "oreo"];
  const CAPAS = { crema: "Crema", fresas: "Fresas", salsas: "Salsas", oreo: "Oreo" };
  const MAX_CAPAS = 6;
  const MAX_TOPPINGS = 4;
  const CLIENTES = ["Sofi", "Mateo", "Valen", "Juanjo", "Isa", "Sami", "Dani", "Luci", "Tomi", "Majo", "Santi", "Caro", "Nico", "Gabi"];
  const COLORES = ["#f6c3cf", "#c9e4f6", "#fde3a7", "#cdeccd", "#e5d0f5", "#ffd6b8"];
  const KEY_RECORD = "hm_juego_record";

  /* Límites de toppings (los mismos del menú) */
  const maxDe = (a) => a.max || 1;
  const total = (c) => Object.values(c).reduce((s, n) => s + n, 0);
  const sumaOtros = (c, id) => Object.entries(c).reduce((s, [k, v]) => s + (k === id ? 0 : v), 0);
  const limiteRoto = (c) => G.items.filter((a) => a.limite && (c[a.id] || 0) >= a.limite.desde).find((a) => sumaOtros(c, a.id) > a.limite.otros);
  function bloqueo(c, id) {
    const a = G.items.find((x) => x.id === id);
    const n = c[id] || 0;
    if (n >= maxDe(a)) return `Máximo ${maxDe(a)} de ${a.nombre} por vaso.`;
    if (total(c) >= MAX_TOPPINGS) return "¡Ya no caben más toppings!";
    const r = limiteRoto({ ...c, [id]: n + 1 });
    if (!r) return "";
    return r.limite.otros === 0
      ? `Con ${r.limite.desde} de ${r.nombre}, ese topping va solo.`
      : `Con ${r.limite.desde} de ${r.nombre}, solo ${r.limite.otros === 1 ? "1 topping más" : r.limite.otros + " toppings más"}.`;
  }
  const iconoDe = (id) => (G.items.find((a) => a.id === id) || {}).icono || id;
  const porIcono = (c) => Object.fromEntries(Object.entries(c).map(([id, n]) => [iconoDe(id), n]));
  const nombres = (c) => G.items.filter((a) => c[a.id]).map((a) => (c[a.id] > 1 ? `${a.nombre} x${c[a.id]}` : a.nombre));
  const precio = (ped) => TAMANOS.find((t) => t.id === ped.tamano).precio + G.items.reduce((s, a) => s + (ped.toppings[a.id] || 0) * a.precio, 0);
  const iguales = (a, b) => G.items.every((x) => (a[x.id] || 0) === (b[x.id] || 0));

  const record = {
    get() { try { return +localStorage.getItem(KEY_RECORD) || 0; } catch (e) { return 0; } },
    set(v) { try { localStorage.setItem(KEY_RECORD, String(v)); } catch (e) { /* sin almacenamiento */ } }
  };

  /* Estado */
  let E = null;
  let vasoUI = null;
  let reloj = 0;

  function nuevoJuego() {
    E = { puntos: 0, vidas: 3, racha: 0, atendidos: 0, pedido: null, vaso: null, ocupado: false, ultimo: null, n: 0 };
    $("#jInicio").hidden = true;
    $("#jFin").hidden = true;
    $("#jMesa").hidden = false;
    pintarHud();
    siguientePedido();
    $("#jTamanos button").focus({ preventScroll: true });
  }

  const nivel = () => 1 + Math.floor(E.atendidos / 3);

  // Pedido al azar que se puede hacer de verdad (respeta los límites del menú)
  function crearPedido() {
    const nv = nivel();
    const rango = nv === 1 ? [0, 1] : nv === 2 ? [1, 2] : nv < 5 ? [1, 3] : [2, 4];
    const meta = rango[0] + azar(rango[1] - rango[0] + 1);
    const c = {};
    for (let i = 0; i < 40 && total(c) < meta; i++) {
      const a = G.items[azar(G.items.length)];
      if (!bloqueo(c, a.id)) c[a.id] = (c[a.id] || 0) + 1;
    }
    let nombre;
    do { nombre = CLIENTES[azar(CLIENTES.length)]; } while (E.pedido && nombre === E.pedido.cliente);
    const segundos = Math.max(12, 30 - (nv - 1) * 2.5) + total(c) * 1.5;
    return { cliente: nombre, color: COLORES[azar(COLORES.length)], tamano: TAMANOS[azar(TAMANOS.length)].id, toppings: c, segundos };
  }

  function siguientePedido() {
    E.n++;
    E.pedido = crearPedido();
    E.vaso = null;
    E.ocupado = false;
    E.inicio = performance.now();
    E.pausa = 0;
    const v = $("#jVaso");
    v.className = "hm-mesa-vaso";
    pintarPedido();
    pintarVaso();
    pintarControles();
    mensaje(`Pedido ${E.n}: ${E.pedido.cliente} quiere un vaso de ${nombreTamano(E.pedido.tamano)}${total(E.pedido.toppings) ? " con " + nombres(E.pedido.toppings).join(", ") : " sin toppings"}.`, "info", true);
    cancelAnimationFrame(reloj);
    reloj = requestAnimationFrame(tic);
    // Si el foco quedó en un botón que se desactivó, vuelve al primero
    const f = document.activeElement;
    if (!f || f === document.body || f.disabled) $("#jTamanos button").focus({ preventScroll: true });
  }

  const nombreTamano = (id) => TAMANOS.find((t) => t.id === id).nombre;

  /* Paciencia del cliente */
  function tic(ahora) {
    if (!E || E.ocupado) return;
    if (document.hidden) { reloj = requestAnimationFrame(tic); return; }
    const resta = 1 - (ahora - E.inicio - E.pausa) / (E.pedido.segundos * 1000);
    const barra = $("#jPaciencia");
    barra.style.transform = `scaleX(${Math.max(0, resta)})`;
    barra.classList.toggle("is-poca", resta < .3);
    $("#jCara").innerHTML = cara(resta > .55 ? "feliz" : resta > .3 ? "normal" : "preocupada");
    if (resta <= 0) return fallo(`¡${E.pedido.cliente} se cansó de esperar!`);
    reloj = requestAnimationFrame(tic);
  }
  // No cuenta el tiempo con la pestaña oculta
  let ocultoDesde = 0;
  document.addEventListener("visibilitychange", () => {
    if (!E) return;
    if (document.hidden) ocultoDesde = performance.now();
    else if (ocultoDesde) { E.pausa += performance.now() - ocultoDesde; ocultoDesde = 0; }
  });

  /* Pintar */
  function pintarHud() {
    $("#jPuntos").textContent = E.puntos.toLocaleString("es-CO");
    $("#jVidas").innerHTML = [0, 1, 2].map((i) => `<i class="bi bi-heart${i < E.vidas ? "-fill" : ""}" aria-hidden="true"></i>`).join("");
    $("#jVidas").setAttribute("aria-label", `${E.vidas} ${E.vidas === 1 ? "vida" : "vidas"}`);
    $("#jRacha").textContent = E.racha > 1 ? `Racha x${E.racha}` : "";
  }

  function cara(animo) {
    const boca = { feliz: "M-7 4 Q0 11 7 4", normal: "M-6 6 H6", preocupada: "M-7 8 Q0 2 7 8" }[animo];
    const cejas = animo === "preocupada" ? `<path d="M-11 -9 L-4 -7 M11 -9 L4 -7" stroke="#4a1f48" stroke-width="2" stroke-linecap="round"/>` : "";
    return `<svg viewBox="-20 -20 40 40" aria-hidden="true" focusable="false"><circle r="19" fill="${E.pedido.color}" stroke="#4a1f48" stroke-width="2.5"/>
      <circle cx="-6" cy="-3" r="2.3" fill="#4a1f48"/><circle cx="6" cy="-3" r="2.3" fill="#4a1f48"/>${cejas}
      <path d="${boca}" stroke="#4a1f48" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`;
  }

  function chip(texto, icono) {
    const ic = icono && window.HM_ICONO_TOPPING ? window.HM_ICONO_TOPPING(icono) : "";
    return `<li class="hm-pedido-chip">${ic ? `<span class="hm-pedido-ic">${ic}</span>` : `<i class="bi bi-cup-straw" aria-hidden="true"></i>`}<span>${esc(texto)}</span></li>`;
  }

  function pintarPedido() {
    const ped = E.pedido;
    $("#jCara").innerHTML = cara("feliz");
    $("#jCliente").textContent = ped.cliente;
    $("#jPrecio").textContent = money(precio(ped));
    $("#jChips").innerHTML = chip(`Vaso ${nombreTamano(ped.tamano)}`) +
      (total(ped.toppings)
        ? G.items.filter((a) => ped.toppings[a.id]).map((a) => chip(`${a.nombre}${ped.toppings[a.id] > 1 ? " x" + ped.toppings[a.id] : ""}`, a.icono)).join("")
        : `<li class="hm-pedido-chip is-sin">Sin toppings</li>`);
    const barra = $("#jPaciencia");
    barra.style.transform = "scaleX(1)";
    barra.classList.remove("is-poca");
    const tk = $("#jPedido");
    tk.classList.remove("is-llega");
    void tk.offsetWidth;
    tk.classList.add("is-llega");
  }

  function pintarVaso() {
    const el = $("#jVaso");
    if (!E.vaso) {
      vasoUI = null;
      el.innerHTML = `<div class="hm-mesa-vacia"><i class="bi bi-arrow-down-circle" aria-hidden="true"></i>Pon un vaso</div>`;
      return;
    }
    if (!vasoUI) vasoUI = window.HM_VASO.montar(el, { receta: RECETA });
    vasoUI.pintar({ grande: TAMANOS.findIndex((t) => t.id === E.vaso.tamano) > 0, capas: E.vaso.capas, toppings: porIcono(E.vaso.toppings) });
  }

  function pintarControles() {
    const hay = !!E.vaso;
    const listo = !E.ocupado;
    $("#jTamanos").querySelectorAll("button").forEach((b) => (b.disabled = !listo || hay));
    $("#jCapas").querySelectorAll("button").forEach((b) => (b.disabled = !listo || !hay));
    $("#jToppings").querySelectorAll("button").forEach((b) => {
      b.disabled = !listo || !hay;
      const n = hay ? E.vaso.toppings[b.dataset.top] || 0 : 0;
      b.querySelector("output").textContent = n ? `x${n}` : "";
    });
    $("#jBotar").disabled = !listo || !hay;
    $("#jEntregar").disabled = !listo || !hay;
  }

  function mensaje(texto, tipo, soloLector) {
    $("#jAnuncio").textContent = texto;
    if (soloLector) return;
    const m = $("#jMsg");
    m.textContent = texto;
    m.className = `hm-burbuja is-${tipo || "info"}`;
    void m.offsetWidth;
    m.classList.add("is-ve");
  }

  /* Acciones */
  function ponerVaso(id) {
    if (E.ocupado || E.vaso) return;
    E.vaso = { tamano: id, capas: [], toppings: {} };
    pintarVaso();
    pintarControles();
    $("#jCapas button").focus();
  }

  function ponerCapa(c) {
    if (E.ocupado || !E.vaso) return;
    if (E.vaso.capas.length >= MAX_CAPAS) return mensaje("¡El vaso está lleno! Entrégalo o bótalo.", "aviso");
    E.vaso.capas.push(c);
    pintarVaso();
  }

  function ponerTopping(id) {
    if (E.ocupado || !E.vaso) return;
    const b = bloqueo(E.vaso.toppings, id);
    if (b) return mensaje(b, "aviso");
    E.vaso.toppings[id] = (E.vaso.toppings[id] || 0) + 1;
    pintarVaso();
    pintarControles();
  }

  function botar() {
    if (E.ocupado || !E.vaso) return;
    E.vaso = null;
    pintarVaso();
    pintarControles();
    mensaje("Vaso a la basura. ¡Empieza otra vez!", "info");
    $("#jTamanos button").focus();
  }

  // Qué salió mal ("" si el vaso está perfecto)
  function revisar() {
    const v = E.vaso, ped = E.pedido;
    if (v.tamano !== ped.tamano) return `Era un vaso de ${nombreTamano(ped.tamano)}.`;
    const capas = v.capas.join(",");
    if (capas !== RECETA.join(",")) {
      const falta = RECETA.filter((c) => !v.capas.includes(c));
      if (falta.length) return `Faltó: ${falta.map((c) => CAPAS[c]).join(", ")}.`;
      return "Las capas van en orden: crema, fresas, salsas y Oreo.";
    }
    if (!iguales(v.toppings, ped.toppings)) {
      return total(ped.toppings) ? `Los toppings eran: ${nombres(ped.toppings).join(", ")}.` : "Este vaso era sin toppings.";
    }
    return "";
  }

  function entregar() {
    if (E.ocupado || !E.vaso) return;
    const error = revisar();
    if (error) return fallo(error);
    const resta = Math.max(0, 1 - (performance.now() - E.inicio - E.pausa) / (E.pedido.segundos * 1000));
    E.racha++;
    E.atendidos++;
    const ganados = Math.round((100 + total(E.pedido.toppings) * 25 + resta * E.pedido.segundos * 5) * Math.min(2, 1 + (E.racha - 1) * 0.1));
    E.puntos += ganados;
    E.ultimo = { tamano: E.vaso.tamano, toppings: { ...E.vaso.toppings } };
    terminar("is-sale", `¡Delicioso! ${E.pedido.cliente} quedó feliz. +${ganados}`, "bien", 1000);
  }

  function fallo(texto) {
    E.vidas--;
    E.racha = 0;
    terminar("is-mal", `${texto} ${E.vidas ? "Pierdes una vida." : ""}`.trim(), "mal", 1700);
  }

  function terminar(clase, texto, tipo, espera) {
    E.ocupado = true;
    cancelAnimationFrame(reloj);
    if (tipo !== "bien") $("#jCara").innerHTML = cara("preocupada");
    $("#jVaso").classList.add(clase);
    pintarHud();
    pintarControles();
    mensaje(texto, tipo);
    const fin = E.vidas <= 0;
    setTimeout(() => (fin ? finDelJuego() : siguientePedido()), reducido() ? Math.min(espera, 900) : espera);
  }

  function finDelJuego() {
    const mejor = Math.max(record.get(), E.puntos);
    const nuevo = E.puntos > 0 && E.puntos >= mejor && E.puntos > record.get();
    record.set(mejor);
    $("#jMesa").hidden = true;
    $("#jFin").hidden = false;
    $("#jFinPuntos").textContent = E.puntos.toLocaleString("es-CO");
    $("#jFinAtendidos").textContent = E.atendidos === 1 ? "1 pedido atendido" : `${E.atendidos} pedidos atendidos`;
    $("#jFinRecord").textContent = nuevo ? "¡Nuevo récord!" : `Récord: ${mejor.toLocaleString("es-CO")}`;
    const u = E.ultimo;
    const ids = u ? G.items.flatMap((a) => Array(u.toppings[a.id] || 0).fill(a.id)) : [];
    $("#jPedirReal").href = `./#pedir=${P.id}${u ? `&tamano=${encodeURIComponent(u.tamano)}${ids.length ? "&t=" + ids.join(",") : ""}` : ""}`;
    $("#jPedirTexto").textContent = u
      ? `Vaso de ${nombreTamano(u.tamano)}${ids.length ? " con " + nombres(u.toppings).join(", ") : ""} · ${money(precio(u))}`
      : `Desde ${money(Math.min(...TAMANOS.map((t) => t.precio)))}`;
    $("#jFin h2").focus();
  }

  /* Controles */
  $("#jTamanos").innerHTML = TAMANOS.map((t) => `
    <button type="button" class="hm-jbtn" data-tam="${esc(t.id)}"><i class="bi bi-cup" aria-hidden="true"></i><span>${esc(t.nombre)}</span></button>`).join("");
  $("#jCapas").innerHTML = RECETA.map((c, i) => `
    <button type="button" class="hm-jbtn is-capa is-${c}" data-capa="${c}"><span class="hm-jbtn-num" aria-hidden="true">${i + 1}</span><span>${CAPAS[c]}</span></button>`).join("");
  $("#jToppings").innerHTML = G.items.map((a) => `
    <button type="button" class="hm-jbtn is-top" data-top="${esc(a.id)}" aria-label="Topping ${esc(a.nombre)}">
      <span class="hm-jbtn-ic">${window.HM_ICONO_TOPPING ? window.HM_ICONO_TOPPING(a.icono) : ""}</span><span>${esc(a.nombre)}</span><output aria-live="off"></output></button>`).join("");

  document.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || b.disabled) return;
    if (b.dataset.tam) ponerVaso(b.dataset.tam);
    else if (b.dataset.capa) ponerCapa(b.dataset.capa);
    else if (b.dataset.top) ponerTopping(b.dataset.top);
    else if (b.id === "jBotar") botar();
    else if (b.id === "jEntregar") entregar();
    else if (b.hasAttribute("data-jugar")) nuevoJuego();
  });

  // Portada: Hony y récord
  const honyGrande = `<svg viewBox="-26 -26 52 52" aria-hidden="true" focusable="false">${window.HM_VASO.hony(0, 0, 24)}</svg>`;
  document.querySelectorAll("[data-hony]").forEach((el) => (el.innerHTML = honyGrande));
  const r = record.get();
  $("#jRecordInicio").textContent = r ? `Tu récord: ${r.toLocaleString("es-CO")}` : "";
  $("#jVasoPortada").innerHTML = window.HM_VASO.svg({ grande: true, capas: RECETA, toppings: { queso: 1, oreo: 1 }, orden: ["queso-0", "oreo-0"] }, { receta: RECETA });
})();
