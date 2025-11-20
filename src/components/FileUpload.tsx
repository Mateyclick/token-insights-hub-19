import { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isAnalyzing: boolean;
}

export const FileUpload = ({ onFileSelect, isAnalyzing }: FileUploadProps) => {
  const { toast } = useToast();

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      
      if (isAnalyzing) return;
      
      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;
      
      const file = files[0];
      const validExtensions = ['.json', '.yaml', '.yml', '.toml', '.xml', '.txt'];
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validExtensions.includes(extension)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a JSON, YAML, TOML, XML, or text file.',
          variant: 'destructive'
        });
        return;
      }
      
      onFileSelect(file);
    },
    [onFileSelect, isAnalyzing, toast]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer bg-card"
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept=".json,.yaml,.yml,.toml,.xml,.txt"
        onChange={handleFileInput}
        disabled={isAnalyzing}
      />
      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground mb-1">
            Drop your file here or click to browse
          </p>
          <p className="text-sm text-muted-foreground">
            Supports JSON, YAML, TOML, XML, and text files
          </p>
        </div>
      </label>
    </div>
  );
};
