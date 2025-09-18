/// <reference types="astro/client" />

interface Window {
  showPreloader: (message?: string) => void;
  showPreloaderSuccess: (message?: string) => void;
  hidePreloader: () => void;
  personasData: any[];
  viewPerson: (id: string) => void;
  editPerson: (id: string) => void;
  deletePerson: (id: string) => void;
}
