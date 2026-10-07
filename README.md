# Honeymoon · Repostería en Barranquilla

Sitio web estático (HTML + Bootstrap 5.3 + JavaScript puro) para una repostería: fresas con crema, pavés, cheesecakes, mini donas, galletas, alfajores y tortas por encargo, con carrito y envío del pedido por WhatsApp.

## Estructura

```
index.html                 Página principal
assets/css/styles.css      Estilos y paleta de marca
assets/js/config.js        WhatsApp, horario, zonas de domicilio, pagos, días de encargo
assets/js/menu.js          Categorías, productos, tamaños y adiciones
assets/js/illustrations.js Ilustraciones SVG de los productos
assets/js/app.js           Lógica: menú, carrito, checkout y mensaje de WhatsApp
assets/img/                Logo, favicon y recortes de la mascota
assets/vendor/             Bootstrap 5.3.3 y Bootstrap Icons 1.11.3 (copias locales, licencia MIT)
```

Bootstrap se sirve desde `assets/vendor/` en vez de un CDN: la página no depende de un tercero para funcionar y no se ejecuta código externo. Solo las fuentes vienen de Google Fonts.

## WhatsApp y precios

En `assets/js/config.js`:

- `whatsapp`: número del negocio con código de país, sin `+` ni espacios (hoy `573001233575`). Si se pone el de prueba `573000000000`, aparece la franja **Modo prueba**.
- `preciosConfirmados`: mientras sea `false`, la página muestra la franja **Precios de referencia** y el mensaje de WhatsApp agrega "Precios de referencia: confirmar total". Cámbialo a `true` cuando los precios y tamaños de `menu.js` sean los reales.

## Redes sociales

En `assets/js/config.js`, la lista `redes` alimenta los botones del pie de página y de la sección Temporada, y los datos estructurados para buscadores (`sameAs`). Cada red lleva `id` (el nombre del ícono de Bootstrap Icons: `instagram`, `tiktok`, `facebook`…), `usuario` y `url` sin parámetros de rastreo.

## Editar el menú

En `assets/js/menu.js`:

- `HM_CATEGORIAS`: filtros del menú (Fresas con crema, Pavés, Cheesecakes, Mini donas, Galletas y alfajores, Tortas, Temporada).
- `HM_ADICIONES`: grupos de toppings con precio (`donas`, `galletaChips`, `galletaRedVelvet`).
- `HM_MENU`: productos. Campos principales:
  - `tamanos`: con precio y, opcional, `detalle` ("12 porciones") y `encargo: true`.
  - `adiciones`: nombre del grupo de adiciones que acepta.
  - `encargo: true`: todo el producto se hace por encargo.
  - `cotizar: true` (opcional): el producto no va al carrito; su botón abre WhatsApp para pedir cotización.

La franja **Tortas personalizadas para tu evento** (`#personalizadas` en `index.html`) abre WhatsApp con una plantilla para cotizar: ocasión, fecha, porciones, sabor e idea.
  - `ilustracion` (dibujo SVG) o `imagen` (foto). Para fotos reales, guarda la imagen en `assets/img/` y usa `imagen: "assets/img/mi-foto.webp"`.
  - `notaPlaceholder`: texto de ejemplo para la nota del producto.
  - `temporada: { desde: "11-01", hasta: "12-31", texto }`: solo se puede pedir en esas fechas (hora de Colombia); fuera de ellas sale como "Próximamente".
  - `disponible: false`: se muestra como "Próximamente" y no se puede pedir.

Las zonas de domicilio, sus costos, el horario, los métodos de pago y `diasEncargo` (anticipación mínima para tortas, por defecto 2) están en `config.js`. Los precios, tamaños, horario y tarifas actuales son de referencia.

## Cómo funciona el pedido

1. El cliente elige producto, tamaño, adiciones, notas y cantidad.
2. El carrito se guarda en el navegador (`localStorage`), así no se pierde si recarga la página.
3. En "Finalizar pedido" llena nombre, celular, domicilio o recogida, zona, fecha de entrega y método de pago. Si el carrito tiene productos por encargo, la fecha es obligatoria y no deja elegir antes de `diasEncargo` días ni días cerrados.
4. Se abre `https://wa.me/<número>?text=...` con el pedido formateado: código de pedido, datos del cliente, fecha, productos con tamaño/adiciones/notas, subtotal, domicilio, total y forma de pago.

## Ver en local

No necesita compilación. Abre `index.html` en el navegador o sirve la carpeta:

```bash
npx http-server -p 8080
```

## Publicar

Es 100 % estático: no necesita servidor, base de datos ni comando de build. Se publica con **GitHub Pages** (rama `master`, carpeta raíz) en **https://honeymoonreposteria.com** (dominio registrado en Hostinger). Cada merge a `master` se publica solo.

- `CNAME` (raíz del repo) contiene el dominio; no lo borres o GitHub Pages deja de servir el dominio propio.
- `canonical`, `og:url` y `og:image` en `index.html` apuntan al dominio (vista previa al compartir por WhatsApp y buscadores).

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
