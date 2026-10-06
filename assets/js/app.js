/* =========================================================
   Honey Moon · Lógica de menú, carrito y pedido por WhatsApp
   ========================================================= */
(function () {
  "use strict";

  const CFG = window.HM_CONFIG;
  const MENU = window.HM_MENU;
  const CATS = window.HM_CATEGORIAS;
  const ADICIONES = window.HM_ADICIONES;
  const NUMERO_PRUEBA = "573000000000";
  const MAX_CANTIDAD = 20;

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const money = (n) => "$" + Math.round(n).toLocaleString("es-CO");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const getProducto = (id) => MENU.find((p) => p.id === id);
  const getAdicion = (id) => ADICIONES.find((a) => a.id === id);
  const waUrl = (texto) => `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(texto)}`;

  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* almacenamiento no disponible */ }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch (e) { /* almacenamiento no disponible */ }
    }
  };

  function media(p) {
    if (p.imagen) return `<img src="${esc(p.imagen)}" alt="" loading="lazy">`;
    return window.HM_ILUSTRACION(p.ilustracion);
  }
  const fondo = (p) => (p.ilustracion && p.ilustracion.fondo) || p.fondo || "var(--hm-pink-soft)";
  const precioDesde = (p) => Math.min(...p.tamanos.map((t) => t.precio));
  const disponible = (p) => p.disponible !== false;

  /* =====================================================
     Carrito
     ===================================================== */
  let carrito = store.get("hm_carrito", []).filter((it) => {
    const p = getProducto(it.id);
    return p && disponible(p) && p.tamanos.some((t) => t.id === it.tamano) && it.cantidad > 0;
  });

  function claveItem(it) {
    return [it.id, it.tamano, [...it.adiciones].sort().join("+"), it.nota.trim().toLowerCase()].join("|");
  }

  function precioUnitario(it) {
    const p = getProducto(it.id);
    const t = p.tamanos.find((x) => x.id === it.tamano) || p.tamanos[0];
    return t.precio + it.adiciones.reduce((s, id) => s + ((getAdicion(id) || {}).precio || 0), 0);
  }

  const subtotal = () => carrito.reduce((s, it) => s + precioUnitario(it) * it.cantidad, 0);
  const totalUnidades = () => carrito.reduce((s, it) => s + it.cantidad, 0);

  function guardar() {
    store.set("hm_carrito", carrito);
    renderCarrito();
  }

  function agregar(item) {
    const clave = claveItem(item);
    const existente = carrito.find((it) => claveItem(it) === clave);
    if (existente) existente.cantidad = Math.min(MAX_CANTIDAD, existente.cantidad + item.cantidad);
    else carrito.push(item);
    guardar();
    const badge = $("#cartCount");
    badge.classList.remove("hm-bump");
    void badge.offsetWidth;
    badge.classList.add("hm-bump");
  }

  function describirItem(it) {
    const p = getProducto(it.id);
    const partes = [];
    if (p.tamanos.length > 1) partes.push(p.tamanos.find((t) => t.id === it.tamano).nombre);
    const adic = it.adiciones.map((id) => getAdicion(id)).filter(Boolean).map((a) => a.nombre);
    return { p, tamano: partes[0] || "", adic, nota: it.nota.trim() };
  }

  function renderCarrito() {
    const cont = $("#carritoItems");
    const n = totalUnidades();
    const sub = subtotal();

    $("#cartCount").textContent = n;
    $("#cartCount").classList.toggle("d-none", n === 0);
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
          <a href="#menu" class="btn btn-hm btn-hm-red" data-bs-dismiss="offcanvas">Ver el menú</a>
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
            <div class="d-flex justify-content-between align-items-center mt-2">
              <div class="hm-qty hm-qty-sm" role="group" aria-label="Cantidad de ${esc(d.p.nombre)}">
                <button type="button" data-step="${i}" data-delta="-1" aria-label="Quitar uno"><i class="bi bi-dash-lg"></i></button>
                <output>${it.cantidad}</output>
                <button type="button" data-step="${i}" data-delta="1" aria-label="Agregar uno" ${it.cantidad >= MAX_CANTIDAD ? "disabled" : ""}><i class="bi bi-plus-lg"></i></button>
              </div>
              <strong>${money(precioUnitario(it) * it.cantidad)}</strong>
            </div>
          </div>
        </div>`;
    }).join("");
  }

  $("#carritoItems").addEventListener("click", (e) => {
    const rm = e.target.closest("[data-remove]");
    const st = e.target.closest("[data-step]");
    if (rm) {
      carrito.splice(+rm.dataset.remove, 1);
      guardar();
    } else if (st) {
      const it = carrito[+st.dataset.step];
      it.cantidad = Math.min(MAX_CANTIDAD, it.cantidad + +st.dataset.delta);
      if (it.cantidad <= 0) carrito.splice(+st.dataset.step, 1);
      guardar();
    }
  });

  $("#vaciarCarrito").addEventListener("click", () => {
    if (!confirm("¿Seguro que quieres vaciar el carrito?")) return;
    carrito = [];
    guardar();
  });

  /* =====================================================
     Menú
     ===================================================== */
  let categoriaActiva = "todos";

  function tarjeta(p) {
    const ok = disponible(p);
    const varios = p.tamanos.length > 1;
    return `
      <div class="col" data-cat="${p.categoria}">
        <article class="hm-card${ok ? "" : " is-disabled"}" ${ok ? `tabindex="0" role="button" data-open="${p.id}" aria-label="Personalizar ${esc(p.nombre)}"` : `aria-disabled="true"`}>
          <div class="hm-card-media" style="background:${fondo(p)}">
            ${media(p)}
            ${p.etiqueta ? `<span class="hm-tag${ok ? "" : " is-soon"}">${esc(p.etiqueta)}</span>` : ""}
          </div>
          <div class="hm-card-body">
            <h3 class="hm-card-title">${esc(p.nombre)}</h3>
            <p class="hm-card-desc">${esc(p.descripcion)}</p>
            <div class="hm-card-foot">
              <div class="hm-price">${varios ? "<small>Desde</small>" : ""}${money(precioDesde(p))}</div>
              ${ok
                ? `<span class="btn btn-hm btn-hm-red text-nowrap" aria-hidden="true"><i class="bi bi-plus-lg"></i><span class="ms-1">Agregar</span></span>`
                : `<span class="btn btn-hm btn-hm-paper disabled text-nowrap" aria-hidden="true">Próximamente</span>`}
            </div>
          </div>
        </article>
      </div>`;
  }

  function renderCategorias() {
    $("#categorias").innerHTML = CATS.map((c) => `
      <button type="button" class="hm-cat${c.id === categoriaActiva ? " active" : ""}" role="tab"
        aria-selected="${c.id === categoriaActiva}" aria-controls="productos" data-cat="${c.id}">
        <i class="bi ${c.icono}"></i>${esc(c.nombre)}
      </button>`).join("");
  }

  function renderProductos() {
    const lista = categoriaActiva === "todos" ? MENU : MENU.filter((p) => p.categoria === categoriaActiva);
    $("#productos").innerHTML = lista.map(tarjeta).join("");
  }

  $("#categorias").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    categoriaActiva = btn.dataset.cat;
    renderCategorias();
    renderProductos();
    btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  });

  function renderTemporada() {
    $("#temporadaLista").innerHTML = MENU.filter((p) => p.categoria === "temporada").map((p) => {
      const ok = disponible(p);
      return `
        <div class="hm-season-item">
          <img src="${esc(p.imagen)}" alt="" loading="lazy">
          <div class="flex-grow-1">
            <span class="hm-tag position-static d-inline-block mb-1${ok ? "" : " is-soon"}">${esc(p.etiqueta)}</span>
            <h3>${esc(p.nombre)}</h3>
            <p>${esc(p.descripcion)}</p>
            <div class="d-flex align-items-center justify-content-between gap-2">
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
  const productoModal = new bootstrap.Modal("#productoModal");
  const form = $("#productoForm");
  let actual = null;
  let cantidad = 1;

  function abrirProducto(id) {
    const p = getProducto(id);
    if (!p || !disponible(p)) return;
    actual = p;
    cantidad = 1;

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
            <label class="hm-option flex-column text-center gap-0" for="t-${t.id}">
              <span>${esc(t.nombre)}</span><span class="hm-option-price">${money(t.precio)}</span>
            </label>
          </div>`).join("")}
      </div>` : `<input type="hidden" name="tamano" value="${p.tamanos[0].id}">
      <div class="hm-group-title">${esc(p.tamanos[0].nombre)} <small>${money(p.tamanos[0].precio)}</small></div>`;

    $("#productoAdiciones").innerHTML = p.adiciones ? `
      <div class="hm-group-title" id="lblAdic">Adiciones <small>Opcional</small></div>
      <div class="row g-2" role="group" aria-labelledby="lblAdic">
        ${ADICIONES.map((a) => `
          <div class="col-sm-6">
            <input type="checkbox" class="btn-check" name="adicion" id="a-${a.id}" value="${a.id}">
            <label class="hm-option" for="a-${a.id}">
              <span class="d-flex align-items-center"><span class="hm-check" aria-hidden="true"></span>${esc(a.nombre)}</span>
              <span class="hm-option-price">+${money(a.precio)}</span>
            </label>
          </div>`).join("")}
      </div>` : "";

    $("#productoNota").value = "";
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
    $("#productoCantidad").textContent = cantidad;
    $('[data-qty="-1"]', form).disabled = cantidad <= 1;
    $('[data-qty="1"]', form).disabled = cantidad >= MAX_CANTIDAD;
    $("#productoTotal").textContent = money(precioUnitario(sel) * cantidad);
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
    agregar(seleccionActual());
    productoModal.hide();
    toast(`${cantidad > 1 ? cantidad + "× " : ""}${actual.nombre} agregado al carrito`);
  });

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-open]");
    if (el) abrirProducto(el.dataset.open);
  });
  document.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches("article[data-open]")) {
      e.preventDefault();
      abrirProducto(e.target.dataset.open);
    }
  });

  /* =====================================================
     Checkout
     ===================================================== */
  const offcanvas = bootstrap.Offcanvas.getOrCreateInstance("#carrito");
  const checkoutModal = new bootstrap.Modal("#checkoutModal");
  const cForm = $("#checkoutForm");

  $("#cZona").innerHTML = `<option value="" selected disabled>Elige tu zona</option>` +
    CFG.zonas.map((z) => `<option value="${z.id}">${esc(z.nombre)} · ${money(z.costo)}</option>`).join("");
  $("#cPago").innerHTML = CFG.metodosPago.map((m) => `<option>${esc(m)}</option>`).join("");
  $("#puntoRecogida").textContent = CFG.puntoRecogida;

  const esDomicilio = () => cForm.entrega.value === "domicilio";
  const zonaSel = () => CFG.zonas.find((z) => z.id === $("#cZona").value);
  const costoDomicilio = () => (esDomicilio() && zonaSel() ? zonaSel().costo : 0);
  const soloDigitos = (s) => String(s || "").replace(/\D/g, "");

  function actualizarCheckout() {
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
        <span><strong>${it.cantidad}×</strong> ${esc(d.p.nombre)}${extra ? `<br><small class="text-cocoa-soft">${esc(extra)}</small>` : ""}</span>
        <span class="text-nowrap">${money(precioUnitario(it) * it.cantidad)}</span>
      </div>`;
    }).join("");
  }

  function prellenarCliente() {
    const c = store.get("hm_cliente", {});
    ["nombre", "telefono", "direccion", "barrio"].forEach((k) => { if (c[k] && !cForm[k].value) cForm[k].value = c[k]; });
    if (c.zona && !$("#cZona").value) $("#cZona").value = c.zona;
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

  $("#volverCarrito").addEventListener("click", () => {
    $("#checkoutModal").addEventListener("hidden.bs.modal", () => offcanvas.show(), { once: true });
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
    L.push(`🍓 *Nuevo pedido · ${CFG.negocio}*`);
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
    L.push("");
    L.push("*Productos:*");
    carrito.forEach((it, i) => {
      const d = describirItem(it);
      L.push(`${i + 1}. ${it.cantidad}x ${d.p.nombre}${d.tamano ? ` (${d.tamano})` : ""} — ${money(precioUnitario(it) * it.cantidad)}`);
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
    actualizarCheckout();
    if (!cForm.checkValidity()) {
      cForm.classList.add("was-validated");
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
    mostrarPasoCheckout(false);
    $("#checkoutExito").focus();
  });

  $("#nuevoPedido").addEventListener("click", () => {
    carrito = [];
    guardar();
    checkoutModal.hide();
    toast("¡Listo! Tu carrito quedó vacío para un nuevo antojo");
  });

  $("#checkoutModal").addEventListener("hidden.bs.modal", () => mostrarPasoCheckout(true));

  /* =====================================================
     Horario, info y extras
     ===================================================== */
  function estadoTienda() {
    const partes = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Bogota", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23"
    }).formatToParts(new Date());
    const get = (t) => (partes.find((p) => p.type === t) || {}).value;
    const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    const hora = +get("hour") + +get("minute") / 60;
    const rango = CFG.horario[dia];
    const abierto = !!rango && hora >= rango[0] && hora < rango[1];
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
    $("#igLink").href = `https://instagram.com/${CFG.instagram}`;
    $("#igLink").textContent = `@${CFG.instagram}`;

    const saludo = waUrl(`¡Hola ${CFG.negocio}! 🍓 Quiero hacer una consulta.`);
    $$("[data-wa-general]").forEach((a) => {
      a.href = saludo;
      a.target = "_blank";
      a.rel = "noopener";
    });
    $("#testBanner").classList.toggle("d-none", CFG.whatsapp !== NUMERO_PRUEBA);
  }

  let toastInst;
  function toast(msg) {
    $("#toastMsg").textContent = msg;
    toastInst = toastInst || bootstrap.Toast.getOrCreateInstance("#toast");
    toastInst.show();
  }

  // Cierra el menú móvil al elegir un enlace
  $$("#navLinks .nav-link").forEach((a) => a.addEventListener("click", () => {
    const c = bootstrap.Collapse.getInstance("#navLinks");
    if (c) c.hide();
  }));

  // Sincroniza el carrito entre pestañas
  window.addEventListener("storage", (e) => {
    if (e.key === "hm_carrito") {
      carrito = store.get("hm_carrito", []).filter((it) => getProducto(it.id));
      renderCarrito();
    }
  });

  /* Init */
  renderCategorias();
  renderProductos();
  renderTemporada();
  renderInfo();
  renderCarrito();
  estadoTienda();
  setInterval(estadoTienda, 60 * 1000);
})();
