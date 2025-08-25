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
}

// Esto es necesario para que TypeScript trate este archivo como un módulo
export {};

