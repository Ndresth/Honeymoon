/* =========================================================
   Honeymoon · Configuración del negocio
   Edita este archivo para cambiar número, horarios y domicilios.
   ========================================================= */
window.HM_CONFIG = {
  negocio: "Honeymoon",
  ciudad: "Barranquilla",
  // Redes sociales: id = nombre del ícono de Bootstrap Icons (bi-instagram, bi-tiktok...)
  redes: [
    { id: "instagram", nombre: "Instagram", usuario: "l.hooneymoonn", url: "https://www.instagram.com/l.hooneymoonn/" },
    { id: "tiktok", nombre: "TikTok", usuario: "honeymoonpostres", url: "https://www.tiktok.com/@honeymoonpostres" }
  ],

  // WhatsApp del negocio: código de país (57) + número, sin espacios ni "+".
  whatsapp: "573001233575",

  // Pon true cuando los precios y tamaños de menu.js sean los reales:
  // quita el aviso "Precios de referencia" y la nota en el mensaje de WhatsApp.
  preciosConfirmados: false,

  // Horario de atención (hora de Colombia). 0 = domingo ... 6 = sábado. null = cerrado.
  horario: {
    0: [14, 22],
    1: null,
    2: [14, 21],
    3: [14, 21],
    4: [14, 21],
    5: [14, 22],
    6: [14, 22]
  },
  horarioTexto: [
    "Martes a jueves · 2:00 p. m. – 9:00 p. m.",
    "Viernes a domingo · 2:00 p. m. – 10:00 p. m.",
    "Lunes · descansamos"
  ],

  // Zonas de domicilio (valores de prueba, ajústalos a tus tarifas reales).
  // Zonas de domicilio. El valor del domicilio se confirma por WhatsApp según el barrio.
  zonas: [
    { id: "riomar", nombre: "Riomar" },
    { id: "norte-centro", nombre: "Norte – Centro Histórico" },
    { id: "suroccidente", nombre: "Suroccidente" },
    { id: "metropolitana", nombre: "Metropolitana" },
    { id: "suroriente", nombre: "Suroriente" },
    { id: "puerto-colombia", nombre: "Puerto Colombia" },
    { id: "soledad", nombre: "Soledad" }
  ],

  // Punto de recogida (de prueba).
  puntoRecogida: "Barranquilla · dirección por confirmar",

  metodosPago: ["Efectivo", "Nequi", "Daviplata", "Transferencia Bancolombia"],

  // Días de anticipación para productos por encargo (tortas, cheesecake entero...).
  diasEncargo: 2
};
