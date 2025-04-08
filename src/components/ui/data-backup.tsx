import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Download, Upload, File, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { useToast } from './use-toast';
import { exportAllData, importAllData, downloadBackup, readBackupFile } from '@/lib/backupUtil';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Progress } from './progress';

export function DataBackup() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [showImportAlert, setShowImportAlert] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para exportar os dados
  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = await exportAllData();
      downloadBackup(data);
      
      toast({
        title: "Backup concluído",
        description: "Seus dados foram exportados com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast({
        title: "Erro ao exportar",
        description: error instanceof Error ? error.message : "Não foi possível exportar os dados",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Função para importar os dados
  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setImportProgress(20);
      setShowImportAlert(true);
      
      // Ler o arquivo
      const jsonData = await readBackupFile(file);
      setImportProgress(50);
      
      // Importar os dados
      const result = await importAllData(jsonData);
      setImportProgress(100);
      
      if (result.success) {
        toast({
          title: "Importação concluída",
          description: result.message,
        });
      } else {
        toast({
          title: "Erro na importação",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      toast({
        title: "Erro ao importar",
        description: error instanceof Error ? error.message : "Não foi possível importar o arquivo",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setShowImportAlert(false);
      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Gatilho para abrir o seletor de arquivos
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Backup e Restauração
        </CardTitle>
        <CardDescription>
          Exporte seus dados para backup ou restaure a partir de um arquivo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
        {showImportAlert && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Importando dados</AlertTitle>
            <AlertDescription>
              <p className="mb-2">Não feche o navegador durante a importação.</p>
              <Progress value={importProgress} className="h-2 mt-2" />
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2 py-6"
            onClick={handleExportData}
            disabled={isExporting || isImporting}
          >
            <Download className="h-5 w-5" />
            <div className="flex flex-col items-center">
              <span className="font-medium">Exportar Backup</span>
              <span className="text-xs text-muted-foreground">Salve seus dados</span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-center gap-2 py-6"
            onClick={triggerFileInput}
            disabled={isExporting || isImporting}
          >
            <Upload className="h-5 w-5" />
            <div className="flex flex-col items-center">
              <span className="font-medium">Importar Backup</span>
              <span className="text-xs text-muted-foreground">Restaure seus dados</span>
            </div>
          </Button>
        </div>

        <input 
          type="file" 
          ref={fileInputRef}
          accept=".json"
          className="hidden"
          onChange={handleImportData}
        />

        <p className="text-sm text-muted-foreground mt-4">
          <AlertCircle className="h-4 w-4 inline-block mr-1" />
          Importante: Ao importar um backup, recomendamos reiniciar o aplicativo após a conclusão.
        </p>
      </CardContent>
    </Card>
  );
} 