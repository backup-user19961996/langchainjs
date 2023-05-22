import {
  Tiktoken,
  TiktokenBPE,
  TiktokenEncoding,
  TiktokenModel,
  getEncodingNameForModel,
} from "js-tiktoken/lite";
import { AsyncCaller } from "./async_caller.js";

export const cache: Record<string, Promise<TiktokenBPE>> = {};

export const setEncodingCache = (key: string, func: Promise<TiktokenBPE>) => {
  cache[key] = func;
};

const caller = /* #__PURE__ */ new AsyncCaller({});

export async function getEncoding(
  encoding: TiktokenEncoding,
  options?: {
    signal?: AbortSignal;
    extendedSpecialTokens?: Record<string, number>;
  }
) {
  if (!(encoding in cache)) {
    cache[encoding] = caller
      .fetch(`https://tiktoken.pages.dev/js/${encoding}.json`, {
        signal: options?.signal,
      })
      .then((res) => res.json())
      .catch((e) => {
        delete cache[encoding];
        throw e;
      });
  } else {
    console.log("cache hit for encoding", encoding);
  }

  return new Tiktoken(await cache[encoding], options?.extendedSpecialTokens);
}

export async function encodingForModel(
  model: TiktokenModel,
  options?: {
    signal?: AbortSignal;
    extendedSpecialTokens?: Record<string, number>;
  }
) {
  return getEncoding(getEncodingNameForModel(model), options);
}
