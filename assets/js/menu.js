/* =========================================================
   Honeymoon · Menú
   Precios en pesos colombianos (COP), tomados del menú oficial.

   Campos de cada producto:
   - tamanos: lista de tamaños con precio (si hay uno solo, no se muestra selector).
              Un tamaño puede llevar `detalle` (ej. "Pequeña"), `encargo: true` e `imagen`
              (foto de ese tamaño: en el detalle, la foto cambia al elegirlo).
   - adiciones: nombre del grupo de HM_ADICIONES que acepta (toppings con precio y cantidad;
                cada topping tiene `max` y, opcional, `limite`, `icono` y `foto`)
   - eleccion: { titulo, detalle, opciones: [{ id, nombre, imagen?, fotoNota?, posicion?, ilustracion? }] }
               → el cliente elige una opción incluida en el precio (ej. el topping del paveé).
               Si la opción trae `imagen`, la foto del detalle cambia al elegirla (si no, se usa
               la foto del producto). La tarjeta del menú muestra la foto del producto.
               Si una opción trae `precio`, ese es el precio del producto con esa opción
               (ej. el relleno de una torta): la tarjeta lista cada opción con su precio.
               Con varios tamaños, `precios: { idTamaño: precio }` da el precio de la opción
               en cada tamaño (ej. Berry Love: 1 Lb, ½ Lb y 10 cm).
   - eleccion.soloTamanos: ["idTamaño"] → la opción solo se elige en esos tamaños
     (ej. el relleno de Berry Love, solo en la mini torta de 10 cm).
   - categoria: "tortas" → el producto sale en esa sección de la página (sin categoría, en el menú).
   - aviso: texto que se muestra en el detalle (ej. cómo enviar las fotos de la torta).
   - galeria (producto, tamaño u opción, junto a `imagen`): [{ imagen, posicion? }] → fotos extra;
             en el detalle salen miniaturas para pasar de una foto a otra.
   - armar: { titulo, receta, base } → muestra "Así va tu vaso": un vaso dibujado que se llena
            con las capas de `receta` (ver vaso.js), crece con el tamaño y recibe los toppings
            que el cliente agrega (se dibujan con el `icono` de cada topping).
   - encargo: true si todo el producto se hace por encargo (ver diasEncargo en config.js)
   - temporada: { desde: "MM-DD", hasta: "MM-DD", texto } → solo se puede pedir en esas fechas
   - ilustracion: dibujo generado (tipo, colores, topping)  ó  imagen: ruta a una foto
   - fotoReferencia: true muestra la etiqueta "Foto de referencia" sobre la imagen;
     fotoNota: "texto" muestra ese texto en su lugar (ej. qué topping sale en la foto)
   - posicion (producto o tamaño): encuadre de la foto si el producto no queda centrado,
     ej. "center 70%" (por defecto "center 60%")
   - notaPlaceholder: texto de ejemplo para la nota del producto
   - destacado: true para mostrarlo en una tarjeta ancha (foto a un lado)
   - disponible: false para mostrarlo como "Próximamente"
   ========================================================= */
window.HM_ADICIONES = {
  // Toppings de las fresas con crema: cada porción suma su precio ($2.000; la cobertura $3.000).
  // max: porciones máximas de ese topping en un vaso.
  // limite: { desde, otros } → desde esa cantidad de ese topping, se permiten como máximo
  //         `otros` porciones de los demás toppings (otros: 0 = va solo).
  // independiente: true → no cuenta para los límites de los demás (ej. la cobertura va en el vaso).
  // corto: nombre corto para la tarjeta; detalle: texto bajo el nombre en el detalle.
  fresas: {
    texto: "✨ ¡Llévalo al siguiente nivel! Añade tus toppings favoritos y crea una combinación deliciosa, crujiente y llena de sabor.💜",
    items: [
      { id: "f-queso", nombre: "Queso", icono: "queso", precio: 2000, max: 2, limite: { desde: 2, otros: 1 } },
      { id: "f-chocoramo", nombre: "Chocoramo", icono: "chocoramo", precio: 2000, max: 2, limite: { desde: 2, otros: 0 } },
      { id: "f-piazza", nombre: "Piazza", icono: "piazza", precio: 2000, max: 2, limite: { desde: 2, otros: 0 } },
      { id: "f-oreo", nombre: "Oreo", icono: "oreo", precio: 2000, max: 2, limite: { desde: 2, otros: 0 } }, // ya viene en la base
      { id: "f-cobertura", nombre: "Cobertura de chocolate", corto: "Cobertura", detalle: "En el vaso", icono: "cobertura", precio: 3000, max: 1, independiente: true }
    ]
  }
};

(function () {
  const FONDO = "#f1e1ef";

  window.HM_MENU = [
    {
      id: "fresas-con-crema",
      nombre: "Fresas con crema",
      descripcion: "🍓Capas de nuestra crema suave y cremosa, fresas frescas, glaseado de fresa, dulce de leche, leche condensada y galleta Oreo. ¡Una combinación dulce e irresistible que puedes personalizar con tu topping favorito!",
      tamanos: [
        { id: "9oz", nombre: "9 onz", detalle: "Pequeña", precio: 14000, imagen: "assets/img/fresas-9onz.webp", posicion: "center 70%" },
        { id: "12oz", nombre: "12 onz", detalle: "Mediana", precio: 18000, imagen: "assets/img/fresas-12onz.webp", posicion: "center 70%" }
      ],
      adiciones: "fresas",
      armar: {
        titulo: "Así va tu vaso",
        receta: ["crema", "fresas", "crema", "fresas", "glaseado", "dulce", "condensada", "oreo"],
        base: "Crema, fresas, glaseado de fresa, dulce de leche, leche condensada y Oreo"
      },
      destacado: true, // tarjeta ancha, primera del menú
      imagen: "assets/img/fresas-9onz.webp", // foto real (vaso de 9 onz)
      posicion: "center 70%",
      fondo: FONDO
    },
    {
      id: "pave",
      nombre: "Paveé",
      descripcion: "🥄Capas de galleta Ducales, nuestra crema suave y leche Klim en un cuchareable de 9 onz. ¡Corónalo con tu topping favorito, Oreo, untable de Milo o leche Klim, y disfruta cada cucharada!",
      tamanos: [{ id: "9oz", nombre: "9 Onz", detalle: "Cuchareable", precio: 16000 }],
      eleccion: {
        titulo: "Topping",
        detalle: "Topping incluido: Oreo, Untable de Milo o Leche Klim",
        opciones: [
          {
            id: "oreo", nombre: "Oreo", imagen: "assets/img/pave-oreo.webp", fotoNota: "Foto: con topping de Oreo", posicion: "center 55%",
            galeria: [{ imagen: "assets/img/pave-oreo-arriba.webp", posicion: "center 55%" }] // vista desde arriba
          },
          { id: "milo", nombre: "Untable de Milo", imagen: "assets/img/pave-milo.webp", fotoNota: "Foto: con topping de Untable de Milo", posicion: "center 62%" },
          { id: "klim", nombre: "Leche Klim", imagen: "assets/img/pave-klim.webp", fotoNota: "Foto: con topping de leche Klim" }
        ]
      },
      // Foto de la tarjeta y de las opciones sin foto propia (Oreo)
      imagen: "assets/img/pave-milo.webp",
      fotoNota: "Foto: con topping de Untable de Milo",
      posicion: "center 62%"
    },
    {
      id: "galletas",
      nombre: "Galletas",
      descripcion: "🍪Galletas mini con chips de chocolate, en bolsita de 150 g y con un vasito de chocolate tipo Nutella para acompañarlas. ¡Pequeñitas, irresistibles y perfectas para compartir… o no!",
      tamanos: [{ id: "bolsita", nombre: "Bolsita 150 g", detalle: "Mini chips de chocolate", precio: 15000 }],
      imagen: "assets/img/galletas-mini.webp", // bolsitas con el sticker y galletas mini
      posicion: "center 62%"
    },
    {
      id: "mini-donas",
      nombre: "Mini donas",
      descripcion: "🍩Vaso de 12 onz con 7 mini donitas cubiertas de chocolate y chispitas de colores. ¡Un antojo dulce y divertido, perfecto para cualquier momento del día!",
      tamanos: [{ id: "vaso", nombre: "Vaso 12 onz", detalle: "7 mini donitas", precio: 15000 }],
      imagen: "assets/img/mini-donas.webp", // foto real del vaso de 12 onz con tapa de domo
      posicion: "center 80%"
    },

    /* ===== Tortas (sección "Tortas") =====
       Solo pequeñas y por porción. La mini torta de 10 cm es por encargo (diasEncargo, hoy 2 días);
       la porción no. */
    {
      id: "torta-choco-moon",
      categoria: "tortas",
      nombre: "Choco Moon",
      nombreCompleto: "Torta Choco Moon",
      descripcion: "🍫 Torta de chocolate con relleno de ganache de chocolate y cobertura de chocolate. ¡Para los verdaderos amantes del chocolate! 🤎✨",
      tamanos: [
        { id: "10cm", nombre: "Mini torta 10 cm", detalle: "2 a 4 porciones", precio: 50000, encargo: true },
        { id: "porcion", nombre: "Porción", precio: 18000 }
      ],
      imagen: "assets/img/torta-choco-moon.webp",
      posicion: "center 66%"
    },
    {
      id: "torta-caramel-crunch",
      categoria: "tortas",
      nombre: "Caramel Crunch",
      nombreCompleto: "Torta Caramel Crunch",
      descripcion: "🤎 Bizcocho de vainilla con relleno de dulce de leche, cobertura de dulce de leche y coronado con maní. ¡Una combinación irresistible para los amantes de lo dulce! ✨",
      tamanos: [
        { id: "10cm", nombre: "Mini torta 10 cm", detalle: "2 a 4 porciones", precio: 45000, encargo: true },
        { id: "porcion", nombre: "Porción", precio: 17000 }
      ],
      imagen: "assets/img/torta-caramel-crunch.webp",
      posicion: "center 60%"
    },
    {
      id: "torta-berry-love",
      categoria: "tortas",
      nombre: "Berry Love",
      nombreCompleto: "Torta Berry Love",
      descripcion: "💜 Bizcocho de vainilla con cobertura de buttercream. En la mini torta de 10 cm eliges el relleno: fresas con crema, Oreo o dulce de leche. La porción va con relleno de Oreo. ✨",
      tamanos: [
        { id: "10cm", nombre: "Mini torta 10 cm", detalle: "2 a 4 porciones", precio: 45000, encargo: true },
        { id: "porcion", nombre: "Porción", detalle: "Relleno de Oreo", precio: 17000 }
      ],
      // El relleno solo se elige en la mini torta de 10 cm
      eleccion: {
        titulo: "Relleno",
        detalle: "Elige uno",
        soloTamanos: ["10cm"],
        opciones: [
          { id: "fresas", nombre: "Fresas con crema" },
          { id: "oreo", nombre: "Oreo" },
          { id: "dulce", nombre: "Dulce de leche" }
        ]
      },
      notaPlaceholder: "Ej: nombre, motivo de la celebración…",
      imagen: "assets/img/torta-berry-love.webp",
      fotoNota: "Foto: relleno de fresas con crema",
      posicion: "center 60%",
      galeria: [{ imagen: "assets/img/torta-berry-love-corte.webp", posicion: "center 50%" }]
    }
  ];
})();
