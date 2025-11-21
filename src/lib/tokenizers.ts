// src/lib/tokenizers.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tiktoken, get_encoding } from "tiktoken";

/**
 * Tokenizer module mejorado
 * - Cache liberable (.free())
 * - ENCODING_MAP con tipado estricto
 * - decode simplificado para Llama-approx
 * - getCacheStats() para diagnóstico
 * - JSDoc explicativo sobre la aproximación Llama
 */

/* ------------------------
   Tipos
   ------------------------ */
export type TokenizerResult = { tokens: number; timeMs: number };
type TiktokenCacheEntry = { encoding: Tiktoken; model: string; loadedAt: number };

type TiktokenEncoding = "cl100k_base" | "o200k_base" | "p50k_base" | "r50k_base";

/* ------------------------
   Estado / Cache
   ------------------------ */
const tiktokenCache: Map<string, TiktokenCacheEntry> = new Map();
let llamaTokenizerCache:
  | { encode: (t: string) => number[]; decode: (ts: number[]) => string }
  | null = null;

/* ------------------------
   Util helpers
   ------------------------ */
function nowMs() {
  return performance.now();
}

function normalizeEncodeResult(encResult: any): number[] {
  if (Array.isArray(encResult)) return encResult as number[];
  if (encResult instanceof Uint32Array || encResult instanceof Uint16Array || encResult instanceof Uint8Array) {
    return Array.from(encResult);
  }
  // fallback: try to coerce
  try {
    return Array.from(encResult as any);
  } catch {
    return [];
  }
}

function normalizeDecodeResult(decResult: any): string {
  if (typeof decResult === "string") return decResult;
  if (decResult instanceof Uint8Array) {
    return new TextDecoder("utf-8").decode(decResult);
  }
  try {
    return String(decResult);
  } catch {
    return "";
  }
}

/* ------------------------
   ENCODING MAP (tipado estricto)
   ------------------------ */
const ENCODING_MAP: Record<string, TiktokenEncoding> = {
  "gpt-4": "cl100k_base",
  "gpt-4-turbo": "cl100k_base",
  "gpt-4o": "o200k_base",
  "gpt-4o-mini": "o200k_base",
  "gpt-3.5-turbo": "cl100k_base",
  "gpt-3.5-turbo-16k": "cl100k_base",
  "text-embedding-ada-002": "cl100k_base",
  "text-embedding-3-small": "cl100k_base",
  "text-embedding-3-large": "cl100k_base",
  "text-davinci-003": "p50k_base",
  "text-davinci-002": "p50k_base",
  "davinci": "r50k_base",
  "curie": "r50k_base",
  "babbage": "r50k_base",
  "ada": "r50k_base",
};

/* ------------------------
   loadTiktoken
   ------------------------ */
export async function loadTiktoken(model: string): Promise<Tiktoken> {
  const start = nowMs();
  const key = model.toLowerCase();

  if (tiktokenCache.has(key)) {
    return tiktokenCache.get(key)!.encoding;
  }

  try {
    const encodingName = ENCODING_MAP[key] || ENCODING_MAP[model] || "cl100k_base";
    const encoding = get_encoding(encodingName as any) as Tiktoken;

    tiktokenCache.set(key, {
      encoding,
      model,
      loadedAt: Date.now(),
    });

    // console.debug(`Loaded encoding ${encodingName} for ${model} in ${(nowMs()-start).toFixed(2)}ms`);
    return encoding;
  } catch (err) {
    console.error("loadTiktoken error:", err);
    throw err;
  }
}

/* ------------------------
   loadLlamaTokenizer (APROXIMACION documentada)
   ------------------------ */
/**
 * loadLlamaTokenizer
 *
 * ⚠️ Esta función usa `tiktoken` (cl100k_base) como aproximación para tokenizar
 * modelos Llama/Mistral en entornos browser. Esto NO garantiza tokenización 1:1
 * con SentencePiece o tokenizers nativos de Llama. Precisión estimada: ~70-85%
 * (puede variar ±15-25%). Para tokenización exacta de Llama usa un tokenizer
 * basado en SentencePiece/WASM (ej. xenova / huggingface wasm wrappers).
 */
export async function loadLlamaTokenizer(): Promise<{ encode: (t: string) => number[]; decode: (ts: number[]) => string }> {
  if (llamaTokenizerCache) return llamaTokenizerCache;

  const encoding = get_encoding("cl100k_base") as Tiktoken;

  // Simplified decode as reviewer recommended
  llamaTokenizerCache = {
    encode: (text: string) => normalizeEncodeResult(encoding.encode(text)),
    decode: (tokens: number[]) => {
      try {
        const uint32 = new Uint32Array(tokens);
        const decoded = encoding.decode(uint32 as any);
        return normalizeDecodeResult(decoded);
      } catch (err) {
        console.warn("llama decode failed", err);
        return "";
      }
    },
  };

  return llamaTokenizerCache;
}

/* ------------------------
   countTokensWithTiktoken
   ------------------------ */
export async function countTokensWithTiktoken(text: string, model: string): Promise<TokenizerResult> {
  const start = nowMs();
  try {
    const encoding = await loadTiktoken(model);
    const raw = encoding.encode(text);
    const tokens = normalizeEncodeResult(raw);
    return { tokens: tokens.length, timeMs: parseFloat((nowMs() - start).toFixed(2)) };
  } catch (err) {
    // fallback estimation
    const fallback = Math.max(1, Math.ceil(text.length / 4));
    return { tokens: fallback, timeMs: parseFloat((nowMs() - start).toFixed(2)) };
  }
}

/* ------------------------
   countTokensWithLlama (approx)
   ------------------------ */
export async function countTokensWithLlama(text: string): Promise<TokenizerResult> {
  const start = nowMs();
  try {
    const tokenizer = await loadLlamaTokenizer();
    const tokens = tokenizer.encode(text);
    return { tokens: tokens.length, timeMs: parseFloat((nowMs() - start).toFixed(2)) };
  } catch (err) {
    const fallback = Math.max(1, Math.ceil(text.length / 4));
    return { tokens: fallback, timeMs: parseFloat((nowMs() - start).toFixed(2)) };
  }
}

/* ------------------------
   Auto detect & route
   ------------------------ */
const OPENAI_PREFIXES = ["gpt", "text-", "davinci", "curie", "babbage", "ada"];
const LLAMA_PREFIXES = ["llama", "mistral", "mixtral", "codellama", "vicuna", "alpaca"];

export async function countTokensAuto(text: string, model: string): Promise<TokenizerResult> {
  const start = nowMs();
  const lower = model.toLowerCase();
  const isOpenAI = OPENAI_PREFIXES.some((p) => lower.includes(p));
  const isLlama = LLAMA_PREFIXES.some((p) => lower.includes(p));

  let res: TokenizerResult;
  if (isOpenAI) res = await countTokensWithTiktoken(text, model);
  else if (isLlama) res = await countTokensWithLlama(text);
  else res = await countTokensWithTiktoken(text, "gpt-4");

  return { tokens: res.tokens, timeMs: parseFloat((nowMs() - start).toFixed(2)) };
}

/* ------------------------
   countChatTokens - approximation for chat messages
   ------------------------ */
export type ChatMessage = { role: string; content: string };

export async function countChatTokens(messages: ChatMessage[], model = "gpt-4"): Promise<number> {
  const encoding = await loadTiktoken(model);
  let total = 3; // base overhead
  for (const m of messages) {
    total += 4; // per-message overhead
    total += normalizeEncodeResult(encoding.encode(m.role)).length;
    total += normalizeEncodeResult(encoding.encode(m.content)).length;
  }
  return total;
}

/* ------------------------
   Cache diagnostics
   ------------------------ */
export function getCacheStats() {
  const models = Array.from(tiktokenCache.keys());
  const oldest = models.length ? Math.min(...Array.from(tiktokenCache.values()).map((e) => e.loadedAt)) : null;
  return {
    tiktokenEntries: tiktokenCache.size,
    llamaLoaded: !!llamaTokenizerCache,
    models,
    oldestEntry: oldest,
  };
}

/* ------------------------
   Clear cache (liberar memoria)
   ------------------------ */
export function clearTokenizerCache(): void {
  for (const [k, entry] of tiktokenCache.entries()) {
    try {
      if (entry.encoding && typeof (entry.encoding as any).free === "function") {
        (entry.encoding as any).free();
      }
    } catch {
      // ignore
    }
    tiktokenCache.delete(k);
  }
  llamaTokenizerCache = null;
}

/* ------------------------
   Dev helper: roundtrip test
   ------------------------ */
export async function assertEncodeDecodeRoundtrip(text: string, model = "gpt-4"): Promise<boolean> {
  try {
    const enc = await loadTiktoken(model);
    const raw = enc.encode(text);
    const arr = normalizeEncodeResult(raw);
    const maybeUint32 = new Uint32Array(arr);
    const decodedRaw = enc.decode(maybeUint32 as any);
    const decoded = normalizeDecodeResult(decodedRaw);
    return decoded === text;
  } catch {
    return false;
  }
}
