# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Portada / portfolio personal de Francisco Roberto Alonso Lorente (ingeniero de software). Sitio estático bilingüe (ES/EN) en HTML, CSS y JavaScript vanilla, sin build, sin dependencias y sin tests. Repositorio git con rama principal `main`.

**Regla de contenido:** el propietario pidió explícitamente no añadir nada que él no haya facilitado. No inventes datos (puestos, fechas, logros, proyectos, redes, ubicación, disponibilidad…). Si falta algo, pregúntalo.

## Ejecutar

- Abrir `index.html` directamente en el navegador (scripts clásicos, no módulos ES, para que funcione con `file://`).
- O servirlo: `npx serve .` / `python3 -m http.server`.
- Comprobar sintaxis: `for f in js/*.js; do node --check "$f"; done`.

## Arquitectura

- `js/data.js` → `window.PROFILE`: todo el contenido del perfil. Los textos traducibles son objetos `{ es, en }`; los demás valores son comunes a ambos idiomas.
- `js/i18n.js` → `window.I18N`: textos de interfaz por idioma. En `index.html` se enlazan con `data-i18n="clave"` (texto) y `data-i18n-aria="clave"` (aria-label). Ambos idiomas deben tener las mismas claves.
- `js/main.js` (IIFE): `tr()` resuelve contenido `{ es, en }`, `ui()` resuelve claves de I18N. `renderStatic()` + `renderContent()` vuelven a pintar todo al cambiar de idioma (botón `#lang-toggle`, que se guarda en `localStorage`). El helper `el()` usa `textContent` y nunca `innerHTML`. `initFlow()` dibuja en `<canvas>` el diagrama animado de la portada (nodos, aristas y flujos; con anchos < 640px intercambia x/y; se pausa fuera de pantalla).
- `css/styles.css`: tokens en `:root`. La portada tiene fondo verde bosque (`--bosque`) y el resto de la página es claro (`--papel`). El canvas lee sus colores de esos tokens.

## Dirección de diseño

Rediseñada con la skill `frontend-design` (instalada en `.agents/skills/`, enlazada desde `.claude/skills/`). Para mantener la coherencia:
- El diagrama en vivo es el único elemento animado y el protagonista. No añadas fundidos al hacer scroll, halos ni efectos de hover en tarjetas.
- Tipografía: solo **Archivo** (eje de anchura): Expanded/800 para el nombre y los títulos destacados, normal para el texto, Condensed para las etiquetas del diagrama. Nada de monoespaciada.
- Maquetación: alineada a la izquierda; cada sección es una `.row` con el título en una columna estrecha y el contenido a la derecha. Sin numeración de secciones, sin tarjetas y sin separadores con punto medio.
- Los emojis delante de cada título de sección los pidió el propietario: se mantienen.
- Respeta `prefers-reduced-motion` (el diagrama se queda estático y se ocultan los contadores).
