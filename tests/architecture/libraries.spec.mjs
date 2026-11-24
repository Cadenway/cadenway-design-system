import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { verifyAngularArchitecture } from '@cadenway/angular-testing/architecture';
import ts from 'typescript';

const rootUrl = new URL('../../', import.meta.url);
const rootDir = fileURLToPath(rootUrl);
const markdownEntry = 'packages/ui/components/markdown/public-api.ts';

function markdownCompatibilityLines() {
  const source = ts.createSourceFile(
    markdownEntry,
    readFileSync(new URL(markdownEntry, rootUrl), 'utf8'),
    ts.ScriptTarget.Latest,
  );
  const declarations = source.statements.map((statement) => {
    assert.ok(ts.isExportDeclaration(statement));
    assert.ok(statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier));
    assert.ok(statement.exportClause && ts.isNamedExports(statement.exportClause));
    return {
      from: statement.moduleSpecifier.text,
      typeOnly: statement.isTypeOnly,
      symbols: statement.exportClause.elements.map(({ name, propertyName, isTypeOnly }) => {
        assert.equal(propertyName, undefined);
        assert.equal(isTypeOnly, false);
        return name.text;
      }),
    };
  });
  assert.deepEqual(declarations, [
    { from: './markdown.component', typeOnly: false, symbols: ['CwMarkdown'] },
    { from: './markdown.marked', typeOnly: false, symbols: ['ɵcreateMarked'] },
    { from: '@cadenway/ui/core', typeOnly: false, symbols: ['ɵwriteMention'] },
    { from: '@cadenway/ui/core', typeOnly: true, symbols: ['ɵMentionToken', 'ɵUnderlineToken'] },
    { from: './markdown.constants', typeOnly: false, symbols: ['CW_MARKDOWN_LABELS'] },
    { from: './markdown.providers', typeOnly: false, symbols: ['provideCwMarkdownLabels'] },
    { from: './markdown.types', typeOnly: true, symbols: ['CwMarkdownLabels'] },
  ]);
  return new Set(
    source.statements
      .slice(1)
      .map(
        (statement) => source.getLineAndCharacterOfPosition(statement.getStart(source)).line + 1,
      ),
  );
}

test('UI entry points and test layout respect the library architecture', () => {
  const compatibilityLines = markdownCompatibilityLines();
  assert.deepEqual(
    verifyAngularArchitecture({
      rootDir,
      tsconfig: 'packages/ui/tsconfig.lib.json',
      profile: 'library',
      roots: ['packages/ui', 'apps/storybook/src'],
      exceptions: [
        {
          file: 'packages/ui/tests/forms-ng-model.spec.ts',
          rule: 'spec-colocation',
          reason: 'The compatibility suite checks the forms integration of multiple UI bricks.',
        },
      ],
    }).filter(
      ({ file, rule, line }) =>
        !(
          file === markdownEntry &&
          rule === 'private-library-symbol' &&
          compatibilityLines.has(line)
        ),
    ),
    [],
  );
});

test('Icons respect the library architecture', () => {
  assert.deepEqual(
    verifyAngularArchitecture({
      rootDir,
      tsconfig: 'packages/icons/tsconfig.lib.json',
      profile: 'library',
      roots: ['packages/icons'],
    }),
    [],
  );
});
