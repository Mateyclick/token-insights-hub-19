import { Tiktoken, get_encoding, Tiktoken as TiktokenType } from 'tiktoken';

// Type for Llama tokenizer - usando tiktoken como aproximación
type LlamaTokenizerInstance = {
  encode: (text: string) => number[];
  decode: (tokens: number[]) => string;
};

// Cache para tokenizers cargados
let tiktokenCache: Map<string, Tiktoken> = new Map();
let llamaTokenizerCache: LlamaTokenizerInstance | null = null;

/**
 * Carga el tokenizer de tiktoken para un modelo específico de OpenAI
 */
export async function loadTiktoken(model: string): Promise<Tiktoken> {
  const start = performance.now();
  
  try {
    // Verificar si ya está en cache
    if (tiktokenCache.has(model)) {
      console.log(`Tiktoken ${model} loaded from cache in ${(performance.now() - start).toFixed(2)}ms`);
      return tiktokenCache.get(model)!;
    }

    // Mapeo de modelos a encodings
    const encodingMap: Record<string, string> = {
      'gpt-4': 'cl100k_base',
      'gpt-4o': 'o200k_base',
      'gpt-4o-mini': 'o200k_base',
      'gpt-3.5-turbo': 'cl100k_base',
      'text-embedding-ada-002': 'cl100k_base',
      'text-davinci-003': 'p50k_base',
      'text-davinci-002': 'p50k_base',
      'davinci': 'r50k_base',
    };

    const encodingName = encodingMap[model] || 'cl100k_base';
    const encoding = get_encoding(encodingName as any);
    
    tiktokenCache.set(model, encoding);
    console.log(`Tiktoken ${model} (${encodingName}) loaded in ${(performance.now() - start).toFixed(2)}ms`);
    
    return encoding;
  } catch (error) {
    console.error('Error loading tiktoken:', error);
    throw new Error(`Failed to load tiktoken for model ${model}: ${error}`);
  }
}

/**
 * Carga el tokenizer de Llama
 * NOTA: Actualmente usa tiktoken (cl100k_base) como aproximación.
 * Para tokenización exacta de Llama, considera integrar un tokenizer específico.
 */
export async function loadLlamaTokenizer(model: string): Promise<LlamaTokenizerInstance> {
  const start = performance.now();
  
  try {
    // Verificar si ya está en cache
    if (llamaTokenizerCache) {
      console.log(`Llama tokenizer loaded from cache in ${(performance.now() - start).toFixed(2)}ms`);
      return llamaTokenizerCache;
    }

    // Usar tiktoken como aproximación para modelos Llama/Mistral
    const tiktokenEncoding = get_encoding('cl100k_base');
    llamaTokenizerCache = {
      encode: (text: string) => {
        const result = tiktokenEncoding.encode(text);
        return Array.from(result);
      },
      decode: (tokens: number[]) => {
        const decoded = tiktokenEncoding.decode(new Uint32Array(tokens));
        return new TextDecoder().decode(decoded);
      }
    };
    
    console.log(`Llama tokenizer (tiktoken approximation) loaded in ${(performance.now() - start).toFixed(2)}ms`);
    
    return llamaTokenizerCache;
  } catch (error) {
    console.error('Error loading llama tokenizer:', error);
    throw new Error(`Failed to load llama tokenizer for model ${model}: ${error}`);
  }
}

/**
 * Cuenta tokens usando tiktoken para modelos OpenAI
 */
export async function countTokensWithTiktoken(
  text: string,
  model: string
): Promise<{ tokens: number; timeMs: number }> {
  const start = performance.now();
  
  try {
    const encoding = await loadTiktoken(model);
    const tokens = encoding.encode(text);
    const timeMs = performance.now() - start;
    
    return {
      tokens: tokens.length,
      timeMs: parseFloat(timeMs.toFixed(2))
    };
  } catch (error) {
    console.error('Error counting tokens with tiktoken:', error);
    throw error;
  }
}

/**
 * Cuenta tokens usando llama tokenizer para modelos Llama/Mistral
 * NOTA: Actualmente usa tiktoken como aproximación
 */
export async function countTokensWithLlama(
  text: string,
  model: string
): Promise<{ tokens: number; timeMs: number }> {
  const start = performance.now();
  
  try {
    const tokenizer = await loadLlamaTokenizer(model);
    const tokens = tokenizer.encode(text);
    const timeMs = performance.now() - start;
    
    return {
      tokens: tokens.length,
      timeMs: parseFloat(timeMs.toFixed(2))
    };
  } catch (error) {
    console.error('Error counting tokens with llama tokenizer:', error);
    throw error;
  }
}

/**
 * Detecta automáticamente qué tokenizer usar basándose en el modelo
 * y cuenta los tokens
 */
export async function countTokensAuto(
  text: string,
  model: string
): Promise<{ tokens: number; timeMs: number }> {
  const start = performance.now();
  
  // Detectar si es un modelo OpenAI o Llama/Mistral
  const openAIModels = [
    'gpt-4',
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-3.5-turbo',
    'text-embedding-ada-002',
    'text-davinci',
    'davinci',
    'curie',
    'babbage',
    'ada'
  ];
  
  const llamaModels = [
    'llama',
    'mistral',
    'mixtral',
    'codellama',
    'vicuna',
    'alpaca'
  ];
  
  const modelLower = model.toLowerCase();
  
  // Verificar si es modelo OpenAI
  const isOpenAI = openAIModels.some(prefix => modelLower.includes(prefix));
  
  // Verificar si es modelo Llama/Mistral
  const isLlama = llamaModels.some(prefix => modelLower.includes(prefix));
  
  try {
    let result;
    
    if (isOpenAI) {
      result = await countTokensWithTiktoken(text, model);
    } else if (isLlama) {
      result = await countTokensWithLlama(text, model);
    } else {
      // Por defecto, usar tiktoken con cl100k_base
      console.warn(`Unknown model type "${model}", defaulting to tiktoken (cl100k_base)`);
      result = await countTokensWithTiktoken(text, model);
    }
    
    // Ajustar el tiempo total
    const totalTimeMs = performance.now() - start;
    
    return {
      tokens: result.tokens,
      timeMs: parseFloat(totalTimeMs.toFixed(2))
    };
  } catch (error) {
    console.error('Error in countTokensAuto:', error);
    throw error;
  }
}

/**
 * Limpia el cache de tokenizers (útil para pruebas o liberación de memoria)
 */
export function clearTokenizerCache(): void {
  tiktokenCache.forEach(encoding => encoding.free());
  tiktokenCache.clear();
  llamaTokenizerCache = null;
  console.log('Tokenizer cache cleared');
}
