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
               la foto del producto).
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
  // Toppings de las fresas con crema: cada porción suma $2.000.
  // max: porciones máximas de ese topping en un vaso.
  // limite: { desde, otros } → desde esa cantidad de ese topping, se permiten como máximo
  //         `otros` porciones de los demás toppings (otros: 0 = va solo).
  fresas: {
    texto: "✨ ¡Llévalo al siguiente nivel! Añade tus toppings favoritos y crea una combinación deliciosa, crujiente y llena de sabor.💜",
    items: [
      { id: "f-queso", nombre: "Queso", icono: "queso", precio: 2000, max: 2, limite: { desde: 2, otros: 1 } },
      { id: "f-chocoramo", nombre: "Chocoramo", icono: "chocoramo", precio: 2000, max: 2, limite: { desde: 2, otros: 0 } },
      { id: "f-piazza", nombre: "Piazza", icono: "piazza", precio: 2000, max: 2, limite: { desde: 2, otros: 0 } },
      { id: "f-oreo", nombre: "Oreo", icono: "oreo", precio: 2000, max: 2, limite: { desde: 2, otros: 0 } } // ya viene en la base
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
          { id: "oreo", nombre: "Oreo" },
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
    }
  ];
})();
