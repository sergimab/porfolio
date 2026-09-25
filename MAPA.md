# Dónde está cada cosa

Lo que ves en pantalla, y el archivo que lo dibuja. Cada componente lleva su CSS
al lado y con su mismo nombre: si editas `Portada.tsx`, su estilo es
`Portada.css`, en la misma carpeta. No hay hojas sueltas ni estilos repartidos.

Lo único que vive fuera de una carpeta de componente es `src/app/globals.css`,
y solo tiene los tokens —colores, esquinas, foco—. Si tocas algo ahí, cambia
todo el sitio a la vez.

---

## Las cuatro direcciones

| Lo que abre el navegador | Página |
| --- | --- |
| `/` la home | `src/app/page.tsx` + `page.css` |
| `/proyecto/<id>` cualquier proyecto | `src/app/proyecto/[id]/page.tsx` |
| `/elysium/web` el prototipo de la web | `src/app/elysium/web/page.tsx` |
| `/elysium/diseno` el proceso de diseño | `src/app/elysium/diseno/page.tsx` |

La página de proyecto no dibuja nada: mira la tabla `LANDINGS` y llama al
componente que toca. Esa tabla es el índice de abajo.

---

## El prototipo de Elysium — `src/components/proyectos/elysium-web/`

Las cuatro pantallas, en el orden en que se recorren:

| Pantalla | Archivo | Estilo |
| --- | --- | --- |
| La de entrada | `PantallaInicio.tsx` | `PantallaInicio.css` |
| El universo con los iconos flotando | `PantallaEras.tsx` | `Popups.css` |
| El trazado del símbolo | `PantallaSimbolo.tsx` | `Popups.css` |
| **La portada con el disco, la lista y las tarjetas** | `PaginaDisco.tsx` | **`PaginaDisco.css`** |

Y las piezas que cruzan las cuatro:

- `WebSimulada.tsx` / `WebSimulada.css` — el envoltorio y la barra de arriba.
- `Barra.tsx` — la barra en sí (su estilo está en `WebSimulada.css`).
- `Portada.tsx` / `Portada.css` — el disco, que sale en varias pantallas.
- `simbolo.ts` — cómo se genera la figura. `SimboloPlano.tsx`, la versión
  rellena de negro que va estampada en las camisetas.

---

## Los proyectos, por identificador

| id | Proyecto | Carpeta |
| --- | --- | --- |
| m1 | Motion Yelmo | `yelmo-motion/` |
| m2 | Motion El Arte del Miedo | `arte-del-miedo/` |
| b1 | Espacio vacío | `espacio-vacio/` |
| b2 | Rebranding Yelmo | `yelmo/` |
| b3 | El Arte del Miedo | `arte-del-miedo/` |
| b4 | Sala Equis | `sala-equis/` |
| f1 | Afiche Orquesta Tokio | `orquesta-tokio/` |
| f2 | Galería Orquesta Tokio | `orquesta-tokio/` |
| i1 | Infografías | `iberdrola/` |
| i3 | Newsletters | `iberdrola/` |
| i4 | Iconografía | `iberdrola/` |
| i5 | Sistema de ilustraciones | `iberdrola/` |
| u1 | Web de Elysium | `elysium-web/` (va a `/elysium/web`) |
| u2 | App Espacio vacío | `app-espacio-vacio/` |
| u3 | App El Arte del Miedo | `arte-del-miedo/` |
| u4 | Web Porfolio, el sistema de diseño | `sistema/` |
| d1 | Elysium 3D | `elysium/` |
| e1 | Disco Elysium, el editorial | `disco-elysium/` |

Todas cuelgan de `src/components/proyectos/`.

---

## Lo que se repite en todo el sitio — `src/components/shared/`

- `Recomendados` — «Proyectos recomendados», con su filete de arriba.
- `BackCapsule` — la cápsula de volver.
- `DropcapTitle` — los titulares con capitular.
- `RotuloSeccion` — los rótulos de apartado.
- `TextoPapel` / `papel.css` — las cajas de texto sobre el fondo animado.
- `Movil` — el marco de teléfono.
- `MeshGradient`, `MarcoHormigas`, `CtaBanner`, `ToolIcons`.
- `proyectos.ts` — la lista de proyectos, sus categorías y sus colores. Aquí se
  añade uno nuevo o se le cambia el título.

`src/components/home/` es solo de la home; `src/components/layout/`, la cabecera,
el pie y el botón de subir.
