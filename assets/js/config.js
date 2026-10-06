/* =========================================================
   Honey Moon · Configuración del negocio
   Edita este archivo para cambiar número, horarios y domicilios.
   ========================================================= */
window.HM_CONFIG = {
  negocio: "Honey Moon",
  ciudad: "Barranquilla",
  instagram: "honeymoon", // usuario sin @

  // WhatsApp DE PRUEBA. Reemplázalo por el real: código de país (57) + número, sin espacios ni "+".
  // Ejemplo: "573001112233"
  whatsapp: "573000000000",

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
  zonas: [
    { id: "riomar", nombre: "Riomar", costo: 5000 },
    { id: "norte-centro", nombre: "Norte – Centro Histórico", costo: 5000 },
    { id: "suroccidente", nombre: "Suroccidente", costo: 7000 },
    { id: "metropolitana", nombre: "Metropolitana", costo: 7000 },
    { id: "suroriente", nombre: "Suroriente", costo: 8000 },
    { id: "puerto-colombia", nombre: "Puerto Colombia", costo: 10000 },
    { id: "soledad", nombre: "Soledad", costo: 10000 }
  ],

  // Punto de recogida (de prueba).
  puntoRecogida: "Barranquilla · dirección por confirmar",

  metodosPago: ["Efectivo", "Nequi", "Daviplata", "Transferencia Bancolombia"],

  // Días de anticipación para productos por encargo (tortas, cheesecake entero...).
  diasEncargo: 2
};
