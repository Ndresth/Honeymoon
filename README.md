# Honey Moon · Fresas con crema en Barranquilla

Sitio web estático (HTML + Bootstrap 5.3 + JavaScript puro) con menú, carrito y envío del pedido por WhatsApp.

## Estructura

```
index.html                 Página principal
assets/css/styles.css      Estilos y paleta de marca
assets/js/config.js        WhatsApp, horario, zonas de domicilio, métodos de pago
assets/js/menu.js          Categorías, productos, tamaños y adiciones
assets/js/illustrations.js Ilustraciones SVG de los productos
assets/js/app.js           Lógica: menú, carrito, checkout y mensaje de WhatsApp
assets/img/                Logo, favicon y recortes de la mascota
```

## Configurar el WhatsApp real

En `assets/js/config.js` cambia:

```js
whatsapp: "573000000000", // número de prueba
```

por el número real con código de país y sin `+` ni espacios, por ejemplo `"573001112233"`.
Mientras el número sea el de prueba, la página muestra una franja de **Modo prueba** arriba; desaparece sola al poner el real.

## Editar el menú

En `assets/js/menu.js`:

- `HM_CATEGORIAS`: filtros del menú.
- `HM_ADICIONES`: toppings con su precio.
- `HM_MENU`: productos. Cada uno tiene `tamanos` (con precio), `adiciones: true/false`, y una `ilustracion` (dibujo SVG) o una `imagen` (ruta a una foto). Para fotos reales, guarda la imagen en `assets/img/` y usa `imagen: "assets/img/mi-foto.webp"`.
- `disponible: false` muestra el producto como "Próximamente" (sin poder pedirlo).

Las zonas de domicilio, sus costos, el horario y los métodos de pago están en `config.js`. Todos los valores actuales son de prueba.

## Cómo funciona el pedido

1. El cliente elige producto, tamaño, adiciones, notas y cantidad.
2. El carrito se guarda en el navegador (`localStorage`), así no se pierde si recarga la página.
3. En "Finalizar pedido" llena nombre, celular, domicilio o recogida, zona y método de pago.
4. Se abre `https://wa.me/<número>?text=...` con el pedido formateado: código de pedido, datos del cliente, productos, subtotal, domicilio, total y forma de pago.

## Ver en local

No necesita compilación. Abre `index.html` en el navegador o sirve la carpeta:

```bash
npx http-server -p 8080
```

## Publicar

Al ser estático se puede subir tal cual a GitHub Pages (Settings → Pages → rama `master`, carpeta raíz), Netlify o Vercel.
