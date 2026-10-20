/* =========================================================
   Honeymoon · Menú
   Precios en pesos colombianos (COP), tomados del menú oficial.

   Campos de cada producto:
   - tamanos: lista de tamaños con precio (si hay uno solo, no se muestra selector).
              Un tamaño puede llevar `detalle` (ej. "Pequeña") y `encargo: true`.
   - adiciones: nombre del grupo de HM_ADICIONES que acepta (toppings con precio y cantidad;
                cada topping tiene `max` y, opcional, `limite` y `foto`)
   - eleccion: { titulo, detalle, opciones: [{ id, nombre, ilustracion? }] } → el cliente elige
               una opción incluida en el precio (ej. el topping del paveé). Si la opción trae
               `ilustracion`, el dibujo cambia al elegirla.
   - encargo: true si todo el producto se hace por encargo (ver diasEncargo en config.js)
   - temporada: { desde: "MM-DD", hasta: "MM-DD", texto } → solo se puede pedir en esas fechas
   - ilustracion: dibujo generado (tipo, colores, topping)  ó  imagen: ruta a una foto
   - fotoReferencia: true muestra la etiqueta "Foto de referencia" sobre la imagen
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
      { id: "f-queso", nombre: "Queso", precio: 2000, max: 2, limite: { desde: 2, otros: 1 } },
      { id: "f-chocoramo", nombre: "Chocoramo", precio: 2000, max: 2, limite: { desde: 2, otros: 0 } },
      { id: "f-piazza", nombre: "Piazza", precio: 2000, max: 2, limite: { desde: 2, otros: 0 } },
      { id: "f-oreo", nombre: "Oreo", precio: 2000, max: 3, limite: { desde: 2, otros: 0 } }
    ]
  }
};

(function () {
  const FONDO = "#f1e1ef";
  const pave = (topping) => ({ tipo: "pave", capa: "galleta", topping, fondo: "#ecd6e9" });

  window.HM_MENU = [
    {
      id: "fresas-con-crema",
      nombre: "Fresas con crema",
      descripcion: "🍓Capas de nuestra crema suave y cremosa, fresas frescas, glaseado de fresa, dulce de leche y leche condensada. ¡Una combinación dulce e irresistible que puedes personalizar con tu topping favorito!",
      tamanos: [
        { id: "9oz", nombre: "9 onz", detalle: "Pequeña", precio: 14000 },
        { id: "12oz", nombre: "12 onz", detalle: "Mediana", precio: 18000 }
      ],
      adiciones: "fresas",
      destacado: true, // tarjeta ancha, primera del menú
      imagen: "assets/img/fresas-con-crema.webp", // foto real, con toppings de queso y Oreo
      fotoReferencia: true,
      fondo: FONDO
    },
    {
      id: "pave",
      nombre: "Paveé",
      descripcion: "Paveé en vaso de 12 onz, coronado con el topping que elijas.",
      tamanos: [{ id: "12oz", nombre: "12 onz", detalle: "Mediano", precio: 16000 }],
      eleccion: {
        titulo: "Topping",
        detalle: "Incluido · elige uno",
        opciones: [
          { id: "oreo", nombre: "Galleta Oreo", ilustracion: pave("oreo") },
          { id: "milo", nombre: "Galleta Milo", ilustracion: pave("milo") },
          { id: "klim", nombre: "Leche Klim", ilustracion: pave("klim") }
        ]
      },
      ilustracion: pave("oreo")
    },
    {
      id: "galletas",
      nombre: "Galletas",
      descripcion: "Galletas mini con chips de chocolate, en bolsita de 150 g.",
      tamanos: [{ id: "bolsita", nombre: "Bolsita 150 g", detalle: "Mini chips de chocolate", precio: 15000 }],
      ilustracion: { tipo: "bolsita", fondo: "#f3e4f1" }
    },
    {
      id: "mini-donas",
      nombre: "Mini donas",
      descripcion: "Vaso de 12 onz con 7 mini donitas.",
      tamanos: [{ id: "vaso", nombre: "Vaso 12 onz", detalle: "7 mini donitas", precio: 15000 }],
      ilustracion: { tipo: "donas", fondo: "#e9d2e6" }
    }
  ];
})();
