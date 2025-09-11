// src/types/global.d.ts
// Declaraciones de tipos globales para TypeScript

declare global {
  interface Window {
    viewPerson: (personId: string) => void;
    editPerson: (personId: string) => void;
    deletePerson: (personId: string, personName: string) => void;
    initializePersonasFilters: (personas: any[]) => void;
    initializePersonasActions: () => void;
    handleApiResponse: () => void;
  }
  // Permitir imports dinámicos de CDN sin tipos
  const jsPDF: any;
}

// Esto es necesario para que TypeScript trate este archivo como un módulo
export {};

// Declaraciones para imports dinámicos sin tipos
declare module 'xlsx';
declare module 'https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs';
declare module 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
declare module 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.1/dist/jspdf.plugin.autotable.min.js';
declare module '/src/scripts/*';

