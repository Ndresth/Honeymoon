/* =========================================================
   Honey Moon · Lógica de menú, carrito y pedido por WhatsApp
   ========================================================= */
(function () {
  "use strict";

  const CFG = window.HM_CONFIG;
  const MENU = window.HM_MENU;
  const CATS = window.HM_CATEGORIAS;
  const GRUPOS_ADICIONES = window.HM_ADICIONES;
  const ADICIONES = Object.values(GRUPOS_ADICIONES).flat();
  const NUMERO_PRUEBA = "573000000000";
  const TEL = String(CFG.whatsapp).replace(/\D/g, ""); // tolera "+57 300 ..." en config.js
  const MAX_CANTIDAD = 20;

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const money = (n) => "$" + Math.round(n).toLocaleString("es-CO");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const getProducto = (id) => MENU.find((p) => p.id === id);
  const getAdicion = (id) => ADICIONES.find((a) => a.id === id);
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

  function media(p) {
    if (p.imagen) return `<img src="${esc(p.imagen)}" alt="" loading="lazy">`;
    return window.HM_ILUSTRACION(p.ilustracion || {});
  }
  const fondo = (p) => (p.ilustracion && p.ilustracion.fondo) || p.fondo || "var(--hm-pink-soft)";
  const precioDesde = (p) => Math.min(...p.tamanos.map((t) => t.precio));
  const disponible = (p) => p.disponible !== false;
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
    if (!p || !disponible(p) || p.cotizar || !p.tamanos.some((t) => t.id === it.tamano)) return null;
    const cantidad = Math.min(MAX_CANTIDAD, Math.floor(Number(it.cantidad)));
    if (!(cantidad > 0)) return null;
    return {
      id: p.id,
      tamano: it.tamano,
      adiciones: Array.isArray(it.adiciones) ? it.adiciones.filter((id) => typeof id === "string" && getAdicion(id)) : [],
      nota: typeof it.nota === "string" ? it.nota.slice(0, 140) : "",
      cantidad
    };
  }
  const cargarCarrito = () => store.get("hm_carrito", []).map(normalizarItem).filter(Boolean);

  let carrito = cargarCarrito();

  function claveItem(it) {
    return [it.id, it.tamano, [...it.adiciones].sort().join("+"), it.nota.trim().toLowerCase()].join("|");
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
    const adic = it.adiciones.map((id) => getAdicion(id)).filter(Boolean).map((a) => a.nombre);
    return { p, tamano: p.tamanos.length > 1 ? nombreTamano(t) : "", adic, nota: it.nota.trim(), encargo: esEncargo(p, t) };
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
          <img src="assets/img/mascota-hoy.webp" alt="">
          <h3 class="fs-4">Tu carrito está vacío</h3>
          <p class="text-cocoa-soft">Nuestro honguito te espera con algo dulce.</p>
          <button type="button" class="btn btn-hm btn-hm-red" data-ver-menu>Ver el menú</button>
        </div>`;
      return;
    }

    cont.innerHTML = carrito.map((it, i) => {
      const d = describirItem(it);
      const meta = [d.tamano, d.adic.length ? "+ " + d.adic.join(", ") : ""].filter(Boolean).join(" · ");
      return `
        <div class="hm-cart-item">
          <div class="hm-cart-thumb" style="background:${fondo(d.p)}">${media(d.p)}</div>
          <div class="flex-grow-1 min-w-0">
            <div class="d-flex justify-content-between gap-2">
              <div class="hm-cart-name">${esc(d.p.nombre)}</div>
              <button class="hm-cart-remove" type="button" data-remove="${i}" aria-label="Quitar ${esc(d.p.nombre)}"><i class="bi bi-trash3"></i></button>
            </div>
            ${meta ? `<div class="hm-cart-meta">${esc(meta)}</div>` : ""}
            ${d.nota ? `<div class="hm-cart-meta fst-italic">“${esc(d.nota)}”</div>` : ""}
            ${d.encargo ? `<div class="hm-cart-meta"><i class="bi bi-calendar-heart me-1"></i>Por encargo</div>` : ""}
            <div class="d-flex justify-content-between align-items-center mt-2">
              <div class="hm-qty hm-qty-sm" role="group" aria-label="Cantidad de ${esc(d.p.nombre)}">
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
  let categoriaActiva = "todos";

  function tarjeta(p, nivel = 3) {
    const ok = disponible(p);
    const varios = p.tamanos.length > 1 || p.cotizar;
    const precio = `${varios ? "desde " : ""}${money(precioDesde(p))}`;
    const encargo = p.encargo ? textoEncargo()
      : p.tamanos.some((t) => t.encargo) ? `${p.tamanos.filter((t) => t.encargo).map((t) => t.nombre).join(", ")} por encargo` : "";
    const detalle = `${precio}${encargo ? ", " + encargo : ""}`;
    const accion = p.cotizar
      ? `data-cotizar="${p.id}" aria-label="Cotizar ${esc(p.nombre)} por WhatsApp, ${esc(detalle)}"`
      : `data-open="${p.id}" aria-label="Personalizar ${esc(p.nombre)}, ${esc(detalle)}"`;
    let boton = `<span class="btn btn-hm btn-hm-red text-nowrap" aria-hidden="true"><i class="bi bi-plus-lg"></i><span class="ms-1">Agregar</span></span>`;
    if (p.cotizar) boton = `<span class="btn btn-hm btn-hm-wa text-nowrap" aria-hidden="true"><i class="bi bi-whatsapp"></i><span class="ms-1">Cotizar</span></span>`;
    if (!ok) boton = `<span class="btn btn-hm btn-hm-paper disabled text-nowrap" aria-hidden="true">Próximamente</span>`;
    return `
      <div class="col" data-cat="${p.categoria}">
        <div class="hm-card${ok ? "" : " is-disabled"}" ${ok ? `tabindex="0" role="button" ${accion}` : `aria-disabled="true"`}>
          <div class="hm-card-media" style="background:${fondo(p)}">
            ${media(p)}
            ${p.etiqueta ? `<span class="hm-tag${ok ? "" : " is-soon"}">${esc(p.etiqueta)}</span>` : ""}
          </div>
          <div class="hm-card-body">
            <h${nivel} class="hm-card-title">${esc(p.nombre)}</h${nivel}>
            <p class="hm-card-desc">${esc(p.descripcion)}</p>
            ${encargo ? `<p class="hm-card-note"><i class="bi bi-calendar-heart"></i>${esc(encargo)}</p>` : ""}
            <div class="hm-card-foot">
              <div class="hm-price">${varios ? "<small>Desde</small>" : ""}${money(precioDesde(p))}</div>
              ${boton}
            </div>
          </div>
        </div>
      </div>`;
  }

  function renderCategorias() {
    $("#categorias").innerHTML = CATS.map((c) => `
      <button type="button" class="hm-cat${c.id === categoriaActiva ? " active" : ""}"
        aria-pressed="${c.id === categoriaActiva}" data-cat="${c.id}">
        <i class="bi ${c.icono}" aria-hidden="true"></i>${esc(c.nombre)}
      </button>`).join("");
  }

  function marcarCategoria() {
    $$("#categorias [data-cat]").forEach((b) => {
      const on = b.dataset.cat === categoriaActiva;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on);
    });
  }

  function renderProductos() {
    let total;
    if (categoriaActiva !== "todos") {
      const lista = MENU.filter((p) => p.categoria === categoriaActiva);
      total = lista.length;
      $("#productos").innerHTML = lista.map((p) => tarjeta(p)).join("");
    } else {
      // En "Todo" se agrupa por categoría con su título
      total = MENU.length;
      $("#productos").innerHTML = CATS.filter((c) => c.id !== "todos").map((c) => {
        const lista = MENU.filter((p) => p.categoria === c.id);
        if (!lista.length) return "";
        return `<div class="col-12 hm-cat-heading"><h3><i class="bi ${c.icono}" aria-hidden="true"></i>${esc(c.nombre)}</h3></div>` +
          lista.map((p) => tarjeta(p, 4)).join("");
      }).join("");
    }
    const cat = CATS.find((c) => c.id === categoriaActiva);
    $("#menuEstado").textContent = `${total} ${total === 1 ? "producto" : "productos"} en ${cat ? cat.nombre : "el menú"}`;
  }

  $("#categorias").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    categoriaActiva = btn.dataset.cat;
    marcarCategoria();
    renderProductos();

    // Centra la categoría elegida en el carrusel horizontal
    const cont = $("#categorias");
    const rb = btn.getBoundingClientRect();
    const rc = cont.getBoundingClientRect();
    cont.scrollBy({ left: rb.left + rb.width / 2 - (rc.left + rc.width / 2), behavior: suave() });

    // Si el usuario estaba más abajo, vuelve al inicio de los productos filtrados
    const off = $(".hm-navbar").offsetHeight + $(".hm-cats").offsetHeight + 8;
    const top = $("#productos").getBoundingClientRect().top + window.scrollY - off;
    if (window.scrollY > top) window.scrollTo({ top, behavior: suave() });
  });

  function renderTemporada() {
    $("#temporadaLista").innerHTML = MENU.filter((p) => p.categoria === "temporada").map((p) => {
      const ok = disponible(p);
      return `
        <div class="hm-season-item">
          <div class="hm-season-media" style="background:${fondo(p)}">${media(p)}</div>
          <div class="flex-grow-1">
            ${p.etiqueta ? `<span class="hm-tag position-static d-inline-block mb-1${ok ? "" : " is-soon"}">${esc(p.etiqueta)}</span>` : ""}
            <h3>${esc(p.nombre)}</h3>
            <p>${esc(p.descripcion)}</p>
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
              <span class="hm-price fs-6">Desde ${money(precioDesde(p))}</span>
              ${ok
                ? `<button type="button" class="btn btn-hm btn-hm-red btn-sm text-nowrap" data-open="${p.id}"><i class="bi bi-plus-lg me-1"></i>Agregar</button>`
                : `<button type="button" class="btn btn-hm btn-hm-paper btn-sm text-nowrap" disabled>Próximamente</button>`}
            </div>
          </div>
        </div>`;
    }).join("");
  }

  /* =====================================================
     Modal de producto
     ===================================================== */
  const form = $("#productoForm");
  let actual = null;
  let cantidad = 1;
  let disparador = null;

  function abrirProducto(id) {
    const p = getProducto(id);
    if (!p || !disponible(p) || p.cotizar) return;
    actual = p;
    cantidad = 1;
    disparador = document.activeElement;

    $("#productoTitulo").textContent = p.nombre;
    $("#productoDesc").textContent = p.descripcion;
    const m = $("#productoMedia");
    m.style.background = fondo(p);
    m.innerHTML = media(p);

    const varios = p.tamanos.length > 1;
    $("#productoTamanos").innerHTML = varios ? `
      <div class="hm-group-title" id="lblTamano">Tamaño <small>Elige uno</small></div>
      <div class="row g-2" role="radiogroup" aria-labelledby="lblTamano">
        ${p.tamanos.map((t, i) => `
          <div class="col-${p.tamanos.length === 2 ? 6 : 4}">
            <input type="radio" class="btn-check" name="tamano" id="t-${t.id}" value="${t.id}" ${i === 0 ? "checked" : ""}>
            <label class="hm-option flex-column text-center gap-0 h-100" for="t-${t.id}">
              <span>${esc(t.nombre)}</span>
              ${t.detalle ? `<small class="hm-option-detail">${esc(t.detalle)}</small>` : ""}
              <span class="hm-option-price">${money(t.precio)}</span>
            </label>
          </div>`).join("")}
      </div>` : `<input type="hidden" name="tamano" value="${p.tamanos[0].id}">
      <div class="hm-group-title">${esc(nombreTamano(p.tamanos[0]))} <small>${money(p.tamanos[0].precio)}</small></div>`;

    const grupo = p.adiciones ? GRUPOS_ADICIONES[p.adiciones] || [] : [];
    $("#productoAdiciones").innerHTML = grupo.length ? `
      <div class="hm-group-title" id="lblAdic">Adiciones <small>Opcional</small></div>
      <div class="row g-2" role="group" aria-labelledby="lblAdic">
        ${grupo.map((a) => `
          <div class="col-sm-6">
            <input type="checkbox" class="btn-check" name="adicion" id="a-${a.id}" value="${a.id}">
            <label class="hm-option" for="a-${a.id}">
              <span class="hm-option-name d-flex align-items-center"><span class="hm-check" aria-hidden="true"></span>${esc(a.nombre)}</span>
              <span class="hm-option-price">+${money(a.precio)}</span>
            </label>
          </div>`).join("")}
      </div>` : "";

    $("#productoNota").value = "";
    $("#productoNota").placeholder = p.notaPlaceholder || "Ej: sin leche condensada, extra crema…";
    actualizarTotalProducto();
    productoModal.show();
  }

  function seleccionActual() {
    const fd = new FormData(form);
    return {
      id: actual.id,
      tamano: fd.get("tamano"),
      adiciones: fd.getAll("adicion"),
      nota: ($("#productoNota").value || "").trim(),
      cantidad
    };
  }

  function actualizarTotalProducto() {
    const sel = seleccionActual();
    const menos = $('[data-qty="-1"]', form);
    const mas = $('[data-qty="1"]', form);
    const enfocado = document.activeElement;
    $("#productoCantidad").textContent = cantidad;
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

  form.addEventListener("change", actualizarTotalProducto);
  form.addEventListener("click", (e) => {
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
    if (n === 0) toast(`Ya tienes el máximo (${MAX_CANTIDAD}) de ${actual.nombre}`);
    else toast(`${n > 1 ? n + "× " : ""}${actual.nombre} agregado al carrito${n < cantidad ? ` (máximo ${MAX_CANTIDAD})` : ""}`);
  });

  $("#productoModal").addEventListener("hidden.bs.modal", () => {
    if (disparador && document.contains(disparador)) disparador.focus();
    else if (!document.activeElement || document.activeElement === document.body) enfocarBotonCarrito();
    disparador = null;
  });

  const mensajeCotizacion = (p) => [
    `¡Hola ${CFG.negocio}! 🎂 Quiero cotizar una ${p ? p.nombre.toLowerCase() : "torta personalizada"}.`,
    "",
    "• Ocasión:",
    "• Fecha del evento:",
    "• Número de porciones:",
    "• Sabor:",
    "• Idea o temática:"
  ].join("\n");

  function cotizar(id) {
    const win = window.open(waUrl(mensajeCotizacion(getProducto(id))), "_blank");
    if (win) win.opener = null;
  }

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-open]");
    const cot = e.target.closest("[data-cotizar]");
    if (el) abrirProducto(el.dataset.open);
    else if (cot) cotizar(cot.dataset.cotizar);
  });
  document.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches(".hm-card[data-open], .hm-card[data-cotizar]")) {
      e.preventDefault();
      if (e.target.dataset.open) abrirProducto(e.target.dataset.open);
      else cotizar(e.target.dataset.cotizar);
    }
  });

  /* =====================================================
     Checkout
     ===================================================== */
  const cForm = $("#checkoutForm");

  $("#cZona").innerHTML = `<option value="" selected disabled>Elige tu zona</option>` +
    CFG.zonas.map((z) => `<option value="${esc(z.id)}">${esc(z.nombre)} · ${money(z.costo)}</option>`).join("");
  $("#cPago").innerHTML = CFG.metodosPago.map((m) => `<option>${esc(m)}</option>`).join("");
  $("#puntoRecogida").textContent = CFG.puntoRecogida;

  const esDomicilio = () => cForm.entrega.value === "domicilio";
  const zonaSel = () => CFG.zonas.find((z) => z.id === $("#cZona").value);
  const costoDomicilio = () => (esDomicilio() && zonaSel() ? zonaSel().costo : 0);
  const soloDigitos = (s) => String(s || "").replace(/\D/g, "");

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
  const abreEl = (iso) => !!CFG.horario[isoAFecha(iso).getUTCDay()];
  const proximoAbierto = (iso) => {
    let d = iso;
    for (let i = 0; i < 14 && !abreEl(d); i++) d = sumarDias(d, 1);
    return d;
  };
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
    const f = $("#cFecha");
    f.min = min;
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
    const envio = costoDomicilio();
    $("#checkoutDomicilio").textContent = !dom ? "Gratis (recoges)" : zonaSel() ? money(envio) : "Elige tu zona";
    $("#checkoutTotal").textContent = money(sub + envio);

    const cambio = +soloDigitos($("#cCambio").value);
    $("#cCambio").setCustomValidity(efectivo && cambio && cambio < sub + envio ? "El valor es menor que el total." : "");

    $("#checkoutResumen").innerHTML = carrito.map((it) => {
      const d = describirItem(it);
      const extra = [d.tamano, ...d.adic].filter(Boolean).join(", ");
      return `<div class="hm-summary-line">
        <span><strong>${Number(it.cantidad)}×</strong> ${esc(d.p.nombre)}${extra ? `<br><small class="text-cocoa-soft">${esc(extra)}</small>` : ""}</span>
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
    const envio = costoDomicilio();
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
      L.push(`*Zona:* ${zonaSel().nombre}`);
    } else {
      L.push(`*Entrega:* Recoger en el local`);
    }
    L.push(`*Fecha:* ${datos.fecha ? fechaLarga(datos.fecha) : "Hoy, lo antes posible"}`);
    L.push("");
    L.push("*Productos:*");
    carrito.forEach((it, i) => {
      const d = describirItem(it);
      L.push(`${i + 1}. ${it.cantidad}x ${d.p.nombre}${d.tamano ? ` · ${d.tamano}` : ""} — ${money(precioUnitario(it) * it.cantidad)}`);
      if (d.adic.length) L.push(`   + ${d.adic.join(", ")}`);
      if (d.nota) L.push(`   Nota: ${d.nota}`);
    });
    L.push("");
    L.push(`Subtotal: ${money(sub)}`);
    if (esDomicilio()) L.push(`Domicilio: ${money(envio)}`);
    L.push(`*Total: ${money(sub + envio)}*`);
    L.push("");
    L.push(`*Pago:* ${datos.pago}${datos.cambio ? ` (paga con ${money(datos.cambio)})` : ""}`);
    if (datos.notas) L.push(`*Notas:* ${datos.notas}`);
    return L.join("\n");
  }

  cForm.addEventListener("submit", (e) => {
    e.preventDefault();
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
    $("#zonasLista").innerHTML = CFG.zonas.map((z) => `<li><span>${esc(z.nombre)}</span><strong>${money(z.costo)}</strong></li>`).join("");
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
    $("#testBanner").classList.toggle("d-none", TEL !== NUMERO_PRUEBA);
    $$("[data-dias-encargo]").forEach((el) => (el.textContent = CFG.diasEncargo));
    const personalizada = getProducto("torta-personalizada");
    const arte = $("#customArt");
    if (personalizada) {
      arte.style.background = fondo(personalizada);
      arte.innerHTML = media(personalizada);
    } else {
      arte.closest(".hm-custom").classList.add("d-none");
    }
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

  // Datos estructurados (schema.org) para buscadores: negocio, horario y perfiles sociales
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
      servesCuisine: "Repostería",
      priceRange: "$$",
      address: { "@type": "PostalAddress", addressLocality: CFG.ciudad, addressRegion: "Atlántico", addressCountry: "CO" },
      sameAs: redes().map((r) => r.url),
      openingHoursSpecification: Object.entries(CFG.horario).filter(([, r]) => r).map(([d, r]) => ({
        "@type": "OpeningHoursSpecification", dayOfWeek: dias[d], opens: hh(r[0]), closes: hh(r[1])
      }))
    };
    if (TEL !== NUMERO_PRUEBA) datos.telephone = `+${TEL}`;
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(datos);
    document.head.appendChild(s);
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
  renderCategorias();
  renderProductos();
  renderTemporada();
  renderInfo();
  renderDatosEstructurados();
  renderCarrito();
  estadoTienda();
  setInterval(estadoTienda, 60 * 1000);
})();
