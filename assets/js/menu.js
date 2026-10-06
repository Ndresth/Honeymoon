/* =========================================================
   Honey Moon · Menú de prueba (repostería)
   Precios en pesos colombianos (COP). Edita libremente.

   Campos de cada producto:
   - tamanos: lista de tamaños con precio (si hay uno solo, no se muestra selector).
              Un tamaño puede llevar `detalle` (ej. "12 porciones") y `encargo: true`.
   - adiciones: nombre del grupo de HM_ADICIONES que acepta ("postres", "tortas"...)
   - encargo: true si todo el producto se hace por encargo (ver diasEncargo en config.js)
   - cotizar: true para productos que se cotizan por WhatsApp (no van al carrito)
   - ilustracion: dibujo generado (tipo, colores, topping)  ó  imagen: ruta a una foto
   - notaPlaceholder: texto de ejemplo para la nota del producto
   - disponible: false para mostrarlo como "Próximamente"
   ========================================================= */
window.HM_CATEGORIAS = [
  { id: "todos", nombre: "Todo", icono: "bi-stars" },
  { id: "tortas", nombre: "Tortas", icono: "bi-cake" },
  { id: "cupcakes", nombre: "Cupcakes", icono: "bi-cake2" },
  { id: "horneados", nombre: "Brownies y galletas", icono: "bi-cookie" },
  { id: "postres", nombre: "Fresas y postres", icono: "bi-heart" },
  { id: "bebidas", nombre: "Bebidas", icono: "bi-cup-straw" },
  { id: "temporada", nombre: "Temporada", icono: "bi-moon-stars" }
];

window.HM_ADICIONES = {
  postres: [
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
  ],
  tortas: [
    { id: "velas", nombre: "Velas de cumpleaños", precio: 3000 },
    { id: "tarjeta", nombre: "Tarjeta con dedicatoria", precio: 3000 },
    { id: "fresas-deco", nombre: "Decoración con fresas", precio: 8000 },
    { id: "topper", nombre: "Topper personalizado", precio: 12000 }
  ]
};

(function () {
  const VASOS = (p9, p12, p16) => [
    { id: "9oz", nombre: "9 oz", precio: p9 },
    { id: "12oz", nombre: "12 oz", precio: p12 },
    { id: "16oz", nombre: "16 oz", precio: p16 }
  ];
  const TORTAS = (mini, mediana, grande) => [
    { id: "mini", nombre: "Mini", detalle: "6 porciones", precio: mini },
    { id: "mediana", nombre: "Mediana", detalle: "12 porciones", precio: mediana },
    { id: "grande", nombre: "Grande", detalle: "20 porciones", precio: grande }
  ];
  const CAJAS = (unidad, x4, x6) => [
    { id: "unidad", nombre: "Unidad", precio: unidad },
    { id: "caja4", nombre: "Caja x4", precio: x4 },
    { id: "caja6", nombre: "Caja x6", precio: x6 }
  ];
  const NOTA_TORTA = "Ej: escribir «Feliz cumpleaños, Ana»";

  window.HM_MENU = [
    /* ---------- Tortas ---------- */
    {
      id: "torta-chocolate",
      categoria: "tortas",
      nombre: "Torta Chocolate Honey",
      descripcion: "Bizcocho de chocolate húmedo, relleno de crema, ganache y fresas frescas.",
      etiqueta: "Más pedida",
      tamanos: TORTAS(55000, 95000, 140000),
      encargo: true,
      adiciones: "tortas",
      notaPlaceholder: NOTA_TORTA,
      ilustracion: { tipo: "torta", salsa: "#6b3a22", relleno: "#fffaf2", cobertura: "#4a2414", fondo: "#ffd9e8" }
    },
    {
      id: "torta-red-velvet",
      categoria: "tortas",
      nombre: "Red Velvet",
      descripcion: "Bizcocho red velvet con capas de frosting de queso crema.",
      tamanos: TORTAS(60000, 105000, 150000),
      encargo: true,
      adiciones: "tortas",
      notaPlaceholder: NOTA_TORTA,
      ilustracion: { tipo: "torta", salsa: "#b3263a", relleno: "#fffaf2", cobertura: "#fffaf2", topping: "migas", fondo: "#e3e6d4" }
    },
    {
      id: "torta-zanahoria",
      categoria: "tortas",
      nombre: "Torta de zanahoria",
      descripcion: "Con nueces, canela y frosting de queso crema.",
      tamanos: TORTAS(50000, 90000, 130000),
      encargo: true,
      adiciones: "tortas",
      notaPlaceholder: NOTA_TORTA,
      ilustracion: { tipo: "torta", salsa: "#d98c3f", relleno: "#fffaf2", cobertura: "#fffaf2", topping: "zanahoria", fondo: "#fbe7b8" }
    },
    {
      id: "torta-tres-leches",
      categoria: "tortas",
      nombre: "Tres leches",
      descripcion: "Bizcocho bañado en tres leches, con merengue y canela.",
      tamanos: TORTAS(45000, 80000, 120000),
      encargo: true,
      adiciones: "tortas",
      notaPlaceholder: NOTA_TORTA,
      ilustracion: { tipo: "torta", salsa: "#f6e2b3", relleno: "#fff1d0", cobertura: "#fffaf2", topping: "merengue", fondo: "#f1d9c4" }
    },
    {
      id: "cheesecake",
      categoria: "tortas",
      nombre: "Cheesecake de frutos rojos",
      descripcion: "Base de galleta, crema de queso horneada y salsa de frutos rojos.",
      tamanos: [
        { id: "porcion", nombre: "Porción", precio: 12000 },
        { id: "entero", nombre: "Entero", detalle: "8 porciones", precio: 85000, encargo: true }
      ],
      ilustracion: { tipo: "porcion", salsa: "#fff1d6", cobertura: "#b0213a", fondo: "#ffd9e8" }
    },
    {
      id: "torta-personalizada",
      categoria: "tortas",
      nombre: "Torta personalizada",
      descripcion: "Temática para cumpleaños, baby shower o grados. Cuéntanos tu idea y te cotizamos.",
      etiqueta: "Para eventos",
      tamanos: [{ id: "cotizar", nombre: "Desde", precio: 150000 }],
      cotizar: true,
      ilustracion: { tipo: "torta", salsa: "#f7b6cf", relleno: "#fffaf2", cobertura: "#ffc5de", velas: true, fondo: "#e3e6d4" }
    },

    /* ---------- Cupcakes ---------- */
    {
      id: "cupcake-honey",
      categoria: "cupcakes",
      nombre: "Cupcake Honey",
      descripcion: "Chocolate con frosting de vainilla y chips. El favorito de nuestro honguito.",
      etiqueta: "Favorito del honguito",
      tamanos: CAJAS(7000, 26000, 38000),
      ilustracion: { tipo: "cupcake", salsa: "#6b3a22", frosting: "#fffaf2", capsula: "#6b3a22", rayas: "#4a2414", fondo: "#ffd9e8" }
    },
    {
      id: "cupcake-fresa",
      categoria: "cupcakes",
      nombre: "Cupcake de fresa",
      descripcion: "Vainilla relleno de mermelada de fresa con frosting rosado.",
      tamanos: CAJAS(7000, 26000, 38000),
      ilustracion: { tipo: "cupcake", salsa: "#f3d3a0", frosting: "#ffc5de", fresa: true, fondo: "#e3e6d4" }
    },
    {
      id: "cupcake-red-velvet",
      categoria: "cupcakes",
      nombre: "Cupcake red velvet",
      descripcion: "Red velvet con frosting de queso crema.",
      tamanos: CAJAS(8000, 30000, 44000),
      ilustracion: { tipo: "cupcake", salsa: "#b3263a", frosting: "#fffaf2", capsula: "#b3263a", rayas: "#8f1c2c", fondo: "#fbe7b8" }
    },

    /* ---------- Brownies y galletas ---------- */
    {
      id: "brownie-clasico",
      categoria: "horneados",
      nombre: "Brownie clásico",
      descripcion: "Húmedo por dentro, crujiente por fuera, con trozos de chocolate.",
      tamanos: [
        { id: "unidad", nombre: "Unidad", precio: 6000 },
        { id: "caja6", nombre: "Caja x6", precio: 33000 }
      ],
      ilustracion: { tipo: "brownie", fondo: "#f1d9c4" }
    },
    {
      id: "brownie-nutella",
      categoria: "horneados",
      nombre: "Brownie con Nutella",
      descripcion: "Nuestro brownie relleno y cubierto de Nutella.",
      etiqueta: "Nuevo",
      tamanos: [
        { id: "unidad", nombre: "Unidad", precio: 8000 },
        { id: "caja6", nombre: "Caja x6", precio: 45000 }
      ],
      ilustracion: { tipo: "brownie", topping: "nutella", fondo: "#ffd9e8" }
    },
    {
      id: "galletas-chips",
      categoria: "horneados",
      nombre: "Galletas chips de chocolate",
      descripcion: "Grandes, doradas por fuera y suaves en el centro.",
      tamanos: [
        { id: "unidad", nombre: "Unidad", precio: 4500 },
        { id: "caja6", nombre: "Caja x6", precio: 25000 },
        { id: "caja12", nombre: "Caja x12", precio: 48000 }
      ],
      ilustracion: { tipo: "galleta", salsa: "#e2b06a", chips: "#4a2414", fondo: "#fbe7b8" }
    },
    {
      id: "galletas-red-velvet",
      categoria: "horneados",
      nombre: "Galletas red velvet",
      descripcion: "Red velvet con chips de chocolate blanco.",
      tamanos: [
        { id: "unidad", nombre: "Unidad", precio: 5000 },
        { id: "caja6", nombre: "Caja x6", precio: 28000 },
        { id: "caja12", nombre: "Caja x12", precio: 54000 }
      ],
      ilustracion: { tipo: "galleta", salsa: "#b3263a", chips: "#fffaf2", fondo: "#e3e6d4" }
    },
    {
      id: "alfajores",
      categoria: "horneados",
      nombre: "Alfajores de arequipe",
      descripcion: "De maicena, rellenos de arequipe y bordeados de coco.",
      tamanos: [
        { id: "caja6", nombre: "Caja x6", precio: 18000 },
        { id: "caja12", nombre: "Caja x12", precio: 34000 }
      ],
      ilustracion: { tipo: "alfajor", fondo: "#ffd9e8" }
    },

    /* ---------- Fresas y postres ---------- */
    {
      id: "clasica-honey",
      categoria: "postres",
      nombre: "Fresas con crema Honey",
      descripcion: "Fresas frescas, nuestra crema de la casa y un hilo de leche condensada.",
      etiqueta: "Clásico",
      tamanos: VASOS(12000, 15000, 19000),
      adiciones: "postres",
      ilustracion: { tipo: "vaso", salsa: "#fff1d0", fondo: "#ffd9e8" }
    },
    {
      id: "costena",
      categoria: "postres",
      nombre: "Fresas La Costeña",
      descripcion: "Fresas, crema, queso rallado y leche condensada. El clásico de Barranquilla.",
      etiqueta: "Bien barranquillera",
      tamanos: VASOS(13000, 16000, 20000),
      adiciones: "postres",
      ilustracion: { tipo: "vaso", salsa: "#fff1d0", topping: "queso", fondo: "#fbe7b8" }
    },
    {
      id: "nutella-moon",
      categoria: "postres",
      nombre: "Nutella Moon",
      descripcion: "Fresas, crema, Nutella por dentro y por encima, con almendras tostadas.",
      tamanos: VASOS(15000, 19000, 23000),
      adiciones: "postres",
      ilustracion: { tipo: "vaso", salsa: "#6b3a22", topping: "almendras", fondo: "#f1d9c4" }
    },
    {
      id: "oreo-crush",
      categoria: "postres",
      nombre: "Oreo Crush",
      descripcion: "Fresas, crema, galleta Oreo triturada y salsa de chocolate.",
      tamanos: VASOS(14000, 17000, 21000),
      adiciones: "postres",
      ilustracion: { tipo: "vaso", salsa: "#3b2620", topping: "oreo", fondo: "#e3e6d4" }
    },
    {
      id: "fresas-helado",
      categoria: "postres",
      nombre: "Fresas con helado",
      descripcion: "Fresas, crema y una bola de helado de vainilla encima.",
      tamanos: [
        { id: "12oz", nombre: "12 oz", precio: 16000 },
        { id: "16oz", nombre: "16 oz", precio: 20000 }
      ],
      adiciones: "postres",
      ilustracion: { tipo: "helado", salsa: "#e5412d", fondo: "#ffe0d6" }
    },
    {
      id: "waffle-fresas",
      categoria: "postres",
      nombre: "Waffle de fresas",
      descripcion: "Waffle recién hecho con fresas, crema de la casa y salsa de chocolate.",
      tamanos: [{ id: "unico", nombre: "Unidad", precio: 18000 }],
      adiciones: "postres",
      ilustracion: { tipo: "waffle", salsa: "#5a2d1c", fondo: "#fbe7b8" }
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
      ilustracion: { tipo: "malteada", salsa: "#f6a3c3", fondo: "#ffd9e8" }
    },
    {
      id: "frappe-fresas-crema",
      categoria: "bebidas",
      nombre: "Frappé fresas con crema",
      descripcion: "Granizado cremoso de fresa con chantilly y sirope de frutos rojos.",
      tamanos: [{ id: "16oz", nombre: "16 oz", precio: 14000 }],
      ilustracion: { tipo: "malteada", salsa: "#ef8fb1", fondo: "#f6e3e9" }
    },
    {
      id: "limonada-fresa",
      categoria: "bebidas",
      nombre: "Limonada de fresa",
      descripcion: "Limonada natural con fresas, bien fría para el calor de Barranquilla.",
      tamanos: [{ id: "16oz", nombre: "16 oz", precio: 9000 }],
      ilustracion: { tipo: "limonada", salsa: "#ffbfcf", fondo: "#e3e6d4" }
    },

    /* ---------- Temporada ---------- */
    {
      id: "vampi-cupcake",
      categoria: "temporada",
      nombre: "Vampi-Cupcake",
      descripcion: "Chocolate con corazón de frutos rojos y colmillos de chocolate blanco. Solo en octubre.",
      etiqueta: "Octubre",
      tamanos: [
        { id: "unidad", nombre: "Unidad", precio: 8000 },
        { id: "caja4", nombre: "Caja x4", precio: 30000 }
      ],
      imagen: "assets/img/mascota-octubre.webp",
      fondo: "#3a4e33"
    },
    {
      id: "navi-cupcake",
      categoria: "temporada",
      nombre: "Navi-Cupcake",
      descripcion: "Chocolate, canela y galleta de jengibre. Llega en diciembre.",
      etiqueta: "Diciembre",
      tamanos: [
        { id: "unidad", nombre: "Unidad", precio: 8000 },
        { id: "caja4", nombre: "Caja x4", precio: 30000 }
      ],
      imagen: "assets/img/mascota-diciembre.webp",
      fondo: "#1a2738",
      disponible: false
    }
  ];
})();
