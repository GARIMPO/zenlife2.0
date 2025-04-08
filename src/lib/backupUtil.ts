import { dbGetAll, dbSet, initDB } from './indexedDBStorage';

// Função para exportar todos os dados do IndexedDB
export const exportAllData = async (): Promise<string> => {
  try {
    // Buscar os dados de cada store
    const userData = await dbGetAll('userData');
    const users = await dbGetAll('users');
    const settings = await dbGetAll('settings');
    
    // Criar objeto com todos os dados
    const allData = {
      userData,
      users,
      settings,
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0'
    };

    // Adicionar informações extras ao backup
    const extraInfo = {
      totalItems: userData.length + users.length + settings.length,
      deviceInfo: navigator.userAgent,
      backupType: 'full',
    };
    
    // Converter para JSON
    return JSON.stringify({...allData, extraInfo}, null, 2);
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    throw new Error('Não foi possível exportar os dados. Tente novamente.');
  }
};

// Função para importar dados do JSON
export const importAllData = async (jsonData: string): Promise<{ success: boolean, message: string }> => {
  try {
    // Verificar se o JSON é válido
    const data = JSON.parse(jsonData);
    
    if (!data || typeof data !== 'object') {
      throw new Error('Formato de arquivo inválido');
    }
    
    // Verificar se os dados têm a estrutura esperada
    if (!data.userData || !Array.isArray(data.userData)) {
      throw new Error('Dados de usuário inválidos ou ausentes no arquivo de backup');
    }
    
    // Obter acesso ao banco de dados
    const db = await initDB();
    
    // Importar dados do userData (principal store de dados do app)
    if (data.userData && Array.isArray(data.userData)) {
      for (const item of data.userData) {
        if (item && item.key && item.data) {
          await dbSet('userData', item.key, item.data);
        }
      }
    }
    
    // Importar usuários (com cuidado para não sobrescrever o usuário atual)
    if (data.users && Array.isArray(data.users)) {
      for (const user of data.users) {
        if (user && user.id) {
          // Verificar se o usuário já existe
          const existingUser = await dbGetAll('users');
          if (!existingUser.some((u: any) => u.id === user.id)) {
            await dbSet('users', user.id, user);
          }
        }
      }
    }
    
    // Importar configurações (apenas algumas configurações específicas)
    if (data.settings && Array.isArray(data.settings)) {
      for (const setting of data.settings) {
        if (setting && setting.key && 
            // Lista de configurações seguras para importar
            ['theme', 'preferences', 'userPreferences'].includes(setting.key)) {
          await dbSet('settings', setting.key, setting.data);
        }
      }
    }
    
    return { 
      success: true, 
      message: 'Backup importado com sucesso. Os dados foram restaurados.' 
    };
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Erro desconhecido ao importar dados' 
    };
  }
};

// Função para fazer download do arquivo de backup
export const downloadBackup = (data: string) => {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  
  // Nome do arquivo com data atual
  const date = new Date().toISOString().split('T')[0];
  a.download = `zenlife_backup_${date}.json`;
  a.href = url;
  a.click();
  
  URL.revokeObjectURL(url);
};

// Função para ler o arquivo de backup
export const readBackupFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Não foi possível ler o arquivo'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo'));
    };
    
    reader.readAsText(file);
  });
}; 