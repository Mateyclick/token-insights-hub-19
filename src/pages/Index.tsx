import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { ResultsTable } from '@/components/ResultsTable';
import { ResultsChart } from '@/components/ResultsChart';
import { Button } from '@/components/ui/button';
import { analyzeFile, AnalysisResult } from '@/lib/formatUtils';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileCode } from 'lucide-react';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setResults(null);

    try {
      const analysisResults = await analyzeFile(selectedFile);
      setResults(analysisResults);
      toast({
        title: 'Analysis complete',
        description: `File analyzed successfully in ${analysisResults.totalTime.toFixed(2)}ms`
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'Failed to analyze file',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <FileCode className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Token Format Analyzer</h1>
              <p className="text-sm text-muted-foreground">Compare token usage across file formats</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Upload Section */}
          <div className="space-y-4">
            <FileUpload onFileSelect={handleFileSelect} isAnalyzing={isAnalyzing} />
            
            {selectedFile && (
              <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <FileCode className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing}
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze File'
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Results Section */}
          {results && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <ResultsTable
                results={results.results}
                detectedFormat={results.detectedFormat}
                originalTokens={results.originalTokens}
                totalTime={results.totalTime}
              />
              
              <ResultsChart results={results.results} />
            </div>
          )}

          {/* Info Section */}
          {!results && !selectedFile && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-card rounded-lg border border-border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">📁</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Upload Files</h3>
                <p className="text-sm text-muted-foreground">
                  Support for JSON, YAML, TOML, XML, and plain text formats
                </p>
              </div>
              
              <div className="p-6 bg-card rounded-lg border border-border">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Auto Detection</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically detects file format and converts to all supported types
                </p>
              </div>
              
              <div className="p-6 bg-card rounded-lg border border-border">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Compare Tokens</h3>
                <p className="text-sm text-muted-foreground">
                  View detailed comparison of token counts, time, and estimated costs
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
