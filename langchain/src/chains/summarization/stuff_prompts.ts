/* eslint-disable spaced-comment */
import { PromptTemplate } from "../../prompts/prompt.js";

const template = `Write a concise summary of the following content, the content is not in English, reply in the language of the content is in:


Content: "{text}"


CONCISE SUMMARY:`;

export const DEFAULT_PROMPT = /*#__PURE__*/ new PromptTemplate({
  template,
  inputVariables: ["text"],
});
