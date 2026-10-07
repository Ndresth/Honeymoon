/* =========================================================
   Honeymoon · Ilustraciones SVG de los productos
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

  const toppings = (tipos, puntos) => {
    if (!tipos) return "";
    const lista = [].concat(tipos);
    return puntos.map(([x, y, r], i) => {
      switch (lista[i % lista.length]) {
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
        case "mani":
          return `<path transform="translate(${x} ${y}) rotate(${r * 2})" d="M-6 0 C-6 -4 -1 -4 0 -1.5 C1 -4 6 -4 6 0 C6 4 1 4 0 1.5 C-1 4 -6 4 -6 0Z" fill="#d9a35b" stroke="#8a5528" stroke-width="1.3"/>`;
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


  /* ---------- Repostería ---------- */
  const goteo = (x0, x1, y, largos, color) => {
    const w = (x1 - x0) / largos.length;
    let d = `M${x0} ${y - 6} L${x0} ${y}`;
    largos.forEach((L, i) => {
      const a = x0 + i * w + w * 0.18, b = x0 + (i + 1) * w - w * 0.18;
      d += ` L${a} ${y} C${a} ${y + L} ${b} ${y + L} ${b} ${y}`;
    });
    d += ` L${x1} ${y} L${x1} ${y - 6} Z`;
    return `<path d="${d}" fill="${color}" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>`;
  };

  const plato = (cy, rx = 94, ry = 18) =>
    `<ellipse cx="120" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fffdf7" stroke="${K}" stroke-width="4"/>
     <ellipse cx="120" cy="${cy - 2}" rx="${rx - 18}" ry="${ry - 7}" fill="none" stroke="${K}" stroke-width="2" opacity=".15"/>`;

  const decoTorta = (tipo) => {
    switch (tipo) {
      case "nueces":
        return [[92, 90, 20], [118, 86, -30], [146, 90, 40], [106, 96, 0], [134, 97, 70]]
          .map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="4" fill="#a8652f" stroke="${K}" stroke-width="1.6" transform="rotate(${r} ${x} ${y})"/>`).join("");
      case "zanahoria":
        return [[96, 88, -20], [120, 84, 0], [144, 88, 20]].map(([x, y, r]) => `
          <g transform="translate(${x} ${y}) rotate(${r})">
            <path d="M-3 -8 L0 -14 L3 -8" fill="none" stroke="${LEAF}" stroke-width="3" stroke-linecap="round"/>
            <path d="M-5 -8 L5 -8 L0 8 Z" fill="#f08a2c" stroke="${K}" stroke-width="2" stroke-linejoin="round"/>
          </g>`).join("") + decoTorta("nueces");
      case "migas":
        return [[90, 92], [104, 86], [118, 94], [132, 87], [146, 93], [112, 99], [128, 100], [98, 98], [140, 99]]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#b3263a" stroke="${K}" stroke-width="1"/>`).join("") +
          fresa(120, 74, 1.05, 6);
      case "merengue":
        return [[86, 92], [102, 86], [120, 84], [138, 86], [154, 92], [110, 98], [130, 98]]
          .map(([x, y]) => `<path transform="translate(${x} ${y})" d="M-7 4 C-7 -2 -2 -4 0 -10 C2 -4 7 -2 7 4 Z" fill="#fffaf2" stroke="${K}" stroke-width="2" stroke-linejoin="round"/>`).join("") +
          [[96, 96], [124, 92], [146, 97], [112, 90]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#a8652f"/>`).join("");
      case "chispas": {
        const cols = ["#e5412d", "#6f8f3d", "#fffaf2", "#e97aa6", "#f6e46b"];
        return [[90, 94, 20], [102, 88, -40], [116, 96, 60], [128, 88, 10], [142, 94, -20], [154, 90, 45], [110, 100, -60], [134, 100, 30], [98, 98, 80], [148, 99, -10]]
          .map(([x, y, r], i) => `<rect x="${x - 4}" y="${y - 1.5}" width="8" height="3" rx="1.5" fill="${cols[i % cols.length]}" stroke="${K}" stroke-width=".8" transform="rotate(${r} ${x} ${y})"/>`).join("");
      }
      case "naranja":
        return [[96, 90, -10], [120, 86, 0], [144, 90, 12]].map(([x, y, r]) => `
          <g transform="translate(${x} ${y}) rotate(${r}) scale(1 .62)">
            <circle r="11" fill="#f6a13a" stroke="${K}" stroke-width="2.6"/>
            <circle r="7.5" fill="#ffd27a"/>
            <g stroke="#f6a13a" stroke-width="1.6"><path d="M0 -7.5 V7.5"/><path d="M-7.5 0 H7.5"/><path d="M-5.3 -5.3 L5.3 5.3"/><path d="M5.3 -5.3 L-5.3 5.3"/></g>
          </g>`).join("") +
          `<path d="M120 76 C114 66 122 60 128 64 C126 70 124 74 120 76Z" fill="${LEAF}" stroke="${K}" stroke-width="2"/>`;
      default:
        return fresa(98, 80, 1, -18) + fresa(122, 74, 1.15, 4) + fresa(146, 80, 1, 20);
    }
  };

  const velas = () => [104, 136].map((x, i) => `
    <g transform="translate(${x} ${i ? 50 : 46})">
      <rect x="-4" y="0" width="8" height="34" rx="3" fill="${i ? "#ffc5de" : "#fffaf2"}" stroke="${K}" stroke-width="3"/>
      <path d="M-4 9 L4 5 M-4 19 L4 15 M-4 29 L4 25" stroke="${i ? PINK : "#e5412d"}" stroke-width="2"/>
      <path d="M0 -18 C7 -10 7 -4 0 -2 C-7 -4 -7 -10 0 -18Z" fill="#ffb02e" stroke="${K}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M0 -10 C3 -7 3 -5 0 -4 C-3 -5 -3 -7 0 -10Z" fill="#fff3b0"/>
    </g>`).join("");

  function torta(c) {
    const bizcocho = c.salsa || "#6b3a22";
    const relleno = c.relleno || CREAM;
    const cobertura = c.cobertura || CREAM;
    return `
      ${decoracion()}
      <path d="M100 184 L140 184 L150 196 L90 196 Z" fill="#fffdf7" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>
      ${plato(178, 92, 14)}
      <rect x="60" y="94" width="120" height="78" rx="8" fill="${bizcocho}" stroke="${K}" stroke-width="4"/>
      <rect x="62" y="124" width="116" height="9" fill="${relleno}"/>
      <rect x="62" y="150" width="116" height="9" fill="${relleno}"/>
      <path d="M70 112 V164" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".22"/>
      ${goteo(60, 180, 100, [22, 12, 28, 14, 24, 10, 26, 16], cobertura)}
      <ellipse cx="120" cy="94" rx="60" ry="12" fill="${cobertura}" stroke="${K}" stroke-width="4"/>
      ${c.velas ? velas() + decoTorta("chispas") : decoTorta(c.topping)}`;
  }

  function porcion(c) {
    const cuerpo = c.salsa || "#fff1d6";
    const salsa = c.cobertura || "#b0213a";
    const base = c.base || "#c98a3c";
    const oreo = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})">
      <ellipse rx="12" ry="7" fill="#2b2422" stroke="${K}" stroke-width="2.5"/>
      <rect x="-12" y="-1.6" width="24" height="3.2" fill="#f4efe6"/>
      <ellipse rx="12" ry="7" cy="-3" fill="#3a302d" stroke="${K}" stroke-width="2.5"/>
      <circle cx="-4" cy="-3" r="1.2" fill="#55463f"/><circle cx="3" cy="-4" r="1.2" fill="#55463f"/></g>`;
    const remate = c.extra === "oreo"
      ? `<path d="M128 100 C120 90 132 82 138 88 C140 78 156 80 154 90 C162 90 162 102 152 104 C144 108 132 108 128 100Z" fill="#fffaf2" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>
         ${oreo(110, 104, -12)}${oreo(168, 98, 14)}`
      : `<circle cx="120" cy="104" r="5" fill="#3b4a8a" stroke="${K}" stroke-width="2"/>
         <circle cx="104" cy="112" r="4.5" fill="#3b4a8a" stroke="${K}" stroke-width="2"/>
         ${fresa(150, 92, 1.05, 14)}${fresa(174, 102, .85, 30)}`;
    return `
      ${decoracion()}
      ${plato(160, 98, 24)}
      <path d="M52 128 L190 114 L190 154 L52 168 Z" fill="${cuerpo}" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M52 158 L190 144 L190 154 L52 168 Z" fill="${base}" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M52 128 L150 92 C176 92 198 102 190 114 Z" fill="${salsa}" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M60 127 C64 140 72 140 74 126 M96 122 C98 138 108 138 110 120 M134 118 C136 132 146 132 148 116 M166 116 C168 128 176 128 178 115"
        fill="${salsa}" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/>
      ${remate}`;
  }

  /* Pavé: capas de crema y galleta en vaso, con cuchara */
  function pave(c, uid) {
    const vasoPath = "M68 62 L172 62 L164 184 Q120 191 76 184 Z";
    const CAPAS = {
      galleta: { color: "#e9c88f", detalle: "#c99a55" },
      milo: { color: "#6b4a2b", detalle: "#3f2a18" },
      oblea: { color: "#f3d9a0", detalle: "#d7b36a" }
    };
    const capa = CAPAS[c.capa] || CAPAS.galleta;
    const banda = (y, h) => {
      let migas = "";
      for (let x = 72; x < 170; x += 11) migas += `<circle cx="${x + (y % 7)}" cy="${y + h / 2 + ((x / 11) % 2 ? 2 : -2)}" r="1.8" fill="${capa.detalle}"/>`;
      const rejilla = c.capa === "oblea"
        ? `<path d="${Array.from({ length: 9 }, (_, i) => `M${74 + i * 11} ${y} v${h}`).join(" ")}" stroke="${capa.detalle}" stroke-width="1.4"/>`
        : migas;
      const mora = c.capa === "oblea" ? `<rect x="60" y="${y - 3}" width="120" height="4" fill="#5b1f4a"/>` : "";
      return `<rect x="60" y="${y}" width="120" height="${h}" fill="${capa.color}"/>${rejilla}${mora}`;
    };
    const cima = {
      klim: [[84, 80], [96, 76], [108, 82], [122, 77], [136, 81], [150, 76], [160, 82], [102, 86], [130, 86], [144, 86], [90, 86], [116, 72]]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#fffdf6" stroke="#e8dcc0" stroke-width=".8"/>`).join(""),
      milo: [[82, 80, 0], [94, 76, 30], [108, 82, -20], [122, 76, 45], [136, 82, 10], [150, 77, -35], [160, 83, 20], [100, 86, 60], [128, 86, -50], [144, 86, 15]]
        .map(([x, y, r]) => `<rect x="${x - 4}" y="${y - 3}" width="8" height="6" rx="2" fill="#5a3a22" stroke="${K}" stroke-width="1" transform="rotate(${r} ${x} ${y})"/>`).join(""),
      queso: [[84, 80, 8], [100, 76, -12], [118, 81, 20], [134, 76, -6], [150, 80, 14], [108, 87, 0], [140, 87, -18]]
        .map(([x, y, r]) => `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" rx="2" fill="#fffdf2" stroke="${K}" stroke-width="1.6" transform="rotate(${r} ${x} ${y})"/>`).join("") +
        `<path d="M78 74 q8 6 16 0 q8 -6 16 0 q8 6 16 0 q8 -6 16 0 q8 6 16 0" fill="none" stroke="#5b1f4a" stroke-width="3" stroke-linecap="round" opacity=".85"/>`
    }[c.topping] || "";
    return `
      ${decoracion()}
      <path d="M166 14 L140 84" stroke="${K}" stroke-width="11" stroke-linecap="round"/>
      <path d="M166 14 L140 84" stroke="#dfe6ea" stroke-width="6" stroke-linecap="round"/>
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

  /* Mini donas con crema, fresas y salsa de fresa */
  function donas() {
    const dona = (x, y, s) => `
      <g transform="translate(${x} ${y}) scale(${s})">
        <ellipse rx="30" ry="20" fill="#e6a861" stroke="${K}" stroke-width="4"/>
        <path d="M-25 -3 C-26 -17 26 -17 25 -3 C24 3 19 1 16 5 C13 9 9 3 5 7 C1 11 -3 4 -7 8 C-11 11 -15 3 -19 5 C-23 6 -25 2 -25 -3Z"
          fill="#fffaf2" stroke="${K}" stroke-width="2.6" stroke-linejoin="round"/>
        <path d="M-19 -9 l6 4 l6 -5 l6 5 l6 -5 l6 5 l6 -4" fill="none" stroke="#e5412d" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
        <ellipse rx="8" ry="4.6" cy="-5" fill="#e6a861" stroke="${K}" stroke-width="2.6"/>
        <ellipse rx="5" ry="2.4" cy="-4" fill="#c98a3c"/>
      </g>`;
    return `
      ${decoracion()}
      ${plato(166, 98, 20)}
      ${dona(80, 146, 1)}${dona(160, 146, 1)}${dona(120, 112, 1.05)}
      ${rodaja(60, 128, .8, -20)}${rodaja(182, 126, .8, 25)}
      ${fresa(120, 80, 1.1, 8)}${fresa(150, 96, .85, 28)}`;
  }

  function brownie(c) {
    const bloque = (x, y, w, h) => `
      <path d="M${x} ${y} L${x + 14} ${y - 12} L${x + w + 14} ${y - 12} L${x + w} ${y} Z" fill="#6b3a22" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M${x + w} ${y} L${x + w + 14} ${y - 12} L${x + w + 14} ${y + h - 12} L${x + w} ${y + h} Z" fill="#3a1b0f" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#4a2414" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M${x + 12} ${y - 5} l10 -2 l6 3 M${x + 34} ${y - 8} l8 2 l8 -3" fill="none" stroke="#9a6a4c" stroke-width="2" stroke-linecap="round"/>
      <circle cx="${x + 14}" cy="${y + 12}" r="2.5" fill="#2a120a"/><circle cx="${x + w - 16}" cy="${y + 20}" r="2.5" fill="#2a120a"/>`;
    const extra = c.topping === "nutella"
      ? `<path d="M86 86 q8 8 16 0 q8 -8 16 0 q8 8 16 0" fill="none" stroke="#fff1d0" stroke-width="4.5" stroke-linecap="round"/>`
      : [[94, 84], [110, 80], [128, 84], [140, 79], [118, 88]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#fffaf2"/>`).join("");
    return `
      ${decoracion()}
      ${plato(166, 98, 20)}
      ${bloque(46, 132, 64, 30)}${bloque(124, 132, 64, 30)}
      ${bloque(84, 100, 64, 30)}
      ${extra}
      ${fresa(160, 84, 1, 20)}`;
  }

  function galleta(c) {
    const masa = c.salsa || "#e2b06a";
    const chip = c.chips || "#4a2414";
    const cookie = (x, y, r, rot) => {
      const pts = [[-.45, -.35], [.3, -.45], [.5, .15], [-.1, .5], [-.5, .25], [.05, -.05], [.25, .45]];
      return `<g transform="translate(${x} ${y}) rotate(${rot})">
        <path d="M${-r} 0 C${-r} ${-r * .6} ${-r * .6} ${-r} 0 ${-r} C${r * .62} ${-r} ${r} ${-r * .55} ${r} 0 C${r} ${r * .6} ${r * .55} ${r} 0 ${r} C${-r * .6} ${r} ${-r} ${r * .58} ${-r} 0Z"
          fill="${masa}" stroke="${K}" stroke-width="4"/>
        <path d="M${-r * .5} ${-r * .1} l${r * .2} ${r * .08} M${r * .2} ${r * .2} l${r * .18} ${-r * .06}" stroke="${K}" stroke-width="2" opacity=".25" stroke-linecap="round"/>
        ${pts.map(([a, b]) => `<path transform="translate(${a * r} ${b * r})" d="M-4 -3 C0 -6 5 -3 4 1 C3 5 -3 5 -4 2 Z" fill="${chip}" stroke="${K}" stroke-width="1.2"/>`).join("")}
      </g>`;
    };
    return `
      ${decoracion()}
      ${plato(168, 96, 18)}
      ${cookie(150, 104, 40, 20)}
      ${cookie(100, 124, 48, -10)}
      ${cookie(170, 148, 26, 40)}`;
  }

  function alfajor() {
    const uno = (x, y) => `
      <g transform="translate(${x} ${y}) scale(1.18)">
        <rect x="-40" y="4" width="80" height="16" rx="8" fill="#f3d9a6" stroke="${K}" stroke-width="3.5"/>
        <rect x="-37" y="-4" width="74" height="10" rx="5" fill="#c98a3c" stroke="${K}" stroke-width="2.5"/>
        <g fill="#fffaf2" stroke="${K}" stroke-width=".8">${[-30, -18, -6, 6, 18, 30].map((dx, i) => `<rect x="${dx - 3}" y="${i % 2 ? 1 : -1}" width="6" height="3" rx="1.5"/>`).join("")}</g>
        <rect x="-40" y="-20" width="80" height="18" rx="9" fill="#f6e2b3" stroke="${K}" stroke-width="3.5"/>
        <g fill="#fff">${[[-24, -14], [-10, -11], [4, -15], [18, -12], [28, -16], [-16, -8], [10, -8]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="1.6"/>`).join("")}</g>
      </g>`;
    return `
      ${decoracion()}
      ${plato(170, 96, 18)}
      ${uno(76, 146)}${uno(164, 146)}${uno(120, 102)}`;
  }

  let contador = 0;
  window.HM_ILUSTRACION = function (cfg) {
    cfg = cfg || {};
    const uid = `hm${++contador}`;
    const dibujos = {
      vaso: () => vaso(cfg, uid, false),
      helado: () => vaso(cfg, uid, true),
      malteada: () => malteada(cfg, uid),
      limonada: () => limonada(cfg, uid),
      waffle: () => waffle(cfg, uid),
      cupcake: () => cupcake(cfg, uid),
      torta: () => torta(cfg),
      porcion: () => porcion(cfg),
      brownie: () => brownie(cfg),
      galleta: () => galleta(cfg),
      alfajor: () => alfajor(cfg),
      pave: () => pave(cfg, uid),
      donas: () => donas(cfg)
    };
    const cuerpo = (dibujos[cfg.tipo] || dibujos.vaso)();
    return `<svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" focusable="false">${cuerpo}</svg>`;
  };
})();
