import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import ts from 'typescript';

const printer = ts.createPrinter({ removeComments: true });
// Static members the Angular compiler writes on components and directives.
const angularMetadata = new Set(['ɵcmp', 'ɵdir']);
// Positions of the input and output maps in ɵɵComponentDeclaration and ɵɵDirectiveDeclaration.
const inputMap = 3;
const outputMap = 4;

function print(node) {
  return printer
    .printNode(ts.EmitHint.Unspecified, node, node.getSourceFile())
    .replace(/^(?:(?:export|declare|default) )+/u, '');
}

function hasModifier(node, flag) {
  return (ts.getCombinedModifierFlags(node) & flag) !== 0;
}

function memberName(member) {
  return member.name ? member.name.getText() : ts.SyntaxKind[member.kind];
}

function memberKey(member) {
  return `${hasModifier(member, ts.ModifierFlags.Static) ? 'static ' : ''}${memberName(member)}`;
}

function angularMember(declaration) {
  return declaration.members.find(
    (member) =>
      ts.isPropertyDeclaration(member) &&
      hasModifier(member, ts.ModifierFlags.Static) &&
      angularMetadata.has(memberName(member)),
  );
}

/**
 * Whether the protected members of a class only serve its template: Angular components and
 * directives are used through their selectors and bindings, never subclassed by consumers. An
 * abstract directive is a base class, so its protected members stay in the contract.
 */
function templateBound(declaration) {
  return (
    ts.isClassDeclaration(declaration) &&
    !hasModifier(declaration, ts.ModifierFlags.Abstract) &&
    angularMember(declaration) !== undefined
  );
}

function contractMembers(declaration) {
  const hidden = templateBound(declaration)
    ? ts.ModifierFlags.Private | ts.ModifierFlags.Protected
    : ts.ModifierFlags.Private;
  return declaration.members.filter(
    (member) =>
      !hasModifier(member, hidden) && !(member.name && ts.isPrivateIdentifier(member.name)),
  );
}

function header(declaration) {
  const { factory } = ts;
  const empty = ts.isClassDeclaration(declaration)
    ? factory.updateClassDeclaration(
        declaration,
        declaration.modifiers,
        declaration.name,
        declaration.typeParameters,
        declaration.heritageClauses,
        [],
      )
    : factory.updateInterfaceDeclaration(
        declaration,
        declaration.modifiers,
        declaration.name,
        declaration.typeParameters,
        declaration.heritageClauses,
        [],
      );
  return print(empty);
}

function hasMembers(declaration) {
  return ts.isClassDeclaration(declaration) || ts.isInterfaceDeclaration(declaration);
}

function shape(declaration) {
  return hasMembers(declaration)
    ? { declaration: header(declaration), members: contractMembers(declaration).map(print) }
    : print(declaration);
}

function typeArgument(member, index) {
  return member?.type && ts.isTypeReferenceNode(member.type)
    ? member.type.typeArguments?.[index]
    : undefined;
}

function bindingNames(declaration) {
  const metadata = angularMember(declaration);
  return [inputMap, outputMap].flatMap((index) => {
    const map = typeArgument(metadata, index);
    return map && ts.isTypeLiteralNode(map)
      ? map.members.flatMap((entry) => (entry.name ? [entry.name.text] : []))
      : [];
  });
}

function requiredInput(entry) {
  return (
    ts.isPropertySignature(entry) &&
    entry.type !== undefined &&
    ts.isTypeLiteralNode(entry.type) &&
    entry.type.members.some(
      (field) =>
        field.name?.text === 'required' &&
        field.type?.kind === ts.SyntaxKind.LiteralType &&
        field.type.literal.kind === ts.SyntaxKind.TrueKeyword,
    )
  );
}

/**
 * Whether candidate Angular metadata only adds bindings: every released input and output stays as
 * it was, new outputs are allowed and new inputs are optional. Every other argument (class,
 * selector, exportAs, queries, content slots, standalone flag, host directives) stays as printed.
 */
function additiveMetadata(released, candidate) {
  const from = released.type;
  const to = candidate.type;
  if (!from || !to || !ts.isTypeReferenceNode(from) || !ts.isTypeReferenceNode(to)) return false;
  const releasedArguments = from.typeArguments ?? [];
  const candidateArguments = to.typeArguments ?? [];
  if (
    print(from.typeName) !== print(to.typeName) ||
    releasedArguments.length !== candidateArguments.length
  ) {
    return false;
  }
  return releasedArguments.every((argument, index) => {
    const counterpart = candidateArguments[index];
    if (print(argument) === print(counterpart)) return true;
    if (
      ![inputMap, outputMap].includes(index) ||
      !ts.isTypeLiteralNode(argument) ||
      !ts.isTypeLiteralNode(counterpart)
    ) {
      return false;
    }
    const releasedEntries = new Set(argument.members.map(print));
    const candidateEntries = new Set(counterpart.members.map(print));
    return (
      [...releasedEntries].every((entry) => candidateEntries.has(entry)) &&
      counterpart.members.every(
        (entry) =>
          releasedEntries.has(print(entry)) || index === outputMap || !requiredInput(entry),
      )
    );
  });
}

function declared(checker, name) {
  let symbol = checker.getSymbolAtLocation(name);
  if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
  // The checker gives an unresolved type name a symbol without declarations and the error type,
  // which every type is assignable to and from.
  return symbol !== undefined && !checker.isUnknownSymbol(symbol) && !!symbol.declarations?.length;
}

/** Whether every type reference written in a node resolves, so an unresolved type never passes. */
function resolves(checker, node) {
  if (node === undefined) return true;
  if (ts.isTypeReferenceNode(node) && !declared(checker, node.typeName)) return false;
  if (ts.isTypeQueryNode(node) && !declared(checker, node.exprName)) return false;
  return !ts.forEachChild(node, (child) => !resolves(checker, child) || undefined);
}

function assignable(checker, source, target) {
  if (!resolves(checker, source.type) || !resolves(checker, target.type)) return false;
  const sourceType = source.type
    ? checker.getTypeFromTypeNode(source.type)
    : checker.getTypeAtLocation(source.name);
  const targetType = target.type
    ? checker.getTypeFromTypeNode(target.type)
    : checker.getTypeAtLocation(target.name);
  return checker.isTypeAssignableTo(sourceType, targetType);
}

function untyped(property) {
  return print(
    ts.factory.updatePropertyDeclaration(
      property,
      property.modifiers,
      property.name,
      property.questionToken ?? property.exclamationToken,
      undefined,
      undefined,
    ),
  );
}

/**
 * Whether a changed class member still serves the consumers of the released one. Angular metadata
 * may add bindings. A readonly property that is not an input, model or output is only read, so it
 * may narrow its type; inputs and models are written from templates and stay as printed.
 */
function compatibleMember(checker, released, candidate, bindings) {
  if (!ts.isPropertyDeclaration(released) || !ts.isPropertyDeclaration(candidate)) return false;
  if (untyped(released) !== untyped(candidate)) return false;
  if (angularMetadata.has(memberName(released)) && hasModifier(released, ts.ModifierFlags.Static)) {
    return additiveMetadata(released, candidate);
  }
  return (
    hasModifier(released, ts.ModifierFlags.Readonly) &&
    !bindings.has(memberName(released)) &&
    assignable(checker, candidate, released)
  );
}

function optionalMember(member) {
  return (
    (ts.isPropertySignature(member) || ts.isMethodSignature(member)) &&
    member.questionToken !== undefined
  );
}

function projectedMembers(checker, released, candidate) {
  const releasedMembers = contractMembers(released);
  const candidateMembers = contractMembers(candidate);
  const releasedTexts = new Set(releasedMembers.map(print));
  const candidateTexts = new Set(candidateMembers.map(print));
  const bindings = new Set(
    ts.isClassDeclaration(candidate) ? [...bindingNames(released), ...bindingNames(candidate)] : [],
  );
  const shown = new Set();
  const kept = releasedMembers.flatMap((member) => {
    const text = print(member);
    if (candidateTexts.has(text)) return [text];
    const counterparts = candidateMembers.filter(
      (other) => memberKey(other) === memberKey(member) && !releasedTexts.has(print(other)),
    );
    const [counterpart] = counterparts;
    if (
      counterparts.length === 1 &&
      ts.isClassDeclaration(candidate) &&
      compatibleMember(checker, member, counterpart, bindings)
    ) {
      return [text];
    }
    for (const other of counterparts) shown.add(other);
    return counterparts.map(print);
  });
  // Consumers build objects of a released interface, so a member it gains must be optional: a new
  // required property, method, overload, call, construct or index signature breaks them.
  const required = ts.isInterfaceDeclaration(candidate)
    ? candidateMembers.filter(
        (member) =>
          !releasedTexts.has(print(member)) && !shown.has(member) && !optionalMember(member),
      )
    : [];
  return [...kept, ...required.map(print)];
}

function sameTypeParameters(released, candidate) {
  const list = (declaration) => (declaration.typeParameters ?? []).map(print).join(', ');
  return list(released) === list(candidate);
}

function constant(declaration) {
  return (
    ts.isVariableDeclaration(declaration) &&
    (ts.getCombinedNodeFlags(declaration) & ts.NodeFlags.Const) !== 0
  );
}

/**
 * Prints a candidate declaration as its released counterpart when it keeps the released contract,
 * and as itself otherwise, so that comparing the result with the released shape shows what changed.
 */
function projection(checker, candidate, released) {
  if (released === undefined || candidate.kind !== released.kind) return shape(candidate);
  if (hasMembers(candidate)) {
    return {
      declaration: header(candidate),
      members: projectedMembers(checker, released, candidate),
    };
  }
  const text = print(candidate);
  if (text === print(released)) return text;
  // A type alias may widen: every value of the released type still fits. Type parameters belong
  // to their own declaration, so a changed generic alias only passes when it prints identically.
  const widened =
    ts.isTypeAliasDeclaration(candidate) &&
    sameTypeParameters(released, candidate) &&
    assignable(checker, released, candidate);
  // A constant is only read, so it may narrow its type.
  const narrowed =
    constant(candidate) && constant(released) && assignable(checker, candidate, released);
  return widened || narrowed ? print(released) : text;
}

function exportedDeclarations(program, checker, path) {
  const source = program.getSourceFile(path);
  assert(source, `Missing type declarations: ${path}`);
  const module = checker.getSymbolAtLocation(source);
  assert(module, `Missing module declaration: ${path}`);
  return new Map(
    checker.getExportsOfModule(module).map((exported) => {
      const symbol =
        exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
      assert(symbol.declarations?.length, `Unresolved export ${exported.name} in ${path}`);
      return [exported.name, symbol.declarations];
    }),
  );
}

/**
 * Lists the released exports whose candidate declarations break the published contract.
 *
 * Every released export must still exist. A class or an interface keeps every released member with
 * the same printed text; a class may add members and an interface optional ones. Private members,
 * and the protected members of components and directives, are not compared. A type alias may widen, a constant and a readonly
 * class property that is not an Angular binding may narrow, and Angular metadata may add optional
 * inputs and outputs, all checked with the TypeScript checker. Any other declaration prints
 * identically.
 *
 * @param {{ label: string, released: string, candidate: string }[]} entries Declaration files
 *   to compare, by absolute path.
 * @returns {{ label: string, symbol: string, actual: unknown, expected: unknown }[]} One change per
 *   export whose candidate projection differs from its released shape.
 */
export function publishedTypeChanges(entries) {
  // One program holds both trees so that the checker can relate released and candidate types.
  const program = ts.createProgram(
    entries.flatMap(({ released, candidate }) => [released, candidate]),
    { module: ts.ModuleKind.NodeNext, skipLibCheck: true, types: [] },
  );
  const checker = program.getTypeChecker();
  return entries.flatMap(({ label, released, candidate }) => {
    const candidateExports = exportedDeclarations(program, checker, candidate);
    return [...exportedDeclarations(program, checker, released)].flatMap(
      ([symbol, declarations]) => {
        const expected = declarations.map(shape);
        const actual = candidateExports
          .get(symbol)
          ?.map((declaration, index) => projection(checker, declaration, declarations[index]));
        return isDeepStrictEqual(actual, expected) ? [] : [{ label, symbol, actual, expected }];
      },
    );
  });
}
