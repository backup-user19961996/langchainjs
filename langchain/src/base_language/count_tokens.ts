import { type TiktokenModel } from "js-tiktoken/lite";
// https://www.npmjs.com/package/js-tiktoken

let countTokensInText = (text: string) => {
  return text.split(/\s+/).length;
};

export const setCountTokenInText = (func: (text: string) => number) => {
  countTokensInText = func;
};

export { countTokensInText };

export const batchTextByTokens = async (
  text: string,
  chunkSize: number,
  chunkOverlapToken: number
) => {
  const splitted = text.split(/\s+/);

  let currentGroup: string[] = [];
  let currentTokenCount = 0;
  const groups = [];

  for (let i = 0; i < splitted.length; i++) {
    const word = splitted[i];
    const tokenCount = countTokensInText(word);

    if (currentTokenCount + tokenCount > chunkSize) {
      groups.push(currentGroup.join(" "));

      const overlapStart = Math.max(0, currentGroup.length - chunkOverlapToken);
      currentGroup = currentGroup.slice(overlapStart);
      currentTokenCount = countTokensInText(currentGroup.join(" "));
    }

    currentGroup.push(word);
    currentTokenCount += tokenCount;
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup.join(" "));
  }

  return groups;
};

export const getModelNameForTiktoken = (modelName: string): TiktokenModel => {
  if (modelName.startsWith("gpt-3.5-turbo-")) {
    return "gpt-3.5-turbo";
  }

  if (modelName.startsWith("gpt-4-32k-")) {
    return "gpt-4-32k";
  }

  if (modelName.startsWith("gpt-4-")) {
    return "gpt-4";
  }

  return modelName as TiktokenModel;
};

export const getEmbeddingContextSize = (modelName?: string): number => {
  switch (modelName) {
    case "text-embedding-ada-002":
      return 8191;
    default:
      return 2046;
  }
};

export const getModelContextSize = (modelName: string): number => {
  switch (getModelNameForTiktoken(modelName)) {
    case "gpt-3.5-turbo":
      return 4096;
    case "gpt-4-32k":
      return 32768;
    case "gpt-4":
      return 8192;
    case "text-davinci-003":
      return 4097;
    case "text-curie-001":
      return 2048;
    case "text-babbage-001":
      return 2048;
    case "text-ada-001":
      return 2048;
    case "code-davinci-002":
      return 8000;
    case "code-cushman-001":
      return 2048;
    default:
      return 4097;
  }
};

interface CalculateMaxTokenProps {
  prompt: string;
  modelName: TiktokenModel;
}

export const calculateMaxTokens = async ({
  prompt,
  modelName,
}: CalculateMaxTokenProps) => {
  // fallback to approximate calculation if tiktoken is not available
  let numTokens = Math.ceil(prompt.length / 4);

  try {
    numTokens = countTokensInText(prompt);
  } catch (error) {
    console.warn(
      "Failed to calculate number of tokens, falling back to approximate count"
    );
  }

  const maxTokens = getModelContextSize(modelName);
  return maxTokens - numTokens;
};
