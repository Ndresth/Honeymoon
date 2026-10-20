/* =========================================================
   Honeymoon · Ilustraciones SVG de los productos
   Trazo ciruela y fondos lila, en la línea del logo.
   ========================================================= */
(function () {
  const K = "#4a1f48"; // contorno ciruela
  const RED = "#e5412d";
  const LEAF = "#6f8f3d";
  const LILA = "#a95fa3";

  const fresa = (x, y, s = 1, r = 0) => `
    <g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">
      <path d="M0,-12 C10,-14 17,-6 15,4 C13,13 5,20 0,21 C-5,20 -13,13 -15,4 C-17,-6 -10,-14 0,-12Z"
        fill="${RED}" stroke="${K}" stroke-width="3.4" stroke-linejoin="round"/>
      <g fill="#ffe3a8">
        <ellipse cx="-7" cy="-1" rx="1.3" ry="2"/><ellipse cx="0" cy="-4" rx="1.3" ry="2"/>
        <ellipse cx="7" cy="-1" rx="1.3" ry="2"/><ellipse cx="-4" cy="7" rx="1.3" ry="2"/>
        <ellipse cx="4" cy="7" rx="1.3" ry="2"/><ellipse cx="0" cy="14" rx="1.2" ry="1.8"/>
      </g>
      <path d="M-11,-11 L-5,-13 L-6,-19 L0,-15 L6,-19 L5,-13 L11,-11 L4,-9 L0,-11 L-4,-9Z"
        fill="${LEAF}" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>
    </g>`;

  const corazon = (x, y, s = 1, r = 0) => `
    <path transform="translate(${x} ${y}) rotate(${r}) scale(${s})"
      d="M0,6 C-7,0 -11,-4 -8,-9 C-5,-13 -1,-11 0,-8 C1,-11 5,-13 8,-9 C11,-4 7,0 0,6Z"
      fill="none" stroke="${LILA}" stroke-width="2.6" stroke-linejoin="round"/>`;

  const brillo = (x, y, s = 1) => `
    <path transform="translate(${x} ${y}) scale(${s})"
      d="M0,-8 C1,-2 2,-1 8,0 C2,1 1,2 0,8 C-1,2 -2,1 -8,0 C-2,-1 -1,-2 0,-8Z"
      fill="#fff" stroke="${K}" stroke-width="1.6" stroke-linejoin="round" opacity=".9"/>`;

  const decoracion = () => `
    ${corazon(26, 40, 1.3, -14)}${corazon(212, 150, 1.1, 12)}
    ${brillo(212, 42, 1)}${brillo(34, 152, .8)}
    <g stroke="${LILA}" stroke-width="2.6" stroke-linecap="round">
      <path d="M200 64 l12 -4"/><path d="M202 76 l12 2"/>
      <path d="M30 70 l-10 -6"/>
    </g>`;

  /* ---------- Pavé en vaso: capas de crema y galleta, con el topping elegido ---------- */
  function pave(c, uid) {
    const vasoPath = "M68 62 L172 62 L164 184 Q120 191 76 184 Z";
    const banda = (y, h) => {
      let r = `<rect x="60" y="${y}" width="120" height="${h}" fill="#e9c88f"/>`;
      for (let x = 60; x < 180; x += 24) {
        r += `<rect x="${x}" y="${y + 1}" width="21" height="${h - 2}" rx="2" fill="#e8b866" stroke="#b9852f" stroke-width="1.2"/>`;
        r += `<circle cx="${x + 6}" cy="${y + h / 2}" r="1.3" fill="#b9852f"/><circle cx="${x + 15}" cy="${y + h / 2}" r="1.3" fill="#b9852f"/>`;
      }
      return r;
    };
    const cima = {
      // Galleta Oreo triturada y media galleta encima
      oreo: [[78, 80, 0], [88, 76, 40], [98, 83, -25], [108, 77, 60], [118, 82, 15], [128, 76, -40], [138, 82, 30], [148, 77, 70], [158, 82, -60],
        [92, 88, 10], [112, 88, 50], [132, 88, -20], [152, 87, 35], [102, 72, -10], [124, 71, 25], [144, 72, -45]]
        .map(([x, y, r], i) => `<path transform="translate(${x} ${y}) rotate(${r}) scale(${1 + (i % 3) * .25})" d="M-3.5 -2.4 L1.8 -3.6 L4 .5 L1.2 3.2 L-3.4 2.3Z" fill="#2b2422"/>`).join(""),
      // Galleta Milo triturada
      milo: [[82, 80, 0], [94, 76, 30], [108, 82, -20], [122, 76, 45], [136, 82, 10], [150, 77, -35], [160, 83, 20], [100, 86, 60], [128, 86, -50], [144, 86, 15]]
        .map(([x, y, r]) => `<rect x="${x - 4}" y="${y - 3}" width="8" height="6" rx="2" fill="#5a3a22" stroke="${K}" stroke-width="1" transform="rotate(${r} ${x} ${y})"/>`).join(""),
      // Leche Klim en polvo
      klim: `<ellipse cx="120" cy="80" rx="46" ry="7" fill="#fffdf6" stroke="#e8dcc0" stroke-width="1"/>` +
        [[78, 82], [84, 78], [92, 84], [100, 77], [108, 83], [116, 76], [124, 82], [132, 77], [140, 83], [148, 78], [156, 82], [162, 79], [96, 88], [112, 89], [128, 88], [144, 88]]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.9" fill="#fffdf6" stroke="#e1d3b2" stroke-width=".7"/>`).join("")
    }[c.topping] || "";
    return `
      ${decoracion()}
      <path d="M166 14 L140 84" stroke="${K}" stroke-width="11" stroke-linecap="round"/>
      <path d="M166 14 L140 84" stroke="#f1e1ef" stroke-width="6" stroke-linecap="round"/>
      <defs><clipPath id="cp-${uid}"><path d="${vasoPath}"/></clipPath></defs>
      <g clip-path="url(#cp-${uid})">
        <rect x="60" y="60" width="120" height="132" fill="#fffaf2"/>
        ${banda(160, 30)}${banda(124, 18)}${banda(96, 14)}
        <rect x="60" y="70" width="120" height="22" fill="#fffaf2"/>
        ${cima}
        <path d="M80 76 L86 174" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".7"/>
      </g>
      <path d="${vasoPath}" fill="none" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>
      <rect x="62" y="56" width="116" height="10" rx="5" fill="#fffdf7" stroke="${K}" stroke-width="4"/>`;
  }

  /* ---------- Bolsita de 150 g con galletas mini de chips de chocolate ---------- */
  function bolsita(c, uid) {
    const bolsa = "M74 74 C70 110 64 150 70 178 Q120 190 170 178 C176 150 170 110 166 74 Q120 64 74 74 Z";
    const galleta = (x, y, r, rot) => {
      const chips = [[-.45, -.3], [.3, -.42], [.48, .15], [-.1, .45], [-.48, .25], [.05, -.05]];
      return `<g transform="translate(${x} ${y}) rotate(${rot})">
        <circle r="${r}" fill="#e2b06a" stroke="${K}" stroke-width="3"/>
        ${chips.map(([a, b]) => `<path transform="translate(${a * r} ${b * r}) scale(.62)" d="M-4 -3 C0 -6 5 -3 4 1 C3 5 -3 5 -4 2 Z" fill="#4a2414"/>`).join("")}
      </g>`;
    };
    const pila = [[96, 166, 15, 10], [124, 168, 15, -20], [150, 164, 15, 35], [84, 142, 14, 0], [111, 144, 15, 25], [138, 141, 15, -10],
      [158, 146, 13, 15], [98, 120, 14, -30], [126, 118, 15, 5], [150, 122, 13, 40], [112, 96, 13, 20], [138, 98, 12, -15]];
    return `
      ${decoracion()}
      <defs><clipPath id="cp-${uid}"><path d="${bolsa}"/></clipPath></defs>
      <path d="${bolsa}" fill="#fff" fill-opacity=".55"/>
      <g clip-path="url(#cp-${uid})">${pila.map(([x, y, r, rot]) => galleta(x, y, r, rot)).join("")}
        <path d="M84 84 C80 116 78 150 82 172" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".75" fill="none"/>
      </g>
      <path d="${bolsa}" fill="none" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M114 66 C104 52 94 42 88 28 C98 20 108 30 120 21 C132 30 142 20 152 28 C146 42 136 52 126 66 Z" fill="#fff" fill-opacity=".6" stroke="${K}" stroke-width="3.4" stroke-linejoin="round"/>
      <path d="M118 62 C112 50 106 40 104 30 M122 62 C128 50 134 40 136 30" fill="none" stroke="${K}" stroke-width="2" stroke-linecap="round" opacity=".45"/>
      <g transform="translate(120 64)">
        <path d="M0 0 C-14 -14 -30 -10 -26 2 C-22 12 -8 6 0 0 C8 6 22 12 26 2 C30 -10 14 -14 0 0Z" fill="${LILA}" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M-3 2 L-12 20 M3 2 L12 20" stroke="${K}" stroke-width="7" stroke-linecap="round"/>
        <path d="M-3 2 L-12 20 M3 2 L12 20" stroke="${LILA}" stroke-width="3.6" stroke-linecap="round"/>
        <circle r="5.5" fill="${LILA}" stroke="${K}" stroke-width="3"/>
      </g>`;
  }

  /* ---------- Vaso de 12 onz con 9 mini donitas ---------- */
  function donas(c, uid) {
    const vasoPath = "M62 84 L178 84 L166 184 Q120 192 74 184 Z";
    const dona = (x, y, s, rot = 0) => `
      <g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
        <ellipse rx="20" ry="13" fill="#e6a861" stroke="${K}" stroke-width="3.4"/>
        <path d="M-16 -2 C-17 -11 17 -11 16 -2 C15 2 12 1 10 3 C8 6 6 2 3 4 C0 7 -2 3 -5 5 C-8 7 -10 2 -12 3 C-15 4 -16 1 -16 -2Z" fill="#fff4f1" stroke="${K}" stroke-width="2" stroke-linejoin="round"/>
        <ellipse rx="5.5" ry="3.2" cy="-3.5" fill="#e6a861" stroke="${K}" stroke-width="2"/>
        <ellipse rx="3.4" ry="1.6" cy="-3" fill="#c98a3c"/>
      </g>`;
    // 3 arriba asomadas + 6 dentro del vaso transparente = 9
    const dentro = [[94, 160, -6], [121, 163, 4], [148, 159, -3], [96, 121, 5], [122, 125, -5], [147, 120, 8]];
    const arriba = [[94, 78, -14], [146, 78, 14], [120, 66, 0]];
    return `
      ${decoracion()}
      <defs><clipPath id="cp-${uid}"><path d="${vasoPath}"/></clipPath></defs>
      <g clip-path="url(#cp-${uid})">
        <rect x="56" y="84" width="130" height="108" fill="#fff" fill-opacity=".6"/>
        ${dentro.map(([x, y, r]) => dona(x, y, 1.05, r)).join("")}
        <path d="M80 96 L88 176" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".75"/>
      </g>
      ${arriba.map(([x, y, r]) => dona(x, y, 1, r)).join("")}
      <path d="${vasoPath}" fill="none" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>
      <rect x="58" y="82" width="124" height="9" rx="4.5" fill="#fffdf7" stroke="${K}" stroke-width="3.4"/>`;
  }

  let contador = 0;
  window.HM_ILUSTRACION = function (cfg) {
    cfg = cfg || {};
    const uid = `hm${++contador}`;
    const dibujos = {
      pave: () => pave(cfg, uid),
      bolsita: () => bolsita(cfg, uid),
      donas: () => donas(cfg, uid)
    };
    const cuerpo = (dibujos[cfg.tipo] || dibujos.pave)();
    return `<svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" focusable="false">${cuerpo}</svg>`;
  };
})();
