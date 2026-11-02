/* =========================================================
   Honeymoon · Vaso animado de fresas con crema
   Lo usan "Arma tu vaso" (detalle del producto) y el juego "Hony en la cocina".

   HM_VASO.montar(elemento, { receta }) → { pintar(estado, { llenar }) }
   estado: { grande: true|false, capas: ["crema", "fresas", ...], toppings: { queso: 2, oreo: 1 } }
   - Las capas nuevas se llenan, los toppings nuevos caen y, si cambia el tamaño, el vaso crece.
   - receta: capas del vaso lleno (para saber el grosor de cada una).
   Requiere illustrations.js (HM_ARTE_TOPPING) para dibujar los toppings.
   ========================================================= */
(function () {
  "use strict";
  const K = "#4a1f48";

  // Ondita para el borde de arriba de cada capa
  const ola = (y, amp, fase) => {
    let d = `M-4 ${y}`;
    for (let x = -4, i = fase; x < 204; x += 25, i++) d += ` Q${x + 12.5} ${y + (i % 2 ? amp : -amp)} ${x + 25} ${y}`;
    return d;
  };
  const capaBase = (y0, y1, color, fase, borde) =>
    `<path d="${ola(y0, 2.6, fase)} L204 ${y1 + 2} L-4 ${y1 + 2} Z" fill="${color}"${borde ? ` stroke="${borde}" stroke-width="1.2"` : ""}/>`;

  const CAPAS = {
    crema: { peso: 1, nombre: "Crema", dibujo: (y0, y1, i) => capaBase(y0, y1, "#fff4e2", i, "#efd9b8") +
      [30, 78, 126, 168].map((x, j) => `<circle cx="${x + (i % 2) * 12}" cy="${(y0 + y1) / 2 + (j % 2 ? 3 : -2)}" r="2" fill="#f6e4c6"/>`).join("") },
    fresas: { peso: 1, nombre: "Fresas", dibujo: (y0, y1, i) => {
      const cy = (y0 + y1) / 2 + 1;
      const ry = Math.min(9, (y1 - y0) / 2.4);
      return capaBase(y0, y1, "#f9cdd5", i) +
        [18, 46, 74, 102, 130, 158, 186].map((x, j) => {
          const cx = x + (i % 2) * 13, yy = cy + (j % 2 ? 2 : -2), e = ry / 9;
          // Fresa en tajada: corazón rojo con el centro claro y semillitas
          return `<g transform="translate(${cx} ${yy}) scale(${e.toFixed(2)}) rotate(${j % 2 ? 8 : -8})">
            <path d="M-11 -5 Q-6 -11 0 -7 Q6 -11 11 -5 Q12 3 0 10 Q-12 3 -11 -5 Z" fill="#e0364f" stroke="${K}" stroke-width="1.4" stroke-linejoin="round"/>
            <path d="M-6 -3 Q-3 -6 0 -4 Q3 -6 6 -3 Q6 2 0 6 Q-6 2 -6 -3 Z" fill="#f7a1ac"/>
            <circle cx="-8" cy="-3" r=".9" fill="#fff3c4"/><circle cx="8" cy="-3" r=".9" fill="#fff3c4"/><circle cx="0" cy="7" r=".9" fill="#fff3c4"/></g>`;
        }).join("");
    } },
    glaseado: { peso: .38, nombre: "Glaseado de fresa", dibujo: (y0, y1, i) => capaBase(y0, y1, "#d42a46", i) +
      `<path d="${ola(y0 + 2.5, 1.5, i)}" stroke="#ff8a9b" stroke-width="1.4" fill="none" opacity=".8"/>` },
    dulce: { peso: .32, nombre: "Dulce de leche", dibujo: (y0, y1, i) => capaBase(y0, y1, "#c98a3c", i) +
      `<path d="${ola(y0 + 2, 1.2, i)}" stroke="#e8b46a" stroke-width="1.2" fill="none"/>` },
    condensada: { peso: .32, nombre: "Leche condensada", dibujo: (y0, y1, i) => capaBase(y0, y1, "#fffaf1", i, "#eadfcd") },
    oreo: { peso: .42, nombre: "Galleta Oreo", dibujo: (y0, y1, i) => capaBase(y0, y1, "#3a2e2b", i) +
      [14, 34, 52, 70, 92, 110, 128, 146, 166, 186].map((x, j) =>
        `<rect x="${x}" y="${y0 + 2 + (j % 3) * 2}" width="${j % 2 ? 6 : 4}" height="3" rx="1" fill="${j % 3 ? "#5c4a45" : "#f4ede4"}" transform="rotate(${j * 37 % 60 - 30} ${x} ${y0 + 3})"/>`).join("") }
  };
  // En el juego, las tres salsas van en un solo paso
  CAPAS.salsas = {
    peso: CAPAS.glaseado.peso + CAPAS.dulce.peso + CAPAS.condensada.peso,
    nombre: "Salsas",
    dibujo: (y0, y1, i) => {
      const h = (y1 - y0) / 3;
      return CAPAS.condensada.dibujo(y0 + 2 * h, y1, i + 2) + CAPAS.dulce.dibujo(y0 + h, y0 + 2 * h + 1, i + 1) + CAPAS.glaseado.dibujo(y0, y0 + h + 1, i);
    }
  };

  const RECETA = ["crema", "fresas", "crema", "fresas", "glaseado", "dulce", "condensada", "oreo"];

  // Medidas del vaso: el de 12 onz es más alto y un poco más ancho
  const medidas = (grande) => ({ T: grande ? 64 : 104, tw: grande ? 66 : 61, B: 226, bw: 46 });
  const contorno = ({ T, tw, B, bw }, d = 0) =>
    `M${100 - tw + d} ${T} L${100 + tw - d} ${T} L${100 + bw - d} ${B - 6 - d} Q${100 + bw - d} ${B - d} ${100 + bw - 6 - d} ${B - d} ` +
    `L${100 - bw + 6 + d} ${B - d} Q${100 - bw + d} ${B - d} ${100 - bw + d} ${B - 6 - d} Z`;

  // Sticker de Hony, como el de los vasos de verdad
  const hony = (x, y, r) => `<g transform="translate(${x} ${y}) scale(${r / 23})">
      <circle r="23" fill="#c48ebf" stroke="#fff" stroke-width="2.5"/>
      <path d="M-14 1 C-14 -14 14 -14 14 1 Z" fill="#fff"/>
      <circle cx="-6" cy="-7" r="2.4" fill="#c48ebf"/><circle cx="4" cy="-9" r="2" fill="#c48ebf"/><circle cx="9" cy="-3" r="1.8" fill="#c48ebf"/>
      <rect x="-8" y="0" width="16" height="12" rx="5" fill="#fff"/>
      <path d="M-4.5 4.5 q1.5 -1.6 3 0 M1.5 4.5 q1.5 -1.6 3 0 M-2 8 q2 2 4 0" stroke="#c48ebf" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    </g>`;

  // Dónde cae cada porción de topping (hasta 4 por vaso; si hay más, se apilan)
  const PUESTOS = [[100, -12], [60, -4], [140, -4], [100, -32], [72, -26], [128, -26]];

  let contador = 0;
  function svg(estado, op) {
    const uid = `hmv${++contador}`;
    const m = medidas(!!estado.grande);
    const receta = op.receta || RECETA;
    const total = receta.reduce((s, c) => s + (CAPAS[c] ? CAPAS[c].peso : 0), 0) || 1;
    const fondo = m.B - 3, tope = m.T + 10;
    const alto = fondo - tope;
    // Capas de abajo hacia arriba
    let y = fondo;
    const capas = (estado.capas || []).filter((c) => CAPAS[c]).map((c, i) => {
      const h = Math.max(6, (CAPAS[c].peso / total) * alto);
      const y1 = y, y0 = Math.max(m.T - 2, y - h);
      y = y0;
      const anima = op.llenar ? ` is-llena" style="--d:${i * 110}ms` : i >= op.capasAntes ? ' is-llena" style="--d:0ms' : "";
      return `<g class="hm-v-capa${anima}">${CAPAS[c].dibujo(y0, y1, i)}</g>`;
    }).join("");
    const superficie = Math.min(y, fondo - 4);
    const arte = window.HM_ARTE_TOPPING || (() => "");
    const tops = (estado.orden || []).map((k, i) => {
      const [x, dy] = PUESTOS[i % PUESTOS.length];
      const tipo = k.split("-")[0];
      return `<g class="hm-v-top${op.nuevas && op.nuevas.has(k) ? " is-cae" : ""}" data-k="${k}">
        <g transform="translate(${x} ${superficie + dy - Math.floor(i / PUESTOS.length) * 18}) scale(.95) translate(-32 -40)">${arte(tipo)}</g></g>`;
    }).join("");
    const arco = (barrido) => `M${100 - m.tw} ${m.T} A${m.tw} 7 0 0 ${barrido} ${100 + m.tw} ${m.T}`;
    return `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"${op.crece ? ' class="is-crece"' : ""}>
      <defs><clipPath id="${uid}"><path d="${contorno(m, 3)}"/></clipPath></defs>
      <ellipse cx="100" cy="${m.B + 4}" rx="64" ry="7" fill="${K}" opacity=".13"/>
      <path d="${contorno(m)}" fill="#fff" fill-opacity=".35"/>
      <path d="${arco(1)}" fill="none" stroke="${K}" stroke-width="2.6" opacity=".55"/>
      <g clip-path="url(#${uid})">${capas}</g>
      ${tops}
      <path d="${contorno(m)}" fill="#fff" fill-opacity=".1" stroke="${K}" stroke-width="3.2" stroke-linejoin="round"/>
      <path d="M${100 - m.tw + 14} ${m.T + 14} L${100 - m.bw + 10} ${m.B - 14}" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/>
      <path d="${arco(0)}" fill="none" stroke="${K}" stroke-width="3.2" stroke-linecap="round"/>
      ${hony(100, m.B - (m.B - m.T) * .3, estado.grande ? 19 : 17)}
    </svg>`;
  }

  function montar(el, opciones) {
    const op = opciones || {};
    let antes = new Set();
    let orden = [];
    let capasAntes = 0;
    let grandeAntes = null;
    return {
      pintar(estado, { llenar = false } = {}) {
        const claves = [];
        Object.entries(estado.toppings || {}).forEach(([tipo, n]) => { for (let i = 0; i < n; i++) claves.push(`${tipo}-${i}`); });
        // Las porciones que ya estaban conservan su puesto; las nuevas van al final
        orden = orden.filter((k) => claves.includes(k)).concat(claves.filter((k) => !orden.includes(k)));
        const crece = grandeAntes !== null && grandeAntes !== !!estado.grande;
        const nCapas = (estado.capas || []).length;
        el.innerHTML = svg({ ...estado, orden }, {
          receta: op.receta,
          llenar: llenar || crece,
          crece,
          capasAntes: Math.min(capasAntes, nCapas),
          nuevas: new Set(orden.filter((k) => !antes.has(k)))
        });
        antes = new Set(orden);
        capasAntes = nCapas;
        grandeAntes = !!estado.grande;
      }
    };
  }

  window.HM_VASO = { montar, svg: (estado, op) => svg(estado || {}, op || {}), hony, CAPAS, RECETA };
})();
