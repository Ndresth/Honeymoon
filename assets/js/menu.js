/* =========================================================
   Honey Moon · Menú de prueba
   Precios en pesos colombianos (COP). Edita libremente.

   Campos de cada producto:
   - tamanos: lista de tamaños con precio (si hay uno solo, no se muestra selector)
   - adiciones: true si acepta toppings adicionales
   - ilustracion: dibujo generado (tipo, salsa, topping, fondo)  ó  imagen: ruta a una foto
   - disponible: false para mostrarlo como "Próximamente"
   ========================================================= */
window.HM_CATEGORIAS = [
  { id: "todos", nombre: "Todo", icono: "bi-stars" },
  { id: "clasicas", nombre: "Fresas con crema", icono: "bi-heart" },
  { id: "helado", nombre: "Con helado", icono: "bi-snow" },
  { id: "postres", nombre: "Waffles y cupcakes", icono: "bi-cake2" },
  { id: "bebidas", nombre: "Bebidas", icono: "bi-cup-straw" },
  { id: "temporada", nombre: "Temporada", icono: "bi-moon-stars" }
];

window.HM_ADICIONES = [
  { id: "queso", nombre: "Queso rallado", precio: 2000 },
  { id: "leche", nombre: "Leche condensada", precio: 2000 },
  { id: "arequipe", nombre: "Arequipe", precio: 2500 },
  { id: "chocolate", nombre: "Chocolate derretido", precio: 2500 },
  { id: "nutella", nombre: "Nutella", precio: 3500 },
  { id: "oreo", nombre: "Galleta Oreo", precio: 2500 },
  { id: "chips", nombre: "Chips de chocolate", precio: 2000 },
  { id: "malvaviscos", nombre: "Mini malvaviscos", precio: 2000 },
  { id: "almendras", nombre: "Almendras", precio: 3000 },
  { id: "brownie", nombre: "Trozos de brownie", precio: 3500 },
  { id: "helado", nombre: "Bola de helado", precio: 4000 }
];

const VASOS = (p9, p12, p16) => [
  { id: "9oz", nombre: "9 oz", precio: p9 },
  { id: "12oz", nombre: "12 oz", precio: p12 },
  { id: "16oz", nombre: "16 oz", precio: p16 }
];

window.HM_MENU = [
  /* ---------- Fresas con crema ---------- */
  {
    id: "clasica-honey",
    categoria: "clasicas",
    nombre: "Clásica Honey",
    descripcion: "Fresas frescas, nuestra crema de la casa y un hilo de leche condensada.",
    etiqueta: "Más pedido",
    tamanos: VASOS(12000, 15000, 19000),
    adiciones: true,
    ilustracion: { tipo: "vaso", salsa: "#fff1d0", fondo: "#ffd9e8" }
  },
  {
    id: "costena",
    categoria: "clasicas",
    nombre: "La Costeña",
    descripcion: "Fresas, crema, queso rallado y leche condensada. El clásico de Barranquilla.",
    etiqueta: "Bien barranquillera",
    tamanos: VASOS(13000, 16000, 20000),
    adiciones: true,
    ilustracion: { tipo: "vaso", salsa: "#fff1d0", topping: "queso", fondo: "#fbe7b8" }
  },
  {
    id: "nutella-moon",
    categoria: "clasicas",
    nombre: "Nutella Moon",
    descripcion: "Fresas, crema, Nutella por dentro y por encima, con almendras tostadas.",
    tamanos: VASOS(15000, 19000, 23000),
    adiciones: true,
    ilustracion: { tipo: "vaso", salsa: "#6b3a22", topping: "almendras", fondo: "#f1d9c4" }
  },
  {
    id: "arequipe-dream",
    categoria: "clasicas",
    nombre: "Arequipe Dream",
    descripcion: "Fresas, crema, arequipe cremoso y galleta crocante triturada.",
    tamanos: VASOS(14000, 17000, 21000),
    adiciones: true,
    ilustracion: { tipo: "vaso", salsa: "#c98a3c", topping: "galleta", fondo: "#f7e1c0" }
  },
  {
    id: "oreo-crush",
    categoria: "clasicas",
    nombre: "Oreo Crush",
    descripcion: "Fresas, crema, galleta Oreo triturada y salsa de chocolate.",
    etiqueta: "Nuevo",
    tamanos: VASOS(14000, 17000, 21000),
    adiciones: true,
    ilustracion: { tipo: "vaso", salsa: "#3b2620", topping: "oreo", fondo: "#e3e6d4" }
  },
  {
    id: "brownie-lover",
    categoria: "clasicas",
    nombre: "Brownie Lover",
    descripcion: "Fresas, crema, trozos de brownie casero y fudge de chocolate.",
    tamanos: VASOS(15000, 19000, 23000),
    adiciones: true,
    ilustracion: { tipo: "vaso", salsa: "#5a2d1c", topping: "brownie", fondo: "#efd2c6" }
  },

  /* ---------- Con helado ---------- */
  {
    id: "fresas-helado",
    categoria: "helado",
    nombre: "Fresas con helado",
    descripcion: "Fresas, crema y una bola de helado de vainilla encima.",
    tamanos: [
      { id: "12oz", nombre: "12 oz", precio: 16000 },
      { id: "16oz", nombre: "16 oz", precio: 20000 }
    ],
    adiciones: true,
    ilustracion: { tipo: "helado", salsa: "#e5412d", fondo: "#ffe0d6" }
  },
  {
    id: "split-honey",
    categoria: "helado",
    nombre: "Split Honey",
    descripcion: "Fresas, banano, dos bolas de helado, crema chantilly y chocolate.",
    tamanos: [{ id: "unico", nombre: "Tamaño único", precio: 21000 }],
    adiciones: true,
    ilustracion: { tipo: "helado", salsa: "#5a2d1c", topping: "chips", fondo: "#f9e3a8" }
  },

  /* ---------- Waffles y cupcakes ---------- */
  {
    id: "waffle-fresas",
    categoria: "postres",
    nombre: "Waffle de fresas",
    descripcion: "Waffle recién hecho con fresas, crema de la casa y salsa de chocolate.",
    tamanos: [{ id: "unico", nombre: "Unidad", precio: 18000 }],
    adiciones: true,
    ilustracion: { tipo: "waffle", salsa: "#5a2d1c", fondo: "#fbe7b8" }
  },
  {
    id: "cupcake-honey",
    categoria: "postres",
    nombre: "Cupcake Honey",
    descripcion: "Cupcake de chocolate con frosting de vainilla y chips. El favorito de nuestro honguito.",
    etiqueta: "Favorito del honguito",
    tamanos: [
      { id: "unidad", nombre: "Unidad", precio: 7000 },
      { id: "caja4", nombre: "Caja x4", precio: 26000 },
      { id: "caja6", nombre: "Caja x6", precio: 38000 }
    ],
    adiciones: false,
    ilustracion: { tipo: "cupcake", salsa: "#6b3a22", frosting: "#fffaf2", capsula: "#6b3a22", rayas: "#4a2414", fondo: "#ffd9e8" }
  },
  {
    id: "cupcake-fresa",
    categoria: "postres",
    nombre: "Cupcake de fresa",
    descripcion: "Vainilla rellena de mermelada de fresa con frosting rosado.",
    tamanos: [
      { id: "unidad", nombre: "Unidad", precio: 7000 },
      { id: "caja4", nombre: "Caja x4", precio: 26000 },
      { id: "caja6", nombre: "Caja x6", precio: 38000 }
    ],
    adiciones: false,
    ilustracion: { tipo: "cupcake", salsa: "#f3d3a0", frosting: "#ffc5de", fresa: true, fondo: "#e3e6d4" }
  },

  /* ---------- Bebidas ---------- */
  {
    id: "malteada-fresa",
    categoria: "bebidas",
    nombre: "Malteada de fresa",
    descripcion: "Helado, leche y fresas licuadas, con crema y fresa encima.",
    tamanos: [
      { id: "12oz", nombre: "12 oz", precio: 13000 },
      { id: "16oz", nombre: "16 oz", precio: 15000 }
    ],
    adiciones: false,
    ilustracion: { tipo: "malteada", salsa: "#f6a3c3", fondo: "#ffd9e8" }
  },
  {
    id: "frappe-fresas-crema",
    categoria: "bebidas",
    nombre: "Frappé fresas con crema",
    descripcion: "Granizado cremoso de fresa con chantilly y sirope de frutos rojos.",
    tamanos: [{ id: "16oz", nombre: "16 oz", precio: 14000 }],
    adiciones: false,
    ilustracion: { tipo: "malteada", salsa: "#ef8fb1", fondo: "#f6e3e9" }
  },
  {
    id: "limonada-fresa",
    categoria: "bebidas",
    nombre: "Limonada de fresa",
    descripcion: "Limonada natural con fresas, bien fría para el calor de Barranquilla.",
    tamanos: [{ id: "16oz", nombre: "16 oz", precio: 9000 }],
    adiciones: false,
    ilustracion: { tipo: "limonada", salsa: "#ffbfcf", fondo: "#e3e6d4" }
  },

  /* ---------- Temporada ---------- */
  {
    id: "vampi-fresa",
    categoria: "temporada",
    nombre: "Vampi-Fresa",
    descripcion: "Fresas, crema, sirope de frutos rojos y galleta de chocolate. Solo en octubre.",
    etiqueta: "Octubre",
    tamanos: VASOS(15000, 18000, 22000),
    adiciones: true,
    imagen: "assets/img/mascota-octubre.webp",
    fondo: "#3a4e33"
  },
  {
    id: "navi-fresa",
    categoria: "temporada",
    nombre: "Navi-Fresa",
    descripcion: "Fresas, crema, galleta de jengibre, canela y chispas. Llega en diciembre.",
    etiqueta: "Diciembre",
    tamanos: VASOS(15000, 18000, 22000),
    adiciones: true,
    imagen: "assets/img/mascota-diciembre.webp",
    fondo: "#1a2738",
    disponible: false
  }
];
