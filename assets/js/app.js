/* =========================================================
   Honeymoon · Lógica de menú, carrito y pedido por WhatsApp
   ========================================================= */
(function () {
  "use strict";

  const CFG = window.HM_CONFIG;
  const MENU = window.HM_MENU;
  const GRUPOS_ADICIONES = window.HM_ADICIONES;
  const ADICIONES = Object.values(GRUPOS_ADICIONES).flatMap((g) => g.items);
  const NUMERO_PRUEBA = "573000000000";
  const TEL = String(CFG.whatsapp).replace(/\D/g, ""); // tolera "+57 300 ..." en config.js
  const MAX_CANTIDAD = 20;
  const preciosConfirmados = CFG.preciosConfirmados !== false;

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const money = (n) => "$" + Math.round(n).toLocaleString("es-CO");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const getProducto = (id) => MENU.find((p) => p.id === id);
  const getAdicion = (id) => ADICIONES.find((a) => a.id === id);
  const grupoDe = (p) => (p && p.adiciones && GRUPOS_ADICIONES[p.adiciones]) || null;

  /* Toppings con cantidad: el carrito guarda un id por porción (["f-oreo", "f-oreo"]) */
  const contar = (ids) => ids.reduce((c, id) => ((c[id] = (c[id] || 0) + 1), c), {});
  const expandir = (grupo, c) => (grupo ? grupo.items.flatMap((a) => Array(c[a.id] || 0).fill(a.id)) : []);
  const maxDe = (a) => a.max || 1;
  // Porciones de los demás toppings
  const sumaOtros = (c, id) => Object.entries(c).reduce((s, [k, v]) => s + (k === id ? 0 : v), 0);
  // Toppings cuyo límite está activo (ej. 2 de Oreo: nada más; 2 de Queso: solo 1 topping más)
  const limitesActivos = (grupo, c) => grupo.items.filter((a) => a.limite && (c[a.id] || 0) >= a.limite.desde);
  const limiteRoto = (grupo, c) => limitesActivos(grupo, c).find((a) => sumaOtros(c, a.id) > a.limite.otros);
  const toppingsMas = (n) => (n === 1 ? "1 topping más" : `${n} toppings más`);
  // Por qué no se puede sumar otra porción de un topping ("" si sí se puede)
  function bloqueoTopping(grupo, c, id) {
    const a = grupo.items.find((x) => x.id === id);
    const n = c[id] || 0;
    if (n >= maxDe(a)) return `Máximo ${maxDe(a)} de ${a.nombre}.`;
    const nuevo = { ...c, [id]: n + 1 };
    const roto = limiteRoto(grupo, nuevo);
    if (!roto) return "";
    const otros = roto.limite.otros;
    if (roto.id === id) {
      return otros === 0
        ? `Para pedir ${n + 1} de ${a.nombre}, quita los demás toppings.`
        : `Para pedir ${n + 1} de ${a.nombre}, deja máximo ${toppingsMas(otros)}.`;
    }
    return otros === 0
      ? `Con ${c[roto.id]} de ${roto.nombre} no se pueden agregar otros toppings.`
      : `Con ${c[roto.id]} de ${roto.nombre} solo se puede agregar ${toppingsMas(otros)}.`;
  }
  // Aviso fijo mientras un límite esté activo
  function avisoLimite(grupo, c) {
    const a = limitesActivos(grupo, c)[0];
    if (!a) return "";
    return a.limite.otros === 0
      ? `Con ${c[a.id]} de ${a.nombre}, ese topping va solo.`
      : `Con ${c[a.id]} de ${a.nombre} puedes agregar solo ${toppingsMas(a.limite.otros)}.`;
  }
  // Ajusta un pedido guardado a los límites actuales
  function sanearToppings(grupo, c) {
    const r = {};
    grupo.items.forEach((a) => {
      const n = Math.min(c[a.id] || 0, maxDe(a));
      if (n > 0) r[a.id] = n;
    });
    // Si un límite no se cumple, ese topping baja a una porción menos de donde empieza el límite
    for (let i = 0; i < grupo.items.length; i++) {
      const roto = limiteRoto(grupo, r);
      if (!roto) break;
      r[roto.id] = roto.limite.desde - 1;
      if (!r[roto.id]) delete r[roto.id];
    }
    return r;
  }
  // "Queso, Oreo x2"
  function nombresToppings(p, ids) {
    const grupo = grupoDe(p);
    if (!grupo) return [];
    const c = contar(ids);
    return grupo.items.filter((a) => c[a.id]).map((a) => (c[a.id] > 1 ? `${a.nombre} x${c[a.id]}` : a.nombre));
  }
  // Nombre completo para carrito y WhatsApp (por defecto, el mismo de la tarjeta)
  const nombreLargo = (p) => p.nombreCompleto || p.nombre;
  const waUrl = (texto) => `https://wa.me/${TEL}?text=${encodeURIComponent(texto)}`;
  const suave = () => (matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

  const store = {
    // Devuelve el valor guardado solo si es del mismo tipo que el valor por defecto
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        const v = JSON.parse(raw);
        const mismoTipo = v !== null && typeof v === typeof fallback && Array.isArray(v) === Array.isArray(fallback);
        return mismoTipo ? v : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* almacenamiento no disponible */ }
    }
  };

  // Opción elegida de un producto con "eleccion" (ej. el topping del paveé); la primera por defecto
  const getOpcion = (p, id) => (p.eleccion ? p.eleccion.opciones.find((o) => o.id === id) || p.eleccion.opciones[0] : null);
  const ilustracionDe = (p, opcion) => {
    const o = getOpcion(p, opcion);
    return (o && o.ilustracion) || p.ilustracion || {};
  };
  function media(p, opcion) {
    if (p.imagen) return `<img src="${esc(p.imagen)}" alt="" loading="lazy">`;
    return window.HM_ILUSTRACION(ilustracionDe(p, opcion));
  }
  const etiquetaFoto = (p) => (p.imagen && p.fotoReferencia ? `<span class="hm-ref">Foto de referencia</span>` : "");
  const fondo = (p, opcion) => ilustracionDe(p, opcion).fondo || p.fondo || "var(--hm-lilac-100)";
  // "a, b y c"; "y" pasa a "e" antes de i- y "o" a "u" antes de o- (Piazza u Oreo)
  const listaY = (items, y = "y") => {
    if (items.length < 2) return items.join("");
    const ult = items[items.length - 1];
    const conj = y === "o" && /^h?o/i.test(ult) ? "u" : y === "y" && /^h?i(?![aeou])/i.test(ult) ? "e" : y;
    return `${items.slice(0, -1).join(", ")} ${conj} ${ult}`;
  };
  const precioDesde = (p) => Math.min(...p.tamanos.map((t) => t.precio));
  /* Fechas y horas en Colombia; fechas en formato AAAA-MM-DD */
  function ahoraBogota() {
    const partes = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "numeric", minute: "numeric", hourCycle: "h23"
    }).formatToParts(new Date());
    const get = (t) => partes.find((p) => p.type === t).value;
    return {
      fecha: `${get("year")}-${get("month")}-${get("day")}`,
      hora: +get("hour") + +get("minute") / 60
    };
  }
  const hoyBogota = () => ahoraBogota().fecha;
  const isoAFecha = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  };
  const sumarDias = (iso, dias) => {
    const f = isoAFecha(iso);
    f.setUTCDate(f.getUTCDate() + dias);
    return f.toISOString().slice(0, 10);
  };
  const fechaLarga = (iso) => new Intl.DateTimeFormat("es-CO", {
    timeZone: "UTC", weekday: "long", day: "numeric", month: "long"
  }).format(isoAFecha(iso));
  // Productos de temporada: solo se pueden pedir entre temporada.desde y temporada.hasta (MM-DD)
  const abreEl = (iso) => !!CFG.horario[isoAFecha(iso).getUTCDay()];
  const proximoAbierto = (iso) => {
    let d = iso;
    for (let i = 0; i < 14 && !abreEl(d); i++) d = sumarDias(d, 1);
    return d;
  };
  // Temporadas en formato MM-DD (pueden cruzar el año, ej. 12-01 → 01-31)
  const enRango = (md, t) => (t.desde <= t.hasta ? md >= t.desde && md <= t.hasta : md >= t.desde || md <= t.hasta);
  // Último día de la temporada vigente, en AAAA-MM-DD
  const finTemporada = (t, hoy = hoyBogota()) => {
    const y = +hoy.slice(0, 4);
    const fin = `${y}-${t.hasta}`;
    return fin >= hoy ? fin : `${y + 1}-${t.hasta}`;
  };
  // Se puede pedir si hoy está en temporada y, si es por encargo, la primera entrega posible también
  const enTemporada = (p) => {
    if (!p.temporada) return true;
    const hoy = hoyBogota();
    if (!enRango(hoy.slice(5), p.temporada)) return false;
    if (!p.encargo) return true;
    const primera = proximoAbierto(sumarDias(hoy, CFG.diasEncargo));
    return primera <= finTemporada(p.temporada, hoy);
  };
  const disponible = (p) => p.disponible !== false && enTemporada(p);
  const getTamano = (p, id) => p.tamanos.find((t) => t.id === id) || p.tamanos[0];
  const nombreTamano = (t) => t.nombre + (t.detalle ? ` (${t.detalle})` : "");
  const esEncargo = (p, t) => !!(p.encargo || (t && t.encargo));
  const textoEncargo = () => `Por encargo · ${CFG.diasEncargo} días antes`;

  /* Componentes de Bootstrap */
  const productoModal = new bootstrap.Modal("#productoModal");
  const checkoutModal = new bootstrap.Modal("#checkoutModal");
  const offcanvas = bootstrap.Offcanvas.getOrCreateInstance("#carrito");

  // Botón de carrito visible (barra inferior en móvil o el de la navbar)
  function enfocarBotonCarrito() {
    const barra = $(".hm-cartbar");
    (barra.offsetParent ? barra : $(".hm-cart-btn")).focus();
  }

  /* =====================================================
     Carrito
     ===================================================== */
  function normalizarItem(it) {
    if (!it || typeof it !== "object") return null;
    const p = getProducto(it.id);
    if (!p || !disponible(p) || !p.tamanos.some((t) => t.id === it.tamano)) return null;
    const cantidad = Math.min(MAX_CANTIDAD, Math.floor(Number(it.cantidad)));
    if (!(cantidad > 0)) return null;
    return {
      id: p.id,
      tamano: it.tamano,
      opcion: p.eleccion ? getOpcion(p, it.opcion).id : "",
      adiciones: adicionesValidas(p, it.adiciones),
      nota: typeof it.nota === "string" ? it.nota.slice(0, 140) : "",
      cantidad
    };
  }
  function adicionesValidas(p, ids) {
    const grupo = grupoDe(p);
    if (!grupo || !Array.isArray(ids)) return [];
    const propios = ids.filter((id) => typeof id === "string" && grupo.items.some((a) => a.id === id));
    return expandir(grupo, sanearToppings(grupo, contar(propios)));
  }
  const cargarCarrito = () => store.get("hm_carrito", []).map(normalizarItem).filter(Boolean);

  let carrito = cargarCarrito();

  function claveItem(it) {
    return [it.id, it.tamano, it.opcion || "", [...it.adiciones].sort().join("+"), it.nota.trim().toLowerCase()].join("|");
  }

  function precioUnitario(it) {
    const p = getProducto(it.id);
    const t = getTamano(p, it.tamano);
    return t.precio + it.adiciones.reduce((s, id) => s + ((getAdicion(id) || {}).precio || 0), 0);
  }

  const subtotal = () => carrito.reduce((s, it) => s + precioUnitario(it) * it.cantidad, 0);
  const totalUnidades = () => carrito.reduce((s, it) => s + it.cantidad, 0);

  function guardar() {
    store.set("hm_carrito", carrito);
    renderCarrito();
  }

  // Devuelve cuántas unidades se agregaron de verdad (respeta MAX_CANTIDAD)
  function agregar(item) {
    const clave = claveItem(item);
    const existente = carrito.find((it) => claveItem(it) === clave);
    let agregadas = item.cantidad;
    if (existente) {
      const antes = existente.cantidad;
      existente.cantidad = Math.min(MAX_CANTIDAD, antes + item.cantidad);
      agregadas = existente.cantidad - antes;
    } else {
      carrito.push(item);
    }
    guardar();
    const badge = $("#cartCount");
    badge.classList.remove("hm-bump");
    void badge.offsetWidth;
    badge.classList.add("hm-bump");
    return agregadas;
  }

  function describirItem(it) {
    const p = getProducto(it.id);
    const t = getTamano(p, it.tamano);
    const adic = nombresToppings(p, it.adiciones);
    const o = getOpcion(p, it.opcion);
    return {
      p, tamano: p.tamanos.length > 1 ? nombreTamano(t) : "", adic, nota: it.nota.trim(), encargo: esEncargo(p, t),
      opcion: o ? `${p.eleccion.titulo}: ${o.nombre}` : ""
    };
  }

  const carritoTieneEncargo = () => carrito.some((it) => describirItem(it).encargo);

  function renderCarrito() {
    const cont = $("#carritoItems");
    const n = totalUnidades();
    const sub = subtotal();

    $("#cartCount").textContent = n;
    $("#cartCount").classList.toggle("d-none", n === 0);
    $(".hm-cart-btn").setAttribute("aria-label", n ? `Carrito, ${n} ${n === 1 ? "producto" : "productos"}` : "Carrito vacío");
    $$("[data-cart-count]").forEach((el) => (el.textContent = n));
    $$("[data-cart-subtotal]").forEach((el) => (el.textContent = money(sub)));
    document.body.classList.toggle("has-cart", n > 0);
    $("#carritoFoot").classList.toggle("d-none", n === 0);

    if (!carrito.length) {
      cont.innerHTML = `
        <div class="hm-empty">
          <div class="hm-empty-art"><img src="assets/img/logo-honeymoon.svg" alt="" width="456" height="393"></div>
          <h3 class="fs-4">Tu carrito está vacío</h3>
          <p class="text-plum-soft">Hony te espera con algo dulce.</p>
          <button type="button" class="btn btn-hm btn-hm-primary" data-ver-menu>Ver el menú</button>
        </div>`;
      return;
    }

    cont.innerHTML = carrito.map((it, i) => {
      const d = describirItem(it);
      const meta = [d.tamano, d.opcion, d.adic.length ? "+ " + d.adic.join(", ") : ""].filter(Boolean).join(" · ");
      return `
        <div class="hm-cart-item">
          <div class="hm-cart-thumb" style="background:${fondo(d.p, it.opcion)}">${media(d.p, it.opcion)}</div>
          <div class="flex-grow-1 min-w-0">
            <div class="d-flex justify-content-between gap-2">
              <div class="hm-cart-name">${esc(nombreLargo(d.p))}</div>
              <button class="hm-cart-remove" type="button" data-remove="${i}" aria-label="Quitar ${esc(nombreLargo(d.p))}"><i class="bi bi-trash3"></i></button>
            </div>
            ${meta ? `<div class="hm-cart-meta">${esc(meta)}</div>` : ""}
            ${d.nota ? `<div class="hm-cart-meta fst-italic">“${esc(d.nota)}”</div>` : ""}
            ${d.encargo ? `<div class="hm-cart-meta"><i class="bi bi-calendar-heart me-1"></i>Por encargo</div>` : ""}
            <div class="d-flex justify-content-between align-items-center mt-2">
              <div class="hm-qty hm-qty-sm" role="group" aria-label="Cantidad de ${esc(nombreLargo(d.p))}">
                <button type="button" data-step="${i}" data-delta="-1" aria-label="Quitar uno"><i class="bi bi-dash-lg"></i></button>
                <output>${Number(it.cantidad)}</output>
                <button type="button" data-step="${i}" data-delta="1" aria-label="Agregar uno" ${it.cantidad >= MAX_CANTIDAD ? "disabled" : ""}><i class="bi bi-plus-lg"></i></button>
              </div>
              <strong>${money(precioUnitario(it) * it.cantidad)}</strong>
            </div>
          </div>
        </div>`;
    }).join("");
  }

  // Tras re-renderizar el carrito, devuelve el foco a un control equivalente
  function enfocarEnCarrito(i, delta) {
    const dest =
      (delta && $(`#carritoItems [data-step="${i}"][data-delta="${delta}"]:not(:disabled)`)) ||
      (delta && $(`#carritoItems [data-step="${i}"]:not(:disabled)`)) ||
      $(`#carritoItems [data-remove="${Math.min(i, carrito.length - 1)}"]`) ||
      $("#carritoItems [data-ver-menu]") ||
      $("#carrito .btn-close");
    if (dest) dest.focus();
  }

  $("#carritoItems").addEventListener("click", (e) => {
    const rm = e.target.closest("[data-remove]");
    const st = e.target.closest("[data-step]");
    if (e.target.closest("[data-ver-menu]")) {
      $("#carrito").addEventListener("hidden.bs.offcanvas", () => {
        $("#menu").scrollIntoView({ behavior: suave() });
        $("#menuTitle").focus({ preventScroll: true });
      }, { once: true });
      offcanvas.hide();
    } else if (rm) {
      const i = +rm.dataset.remove;
      carrito.splice(i, 1);
      guardar();
      enfocarEnCarrito(i);
    } else if (st) {
      const i = +st.dataset.step;
      const it = carrito[i];
      it.cantidad = Math.min(MAX_CANTIDAD, it.cantidad + +st.dataset.delta);
      if (it.cantidad <= 0) carrito.splice(i, 1);
      guardar();
      enfocarEnCarrito(i, st.dataset.delta);
    }
  });

  $("#vaciarCarrito").addEventListener("click", () => {
    if (!confirm("¿Seguro que quieres vaciar el carrito?")) return;
    carrito = [];
    guardar();
    enfocarEnCarrito(0);
  });

  // Si el carrito se cerró sin un destino de foco claro, vuelve al botón del carrito
  $("#carrito").addEventListener("hidden.bs.offcanvas", () => {
    if (!document.activeElement || document.activeElement === document.body) enfocarBotonCarrito();
  });

  /* =====================================================
     Menú
     ===================================================== */
  // Precio de los toppings para la tarjeta: "+$2.000 c/u" si todos valen lo mismo
  function precioToppings(grupo) {
    const precios = [...new Set(grupo.items.map((a) => a.precio))];
    return precios.length === 1 ? `+${money(precios[0])} c/u` : `desde +${money(Math.min(...precios))}`;
  }

  // Foto del topping; si no hay, su ícono dibujado y, en último caso, la inicial
  function fotoTopping(a) {
    if (a.foto) return `<img class="hm-topping-foto" src="${esc(a.foto)}" alt="" loading="lazy" width="96" height="96">`;
    const icono = a.icono && window.HM_ICONO_TOPPING ? window.HM_ICONO_TOPPING(a.icono) : "";
    if (icono) return `<span class="hm-topping-foto is-icono" aria-hidden="true">${icono}</span>`;
    return `<span class="hm-topping-foto is-inicial" aria-hidden="true">${esc(a.nombre.charAt(0))}</span>`;
  }

  function tarjeta(p) {
    const ok = disponible(p);
    const varios = p.tamanos.length > 1;
    const grupo = grupoDe(p);
    const encargo = !ok && p.temporada ? p.temporada.texto
      : p.encargo ? textoEncargo()
      : p.tamanos.some((t) => t.encargo) ? `${p.tamanos.filter((t) => t.encargo).map((t) => t.nombre).join(", ")} por encargo` : "";
    const detalle = `${varios ? "desde " : ""}${money(precioDesde(p))}${encargo ? ", " + encargo : ""}`;
    const extra = p.eleccion
      ? `<p class="hm-card-extra"><strong>${esc(p.eleccion.titulo)} incluido:</strong> ${esc(listaY(p.eleccion.opciones.map((o) => o.nombre), "o"))}</p>`
      : grupo
        ? `<div class="hm-card-toppings">
            <p class="hm-card-extra mb-2"><strong>Toppings ${esc(precioToppings(grupo))}</strong></p>
            ${grupo.texto ? `<p class="hm-card-extra">${esc(grupo.texto)}</p>` : ""}
            <ul class="hm-topping-chips">${grupo.items.map((a) => `<li>${fotoTopping(a)}<span>${esc(a.nombre)}</span></li>`).join("")}</ul>
          </div>`
        : "";
    const boton = ok
      ? `<span class="btn btn-hm btn-hm-primary w-100 text-nowrap" aria-hidden="true"><i class="bi bi-plus-lg"></i><span class="ms-1">Agregar</span></span>`
      : `<span class="btn btn-hm btn-hm-paper w-100 disabled text-nowrap" aria-hidden="true">Próximamente</span>`;
    return `
      <div class="col${p.destacado ? " hm-col-destacado" : ""}">
        <div class="hm-card${p.destacado ? " is-featured" : ""}${ok ? "" : " is-disabled"}" ${ok ? `tabindex="0" role="button" data-open="${p.id}" aria-label="Personalizar ${esc(nombreLargo(p))}, ${esc(detalle)}"` : `aria-disabled="true"`}>
          <div class="hm-card-media" style="background:${fondo(p)}">
            ${media(p)}${etiquetaFoto(p)}
            ${p.etiqueta ? `<span class="hm-tag${ok ? "" : " is-soon"}">${esc(p.etiqueta)}</span>` : ""}
          </div>
          <div class="hm-card-body">
            <h3 class="hm-card-title"><span>${esc(p.nombre)}</span></h3>
            <p class="hm-card-desc">${esc(p.descripcion)}</p>
            <ul class="hm-card-sizes">
              ${p.tamanos.map((t) => `<li><span>${esc(t.nombre)}${t.detalle ? ` <small>${esc(t.detalle)}</small>` : ""}</span><strong>${money(t.precio)}</strong></li>`).join("")}
            </ul>
            ${extra}
            ${encargo ? `<p class="hm-card-note"><i class="bi bi-calendar-heart"></i>${esc(encargo)}</p>` : ""}
            <div class="hm-card-foot">${boton}</div>
          </div>
        </div>
      </div>`;
  }

  function renderProductos() {
    $("#productos").innerHTML = MENU.map((p) => tarjeta(p)).join("");
  }

  /* =====================================================
     Modal de producto
     ===================================================== */
  const form = $("#productoForm");
  let actual = null;
  let cantidad = 1;
  let disparador = null;
  let conteoToppings = {};

  function abrirProducto(id) {
    const p = getProducto(id);
    if (!p || !disponible(p)) return;
    actual = p;
    cantidad = 1;
    disparador = document.activeElement;

    $("#productoTitulo").textContent = nombreLargo(p);
    $("#productoDesc").textContent = p.descripcion;

    const varios = p.tamanos.length > 1;
    $("#productoTamanos").innerHTML = varios ? `
      <div class="hm-group-title" id="lblTamano">Tamaño <small>Elige uno</small></div>
      <div class="row g-2" role="radiogroup" aria-labelledby="lblTamano">
        ${p.tamanos.map((t, i) => `
          <div class="col-${p.tamanos.length === 2 ? 6 : 4} hm-opt-wrap">
            <input type="radio" class="btn-check" name="tamano" id="t-${t.id}" value="${t.id}" ${i === 0 ? "checked" : ""}>
            <label class="hm-option flex-column text-center gap-0 h-100" for="t-${t.id}">
              <span>${esc(t.nombre)}</span>
              ${t.detalle ? `<small class="hm-option-detail">${esc(t.detalle)}</small>` : ""}
              <span class="hm-option-price">${money(t.precio)}</span>
            </label>
          </div>`).join("")}
      </div>` : `<input type="hidden" name="tamano" value="${p.tamanos[0].id}">
      <div class="hm-group-title">${esc(nombreTamano(p.tamanos[0]))} <small>${money(p.tamanos[0].precio)}</small></div>`;

    const el = p.eleccion;
    $("#productoEleccion").innerHTML = el ? `
      <div class="hm-group-title" id="lblOpcion">${esc(el.titulo)} <small>${esc(el.detalle || "Elige uno")}</small></div>
      <div class="row g-2" role="radiogroup" aria-labelledby="lblOpcion">
        ${el.opciones.map((o, i) => `
          <div class="col-${el.opciones.length === 2 ? 6 : 4} hm-opt-wrap">
            <input type="radio" class="btn-check" name="opcion" id="o-${o.id}" value="${o.id}" ${i === 0 ? "checked" : ""}>
            <label class="hm-option justify-content-center text-center h-100" for="o-${o.id}">${esc(o.nombre)}</label>
          </div>`).join("")}
      </div>` : "";

    const grupo = grupoDe(p);
    conteoToppings = {};
    $("#productoAdiciones").innerHTML = grupo ? `
      <div class="hm-group-title" id="lblAdic">Toppings <small>Opcional · ${esc(precioToppings(grupo))}</small></div>
      ${grupo.texto ? `<p class="hm-group-intro">${esc(grupo.texto)}</p>` : ""}
      <div class="row g-2" role="group" aria-labelledby="lblAdic">
        ${grupo.items.map((a) => `
          <div class="col-12">
            <div class="hm-topping" data-topping="${a.id}">
              ${fotoTopping(a)}
              <span class="hm-topping-info"><strong>${esc(a.nombre)}</strong><small>+${money(a.precio)} · máx. ${maxDe(a)}</small></span>
              <div class="hm-qty hm-qty-sm" role="group" aria-label="Porciones de ${esc(a.nombre)}">
                <button type="button" data-topping-paso="-1" aria-label="Quitar una porción de ${esc(a.nombre)}"><i class="bi bi-dash-lg"></i></button>
                <output aria-live="off">0</output>
                <button type="button" data-topping-paso="1" aria-label="Agregar una porción de ${esc(a.nombre)}"><i class="bi bi-plus-lg"></i></button>
              </div>
            </div>
          </div>`).join("")}
      </div>
      <p class="hm-topping-aviso" id="toppingAviso" role="status" aria-live="polite"></p>
      <span class="visually-hidden" id="toppingAnuncio" role="status" aria-live="polite"></span>
      <p class="hm-topping-reglas">${esc(reglasTexto(grupo))}</p>` : "";

    pintarMedia();
    pintarToppings();
    $("#productoNota").value = "";
    $("#productoNota").placeholder = p.notaPlaceholder || "Ej: alguna indicación para tu pedido…";
    actualizarTotalProducto();
    productoModal.show();
  }

  // Foto o dibujo del producto; con "eleccion", el de la opción marcada
  function pintarMedia() {
    const opcion = (form.querySelector('input[name="opcion"]:checked') || {}).value;
    const m = $("#productoMedia");
    m.style.background = fondo(actual, opcion);
    m.innerHTML = media(actual, opcion) + etiquetaFoto(actual);
  }

  // Texto con los límites del grupo, armado desde menu.js
  function reglasTexto(grupo) {
    const max = grupo.items.map((a) => `${a.nombre} ${maxDe(a)}`).join(", ");
    const conLimite = grupo.items.filter((a) => a.limite);
    const pocos = conLimite.filter((a) => a.limite.otros > 0).map((a) => ` Con ${a.limite.desde} de ${a.nombre}, solo ${toppingsMas(a.limite.otros)}.`).join("");
    const solos = conLimite.filter((a) => a.limite.otros === 0);
    const desde = [...new Set(solos.map((a) => a.limite.desde))];
    const solo = solos.length && desde.length === 1
      ? ` Si pides ${desde[0]} o más de ${listaY(solos.map((a) => a.nombre), "o")}, ese topping va solo.`
      : solos.map((a) => ` Con ${a.limite.desde} o más de ${a.nombre}, va solo.`).join("");
    return `Máximo por vaso: ${max}.${pocos}${solo}`;
  }

  // Botones + y − de cada topping según los límites; el aviso explica lo que no se puede
  function pintarToppings(aviso) {
    const grupo = grupoDe(actual);
    if (!grupo) return;
    grupo.items.forEach((a) => {
      const fila = $(`[data-topping="${a.id}"]`, form);
      const n = conteoToppings[a.id] || 0;
      const out = $("output", fila);
      if (out.textContent !== String(n)) out.textContent = n;
      fila.classList.toggle("is-on", n > 0);
      const menos = $('[data-topping-paso="-1"]', fila);
      const mas = $('[data-topping-paso="1"]', fila);
      menos.setAttribute("aria-disabled", String(n === 0));
      mas.setAttribute("aria-disabled", String(!!bloqueoTopping(grupo, conteoToppings, a.id)));
    });
    const texto = aviso || avisoLimite(grupo, conteoToppings);
    if ($("#toppingAviso").textContent !== texto) $("#toppingAviso").textContent = texto;
  }

  function seleccionActual() {
    const fd = new FormData(form);
    return {
      id: actual.id,
      tamano: fd.get("tamano"),
      opcion: fd.get("opcion") || "",
      adiciones: expandir(grupoDe(actual), conteoToppings),
      nota: ($("#productoNota").value || "").trim(),
      cantidad
    };
  }

  function actualizarTotalProducto() {
    const sel = seleccionActual();
    const menos = $('[data-qty="-1"]', form);
    const mas = $('[data-qty="1"]', form);
    const enfocado = document.activeElement;
    if ($("#productoCantidad").textContent !== String(cantidad)) $("#productoCantidad").textContent = cantidad;
    menos.disabled = cantidad <= 1;
    mas.disabled = cantidad >= MAX_CANTIDAD;
    // Si el botón enfocado se deshabilitó, el foco pasa al otro
    if (enfocado === menos && menos.disabled) mas.focus();
    else if (enfocado === mas && mas.disabled) menos.focus();
    $("#productoTotal").textContent = money(precioUnitario(sel) * cantidad);
    const encargo = esEncargo(actual, getTamano(actual, sel.tamano));
    $("#productoEncargo").classList.toggle("d-none", !encargo);
    $("#productoEncargo span").textContent =
      `Se prepara por encargo: pídelo con al menos ${CFG.diasEncargo} días de anticipación. En el carrito eliges la fecha.`;
  }

  form.addEventListener("change", (e) => {
    if (e.target.name === "opcion") pintarMedia();
    actualizarTotalProducto();
  });
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches(".btn-check")) {
      e.preventDefault();
      e.target.click();
    }
  });
  form.addEventListener("click", (e) => {
    const paso = e.target.closest("[data-topping-paso]");
    if (paso) {
      const grupo = grupoDe(actual);
      const id = paso.closest("[data-topping]").dataset.topping;
      const n = conteoToppings[id] || 0;
      let aviso = "";
      if (paso.dataset.toppingPaso === "1") {
        aviso = bloqueoTopping(grupo, conteoToppings, id);
        if (!aviso) conteoToppings[id] = n + 1;
      } else if (n > 0) {
        conteoToppings[id] = n - 1;
        if (!conteoToppings[id]) delete conteoToppings[id];
      }
      pintarToppings(aviso);
      actualizarTotalProducto();
      // Un solo anuncio para lectores de pantalla, con el nombre del topping
      const t = grupo.items.find((x) => x.id === id);
      const m = conteoToppings[id] || 0;
      if (!aviso && m !== n) $("#toppingAnuncio").textContent = `${t.nombre}: ${m} ${m === 1 ? "porción" : "porciones"}. Total ${$("#productoTotal").textContent}.`;
      // En pantallas pequeñas el aviso puede quedar fuera de la vista
      if (aviso) $("#toppingAviso").scrollIntoView({ block: "nearest" });
      return;
    }
    const b = e.target.closest("[data-qty]");
    if (!b) return;
    cantidad = Math.max(1, Math.min(MAX_CANTIDAD, cantidad + +b.dataset.qty));
    actualizarTotalProducto();
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    // Evita agregar dos veces con doble clic mientras el modal se cierra
    if (!$("#productoModal").classList.contains("show")) return;
    const n = agregar(seleccionActual());
    productoModal.hide();
    if (n === 0) toast(`Ya tienes el máximo (${MAX_CANTIDAD}) de ${nombreLargo(actual)}`);
    else toast(`Agregado al carrito: ${n > 1 ? n + "× " : ""}${nombreLargo(actual)}${n < cantidad ? ` (máximo ${MAX_CANTIDAD})` : ""}`);
  });

  $("#productoModal").addEventListener("hidden.bs.modal", () => {
    if (disparador && document.contains(disparador)) disparador.focus();
    else if (!document.activeElement || document.activeElement === document.body) enfocarBotonCarrito();
    disparador = null;
  });

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-open]");
    if (el) abrirProducto(el.dataset.open);
  });
  document.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches(".hm-card[data-open]")) {
      e.preventDefault();
      abrirProducto(e.target.dataset.open);
    }
  });

  /* =====================================================
     Checkout
     ===================================================== */
  const cForm = $("#checkoutForm");

  $("#cZona").innerHTML = `<option value="" selected disabled>Elige tu ciudad</option>` +
    CFG.zonas.map((z) => `<option value="${esc(z.id)}">${esc(z.nombre)}</option>`).join("");
  $("#cPago").innerHTML = CFG.metodosPago.map((m) => `<option>${esc(m)}</option>`).join("");
  $("#puntoRecogida").textContent = CFG.puntoRecogida;

  // Recoger aún no está disponible: la opción se ve como "Próximamente" y no se puede elegir
  const RECOGER = CFG.recoger === true;
  if (!RECOGER) {
    $("#eRecoger").disabled = true;
    $("#eDomicilio").checked = true;
    $("#eRecoger").closest(".hm-opt-wrap").classList.add("is-soon");
    $('label[for="eRecoger"]').insertAdjacentHTML("beforeend", `<span class="hm-soon">Próximamente</span>`);
  }

  const esDomicilio = () => !RECOGER || cForm.entrega.value === "domicilio";
  const zonaSel = () => CFG.zonas.find((z) => z.id === $("#cZona").value);
  const soloDigitos = (s) => String(s || "").replace(/\D/g, "");

  // ¿Todavía se puede entregar hoy? (hoy abre y no ha pasado la hora de cierre)
  const atiendeHoyAun = () => {
    const ahora = ahoraBogota();
    const rango = CFG.horario[isoAFecha(ahora.fecha).getUTCDay()];
    return !!rango && ahora.hora < rango[1];
  };

  function actualizarFecha() {
    const encargo = carritoTieneEncargo();
    const hoy = hoyBogota();
    const hoyNo = !encargo && !atiendeHoyAun();
    const min = proximoAbierto(encargo ? sumarDias(hoy, CFG.diasEncargo) : hoyNo ? sumarDias(hoy, 1) : hoy);
    const obligatoria = encargo || hoyNo;
    const max = carrito.map((it) => getProducto(it.id).temporada).filter(Boolean).map((t) => finTemporada(t, hoy)).sort()[0] || "";
    const f = $("#cFecha");
    f.min = min;
    f.max = max;
    f.required = obligatoria;
    $("#fechaOpcional").classList.toggle("d-none", obligatoria);
    $("#fechaAyuda").textContent = encargo
      ? `Tu pedido tiene productos por encargo: la fecha más cercana es el ${fechaLarga(min)}.`
      : hoyNo ? `Hoy ya no atendemos: elige una fecha desde el ${fechaLarga(min)}.`
      : "Déjala vacía si lo quieres para hoy.";
    let error = "";
    if (f.value) {
      if (f.value < min) {
        error = encargo ? `Para productos por encargo elige desde el ${fechaLarga(min)}.`
          : hoyNo ? `Hoy ya no atendemos: elige desde el ${fechaLarga(min)}.`
          : "Elige una fecha desde hoy.";
      } else if (max && f.value > max) {
        error = `Los productos de temporada se entregan hasta el ${fechaLarga(max)}.`;
      } else if (!abreEl(f.value)) {
        error = "Ese día no abrimos, elige otra fecha.";
      }
    }
    f.setCustomValidity(error);
    $("#fechaError").textContent = error || "Elige la fecha de entrega.";
  }

  // Asocia ayudas y errores a cada campo para lectores de pantalla
  function actualizarAria() {
    const validado = cForm.classList.contains("was-validated");
    $$("input:not([type=radio]), select, textarea", cForm).forEach((el) => {
      const malo = validado && !el.disabled && !el.checkValidity();
      el.setAttribute("aria-invalid", malo ? "true" : "false");
      const err = el.parentElement.querySelector(".invalid-feedback");
      const ids = [el.id === "cFecha" ? "fechaAyuda" : "", malo && err ? err.id : ""].filter(Boolean).join(" ");
      if (ids) el.setAttribute("aria-describedby", ids);
      else el.removeAttribute("aria-describedby");
    });
  }

  function actualizarCheckout() {
    actualizarFecha();
    const dom = esDomicilio();
    $$("[data-solo-domicilio]").forEach((el) => {
      el.classList.toggle("d-none", !dom);
      $$("input, select", el).forEach((inp) => (inp.disabled = !dom));
    });
    $$("[data-solo-recoger]").forEach((el) => el.classList.toggle("d-none", dom));

    const efectivo = $("#cPago").value === "Efectivo";
    $("#cambioWrap").classList.toggle("d-none", !efectivo);
    $("#cCambio").disabled = !efectivo;

    const sub = subtotal();
    $("#checkoutDomicilio").textContent = dom ? "Se confirma por WhatsApp" : "No aplica (recoges)";
    $("#checkoutTotalLabel").textContent = dom ? "Total sin domicilio" : "Total";
    $("#checkoutTotal").textContent = money(sub);

    const cambio = +soloDigitos($("#cCambio").value);
    $("#cCambio").setCustomValidity(efectivo && cambio && cambio < sub ? "El valor es menor que el total." : "");

    $("#checkoutResumen").innerHTML = carrito.map((it) => {
      const d = describirItem(it);
      const extra = [d.tamano, d.opcion, ...d.adic].filter(Boolean).join(", ");
      return `<div class="hm-summary-line">
        <span><strong>${Number(it.cantidad)}×</strong> ${esc(nombreLargo(d.p))}${extra ? `<br><small class="text-plum-soft">${esc(extra)}</small>` : ""}</span>
        <span class="text-nowrap">${money(precioUnitario(it) * it.cantidad)}</span>
      </div>`;
    }).join("");
    actualizarAria();
  }

  function prellenarCliente() {
    const c = store.get("hm_cliente", {});
    ["nombre", "telefono", "direccion", "barrio"].forEach((k) => {
      if (typeof c[k] === "string" && c[k] && !cForm[k].value) cForm[k].value = c[k];
    });
    if (typeof c.zona === "string" && CFG.zonas.some((z) => z.id === c.zona) && !$("#cZona").value) $("#cZona").value = c.zona;
  }

  cForm.addEventListener("input", (e) => {
    if (e.target.id === "cTelefono") {
      let tel = soloDigitos(e.target.value);
      if (tel.length > 10 && tel.startsWith("57")) tel = tel.slice(2); // +57 300 ...
      e.target.value = tel.slice(0, 10);
    }
    if (e.target.id === "cCambio") e.target.value = soloDigitos(e.target.value).slice(0, 7);
    actualizarCheckout();
  });
  cForm.addEventListener("change", actualizarCheckout);

  $("#irCheckout").addEventListener("click", () => {
    if (!carrito.length) return;
    mostrarPasoCheckout(true);
    $("#carrito").addEventListener("hidden.bs.offcanvas", () => {
      prellenarCliente();
      actualizarCheckout();
      checkoutModal.show();
    }, { once: true });
    offcanvas.hide();
  });

  let volviendoAlCarrito = false;
  $("#volverCarrito").addEventListener("click", () => {
    volviendoAlCarrito = true;
    checkoutModal.hide();
  });

  function mostrarPasoCheckout(formulario) {
    $("#checkoutPaso").classList.toggle("d-none", !formulario);
    $("#checkoutFoot").classList.toggle("d-none", !formulario);
    $("#checkoutExito").classList.toggle("d-none", formulario);
    $("#checkoutTitulo").textContent = formulario ? "Datos de entrega" : "¡Gracias por tu pedido!";
  }

  function codigoPedido() {
    return "HM-" + Date.now().toString(36).slice(-5).toUpperCase();
  }

  function construirMensaje(datos) {
    const sub = subtotal();
    const L = [];
    L.push(`🧁 *Nuevo pedido · ${CFG.negocio}*`);
    L.push(`Pedido ${datos.codigo}`);
    L.push("");
    L.push(`*Cliente:* ${datos.nombre}`);
    L.push(`*Celular:* ${datos.telefono}`);
    if (esDomicilio()) {
      L.push(`*Entrega:* Domicilio`);
      L.push(`*Dirección:* ${datos.direccion}`);
      L.push(`*Barrio:* ${datos.barrio}`);
      L.push(`*Ciudad:* ${zonaSel().nombre}`);
    } else {
      L.push(`*Entrega:* Recoger en el local`);
    }
    L.push(`*Fecha:* ${datos.fecha ? fechaLarga(datos.fecha) : "Hoy, lo antes posible"}`);
    L.push("");
    L.push("*Productos:*");
    carrito.forEach((it, i) => {
      const d = describirItem(it);
      L.push(`${i + 1}. ${it.cantidad}x ${nombreLargo(d.p)}${d.tamano ? ` · ${d.tamano}` : ""} — ${money(precioUnitario(it) * it.cantidad)}`);
      if (d.opcion) L.push(`   ${d.opcion}`);
      if (d.adic.length) L.push(`   + ${d.adic.join(", ")}`);
      if (d.nota) L.push(`   Nota: ${d.nota}`);
    });
    L.push("");
    L.push(`Subtotal: ${money(sub)}`);
    if (esDomicilio()) {
      L.push("Domicilio: por confirmar");
      L.push(`*Total sin domicilio: ${money(sub)}*`);
    } else {
      L.push(`*Total: ${money(sub)}*`);
    }
    if (!preciosConfirmados) L.push("_Precios de referencia: confirmar total._");
    L.push("");
    L.push(`*Pago:* ${datos.pago}${datos.cambio ? ` (paga con ${money(datos.cambio)})` : ""}`);
    if (datos.notas) L.push(`*Notas:* ${datos.notas}`);
    return L.join("\n");
  }

  cForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // La página pudo quedar abierta mientras terminaba una temporada
    const vigentes = carrito.filter((it) => disponible(getProducto(it.id)));
    if (vigentes.length < carrito.length) {
      carrito = vigentes;
      guardar();
      if (carrito.length) actualizarCheckout();
      else checkoutModal.hide();
      toast("Quitamos productos que ya no están disponibles. Revisa tu pedido.");
      return;
    }
    if (!carrito.length) {
      checkoutModal.hide();
      toast("Tu carrito está vacío");
      return;
    }
    actualizarCheckout();
    if (!cForm.checkValidity()) {
      cForm.classList.add("was-validated");
      actualizarAria();
      const inv = cForm.querySelector(":invalid");
      if (inv) inv.focus();
      return;
    }
    const datos = {
      codigo: codigoPedido(),
      nombre: cForm.nombre.value.trim(),
      telefono: cForm.telefono.value.trim(),
      direccion: (cForm.direccion.value || "").trim(),
      barrio: (cForm.barrio.value || "").trim(),
      fecha: $("#cFecha").value,
      pago: $("#cPago").value,
      cambio: $("#cPago").value === "Efectivo" ? +soloDigitos($("#cCambio").value) : 0,
      notas: cForm.notas.value.trim()
    };
    store.set("hm_cliente", {
      nombre: datos.nombre, telefono: datos.telefono, direccion: datos.direccion,
      barrio: datos.barrio, zona: $("#cZona").value
    });

    const url = waUrl(construirMensaje(datos));
    $("#reabrirWa").href = url;
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    else window.location.href = url;

    cForm.classList.remove("was-validated");
    actualizarAria();
    mostrarPasoCheckout(false);
    $("#checkoutExito").focus();
  });

  $("#nuevoPedido").addEventListener("click", () => {
    // Limpia lo que es propio de cada pedido (los datos del cliente se conservan)
    $("#cFecha").value = "";
    $("#cNotas").value = "";
    $("#cCambio").value = "";
    carrito = [];
    guardar();
    checkoutModal.hide();
    toast("¡Listo! Tu carrito quedó vacío para un nuevo antojo");
  });

  $("#checkoutModal").addEventListener("hidden.bs.modal", () => {
    mostrarPasoCheckout(true);
    if (volviendoAlCarrito) {
      volviendoAlCarrito = false;
      offcanvas.show();
    } else {
      enfocarBotonCarrito();
    }
  });

  /* =====================================================
     Horario, info y extras
     ===================================================== */
  function estadoTienda() {
    const ahora = ahoraBogota();
    const rango = CFG.horario[isoAFecha(ahora.fecha).getUTCDay()];
    const abierto = !!rango && ahora.hora >= rango[0] && ahora.hora < rango[1];
    const el = $("#estadoTienda");
    el.textContent = abierto ? "Abierto ahora" : "Cerrado ahora";
    el.classList.toggle("is-open", abierto);
    el.classList.toggle("is-closed", !abierto);
  }

  function renderInfo() {
    $("#horarioLista").innerHTML = CFG.horarioTexto.map((t) => {
      const [dias, horas] = t.split("·").map((s) => s.trim());
      return `<li><span>${esc(dias)}</span><strong class="text-end text-nowrap">${esc(horas || "")}</strong></li>`;
    }).join("");
    const ciudades = CFG.zonas.map((z) => z.nombre);
    $("#zonasTexto").textContent = window.Intl && Intl.ListFormat
      ? new Intl.ListFormat("es", { type: "conjunction" }).format(ciudades)
      : ciudades.join(", ");
    $("#pagosLista").innerHTML = CFG.metodosPago.map((m) => `<span class="hm-pill">${esc(m)}</span>`).join("");
    $$("[data-precio-min]").forEach((el) => (el.textContent = money(Math.min(...MENU.filter(disponible).map(precioDesde)))));
    $("#anio").textContent = new Date().getFullYear();
    renderRedes();

    const saludo = waUrl(`¡Hola ${CFG.negocio}! 🧁 Quiero hacer una consulta.`);
    $$("[data-wa-general]").forEach((a) => {
      a.href = saludo;
      a.target = "_blank";
      a.rel = "noopener";
    });
    const banner = $("#testBanner");
    if (TEL === NUMERO_PRUEBA) {
      banner.innerHTML = `<i class="bi bi-cone-striped" aria-hidden="true"></i> <strong>Modo prueba:</strong> los pedidos se envían a un WhatsApp de prueba.`;
    } else if (!preciosConfirmados) {
      banner.innerHTML = `<i class="bi bi-info-circle" aria-hidden="true"></i> <strong>Precios de referencia:</strong> te confirmamos el total por WhatsApp.`;
    }
    banner.classList.toggle("d-none", TEL !== NUMERO_PRUEBA && preciosConfirmados);
  }

  const redes = () => (CFG.redes || []).filter((r) => /^https:\/\//.test(r.url));

  function renderRedes() {
    const html = redes().map((r) => `
      <a class="hm-social" href="${esc(r.url)}" target="_blank" rel="noopener" aria-label="${esc(r.nombre)}: @${esc(r.usuario)}">
        <i class="bi bi-${esc(r.id)}" aria-hidden="true"></i><span>@${esc(r.usuario)}</span>
      </a>`).join("");
    $$("[data-redes]").forEach((el) => {
      el.innerHTML = html;
      el.closest("[data-redes-wrap]")?.classList.toggle("d-none", !html);
    });
  }

  // Datos estructurados (schema.org) para buscadores: negocio, logo, horario y perfiles sociales
  function renderDatosEstructurados() {
    const dias = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const hh = (h) => `${String(Math.floor(h)).padStart(2, "0")}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;
    const canonical = $('link[rel="canonical"]');
    const imagen = $('meta[property="og:image"]');
    const datos = {
      "@context": "https://schema.org",
      "@type": "Bakery",
      name: CFG.negocio,
      description: $('meta[name="description"]').content,
      url: canonical ? canonical.href : location.href,
      image: imagen ? imagen.content : undefined,
      logo: new URL("assets/img/icono-512.png", canonical ? canonical.href : location.href).href,
      servesCuisine: "Repostería",
      priceRange: "$$",
      address: { "@type": "PostalAddress", addressLocality: CFG.ciudad, addressRegion: "Atlántico", addressCountry: "CO" },
      sameAs: redes().map((r) => r.url),
      openingHoursSpecification: Object.entries(CFG.horario).filter(([, r]) => r).map(([d, r]) => ({
        "@type": "OpeningHoursSpecification", dayOfWeek: dias[d], opens: hh(r[0]), closes: hh(r[1])
      }))
    };
    if (TEL !== NUMERO_PRUEBA) datos.telephone = `+${TEL}`;
    // El nombre del sitio que muestra Google
    const sitio = { "@context": "https://schema.org", "@type": "WebSite", name: CFG.negocio, url: datos.url };
    [datos, sitio].forEach((d) => {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.textContent = JSON.stringify(d);
      document.head.appendChild(s);
    });
  }

  let toastInst;
  function toast(msg) {
    $("#toastMsg").textContent = msg;
    toastInst = toastInst || bootstrap.Toast.getOrCreateInstance("#toast");
    toastInst.show();
  }

  // En el menú móvil: cerrar primero y luego desplazarse, para no caer más abajo de la sección
  $$("#navLinks .nav-link").forEach((a) => a.addEventListener("click", (e) => {
    const nav = $("#navLinks");
    if (!nav.classList.contains("show")) return;
    e.preventDefault();
    const destino = document.querySelector(a.hash);
    nav.addEventListener("hidden.bs.collapse", () => {
      if (destino) destino.scrollIntoView({ behavior: suave() });
      history.pushState(null, "", a.hash);
    }, { once: true });
    bootstrap.Collapse.getOrCreateInstance(nav).hide();
  }));

  // Sincroniza el carrito entre pestañas
  window.addEventListener("storage", (e) => {
    if (e.key !== "hm_carrito") return;
    carrito = cargarCarrito();
    renderCarrito();
    if ($("#checkoutModal").classList.contains("show")) actualizarCheckout();
  });

  /* Init */
  renderProductos();
  renderInfo();
  renderDatosEstructurados();
  renderCarrito();
  estadoTienda();
  setInterval(estadoTienda, 60 * 1000);
})();
