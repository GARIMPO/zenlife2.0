import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { requestPersistentStorage, checkStorageQuota } from './lib/indexedDBStorage';

// Forçar o modo escuro definindo o atributo data-theme no elemento HTML
document.documentElement.setAttribute('data-theme', 'dark');
document.documentElement.classList.add('dark');

// Garantir que o tema permaneça escuro mesmo após navegação ou atualização
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.setAttribute('data-theme', 'dark');
  document.documentElement.classList.add('dark');
  localStorage.setItem('theme', 'dark');
});

// Prevenir mudanças de tema, forçando o modo escuro
const forceTheme = () => {
  document.documentElement.setAttribute('data-theme', 'dark');
  document.documentElement.classList.add('dark');
  localStorage.setItem('theme', 'dark');
}
window.addEventListener('storage', forceTheme);
window.matchMedia('(prefers-color-scheme: dark)').addListener(forceTheme);

// Solicitar armazenamento persistente ao iniciar o aplicativo
const initialize = async () => {
  try {
    // Solicitar armazenamento persistente
    const isPersisted = await requestPersistentStorage();
    console.log(`Armazenamento persistente: ${isPersisted ? 'ativo' : 'não ativo'}`);
    
    // Verificar espaço disponível
    await checkStorageQuota();
  } catch (error) {
    console.error('Erro ao inicializar armazenamento:', error);
  }
  
  // Renderizar o aplicativo
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Iniciar o aplicativo
initialize();

// Registrar o service worker para funcionalidade PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registrado com sucesso:', registration.scope);
      })
      .catch(error => {
        console.error('Falha ao registrar o ServiceWorker:', error);
      });
  });
}
