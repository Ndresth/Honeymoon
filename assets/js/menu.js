/* =========================================================
   Honeymoon · Menú
   Precios en pesos colombianos (COP), tomados del menú oficial.

   Campos de cada producto:
   - tamanos: lista de tamaños con precio (si hay uno solo, no se muestra selector).
              Un tamaño puede llevar `detalle` (ej. "Pequeña") y `encargo: true`.
   - adiciones: nombre del grupo de HM_ADICIONES que acepta (toppings con precio, se eligen varios)
   - eleccion: { titulo, detalle, opciones: [{ id, nombre, ilustracion? }] } → el cliente elige
               una opción incluida en el precio (ej. el topping del pavé). Si la opción trae
               `ilustracion`, el dibujo cambia al elegirla.
   - encargo: true si todo el producto se hace por encargo (ver diasEncargo en config.js)
   - temporada: { desde: "MM-DD", hasta: "MM-DD", texto } → solo se puede pedir en esas fechas
   - ilustracion: dibujo generado (tipo, colores, topping)  ó  imagen: ruta a una foto
   - fotoReferencia: true muestra la etiqueta "Foto de referencia" sobre la imagen
   - notaPlaceholder: texto de ejemplo para la nota del producto
   - disponible: false para mostrarlo como "Próximamente"
   ========================================================= */
window.HM_ADICIONES = {
  // Toppings de las fresas con crema: cada uno suma $2.000
  fresas: [
    { id: "f-queso", nombre: "Queso", precio: 2000 },
    { id: "f-chocoramo", nombre: "Chocoramo", precio: 2000 },
    { id: "f-piazza", nombre: "Piazza", precio: 2000 },
    { id: "f-oreo", nombre: "Oreo", precio: 2000 }
  ]
};

(function () {
  const FONDO = "#f1e1ef";
  const pave = (topping) => ({ tipo: "pave", capa: "galleta", topping, fondo: "#ecd6e9" });

  window.HM_MENU = [
    {
      id: "fresas-con-crema",
      nombre: "Fresas con crema",
      descripcion: "Fresas con crema en vaso. Elige tu tamaño y agrégale los toppings que quieras.",
      tamanos: [
        { id: "9oz", nombre: "9 onz", detalle: "Pequeña", precio: 14000 },
        { id: "12oz", nombre: "12 onz", detalle: "Mediana", precio: 18000 }
      ],
      adiciones: "fresas",
      imagen: "assets/img/fresas-con-crema.webp", // foto real, con toppings de queso y Oreo
      fotoReferencia: true,
      fondo: FONDO
    },
    {
      id: "pave",
      nombre: "Pavé",
      descripcion: "Pavé en vaso de 12 onz, coronado con el topping que elijas.",
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
