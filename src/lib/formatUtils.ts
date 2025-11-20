import yaml from 'js-yaml';
import * as TOML from 'smol-toml';
import { parseString } from 'xml2js';

export type FileFormat = 'json' | 'yaml' | 'toml' | 'xml' | 'text' | 'unknown';

export interface FormatResult {
  format: string;
  content: string;
  tokens: number;
  time: number;
  cost: number;
}

export interface AnalysisResult {
  detectedFormat: FileFormat;
  originalTokens: number;
  results: FormatResult[];
  totalTime: number;
}

// Estimate tokens (rough approximation: ~4 chars per token)
export const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

// Estimate cost based on tokens (example: $0.002 per 1k tokens)
export const estimateCost = (tokens: number): number => {
  return (tokens / 1000) * 0.002;
};

// Detect file format
export const detectFormat = (content: string, filename: string): FileFormat => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  if (extension === 'json') return 'json';
  if (extension === 'yaml' || extension === 'yml') return 'yaml';
  if (extension === 'toml') return 'toml';
  if (extension === 'xml') return 'xml';
  
  // Try to parse as JSON
  try {
    JSON.parse(content);
    return 'json';
  } catch {}
  
  // Try to parse as YAML
  try {
    yaml.load(content);
    return 'yaml';
  } catch {}
  
  // Try to parse as TOML
  try {
    TOML.parse(content);
    return 'toml';
  } catch {}
  
  // Try to parse as XML
  try {
    let isXML = false;
    parseString(content, (err) => {
      if (!err) isXML = true;
    });
    if (isXML) return 'xml';
  } catch {}
  
  return 'text';
};

// Parse content to object
export const parseContent = async (content: string, format: FileFormat): Promise<any> => {
  switch (format) {
    case 'json':
      return JSON.parse(content);
    
    case 'yaml':
      return yaml.load(content);
    
    case 'toml':
      return TOML.parse(content);
    
    case 'xml':
      return new Promise((resolve, reject) => {
        parseString(content, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    
    case 'text':
      return { text: content };
    
    default:
      throw new Error('Unknown format');
  }
};

// Convert object to different formats
export const convertToFormats = (data: any): Record<string, string> => {
  const formats: Record<string, string> = {};
  
  try {
    formats['JSON (Minified)'] = JSON.stringify(data);
  } catch (e) {
    formats['JSON (Minified)'] = 'Error converting to JSON';
  }
  
  try {
    formats['JSON (Pretty)'] = JSON.stringify(data, null, 2);
  } catch (e) {
    formats['JSON (Pretty)'] = 'Error converting to JSON';
  }
  
  try {
    formats['YAML'] = yaml.dump(data);
  } catch (e) {
    formats['YAML'] = 'Error converting to YAML';
  }
  
  try {
    formats['TOML'] = TOML.stringify(data as any);
  } catch (e) {
    formats['TOML'] = 'Error converting to TOML (complex structure not supported)';
  }
  
  return formats;
};

// Analyze file and return results
export const analyzeFile = async (file: File): Promise<AnalysisResult> => {
  const startTime = performance.now();
  
  const content = await file.text();
  const detectedFormat = detectFormat(content, file.name);
  const originalTokens = estimateTokens(content);
  
  // Parse content
  const parsedData = await parseContent(content, detectedFormat);
  
  // Convert to different formats
  const conversions = convertToFormats(parsedData);
  
  // Analyze each format
  const results: FormatResult[] = [];
  
  for (const [formatName, convertedContent] of Object.entries(conversions)) {
    const formatStartTime = performance.now();
    const tokens = estimateTokens(convertedContent);
    const formatTime = performance.now() - formatStartTime;
    const cost = estimateCost(tokens);
    
    results.push({
      format: formatName,
      content: convertedContent,
      tokens,
      time: formatTime,
      cost
    });
  }
  
  const totalTime = performance.now() - startTime;
  
  return {
    detectedFormat,
    originalTokens,
    results,
    totalTime
  };
};
