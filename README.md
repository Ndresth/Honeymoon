# Honeymoon · Repostería en Barranquilla

Sitio web estático (HTML + Bootstrap 5.3 + JavaScript puro) para una repostería: fresas con crema, paveé, galletas y mini donas, con carrito y envío del pedido por WhatsApp.

Branding lila: el lila del logo (`#c48ebf`), blanco y ciruela (`#4a1f48`) para textos y contornos, con el fondo de ondas del menú impreso. Tipografías Montserrat (títulos y etiquetas) y Nunito (texto).

## Estructura

```
index.html                 Página principal
tratamiento-de-datos.html  Política de tratamiento de datos personales (Ley 1581 de 2012)
assets/css/styles.css      Estilos y paleta de marca
assets/js/config.js        WhatsApp, horario, zonas de domicilio, pagos, días de encargo
assets/js/menu.js          Categorías, productos, tamaños y adiciones
assets/js/illustrations.js Ilustraciones SVG de los productos
assets/js/app.js           Lógica: menú, carrito, checkout y mensaje de WhatsApp
assets/img/                Logo (SVG blanco), favicon, imagen para compartir y foto de las fresas
assets/vendor/             Bootstrap 5.3.3 y Bootstrap Icons 1.11.3 (copias locales, licencia MIT)
```

Bootstrap se sirve desde `assets/vendor/` en vez de un CDN: la página no depende de un tercero para funcionar y no se ejecuta código externo. Solo las fuentes vienen de Google Fonts.

## WhatsApp y precios

En `assets/js/config.js`:

- `whatsapp`: número del negocio con código de país, sin `+` ni espacios (hoy `573001233575`). Si se pone el de prueba `573000000000`, aparece la franja **Modo prueba**.
- `preciosConfirmados`: hoy en `true` (precios del menú oficial). Con `false`, la página muestra la franja **Precios de referencia** y el mensaje de WhatsApp agrega "Precios de referencia: confirmar total".

## Redes sociales

En `assets/js/config.js`, la lista `redes` alimenta los botones de "Síguenos" (sección Cómo pedir) y del pie de página, y los datos estructurados para buscadores (`sameAs`). Cada red lleva `id` (el nombre del ícono de Bootstrap Icons: `instagram`, `tiktok`, `facebook`…), `usuario` y `url` sin parámetros de rastreo.

## Editar el menú

En `assets/js/menu.js`:

- `HM_ADICIONES`: grupos de toppings. Cada grupo tiene `texto` (la frase que sale arriba de los toppings) e `items`. Cada topping lleva `precio` por porción, `max` (porciones máximas por vaso), opcional `limite: { desde, otros }` (desde esa cantidad de ese topping, como máximo `otros` porciones de los demás; `otros: 0` = va solo), `icono` (dibujo de `illustrations.js`: `queso`, `chocoramo`, `piazza`, `oreo`) y `foto` (si se agrega una foto, reemplaza al ícono). Hoy `fresas`, a $2.000 la porción:
  - Queso: hasta 2; con 2, solo 1 topping más.
  - Chocoramo, Piazza y Oreo: hasta 2; con 2, van solos (la base ya trae galleta Oreo).
  - Se pueden pedir los 4 toppings a la vez (una porción de cada uno).
- `HM_MENU`: productos (Fresas con crema, Paveé, Galletas y Mini donas). Campos principales:
  - `tamanos`: con precio y, opcional, `detalle` ("Pequeña", "7 mini donitas") y `encargo: true`.
  - `adiciones`: nombre del grupo de toppings que acepta (el cliente suma porciones con + y −; el modal bloquea lo que no cumple los límites y explica por qué).
  - `destacado: true`: tarjeta ancha, con la foto al lado en computador (hoy, Fresas con crema).
  - `eleccion`: una opción incluida en el precio que el cliente debe elegir, como el topping del paveé (Galleta Oreo, Galleta Milo o Leche Klim). Si la opción trae `ilustracion`, el dibujo cambia al elegirla.
  - `ilustracion` (dibujo SVG de `illustrations.js`: `pave`, `bolsita`, `donas`) o `imagen` (foto). Para fotos reales, guarda la imagen en `assets/img/` y usa `imagen: "assets/img/mi-foto.webp"`.
  - `encargo: true`: todo el producto se hace por encargo.
  - `nombreCompleto` (opcional): nombre para el carrito y WhatsApp si el de la tarjeta es corto.
  - `notaPlaceholder`: texto de ejemplo para la nota del producto.
  - `temporada: { desde: "11-01", hasta: "12-31", texto }`: solo se puede pedir en esas fechas (hora de Colombia); fuera de ellas sale como "Próximamente".
  - `disponible: false`: se muestra como "Próximamente" y no se puede pedir.

La tarjeta de cada producto muestra, como el menú impreso, los tamaños con su precio y los toppings.

Recoger en el local está apagado (`recoger: false` en `config.js`): en el checkout sale como **Próximamente** y solo se puede pedir a domicilio. Cuando haya local, pon `recoger: true` y la dirección en `puntoRecogida`.

Las ciudades de domicilio (`zonas`: hoy Barranquilla y Soledad), el horario (hoy martes a domingo de 1:30 a 7:15 p. m. y lunes de descanso, `1: null`; las horas van en decimal, 13.5 = 1:30 p. m.), los métodos de pago y `diasEncargo` (anticipación mínima para productos por encargo, por defecto 2) están en `config.js`. El valor del domicilio no se publica: el cliente elige su ciudad, escribe su barrio y se le confirma por WhatsApp.

## Tratamiento de datos

`tratamiento-de-datos.html` explica, según la Ley 1581 de 2012, para qué se usan los datos del pedido y dónde quedan: la página no tiene servidor, los datos de entrega se guardan solo en el navegador del cliente (`hm_cliente` y `hm_carrito` en `localStorage`) y llegan al negocio únicamente por WhatsApp. Tiene un botón para borrarlos del dispositivo. Se enlaza desde el pie de página y desde el formulario del pedido ("Al enviar tu pedido aceptas…"). Si cambia lo que se pide o cómo se guarda, actualiza ese texto y la fecha de "Última actualización".

## Cómo funciona el pedido

1. El cliente elige producto, tamaño, toppings, notas y cantidad.
2. El carrito se guarda en el navegador (`localStorage`), así no se pierde si recarga la página.
3. En "Finalizar pedido" llena nombre, celular, dirección, barrio, ciudad, fecha de entrega y método de pago. Si el carrito tiene productos por encargo, la fecha es obligatoria y no deja elegir antes de `diasEncargo` días ni días cerrados.
4. Se abre `https://wa.me/<número>?text=...` con el pedido formateado: código de pedido, datos del cliente, fecha, productos con tamaño/topping/adiciones/notas, subtotal, total (sin domicilio, que queda "por confirmar") y forma de pago.

## Ver en local

No necesita compilación. Abre `index.html` en el navegador o sirve la carpeta:

```bash
npx http-server -p 8080
```

## Publicar

Es 100 % estático: no necesita servidor, base de datos ni comando de build. Se publica con **GitHub Pages** (rama `master`, carpeta raíz) en **https://honeymoonreposteria.com** (dominio registrado en Hostinger). Cada merge a `master` se publica solo.

- `CNAME` (raíz del repo) contiene el dominio; no lo borres o GitHub Pages deja de servir el dominio propio.
- `canonical`, `og:url` y `og:image` en `index.html` apuntan al dominio (vista previa al compartir por WhatsApp y buscadores).
- Íconos: `favicon.ico` (raíz), `assets/img/icono.svg`, `icono-192.png`, `icono-180.png` (Apple) e `icono-512.png` (logo en los datos para Google). Si cambias el logo, usa nombres de archivo nuevos: Google y WhatsApp guardan la imagen por su dirección.

### Google

Google actualiza el logo y la vista previa cuando vuelve a rastrear la página, y puede tardar días o semanas. Para pedírselo antes: [Google Search Console](https://search.google.com/search-console) → agregar propiedad **Dominio** `honeymoonreposteria.com` → verificar con el registro `TXT` que da Google (en Hostinger, igual que el de GitHub) → **Inspección de URLs** → `https://honeymoonreposteria.com/` → **Solicitar indexación**.

DNS en Hostinger (*hPanel → Dominios → Portafolio de dominios → el dominio → DNS / Nameservers → Registros DNS*). Antes, borrar los registros `A` de `@` y el `CNAME` de `www` que Hostinger crea por defecto:

| Tipo | Host | Valor |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `ndresth.github.io.` |
| TXT | `_github-pages-challenge-ndresth` | valor que da GitHub en *Settings → Pages → Add a domain* (perfil) |

Sin registros comodín (`*`). Después de propagar: repo → *Settings → Pages* → **Enforce HTTPS**.
