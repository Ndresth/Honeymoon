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

  // true: los precios de menu.js son los del menú oficial. Con false sale el aviso
  // "Precios de referencia" y una nota en el mensaje de WhatsApp.
  preciosConfirmados: true,

  // Horario de atención (hora de Colombia). 0 = domingo ... 6 = sábado. null = cerrado.
  // Horas en decimal: 13.5 = 1:30 p. m., 19.25 = 7:15 p. m.
  horario: {
    0: [13.5, 19.25],
    1: [13.5, 19.25],
    2: [13.5, 19.25],
    3: [13.5, 19.25],
    4: [13.5, 19.25],
    5: [13.5, 19.25],
    6: [13.5, 19.25]
  },
  horarioTexto: [
    "Todos los días · 1:30 p. m. – 7:15 p. m."
  ],

  // Ciudades a las que llegan los domicilios (sección Domicilios y campo "Ciudad" del pedido).
  // El valor del domicilio se confirma por WhatsApp según el barrio.
  zonas: [
    { id: "barranquilla", nombre: "Barranquilla" },
    { id: "soledad", nombre: "Soledad" }
  ],

  // Recoger en el local: false = en el checkout sale "Próximamente" y solo hay domicilio.
  // Pon true cuando haya punto de recogida (y ajusta puntoRecogida).
  recoger: false,
  puntoRecogida: "Barranquilla · dirección por confirmar",

  metodosPago: ["Efectivo", "Nequi", "Daviplata", "Transferencia Bancolombia"],

  // Días de anticipación para productos por encargo (hoy ningún producto del menú lo es).
  diasEncargo: 2
};
