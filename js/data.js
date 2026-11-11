/**
 * Contenido del perfil. Edita SOLO este archivo para cambiar textos.
 * Los textos traducibles son objetos { es, en }; el resto se muestra igual en ambos idiomas.
 * Solo contiene información facilitada por el propietario: no añadir datos inventados.
 */
window.PROFILE = {
  name: "Francisco Roberto Alonso Lorente",
  email: "robalon.dev@gmail.com",
  role: { es: "Ingeniero de software", en: "Software Engineer" },
  tagline: {
    es: "Programo con JavaScript, TypeScript, Node.js y NestJS, sobre PostgreSQL, Prisma y Redis, con arquitecturas basadas en eventos y colas.",
    en: "I build with JavaScript, TypeScript, Node.js and NestJS, on top of PostgreSQL, Prisma and Redis, using event- and queue-based architectures.",
  },

  about: {
    es: [
      "Soy ingeniero de software con cuatro años y medio de experiencia. Trabajo con JavaScript, TypeScript, Node.js y NestJS. Para los datos uso PostgreSQL con Prisma y Redis, y para los eventos y las colas, BullMQ.",
      "En Uelz, empresa del sector fintech, he trabajado en un servicio de gestión de suscripciones integrado con distintas pasarelas de pago: Stripe, Redsys, SEPA y Gr4vy.",
    ],
    en: [
      "I'm a software engineer with 4.5 years of experience. I work with JavaScript, TypeScript, Node.js and NestJS. For data I use PostgreSQL with Prisma and Redis, and for events and queues, BullMQ.",
      "At Uelz, a fintech company, I've worked on a subscription management service integrated with several payment gateways: Stripe, Redsys, SEPA and Gr4vy.",
    ],
  },

  facts: [
    {
      label: { es: "Experiencia", en: "Experience" },
      value: { es: "4 años y medio", en: "4.5 years" },
    },
    {
      label: { es: "Idiomas", en: "Languages" },
      // Un array se muestra como una línea por elemento.
      value: { es: ["Español (lengua materna)", "Inglés (B2)"], en: ["Spanish (native)", "English (B2)"] },
    },
  ],

  stack: [
    { group: { es: "Lenguajes", en: "Languages" }, icon: "{ }", items: ["JavaScript", "TypeScript"] },
    { group: { es: "Backend", en: "Backend" }, icon: "⬢", items: ["Node.js", "NestJS"] },
    { group: { es: "Datos", en: "Data" }, icon: "◫", items: ["PostgreSQL", "Prisma", "Redis"] },
    {
      group: { es: "Mensajería", en: "Messaging" },
      icon: "⇄",
      items: [{ es: "Eventos", en: "Events" }, { es: "Colas", en: "Queues" }, "BullMQ"],
    },
  ],

  // De más reciente a más antigua.
  experience: [
    {
      company: "Uelz",
      sector: "Fintech",
      description: {
        es: "Servicio de gestión de suscripciones con integraciones de diferentes pasarelas de pago.",
        en: "Subscription management service with integrations for several payment gateways.",
      },
      integrations: ["Stripe", "Redsys", "SEPA", "Gr4vy"],
    },
  ],
};
