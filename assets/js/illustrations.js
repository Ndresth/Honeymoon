/* =========================================================
   Honey Moon · Ilustraciones SVG de los productos
   Dibujos con trazo grueso, en el mismo estilo de la mascota.
   ========================================================= */
(function () {
  const K = "#3c150e"; // contorno cacao
  const RED = "#e5412d";
  const LEAF = "#6f8f3d";
  const PINK = "#e97aa6";
  const CREAM = "#fffaf2";

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

  const rodaja = (x, y, s = 1, r = 0) => `
    <g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">
      <path d="M0,-10 C8,-12 13,-5 12,2 C11,9 4,14 0,15 C-4,14 -11,9 -12,2 C-13,-5 -8,-12 0,-10Z" fill="${RED}"/>
      <path d="M0,-5 C4,-6 7,-2 6,2 C5,6 2,9 0,9 C-2,9 -5,6 -6,2 C-7,-2 -4,-6 0,-5Z" fill="#ff9aa8"/>
    </g>`;

  const corazon = (x, y, s = 1, r = 0) => `
    <path transform="translate(${x} ${y}) rotate(${r}) scale(${s})"
      d="M0,6 C-7,0 -11,-4 -8,-9 C-5,-13 -1,-11 0,-8 C1,-11 5,-13 8,-9 C11,-4 7,0 0,6Z"
      fill="none" stroke="${PINK}" stroke-width="2.6" stroke-linejoin="round"/>`;

  const brillo = (x, y, s = 1) => `
    <path transform="translate(${x} ${y}) scale(${s})"
      d="M0,-8 C1,-2 2,-1 8,0 C2,1 1,2 0,8 C-1,2 -2,1 -8,0 C-2,-1 -1,-2 0,-8Z"
      fill="#fff" stroke="${K}" stroke-width="1.6" stroke-linejoin="round" opacity=".85"/>`;

  const decoracion = () => `
    ${corazon(26, 40, 1.3, -14)}${corazon(212, 150, 1.1, 12)}
    ${brillo(212, 42, 1)}${brillo(34, 152, .8)}
    <g stroke="${PINK}" stroke-width="2.6" stroke-linecap="round">
      <path d="M200 64 l12 -4"/><path d="M202 76 l12 2"/>
      <path d="M30 70 l-10 -6"/>
    </g>`;

  const toppings = (tipo, puntos) => {
    if (!tipo) return "";
    return puntos.map(([x, y, r], i) => {
      switch (tipo) {
        case "oreo":
          return `<g transform="translate(${x} ${y}) rotate(${r})"><circle r="6.5" fill="#2b2422" stroke="${K}" stroke-width="2"/><circle r="2.4" fill="#f4efe6"/></g>`;
        case "queso":
          return `<rect x="${x - 6}" y="${y - 1.6}" width="12" height="3.4" rx="1.6" fill="#ffd970" stroke="#d3a43a" stroke-width="1" transform="rotate(${r * 3} ${x} ${y})"/>`;
        case "chips":
          return `<path transform="translate(${x} ${y}) rotate(${r})" d="M0,-4 C3,0 4,3 0,4 C-4,3 -3,0 0,-4Z" fill="#4a2414"/>`;
        case "almendras":
          return `<ellipse cx="${x}" cy="${y}" rx="6" ry="3" fill="#d9a35b" stroke="#8a5528" stroke-width="1.4" transform="rotate(${r * 2} ${x} ${y})"/>`;
        case "brownie":
          return `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" rx="2" fill="#4a2414" stroke="${K}" stroke-width="2" transform="rotate(${r} ${x} ${y})"/>`;
        case "galleta":
          return `<rect x="${x - 4.5}" y="${y - 4}" width="9" height="8" rx="2" fill="#e2b06a" stroke="#a8722f" stroke-width="1.4" transform="rotate(${r} ${x} ${y})"/>`;
        default:
          return "";
      }
    }).join("");
  };

  const PUNTOS_DOMO = [[78, 66, 10], [96, 50, -20], [152, 58, 25], [164, 70, -10], [120, 62, 40], [86, 72, 30], [140, 72, -30], [110, 70, 15]];

  function vaso(c, uid, conHelado) {
    const cup = "M62 80 L178 80 L164 180 Q120 188 76 180 Z";
    const domo = conHelado
      ? `<path d="M74 82 C66 56 84 36 108 38 C114 26 140 26 146 40 C168 42 178 62 166 82 Z" fill="#fff1cf" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>
         <path d="M80 80 q6 8 12 0 q6 8 12 0 q6 8 12 0 q6 8 12 0 q6 8 12 0 q6 8 12 0 q6 8 12 0" fill="none" stroke="${K}" stroke-width="3" stroke-linecap="round" opacity=".35"/>`
      : `<path d="M62 80 C54 58 78 48 92 56 C96 36 130 34 136 52 C152 42 182 56 176 80 Z" fill="${CREAM}" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>`;
    const salsa = c.salsa || "#fff1d0";
    return `
      ${decoracion()}
      <defs><clipPath id="cp-${uid}"><path d="${cup}"/></clipPath></defs>
      <g clip-path="url(#cp-${uid})">
        <rect x="50" y="70" width="140" height="130" fill="#fff6e8"/>
        ${rodaja(80, 100, 1, 10)}${rodaja(108, 96, 1.1, -20)}${rodaja(138, 102, 1, 30)}${rodaja(164, 96, .9, 0)}
        <path d="M50 122 q12 -8 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 V134 q-12 8 -24 0 t-24 0 t-24 0 t-24 0 t-24 0 t-24 0Z" fill="${salsa}" stroke="${K}" stroke-width="1.6" stroke-opacity=".25"/>
        ${rodaja(90, 150, 1.1, -10)}${rodaja(122, 156, 1, 25)}${rodaja(150, 148, 1, -30)}
        ${rodaja(104, 176, .9, 0)}${rodaja(138, 176, .9, 15)}
        <path d="M78 92 L86 172" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".75"/>
      </g>
      <path d="${cup}" fill="none" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>
      ${domo}
      <path d="M72 70 q8 9 16 0 q8 -9 16 0 q8 9 16 0 q8 -9 16 0 q8 9 16 0" fill="none" stroke="${salsa}" stroke-width="6" stroke-linecap="round"
        ${salsa.toLowerCase() === "#fff1d0" ? `opacity=".9"` : ""}/>
      ${toppings(c.topping, PUNTOS_DOMO)}
      ${fresa(108, 40, 1.25, -14)}${fresa(142, 48, 1.05, 20)}
      <rect x="56" y="76" width="128" height="10" rx="5" fill="#fffdf7" stroke="${K}" stroke-width="4"/>`;
  }

  function malteada(c, uid) {
    const glass = "M82 62 L158 62 L148 182 Q120 188 92 182 Z";
    return `
      ${decoracion()}
      <path d="M142 8 L124 70" stroke="${K}" stroke-width="13" stroke-linecap="round"/>
      <path d="M142 8 L124 70" stroke="${RED}" stroke-width="7" stroke-linecap="round"/>
      <path d="M142 8 L124 70" stroke="#fff" stroke-width="7" stroke-dasharray="6 7"/>
      <defs><clipPath id="cp-${uid}"><path d="${glass}"/></clipPath></defs>
      <g clip-path="url(#cp-${uid})">
        <rect x="70" y="60" width="100" height="130" fill="${c.salsa}"/>
        <path d="M70 120 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 V190 H70Z" fill="#000" opacity=".06"/>
        <circle cx="104" cy="132" r="3" fill="#fff" opacity=".6"/><circle cx="132" cy="150" r="2.5" fill="#fff" opacity=".6"/>
        <circle cx="116" cy="164" r="2" fill="#fff" opacity=".6"/>
        <path d="M94 74 L100 172" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".6"/>
      </g>
      <path d="${glass}" fill="none" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M78 64 C70 46 92 38 102 46 C106 30 132 30 136 44 C150 36 170 48 162 64 Z" fill="${CREAM}" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M90 56 q7 7 14 0 q7 -7 14 0 q7 7 14 0 q7 -7 14 0" fill="none" stroke="#e5412d" stroke-width="4.5" stroke-linecap="round" opacity=".8"/>
      ${fresa(160, 64, 1.1, 25)}`;
  }

  function limonada(c, uid) {
    const glass = "M80 52 L160 52 L150 182 Q120 188 90 182 Z";
    const hielo = (x, y, r) => `<rect x="${x - 11}" y="${y - 11}" width="22" height="22" rx="5" fill="#fff" opacity=".55" stroke="${K}" stroke-width="2" stroke-opacity=".35" transform="rotate(${r} ${x} ${y})"/>`;
    return `
      ${decoracion()}
      <path d="M136 10 L122 70" stroke="${K}" stroke-width="13" stroke-linecap="round"/>
      <path d="M136 10 L122 70" stroke="#7fae5a" stroke-width="7" stroke-linecap="round"/>
      <defs><clipPath id="cp-${uid}"><path d="${glass}"/></clipPath></defs>
      <g clip-path="url(#cp-${uid})">
        <rect x="70" y="70" width="100" height="120" fill="${c.salsa}"/>
        <rect x="70" y="50" width="100" height="20" fill="#fff" opacity=".4"/>
        ${hielo(104, 84, 12)}${hielo(134, 92, -18)}${hielo(118, 114, 30)}
        ${rodaja(100, 146, 1, 20)}${rodaja(136, 156, 1.1, -15)}${rodaja(116, 172, .9, 40)}
        <path d="M92 64 L100 172" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".6"/>
      </g>
      <path d="${glass}" fill="none" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>
      <g transform="translate(78 54)">
        <circle r="20" fill="#f6e46b" stroke="${K}" stroke-width="4"/>
        <circle r="14" fill="#fff6b5"/>
        <g stroke="#e8cf3a" stroke-width="2.2"><path d="M0 -14 V14"/><path d="M-14 0 H14"/><path d="M-10 -10 L10 10"/><path d="M10 -10 L-10 10"/></g>
      </g>
      ${fresa(162, 54, 1.05, 22)}`;
  }

  function waffle(c, uid) {
    let grid = "";
    for (let i = -60; i <= 60; i += 17) {
      grid += `<path d="M${120 + i} 60 V200" /><path d="M50 ${128 + i} H190" />`;
    }
    return `
      ${decoracion()}
      <ellipse cx="120" cy="164" rx="100" ry="26" fill="#fffdf7" stroke="${K}" stroke-width="4"/>
      <defs><clipPath id="cp-${uid}"><circle cx="120" cy="128" r="62"/></clipPath></defs>
      <circle cx="120" cy="128" r="62" fill="#e8b464"/>
      <g clip-path="url(#cp-${uid})" stroke="#c4893a" stroke-width="5">${grid}</g>
      <circle cx="120" cy="128" r="62" fill="none" stroke="${K}" stroke-width="4"/>
      <path d="M72 108 q12 14 24 0 q12 -14 24 0 q12 14 24 0 q12 -14 24 0 M80 148 q10 10 20 0 q10 -10 20 0 q10 10 20 0 q10 -10 20 0"
        fill="none" stroke="${c.salsa}" stroke-width="6" stroke-linecap="round"/>
      <path d="M96 122 C88 104 108 96 114 104 C118 90 140 92 140 106 C152 102 160 118 148 126 C140 136 104 136 96 122Z"
        fill="${CREAM}" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>
      ${fresa(122, 98, 1.15, -8)}${fresa(80, 136, 1, -30)}${fresa(164, 140, 1, 28)}${fresa(124, 166, .95, 4)}`;
  }

  function cupcake(c, uid) {
    let rayas = "";
    for (let x = 88; x <= 152; x += 12) rayas += `<path d="M${x} 120 L${x + (x < 120 ? 3 : x > 120 ? -3 : 0)} 184"/>`;
    const frost = c.frosting || CREAM;
    const chips = [[96, 102, 20], [118, 88, -30], [142, 104, 10], [130, 74, 40], [108, 114, -10], [150, 92, 60]]
      .map(([x, y, r]) => `<path transform="translate(${x} ${y}) rotate(${r})" d="M0,-4 C3,0 4,3 0,4 C-4,3 -3,0 0,-4Z" fill="#4a2414"/>`).join("");
    return `
      ${decoracion()}
      <defs><clipPath id="cp-${uid}"><path d="M78 120 L162 120 L150 184 L90 184 Z"/></clipPath></defs>
      <path d="M78 120 L162 120 L150 184 L90 184 Z" fill="${c.capsula || "#f7b6cf"}"/>
      <g clip-path="url(#cp-${uid})" stroke="${c.rayas || "#e98fae"}" stroke-width="4">${rayas}</g>
      <path d="M78 120 L162 120 L150 184 L90 184 Z" fill="none" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M72 122 C70 104 170 104 168 122 Z" fill="${c.salsa}" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M80 116 C66 100 86 84 100 90 C98 70 142 70 140 90 C154 84 174 100 160 116 C140 124 100 124 80 116Z"
        fill="${frost}" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M112 66 C114 56 120 50 126 42 C130 52 136 58 134 68 Z" fill="${frost}" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M100 88 C94 66 116 54 122 58 C130 52 150 68 140 88" fill="${frost}" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>
      ${chips}
      ${c.fresa ? fresa(124, 40, 1.15, 10) : ""}`;
  }

  let contador = 0;
  window.HM_ILUSTRACION = function (cfg) {
    const uid = `hm${++contador}`;
    const dibujos = {
      vaso: () => vaso(cfg, uid, false),
      helado: () => vaso(cfg, uid, true),
      malteada: () => malteada(cfg, uid),
      limonada: () => limonada(cfg, uid),
      waffle: () => waffle(cfg, uid),
      cupcake: () => cupcake(cfg, uid)
    };
    const cuerpo = (dibujos[cfg.tipo] || dibujos.vaso)();
    return `<svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" focusable="false">${cuerpo}</svg>`;
  };
})();
