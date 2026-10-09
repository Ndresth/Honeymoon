/* =========================================================
   Honeymoon · Menú
   Precios en pesos colombianos (COP).

   ⚠️ PRECIOS Y TAMAÑOS DE REFERENCIA: reemplázalos por los reales y luego
   pon `preciosConfirmados: true` en config.js para quitar el aviso.

   Campos de cada producto:
   - tamanos: lista de tamaños con precio (si hay uno solo, no se muestra selector).
              Un tamaño puede llevar `detalle` (ej. "12 porciones") y `encargo: true`.
   - adiciones: nombre del grupo de HM_ADICIONES que acepta ("donas", "galletaChips"...)
   - encargo: true si todo el producto se hace por encargo (ver diasEncargo en config.js)
   - temporada: { desde: "MM-DD", hasta: "MM-DD", texto } → solo se puede pedir en esas fechas
   - ilustracion: dibujo generado (tipo, colores, topping)  ó  imagen: ruta a una foto
   - fotoReferencia: true muestra la etiqueta "Foto de referencia" sobre la imagen
   - notaPlaceholder: texto de ejemplo para la nota del producto
   - disponible: false para mostrarlo como "Próximamente"
   ========================================================= */
window.HM_CATEGORIAS = [
  { id: "todos", nombre: "Todo", icono: "bi-stars" },
  { id: "fresas", nombre: "Fresas con crema", icono: "bi-heart" },
  { id: "paves", nombre: "Pavés", icono: "bi-layers" },
  { id: "cheesecakes", nombre: "Cheesecakes", icono: "bi-cake2" },
  { id: "donas", nombre: "Mini donas", icono: "bi-record-circle" },
  { id: "galletas", nombre: "Galletas y alfajores", icono: "bi-cookie" },
  { id: "tortas", nombre: "Tortas", icono: "bi-cake" },
  { id: "temporada", nombre: "Temporada", icono: "bi-moon-stars" }
];

window.HM_ADICIONES = {
  // Toppings de las mini donas (precios de referencia)
  donas: [
    { id: "d-chocolate", nombre: "Salsa de chocolate", precio: 2000 },
    { id: "d-oreo", nombre: "Oreo triturada", precio: 2000 },
    { id: "d-almendras", nombre: "Almendras", precio: 3000 },
    { id: "d-mani", nombre: "Maní", precio: 2000 },
    { id: "d-arequipe", nombre: "Arequipe", precio: 2000 },
    { id: "d-nutella", nombre: "Nutella", precio: 3500 },
    { id: "d-leche", nombre: "Leche condensada", precio: 2000 },
    { id: "d-chocoramo", nombre: "Chocoramo", precio: 3000 },
    { id: "d-brownie", nombre: "Brownie", precio: 3000 },
    { id: "d-queso", nombre: "Queso rallado", precio: 2000 }
  ],
  galletaChips: [
    { id: "g-arequipe", nombre: "Topping de arequipe", precio: 2000 }
  ],
  galletaRedVelvet: [
    { id: "g-frosting", nombre: "Topping de frosting de queso crema", precio: 2500 }
  ]
};

(function () {
  // Tamaños y precios de referencia
  const VASO = (precio) => [{ id: "vaso", nombre: "Vaso", precio }];
  const PORCION = (precio) => [{ id: "porcion", nombre: "Porción", precio }];
  const PAQUETE = (precio) => [{ id: "paquete", nombre: "Paquete", precio }];
  const TORTAS = (mini, mediana, grande) => [
    { id: "mini", nombre: "Mini", detalle: "6 porciones", precio: mini },
    { id: "mediana", nombre: "Mediana", detalle: "12 porciones", precio: mediana },
    { id: "grande", nombre: "Grande", detalle: "20 porciones", precio: grande }
  ];
  const NOTA_TORTA = "Ej: indicaciones especiales para tu torta";
  const FOTO_FRESAS = "assets/img/fresas-con-crema.webp"; // foto real de referencia

  window.HM_MENU = [
    /* ---------- Fresas con crema ---------- */
    {
      id: "fresas-hony",
      categoria: "fresas",
      nombre: "Fresas con crema Hony",
      descripcion: "Fresa, crema, Oreo, dulce de leche, leche condensada y salsa de fresa.",
      tamanos: VASO(14000),
      imagen: FOTO_FRESAS,
      fotoReferencia: true,
      fondo: "#f6c9d8"
    },
    {
      id: "fresas-cheese",
      categoria: "fresas",
      nombre: "Fresas con crema Cheese",
      descripcion: "Fresa, queso fresco, crema, Oreo, dulce de leche, leche condensada y salsa de fresa.",
      tamanos: VASO(15000),
      imagen: FOTO_FRESAS,
      fotoReferencia: true,
      fondo: "#f6c9d8"
    },
    {
      id: "fresas-nutella-moon",
      categoria: "fresas",
      nombre: "Fresas con crema Nutella Moon",
      descripcion: "Fresa, crema, Nutella, maní tostado y salsa de fresa.",
      tamanos: VASO(16000),
      imagen: FOTO_FRESAS,
      fotoReferencia: true,
      fondo: "#f6c9d8"
    },
    {
      id: "fresas-oreo-crush",
      categoria: "fresas",
      nombre: "Fresas con crema Oreo Crush",
      descripcion: "Fresa, crema, Oreo triturada, salsa de chocolate y salsa de fresa.",
      tamanos: VASO(15000),
      imagen: FOTO_FRESAS,
      fotoReferencia: true,
      fondo: "#f6c9d8"
    },

    /* ---------- Pavés ---------- */
    {
      id: "pave-klim",
      categoria: "paves",
      nombre: "Pavé de leche Klim",
      descripcion: "Capas de nuestra crema secreta con galletas Ducales, coronado con leche Klim.",
      tamanos: VASO(13000),
      ilustracion: { tipo: "pave", capa: "galleta", topping: "klim", fondo: "#e3e6d4" }
    },
    {
      id: "pave-milo",
      categoria: "paves",
      nombre: "Pavé de Milo",
      descripcion: "Capas de nuestra crema secreta con crumble de Milo, coronado con galletas de Milo trituradas.",
      tamanos: VASO(13000),
      ilustracion: { tipo: "pave", capa: "milo", topping: "milo", fondo: "#f1d9c4" }
    },
    {
      id: "pave-oblea",
      categoria: "paves",
      nombre: "Pavé de oblea",
      descripcion: "Capas de nuestra crema secreta con oblea y mermelada de mora, coronado con queso fresco.",
      etiqueta: "Especial de la casa",
      tamanos: VASO(14000),
      ilustracion: { tipo: "pave", capa: "oblea", topping: "queso", fondo: "#ffd9e8" }
    },

    /* ---------- Cheesecakes ---------- */
    {
      id: "cheesecake-frutos-rojos",
      categoria: "cheesecakes",
      nombre: "Cheesecake de frutos rojos",
      descripcion: "Base de galleta de la casa, nuestra crema especial y mermelada de frutos rojos.",
      etiqueta: "A bocados",
      tamanos: PORCION(13000),
      ilustracion: { tipo: "porcion", salsa: "#fff1d6", cobertura: "#b0213a", fondo: "#ffd9e8" }
    },
    {
      id: "cheesecake-oreo",
      categoria: "cheesecakes",
      nombre: "Cheesecake de Oreo",
      descripcion: "Base de galleta Oreo, nuestra crema especial y ganache de chocolate, coronado con galleta Oreo y chantilly de la casa.",
      tamanos: PORCION(14000),
      ilustracion: { tipo: "porcion", salsa: "#fff6ea", cobertura: "#3b2620", base: "#2b2422", extra: "oreo", fondo: "#e3e6d4" }
    },

    /* ---------- Mini donas ---------- */
    {
      id: "mini-donas-honey",
      categoria: "donas",
      nombre: "Mini donas Honey",
      descripcion: "Mini donas frescas con crema de la casa, fresas frescas y salsa de fresa. Agrégales tus toppings favoritos.",
      tamanos: PORCION(14000),
      adiciones: "donas",
      ilustracion: { tipo: "donas", fondo: "#fbe7b8" }
    },

    /* ---------- Galletas y alfajores ---------- */
    {
      id: "galletas-mini-chips",
      categoria: "galletas",
      nombre: "Galletas mini de chips de chocolate",
      descripcion: "Galletas mini con chips de chocolate. Puedes agregarles topping de arequipe.",
      tamanos: PAQUETE(10000),
      adiciones: "galletaChips",
      ilustracion: { tipo: "galleta", salsa: "#e2b06a", chips: "#4a2414", fondo: "#fbe7b8" }
    },
    {
      id: "galletas-mini-red-velvet",
      categoria: "galletas",
      nombre: "Galletas mini red velvet",
      descripcion: "Galletas mini red velvet. Puedes agregarles topping de frosting de queso crema.",
      tamanos: PAQUETE(11000),
      adiciones: "galletaRedVelvet",
      ilustracion: { tipo: "galleta", salsa: "#b3263a", chips: "#fffaf2", fondo: "#e3e6d4" }
    },
    {
      id: "galletas-mini-klim",
      categoria: "galletas",
      nombre: "Galletas mini de leche Klim",
      descripcion: "Galletas mini de leche Klim.",
      tamanos: PAQUETE(10000),
      ilustracion: { tipo: "galleta", salsa: "#f3dfb0", chips: "#fffaf2", fondo: "#ffd9e8" }
    },
    {
      id: "alfajores-arequipe",
      categoria: "galletas",
      nombre: "Alfajores de arequipe",
      descripcion: "Alfajores de maicena con relleno de arequipe y bordeado de coco.",
      tamanos: PAQUETE(12000),
      ilustracion: { tipo: "alfajor", fondo: "#f1d9c4" }
    },

    /* ---------- Tortas ---------- */
    {
      id: "torta-chocolate-honey",
      categoria: "tortas",
      nombre: "Torta de chocolate Honey",
      descripcion: "Nuestra torta de chocolate de la casa.",
      tamanos: TORTAS(55000, 95000, 140000),
      encargo: true,
      notaPlaceholder: NOTA_TORTA,
      ilustracion: { tipo: "torta", salsa: "#6b3a22", relleno: "#fffaf2", cobertura: "#4a2414", fondo: "#ffd9e8" }
    },
    {
      id: "torta-red-velvet",
      categoria: "tortas",
      nombre: "Torta Red Velvet",
      descripcion: "Nuestra torta red velvet.",
      tamanos: TORTAS(60000, 105000, 150000),
      encargo: true,
      notaPlaceholder: NOTA_TORTA,
      ilustracion: { tipo: "torta", salsa: "#b3263a", relleno: "#fffaf2", cobertura: "#fffaf2", topping: "migas", fondo: "#e3e6d4" }
    },
    {
      id: "torta-naranja",
      categoria: "tortas",
      nombre: "Torta de naranja",
      descripcion: "Nuestra torta de naranja.",
      tamanos: TORTAS(50000, 90000, 130000),
      encargo: true,
      notaPlaceholder: NOTA_TORTA,
      ilustracion: { tipo: "torta", salsa: "#f2b24b", relleno: "#fff1d0", cobertura: "#ffd98a", topping: "naranja", fondo: "#fbe7b8" }
    },
    {
      id: "torta-tres-leches",
      categoria: "tortas",
      nombre: "Torta tres leches",
      descripcion: "Nuestra torta tres leches.",
      tamanos: TORTAS(45000, 80000, 120000),
      encargo: true,
      notaPlaceholder: NOTA_TORTA,
      ilustracion: { tipo: "torta", salsa: "#f6e2b3", relleno: "#fff1d0", cobertura: "#fffaf2", topping: "merengue", fondo: "#f1d9c4" }
    },

    /* ---------- Temporada ---------- */
    {
      id: "torta-envinada-hony",
      categoria: "temporada",
      nombre: "Torta envinada Hony",
      descripcion: "Nuestra torta de temporada para noviembre y diciembre.",
      etiqueta: "Nov – Dic",
      tamanos: TORTAS(60000, 105000, 150000),
      encargo: true,
      temporada: { desde: "11-01", hasta: "12-31", texto: "Disponible en noviembre y diciembre" },
      notaPlaceholder: NOTA_TORTA,
      imagen: "assets/img/mascota-diciembre.webp",
      fondo: "#1a2738"
    }
  ];
})();
