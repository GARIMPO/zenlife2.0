
import { useEffect, useState } from 'react';

export interface IdeaStep {
  id: number;
  description: string;
  cost: number;
  completed: boolean;
}

export interface Idea {
  id: number;
  name: string;
  description?: string;
  totalCost: number;
  steps: IdeaStep[];
  createdAt: string;
  updatedAt: string;
  archived?: boolean; // Added archived property
  archivedDate?: string; // Added archivedDate property
}

const IDEAS_STORAGE_KEY = 'zenlife-ideas';

// Empty array for ideas
const defaultIdeas: Idea[] = [];

// Salvar ideias no localStorage
export const saveIdeas = (ideas: Idea[]) => {
  localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(ideas));
};

// Obter ideias do localStorage
export const getIdeas = (): Idea[] => {
  const storedIdeas = localStorage.getItem(IDEAS_STORAGE_KEY);
  const ideas = storedIdeas ? JSON.parse(storedIdeas) : defaultIdeas;
  
  // Garantir que todas as ideias tenham a propriedade archived
  return ideas.map((idea: Idea) => ({
    ...idea,
    archived: idea.archived ?? false // Use ?? para garantir que undefined se torne false
  }));
};

// Hook customizado para gerenciar estado das ideias
export const useIdeas = () => {
  const [ideas, setIdeas] = useState<Idea[]>(getIdeas());

  // Atualiza automaticamente o totalCost sempre que as ideias mudarem
  useEffect(() => {
    const updatedIdeas = ideas.map(idea => {
      const totalCost = idea.steps.reduce((acc, step) => acc + step.cost, 0);
      return { ...idea, totalCost, updatedAt: new Date().toISOString() };
    });

    // Só atualiza se houver mudança real nos custos
    if (JSON.stringify(updatedIdeas) !== JSON.stringify(ideas)) {
      setIdeas(updatedIdeas);
    } else {
      // Ainda salvamos no localStorage mesmo se não houver mudança nos custos
      // para garantir que outras mudanças sejam persistidas
      saveIdeas(ideas);
    }
  }, [ideas]);

  return { ideas, setIdeas };
};

// Obter apenas ideias ativas (não arquivadas)
export const getActiveIdeas = (): Idea[] => {
  return getIdeas().filter(idea => !idea.archived);
};

// Obter apenas ideias arquivadas
export const getArchivedIdeas = (): Idea[] => {
  return getIdeas().filter(idea => idea.archived);
};

// Arquivar uma ideia
export const archiveIdea = (ideaId: number, ideas: Idea[], setIdeas: React.Dispatch<React.SetStateAction<Idea[]>>) => {
  const updatedIdeas = ideas.map(idea => 
    idea.id === ideaId 
      ? { ...idea, archived: true, archivedDate: new Date().toISOString() }
      : idea
  );
  setIdeas(updatedIdeas);
  return updatedIdeas;
};

// Restaurar uma ideia arquivada
export const restoreIdea = (ideaId: number, ideas: Idea[], setIdeas: React.Dispatch<React.SetStateAction<Idea[]>>) => {
  const updatedIdeas = ideas.map(idea => 
    idea.id === ideaId 
      ? { ...idea, archived: false, archivedDate: undefined }
      : idea
  );
  setIdeas(updatedIdeas);
  return updatedIdeas;
};
