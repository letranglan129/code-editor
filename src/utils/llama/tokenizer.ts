const llamaTokenizer = require('llama-tokenizer-js')

export const countTokens = (text: string) => {
    return llamaTokenizer.encode(text).length;
};