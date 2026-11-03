/* =========================================================
   Honeymoon · Juego "Fresas con crema"
   Pon el vaso del tamaño pedido, arma las capas en orden (1 crema → 2 fresas → 3 salsas →
   4 Oreo), agrega los toppings y entrega. En cada pedido los botones de las capas cambian de
   lugar (cada uno conserva su número); desde el nivel 3 también se mueven los toppings.
   Usa los tamaños, precios, toppings y límites reales de menu.js.
   ========================================================= */
(function () {
  "use strict";

  const P = window.HM_MENU.find((p) => p.id === "fresas-con-crema");
  const G = window.HM_ADICIONES[P.adiciones];
  const TAMANOS = P.tamanos;
  const RECETA = ["crema", "fresas", "salsas", "oreo"];
  const CAPAS = { crema: "Crema", fresas: "Fresas", salsas: "Salsas", oreo: "Oreo" };
  const MAX_CAPAS = 6;
  const MAX_TOPPINGS = 4;
  const K = "#4a1f48";

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
  const nombreTamano = (id) => TAMANOS.find((t) => t.id === id).nombre;

  /* Íconos de los botones de capas y del vaso */
  const ICONO_CAPA = {
    crema: `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M8 30 C4 30 4 24 9 23 C7 18 12 14 16 17 C16 11 25 10 26 16 C31 14 35 19 32 23 C37 24 36 30 32 30 Z" fill="#fffaf0" stroke="${K}" stroke-width="2.2" stroke-linejoin="round"/><path d="M14 24 Q20 20 26 24" stroke="#ead8b8" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
    fresas: `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M20 35 C9 29 7 19 11 14 C14 11 18 12 20 13 C22 12 26 11 29 14 C33 19 31 29 20 35Z" fill="#e0364f" stroke="${K}" stroke-width="2.2" stroke-linejoin="round"/><path d="M13 12 L17 9 L20 12 L23 9 L27 12 L22 14 L18 14Z" fill="#5cbf7a" stroke="${K}" stroke-width="1.8" stroke-linejoin="round"/>${[[15, 19], [21, 18], [25, 22], [17, 25], [22, 28]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1" ry="1.5" fill="#ffe9a8"/>`).join("")}</svg>`,
    salsas: `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M9 8 Q9 24 13 26 Q17 24 17 8Z" fill="#d42a46" stroke="${K}" stroke-width="2"/><path d="M16 8 Q16 28 20 30 Q24 28 24 8Z" fill="#c98a3c" stroke="${K}" stroke-width="2"/><path d="M23 8 Q23 24 27 26 Q31 24 31 8Z" fill="#fffaf0" stroke="${K}" stroke-width="2"/><path d="M6 8 H34" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/></svg>`,
    oreo: `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><circle cx="20" cy="20" r="13" fill="#2b2422" stroke="${K}" stroke-width="2.2"/><circle cx="20" cy="20" r="9" fill="none" stroke="#5a4a44" stroke-width="1.4"/>${[0, 60, 120, 180, 240, 300].map((g) => `<circle cx="${(20 + 6 * Math.cos(g * Math.PI / 180)).toFixed(1)}" cy="${(20 + 6 * Math.sin(g * Math.PI / 180)).toFixed(1)}" r="1.2" fill="#5a4a44"/>`).join("")}</svg>`
  };
  const VASO_ICONO = `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M10 9 H30 L27 33 Q27 35 25 35 H15 Q13 35 13 33Z" fill="#fff" fill-opacity=".6" stroke="${K}" stroke-width="2.2" stroke-linejoin="round"/><path d="M11.5 18 H28.5 L27.4 27 H12.6Z" fill="#f9cdd5"/><path d="M8 9 H32" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/></svg>`;

  let ctx = null, ped = null, vaso = null, vasoUI = null, tres = null;
  let ordenCapas = RECETA.slice();
  let ordenTops = G.items.map((a) => a.id);

  // Cambia los botones de lugar con una animación (el DOM también, para que el orden del Tab coincida)
  function reordenar(cont, attr, orden) {
    const btns = Array.from(cont.children);
    const antes = new Map(btns.map((b) => [b, b.getBoundingClientRect()]));
    orden.forEach((k) => cont.appendChild(cont.querySelector(`[${attr}="${k}"]`)));
    if (ctx.reducido()) return;
    btns.forEach((b) => {
      const a = antes.get(b), d = b.getBoundingClientRect();
      const dx = a.left - d.left, dy = a.top - d.top;
      if (dx || dy) b.animate([{ transform: `translate(${dx}px, ${dy}px) scale(.9)` }, { transform: "none" }], { duration: 420, easing: "cubic-bezier(.3,1.3,.5,1)" });
    });
  }

  function preparar(c) {
    ctx = c;
    vaso = null;
    vasoUI = null;
    ordenCapas = RECETA.slice();
    ordenTops = G.items.map((a) => a.id);
    ctx.escenario.innerHTML = `<div class="hm-mesa-vaso" id="fVaso"></div>`;
    // En 3D si el navegador puede; si no, el dibujo 2D
    const el = ctx.escenario.querySelector("#fVaso");
    salir();
    try { tres = window.HM_3D && window.HM_3D.soporta() ? window.HM_3D.fresas(el) : null; } catch (e) { tres = null; }
    el.classList.toggle("is-3d", !!tres);
    ctx.escenario.closest(".hm-mesa").classList.toggle("is-3d", !!tres);
    ctx.controles.innerHTML = `
      <div class="hm-ctrl-wrap" id="fCtrl">
        <div class="hm-ctrl">
          <h2 class="hm-ctrl-tit">1 · Vaso</h2>
          <div class="hm-ctrl-btns is-2" id="fTamanos">${TAMANOS.map((t) => `
            <button type="button" class="hm-jbtn" data-tam="${ctx.esc(t.id)}"><span class="hm-jbtn-ic">${VASO_ICONO}</span><span>${ctx.esc(t.nombre)}</span></button>`).join("")}</div>
        </div>
        <div class="hm-ctrl">
          <h2 class="hm-ctrl-tit">2 · Capas <small>sigue los números</small></h2>
          <div class="hm-ctrl-btns is-4" id="fCapas">${RECETA.map((k, i) => `
            <button type="button" class="hm-jbtn is-capa is-${k}" data-capa="${k}" aria-label="${i + 1}: ${CAPAS[k]}"><span class="hm-jbtn-num" aria-hidden="true">${i + 1}</span><span class="hm-jbtn-ic">${ICONO_CAPA[k]}</span><span>${CAPAS[k]}</span></button>`).join("")}</div>
        </div>
        <div class="hm-ctrl">
          <h2 class="hm-ctrl-tit">3 · Toppings <small>los del pedido</small></h2>
          <div class="hm-ctrl-btns is-4" id="fToppings">${G.items.map((a) => `
            <button type="button" class="hm-jbtn is-top" data-top="${ctx.esc(a.id)}" aria-label="Topping ${ctx.esc(a.nombre)}"><span class="hm-jbtn-ic">${window.HM_ICONO_TOPPING ? window.HM_ICONO_TOPPING(a.icono) : ""}</span><span>${ctx.esc(a.nombre)}</span><output aria-live="off"></output></button>`).join("")}</div>
        </div>
        <div class="hm-ctrl-acciones">
          <button type="button" class="btn btn-hm btn-hm-paper" id="fBotar"><i class="bi bi-trash3 me-1" aria-hidden="true"></i>Botar</button>
          <button type="button" class="btn btn-hm btn-hm-primary" id="fEntregar"><i class="bi bi-bag-check-fill me-1" aria-hidden="true"></i>Entregar</button>
        </div>
      </div>`;
    ctx.controles.querySelector("#fCtrl").addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b || b.disabled) return;
      if (b.dataset.tam) ponerVaso(b.dataset.tam);
      else if (b.dataset.capa) ponerCapa(b.dataset.capa);
      else if (b.dataset.top) ponerTopping(b.dataset.top);
      else if (b.id === "fBotar") botar();
      else if (b.id === "fEntregar") entregar();
    });
  }

  // Pedido al azar que se puede hacer de verdad; cada nivel trae más toppings y menos tiempo
  function crearPedido(nv) {
    const rango = nv === 1 ? [0, 1] : nv === 2 ? [1, 2] : nv < 5 ? [1, 3] : [2, 4];
    const meta = rango[0] + ctx.azar(rango[1] - rango[0] + 1);
    const c = {};
    for (let i = 0; i < 40 && total(c) < meta; i++) {
      const a = G.items[ctx.azar(G.items.length)];
      if (!bloqueo(c, a.id)) c[a.id] = (c[a.id] || 0) + 1;
    }
    const tamano = TAMANOS[ctx.azar(TAMANOS.length)].id;
    const p = { tamano, toppings: c };
    const ids = G.items.flatMap((a) => Array(c[a.id] || 0).fill(a.id));
    p.precio = precio(p);
    p.segundos = Math.max(9, 26 * Math.pow(.86, nv - 1)) + total(c) * 1.2;
    p.extra = total(c) * 25;
    p.lector = `un vaso de ${nombreTamano(tamano)}${total(c) ? " con " + nombres(c).join(", ") : " sin toppings"}`;
    p.chips = [{ texto: `Vaso ${nombreTamano(tamano)}`, icono: VASO_ICONO }].concat(total(c)
      ? G.items.filter((a) => c[a.id]).map((a) => ({ texto: `${a.nombre}${c[a.id] > 1 ? " x" + c[a.id] : ""}`, icono: window.HM_ICONO_TOPPING ? window.HM_ICONO_TOPPING(a.icono) : "" }))
      : [{ texto: "Sin toppings", clase: "is-sin" }]);
    p.tienda = { hash: `pedir=${P.id}&tamano=${encodeURIComponent(tamano)}${ids.length ? "&t=" + ids.join(",") : ""}`, texto: `Vaso de ${nombreTamano(tamano)}${ids.length ? " con " + nombres(c).join(", ") : ""} · ${ctx.money(p.precio)}` };
    return p;
  }

  function iniciar(p) {
    ped = p;
    vaso = null;
    ctx.escenario.querySelector("#fVaso").classList.remove("is-sale", "is-mal");
    pintarVaso();
    // En cada pedido las capas cambian de lugar; desde el nivel 3, también los toppings
    ordenCapas = ctx.barajar(RECETA, ordenCapas);
    reordenar(ctx.controles.querySelector("#fCapas"), "data-capa", ordenCapas);
    if (ctx.nivel() >= 3) {
      ordenTops = ctx.barajar(G.items.map((a) => a.id), ordenTops);
      reordenar(ctx.controles.querySelector("#fToppings"), "data-top", ordenTops);
    }
    pintarControles();
  }

  function pintarVaso() {
    const el = ctx.escenario.querySelector("#fVaso");
    el.dataset.capas = vaso ? vaso.capas.length : 0;
    el.dataset.toppings = vaso ? total(vaso.toppings) : 0;
    if (tres) {
      tres.pintar(vaso ? { grande: TAMANOS.findIndex((t) => t.id === vaso.tamano) > 0, capas: vaso.capas, toppings: porIcono(vaso.toppings) } : null);
      let v = el.querySelector(".hm-mesa-vacia");
      if (!v) { el.insertAdjacentHTML("beforeend", `<div class="hm-mesa-vacia"><i class="bi bi-arrow-down-circle" aria-hidden="true"></i>Pon un vaso</div>`); v = el.querySelector(".hm-mesa-vacia"); }
      v.hidden = !!vaso;
      return;
    }
    if (!vaso) {
      vasoUI = null;
      el.innerHTML = `<div class="hm-mesa-vacia"><i class="bi bi-arrow-down-circle" aria-hidden="true"></i>Pon un vaso</div>`;
      return;
    }
    if (!vasoUI) vasoUI = window.HM_VASO.montar(el, { receta: RECETA });
    vasoUI.pintar({ grande: TAMANOS.findIndex((t) => t.id === vaso.tamano) > 0, capas: vaso.capas, toppings: porIcono(vaso.toppings) });
  }

  function pintarControles() {
    const hay = !!vaso;
    const listo = !ctx.ocupado();
    ctx.controles.querySelectorAll("[data-tam]").forEach((b) => (b.disabled = !listo || hay));
    ctx.controles.querySelectorAll("[data-capa]").forEach((b) => (b.disabled = !listo || !hay));
    ctx.controles.querySelectorAll("[data-top]").forEach((b) => {
      b.disabled = !listo || !hay;
      const n = hay ? vaso.toppings[b.dataset.top] || 0 : 0;
      b.querySelector("output").textContent = n ? `x${n}` : "";
    });
    ctx.controles.querySelector("#fBotar").disabled = !listo || !hay;
    ctx.controles.querySelector("#fEntregar").disabled = !listo || !hay;
  }

  function ponerVaso(id) {
    if (ctx.ocupado() || vaso) return;
    vaso = { tamano: id, capas: [], toppings: {} };
    ctx.sonar("tap");
    pintarVaso();
    pintarControles();
    ctx.controles.querySelector("#fCapas button").focus({ preventScroll: true });
  }

  function ponerCapa(k) {
    if (ctx.ocupado() || !vaso) return;
    if (vaso.capas.length >= MAX_CAPAS) return ctx.mensaje("¡El vaso está lleno! Entrégalo o bótalo.", "aviso");
    vaso.capas.push(k);
    ctx.sonar("capa");
    pintarVaso();
  }

  function ponerTopping(id) {
    if (ctx.ocupado() || !vaso) return;
    const b = bloqueo(vaso.toppings, id);
    if (b) { ctx.sonar("aviso"); return ctx.mensaje(b, "aviso"); }
    vaso.toppings[id] = (vaso.toppings[id] || 0) + 1;
    ctx.sonar("pop");
    pintarVaso();
    pintarControles();
  }

  function botar() {
    if (ctx.ocupado() || !vaso) return;
    vaso = null;
    pintarVaso();
    pintarControles();
    ctx.mensaje("Vaso a la basura. ¡Empieza otra vez!", "info");
    ctx.controles.querySelector("#fTamanos button").focus({ preventScroll: true });
  }

  // Qué salió mal ("" si el vaso está perfecto)
  function revisar() {
    if (vaso.tamano !== ped.tamano) return `Era un vaso de ${nombreTamano(ped.tamano)}.`;
    if (vaso.capas.join() !== RECETA.join()) {
      const falta = RECETA.filter((k) => !vaso.capas.includes(k));
      if (falta.length) return `Faltó: ${falta.map((k) => CAPAS[k]).join(", ")}.`;
      return "Las capas van en orden: crema, fresas, salsas y Oreo.";
    }
    if (!iguales(vaso.toppings, ped.toppings)) {
      return total(ped.toppings) ? `Los toppings eran: ${nombres(ped.toppings).join(", ")}.` : "Este vaso era sin toppings.";
    }
    return "";
  }

  function entregar() {
    if (ctx.ocupado() || !vaso) return;
    const error = revisar();
    if (tres) tres.entregar(!error);
    else ctx.escenario.querySelector("#fVaso").classList.add(error ? "is-mal" : "is-sale");
    if (error) ctx.mal(error);
    else ctx.bien("¡Delicioso!");
  }

  function salir() {
    if (tres) tres.destruir();
    tres = null;
  }

  // Portada: vaso lleno con toppings
  const portada = () => window.HM_VASO.svg({ grande: true, capas: RECETA, toppings: { queso: 1, oreo: 1 }, orden: ["queso-0", "oreo-0"] }, { receta: RECETA });

  window.HM_JUEGO.registrar({
    id: "fresas",
    nombre: "Fresas con crema",
    kicker: "Arma el vaso",
    descripcion: "Pon el vaso, arma las capas en orden y agrega los toppings antes de que el cliente pierda la paciencia.",
    claveRecord: "hm_juego_record",
    pasos: [
      "<strong>Pon el vaso</strong> del tamaño que pide el cliente.",
      "<strong>Arma las capas siguiendo los números 1, 2, 3 y 4</strong>: crema, fresas, salsas y Oreo. ¡Ojo! En cada pedido los botones cambian de lugar.",
      "<strong>Agrega los toppings</strong> del pedido y toca <em>Entregar</em>."
    ],
    portada,
    preparar,
    crearPedido,
    iniciar,
    pintarControles,
    primerControl: () => ctx.controles.querySelector("#fTamanos button"),
    detener: () => {},
    salir,
    textoNivel: (n) => (n === 3 ? "Menos tiempo y ahora también se mueven los toppings." : n === 5 ? "Pedidos más grandes y clientes con mucha prisa." : "Los clientes tienen menos paciencia."),
    tiendaInicial: () => ({ hash: `pedir=${P.id}`, texto: `Fresas con crema desde ${ctx.money(Math.min(...TAMANOS.map((t) => t.precio)))}` })
  });
})();
