# Honeymoon · Repostería en Barranquilla

Sitio web estático (HTML + Bootstrap 5.3 + JavaScript puro) para una repostería: fresas con crema, paveé, galletas y mini donas, con carrito y envío del pedido por WhatsApp.

Branding lila: el lila del logo (`#c48ebf`), blanco y ciruela (`#4a1f48`) para textos y contornos, con el fondo de ondas del menú impreso. Tipografías Montserrat (títulos y etiquetas) y Nunito (texto).

## Estructura

```
index.html                 Página principal
tratamiento-de-datos.html  Política de tratamiento de datos personales (Ley 1581 de 2012)
juego.html                 Juegos de Hony: "Fresas con crema" y "Galletas al horno"
assets/css/styles.css      Estilos y paleta de marca
assets/js/config.js        WhatsApp, horario, zonas de domicilio, pagos, días de encargo
assets/js/menu.js          Categorías, productos, tamaños y adiciones
assets/js/illustrations.js Ilustraciones SVG de los productos
assets/js/vaso.js          Vaso animado de fresas con crema ("Así va tu vaso" y el juego de fresas)
assets/js/juego.js         Marco común de los juegos (pantallas, clientes, puntos, vidas, niveles, récords, sonido)
assets/js/juego-fresas.js  Juego "Fresas con crema"
assets/js/juego-galletas.js Juego "Galletas al horno"
assets/js/juego-3d.js      Escenas 3D de los juegos (Three.js): cocina, vaso, bandeja y horno
assets/vendor/three/       Three.js 0.170.0 (licencia MIT en LICENSE), solo lo carga juego.html
assets/js/app.js           Lógica: menú, carrito, checkout y mensaje de WhatsApp
assets/img/                Logo (SVG blanco), íconos, imagen para compartir y fotos de los productos (WebP)
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
  - Cobertura de chocolate en el vaso: $3.000, máximo 1. Es `independiente: true`: no cuenta para los límites de los demás (se puede pedir con cualquier combinación). En "Así va tu vaso" se dibuja chorreando por las paredes del vaso; en el juego no aparece.
  - Campos opcionales de cada topping: `corto` (nombre en la tarjeta), `detalle` (texto bajo el nombre en el detalle) e `independiente`.
  - Se pueden pedir los 4 toppings a la vez (una porción de cada uno).
- `HM_MENU`: productos del menú (Fresas con crema, Paveé, Galletas y Mini donas) y de la sección Tortas (ver abajo). Campos principales:
  - `tamanos`: con precio y, opcional, `detalle` ("Pequeña", "7 mini donitas") y `encargo: true`.
  - `adiciones`: nombre del grupo de toppings que acepta (el cliente suma porciones con + y −; el modal bloquea lo que no cumple los límites y explica por qué).
  - `destacado: true`: tarjeta ancha, con la foto al lado en computador (hoy, Fresas con crema).
  - `eleccion`: una opción incluida en el precio que el cliente debe elegir, como el topping del paveé (Oreo, Untable de Milo o Leche Klim). Si la opción trae `imagen` (y opcional `fotoNota` y `posicion`), la foto del detalle cambia al elegirla; si no, se usa la foto del producto.
  - Si una opción de `eleccion` trae `precio`, ese es el precio del producto con esa opción (ej. el relleno de Berry Love): la tarjeta lista cada opción con su precio, el detalle lo muestra en cada botón y el total cambia al elegir.
  - `categoria: "tortas"`: el producto sale en la sección Tortas en vez del menú. `aviso`: texto que se muestra en el detalle (ej. cómo enviar las fotos).
  - `ilustracion` (dibujo SVG de `illustrations.js`: `pave`, `bolsita`, `donas`) o `imagen` (foto). Para fotos reales, guarda la imagen en `assets/img/` y usa `imagen: "assets/img/mi-foto.webp"`. Las fotos de producto son verticales (3:4, fondo lila) y van en WebP de 1200 px de ancho para que carguen rápido; las originales quedan en `assets/img/originales/`.
  - Un tamaño puede tener su propia `imagen`: en el detalle la foto cambia al elegirlo (Fresas con crema: 9 onz y 12 onz).
  - `posicion` (opcional, producto o tamaño): encuadre de la foto, ej. `"center 70%"`, para que el producto no se corte en los marcos más bajos (en celular las fotos van cuadradas).
  - `fotoNota` (opcional): texto sobre la foto, por ejemplo qué topping sale (Paveé: "Foto: con topping de Untable de Milo"; la opción Leche Klim muestra su propia foto).
  - `galeria` (opcional, en el producto, un tamaño o una opción, junto a `imagen`): `[{ imagen, posicion }]` con fotos extra; en el detalle salen miniaturas para pasar de una a otra (ej. Paveé con Oreo: de lado y desde arriba). La tarjeta del menú muestra siempre la foto del producto.
  - Mini donas usan la foto real del vaso de 12 onz con tapa de domo (`mini-donas.webp`, original en `assets/img/originales/mini-donas-vaso.jpg`). El dibujo `donas` sigue disponible en `illustrations.js` por si se quiere volver a usar.
  - `encargo: true`: todo el producto se hace por encargo.
  - `nombreCompleto` (opcional): nombre para el carrito y WhatsApp si el de la tarjeta es corto.
  - `notaPlaceholder`: texto de ejemplo para la nota del producto.
  - `temporada: { desde: "11-01", hasta: "12-31", texto }`: solo se puede pedir en esas fechas (hora de Colombia); fuera de ellas sale como "Próximamente".
  - `disponible: false`: se muestra como "Próximamente" y no se puede pedir.

La tarjeta de cada producto muestra, como el menú impreso, los tamaños con su precio y los toppings.

Recoger en el local está apagado (`recoger: false` en `config.js`): en el checkout sale como **Próximamente** y solo se puede pedir a domicilio. Cuando haya local, pon `recoger: true` y la dirección en `puntoRecogida`.

Las ciudades de domicilio (`zonas`: hoy Barranquilla y Soledad), el horario (hoy martes a domingo de 1:30 a 7:15 p. m. y lunes de descanso, `1: null`; las horas van en decimal, 13.5 = 1:30 p. m.), los métodos de pago y `diasEncargo` (anticipación mínima para productos por encargo, por defecto 2) están en `config.js`. El valor del domicilio no se publica: el cliente elige su ciudad, escribe su barrio y se le confirma por WhatsApp.

## Tortas

Sección propia dentro del menú (`#tortas`, con enlace en la navegación y el pie). Muestra los productos con `categoria: "tortas"`: tortas de 1 Lb (no son por encargo: se piden como cualquier producto). Precios según el relleno:

- Choco Moon (relleno de chocolate): $130.000.
- Strawberry Kiss (relleno de dulce de leche): 1 Lb $105.000.
- Caramel Crunch (relleno de dulce de leche): 1 Lb $105.000.
- Berry Love (decorada con las fotos del cliente), solo 1 Lb: el cliente elige el relleno, Fresas con crema $120.000, Dulce de leche $110.000 u Oreo $110.000.
- Tamaños más pequeños, según el relleno: ½ Lb (fresas con crema $80.000, dulce de leche u Oreo $75.000) y 10 cm (fresas con crema $45.000, dulce de leche u Oreo $40.000). Hoy los tienen Strawberry Kiss y Caramel Crunch (dulce de leche): ½ Lb $75.000 y 10 cm $40.000. Choco Moon sigue solo en 1 Lb (falta el precio con chocolate).
- Si un relleno cambia de precio según el tamaño, la opción puede llevar `precios: { idTamaño: precio }`. El detalle avisa que las fotos se envían por WhatsApp. En su foto de ejemplo, la tarjeta con la cara y el nombre de la persona va difuminada.

La torta de 1 Lb sin relleno vale $90.000, pero no se ofrece en la página. Las fotos están en `assets/img/torta-*.webp` (originales en `assets/img/originales/`).

## Así va tu vaso

Un producto con `armar` (hoy Fresas con crema) muestra en el detalle un vaso dibujado (`vaso.js`) que se llena capa por capa al abrir (`armar.receta`), crece al pasar de 9 a 12 onz y recibe cada topping que el cliente agrega (se dibuja con el `icono` del topping). En celulares altos se queda fijo arriba mientras se eligen los toppings. Al agregar al carrito, Hony salta en el aviso.

Un enlace como `./#pedir=fresas-con-crema&tamano=12oz&t=f-queso,f-oreo` abre ese producto ya armado (el tamaño y los toppings se validan con los límites del menú). Lo usa el juego.

## Juegos de Hony

`juego.html`, enlazado desde el menú, la barra de navegación y el pie de página. Abre con la lista de juegos; `juego.html#fresas` y `juego.html#galletas` van directo a cada uno. Se ven en 3D con Three.js (`juego-3d.js`, estilo caricatura con sombreado por escalones y contornos ciruela): cocina con mesón, repisa y logo; el vaso gira, las capas se llenan y los toppings caen; la bandeja entra al horno, la puerta se abre y adentro se prende la luz mientras las galletas se doran. Si el navegador no tiene WebGL 2, los juegos usan sus dibujos 2D y funcionan igual. Los dos comparten el marco de `juego.js`: llegan clientes dibujados (cambian de cara según su paciencia) con un ticket del pedido y su barra de paciencia; hay 3 vidas, racha, puntos (más por rapidez, racha y nivel), confeti, sonido que se puede apagar (`hm_juego_sonido`) y un récord por juego guardado en el navegador. Cada 3 pedidos la dificultad sube sola, sin avisar, y cada nivel da menos tiempo. Al terminar, "Pedirlo de verdad" abre la tienda con lo último que entregó.

- **Fresas con crema** (`juego-fresas.js`): poner el vaso del tamaño pedido, armar las capas en orden (1 crema → 2 fresas → 3 salsas → 4 Oreo) y agregar los toppings. En cada pedido los botones de las capas cambian de lugar, pero cada uno conserva su número; desde el nivel 3 también se mueven los toppings. Los pedidos salen de `menu.js` (tamaños, toppings, precios y límites reales). Récord en `hm_juego_record`.
- **Galletas al horno** (`juego-galletas.js`): poner el papel, una masa en cada punto que marca el papel (los puntos salen en lugares al azar; tocar fuera quita 2 segundos), meter la bandeja al horno, ponerlo a la temperatura del pedido y sacar las galletas cuando la aguja esté en "Doradas". Más caliente hornea más rápido. La dificultad sube en cada nivel (`dificultad(nivel)`): una galleta más (de 4 hasta 14), puntos más pequeños, menos tiempo, zona dorada más angosta y horno más rápido; desde el nivel 3 el horno va de 5 en 5 grados, desde el 5 las marcas del papel se borran a los 3 segundos (hay que memorizarlas), desde el 6 hay temperaturas de 150 a 210 °C y desde el 7 las marcas se borran a los 1,8 segundos. Récord en `hm_juego_galletas_record`.

Para agregar otro juego: un archivo que llame a `HM_JUEGO.registrar({ id, nombre, kicker, descripcion, pasos, claveRecord, portada, preparar, crearPedido, iniciar, pintarControles, detener, primerControl, tiendaInicial })` (ver los dos juegos) y su `<script>` en `juego.html`.

## Modo "Muy pronto"

En `config.js`, `mantenimiento: true` muestra solo la pantalla "Estamos endulzando la tienda" (logo, Instagram, TikTok y WhatsApp). No se borra nada: el menú, el carrito y el resto siguen en la página, ocultos, y vuelven con `mantenimiento: false`. Mientras está activo, `https://honeymoonreposteria.com/?tienda` muestra la tienda completa (para revisarla antes de abrir). Hoy está **apagado** (tienda abierta). La pantalla "Muy pronto" va en un `<template>`: solo entra en la página con `mantenimiento: true`, así con la tienda abierta Google no lee "Muy pronto" (la página tiene un solo `h1`, el de la tienda).

### Google

`robots.txt` permite leer todo el sitio y apunta a `sitemap.xml` (tienda, juegos y tratamiento de datos). Si Google muestra un texto viejo (por ejemplo "Muy pronto"), en Search Console: Inspección de URLs → `https://honeymoonreposteria.com/` → Probar URL publicada → Solicitar indexación; y en Sitemaps, enviar `sitemap.xml`. Google tarda de unos días a un par de semanas en actualizar el resultado.

## Tratamiento de datos

`tratamiento-de-datos.html` explica, según la Ley 1581 de 2012, para qué se usan los datos del pedido y dónde quedan: la página no tiene servidor, los datos de entrega se guardan solo en el navegador del cliente (`hm_cliente` y `hm_carrito` en `localStorage`; los juegos guardan además sus récords y la preferencia de sonido (`hm_juego_record`, `hm_juego_galletas_record`, `hm_juego_sonido`)) y llegan al negocio únicamente por WhatsApp. No usa cookies (ni de rastreo ni de publicidad), así que no necesita aviso de cookies; si se agrega Google Analytics o un píxel de publicidad, habría que agregar ese aviso. Tiene un botón para borrarlos del dispositivo. Se enlaza desde el pie de página y desde el formulario del pedido ("Al enviar tu pedido aceptas…"). Si cambia lo que se pide o cómo se guarda, actualiza ese texto y la fecha de "Última actualización".

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
