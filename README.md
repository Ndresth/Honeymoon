# Honey Moon · Repostería en Barranquilla

Sitio web estático (HTML + Bootstrap 5.3 + JavaScript puro) para una repostería: tortas por encargo, cupcakes, brownies, galletas y fresas con crema, con carrito y envío del pedido por WhatsApp.

## Estructura

```
index.html                 Página principal
assets/css/styles.css      Estilos y paleta de marca
assets/js/config.js        WhatsApp, horario, zonas de domicilio, pagos, días de encargo
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

- `HM_CATEGORIAS`: filtros del menú (Tortas, Cupcakes, Brownies y galletas, Fresas y postres, Bebidas, Temporada).
- `HM_ADICIONES`: grupos de adiciones con precio (`postres` para toppings, `tortas` para velas, topper, tarjeta…).
- `HM_MENU`: productos. Campos principales:
  - `tamanos`: con precio y, opcional, `detalle` ("12 porciones") y `encargo: true`.
  - `adiciones`: nombre del grupo de adiciones que acepta.
  - `encargo: true`: todo el producto se hace por encargo.
  - `cotizar: true`: no va al carrito, abre WhatsApp para cotizar (torta personalizada).
  - `ilustracion` (dibujo SVG) o `imagen` (foto). Para fotos reales, guarda la imagen en `assets/img/` y usa `imagen: "assets/img/mi-foto.webp"`.
  - `notaPlaceholder`: ejemplo para la nota (dedicatoria en tortas).
  - `disponible: false`: se muestra como "Próximamente" y no se puede pedir.

Las zonas de domicilio, sus costos, el horario, los métodos de pago y `diasEncargo` (anticipación mínima para tortas, por defecto 2) están en `config.js`. Todos los valores actuales son de prueba.

## Cómo funciona el pedido

1. El cliente elige producto, tamaño, adiciones, notas y cantidad.
2. El carrito se guarda en el navegador (`localStorage`), así no se pierde si recarga la página.
3. En "Finalizar pedido" llena nombre, celular, domicilio o recogida, zona, fecha de entrega y método de pago. Si el carrito tiene productos por encargo, la fecha es obligatoria y no deja elegir antes de `diasEncargo` días ni días cerrados.
4. Se abre `https://wa.me/<número>?text=...` con el pedido formateado: código de pedido, datos del cliente, fecha, productos con tamaño/adiciones/dedicatoria, subtotal, domicilio, total y forma de pago.
5. Las tortas personalizadas no pasan por el carrito: el botón "Cotizar" abre WhatsApp con una plantilla (ocasión, fecha, porciones, sabor, idea).

## Ver en local

No necesita compilación. Abre `index.html` en el navegador o sirve la carpeta:

```bash
npx http-server -p 8080
```

## Publicar

Es 100 % estático: no necesita servidor, base de datos ni comando de build.

- **Pruebas (gratis, ya está en GitHub):** GitHub Pages → *Settings → Pages → Deploy from a branch* → rama `master`, carpeta `/ (root)`. Queda en `https://ndresth.github.io/Honeymoon/`.
- **Producción con dominio propio:** Cloudflare Pages → *Workers & Pages → Create → Pages → Connect to Git* → este repo, sin comando de build y con directorio de salida `/`. Cada `git push` a `master` publica solo.
