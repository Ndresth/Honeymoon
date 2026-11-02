/* =========================================================
   Honeymoon · Menú
   Precios en pesos colombianos (COP), tomados del menú oficial.

   Campos de cada producto:
   - tamanos: lista de tamaños con precio (si hay uno solo, no se muestra selector).
              Un tamaño puede llevar `detalle` (ej. "Pequeña"), `encargo: true` e `imagen`
              (foto de ese tamaño: en el detalle, la foto cambia al elegirlo).
   - adiciones: nombre del grupo de HM_ADICIONES que acepta (toppings con precio y cantidad;
                cada topping tiene `max` y, opcional, `limite`, `icono` y `foto`)
   - eleccion: { titulo, detalle, opciones: [{ id, nombre, ilustracion? }] } → el cliente elige
               una opción incluida en el precio (ej. el topping del paveé). Si la opción trae
               `ilustracion`, el dibujo cambia al elegirla.
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
      destacado: true, // tarjeta ancha, primera del menú
      imagen: "assets/img/fresas-9onz.webp", // foto real (vaso de 9 onz)
      posicion: "center 70%",
      fondo: FONDO
    },
    {
      id: "pave",
      nombre: "Paveé",
      descripcion: "Paveé en cuchareable de 9 Onz con nuestra crema suave, Capas de galleta Ducales, leche Klim y coronado con el topping de tu preferencia.",
      tamanos: [{ id: "9oz", nombre: "9 Onz", detalle: "Cuchareable", precio: 16000 }],
      eleccion: {
        titulo: "Topping",
        detalle: "Topping incluido: Oreo, Untable de Milo o Leche Klim",
        opciones: [
          { id: "oreo", nombre: "Oreo" },
          { id: "milo", nombre: "Untable de Milo" },
          { id: "klim", nombre: "Leche Klim" }
        ]
      },
      imagen: "assets/img/pave-klim.webp",
      fotoNota: "Foto: con topping de leche Klim"
    },
    {
      id: "galletas",
      nombre: "Galletas",
      descripcion: "Galletas mini con chips de chocolate, en bolsita de 150 g, con un vasito de chocolate tipo Nutella.",
      tamanos: [{ id: "bolsita", nombre: "Bolsita 150 g", detalle: "Mini chips de chocolate", precio: 15000 }],
      imagen: "assets/img/galletas-mini.webp",
      posicion: "center 54%"
    },
    {
      id: "mini-donas",
      nombre: "Mini donas",
      descripcion: "Vaso de 12 onz con 7 mini donitas.",
      tamanos: [{ id: "vaso", nombre: "Vaso 12 onz", detalle: "7 mini donitas", precio: 15000 }],
      ilustracion: { tipo: "donas", fondo: "#cdaee8" } // dibujo del vaso con las 7 donitas (sin foto real aún)
    }
  ];
})();
