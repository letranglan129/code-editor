import llamaTokenizer from 'llama-tokenizer-js'

export const countTokens = (text: string) => {
    return llamaTokenizer.encode(text).length;
};