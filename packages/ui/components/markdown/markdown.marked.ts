import { ɵcreateMarkdownLexer } from '@cadenway/ui/core';
import { Marked } from 'marked';

/**
 * Function ɵcreateMarked
 *
 * @description
 * Creates the lexer for the renderer and preserves the existing zero-argument factory at the
 * Markdown entry point. Loading the parser here leaves it out of unrelated bricks.
 *
 * @returns {Marked} Fresh lexer configured for the Cadenway Markdown grammar.
 */
export function ɵcreateMarked(): Marked {
  return ɵcreateMarkdownLexer(Marked);
}
