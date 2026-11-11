---
description: Convierte una idea suelta en una nueva sección de la portada, con emoji y descripción en ES/EN
argument-hint: <idea en una frase>
allowed-tools: Read, Edit, Bash(node --check:*)
---

Convierte esta idea en una nueva sección de la portada: **$ARGUMENTS**

Si no se ha escrito ninguna idea, pide al usuario que la describa y no hagas nada más.

## 1. Propuesta (no edites todavía)

Lee `index.html`, `js/i18n.js` y `css/styles.css`. Después presenta una propuesta breve con:

- **Emoji:** uno solo, que represente la idea.
- **Título:** corto, en ES y en EN.
- **Descripción:** 1–2 frases en ES y en EN que expliquen la sección.
- **Posición:** dónde va la sección y qué número le toca. Por defecto, antes de Contacto, que siempre es la última.
- **Id:** id de la sección, en kebab-case y en español (p. ej. `aprendiendo`).

Reglas de contenido (ver CLAUDE.md):
- Usa solo lo que dice la idea. No inventes datos personales, cifras, empresas, fechas, logros ni enlaces.
- Si para la sección hacen falta datos que el usuario no ha dado, enuméralos como preguntas en lugar de rellenarlos.

Termina preguntando si la aplica tal cual o si quiere cambiar algo. **Espera la confirmación.**

## 2. Aplicación (solo tras confirmar)

1. **`js/i18n.js`:** añade las claves `<id>_title` y `<id>_lead` en `es` **y** en `en`. Los dos idiomas deben tener las mismas claves.
2. **`index.html`:** inserta la sección en la posición acordada, siguiendo el patrón de las demás:
   ```html
   <!-- NN · Título -->
   <section class="section" id="<id>">
     <div class="container">
       <header class="section-head reveal">
         <p class="eyebrow">NN</p>
         <h2><span class="section-emoji" aria-hidden="true">EMOJI</span> <span data-i18n="<id>_title"></span></h2>
         <p class="section-lead" data-i18n="<id>_lead"></p>
       </header>
     </div>
   </section>
   ```
   - Renumera los `eyebrow` y los comentarios de las secciones posteriores para que la numeración siga siendo correlativa.
   - Si la sección es lo bastante importante como para tener acceso directo, añade un enlace en `.nav-links` con una clave `nav_<id>` en los dos idiomas. Pregúntalo en la propuesta.
3. **`css/styles.css`:** si aún no existe la regla `.section-emoji`, añádela junto a `.section-lead`:
   ```css
   .section-emoji {
     margin-right: 0.15em;
     font-size: 0.9em;
   }
   ```
4. Comprueba la sintaxis con `node --check js/i18n.js`. Termina con un resumen de una o dos líneas y la sugerencia de recargar `index.html`.
