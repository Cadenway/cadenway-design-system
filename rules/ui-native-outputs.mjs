import angular from 'angular-eslint';

const rule = angular.tsPlugin.rules['no-output-native'];
const existingOutputs = new Map([
  ['CwAlertDialog', new Set(['cancel'])],
  ['CwAttachment', new Set(['cancel'])],
  ['CwCombobox', new Set(['search'])],
  ['CwCommentComposer', new Set(['submit', 'cancel'])],
  ['CwDropzoneFile', new Set(['cancel'])],
  ['CwInlineEdit', new Set(['cancel'])],
  ['CwRelationPicker', new Set(['search'])],
  ['CwRelations', new Set(['search'])],
  ['CwTimeEntryForm', new Set(['submit', 'cancel'])],
  ['CwTimeTracker', new Set(['pause', 'resume'])],
]);

export default {
  ...rule,
  create(context) {
    const adaptedContext = Object.create(context);
    Object.defineProperty(adaptedContext, 'report', {
      value(descriptor) {
        let node = descriptor.node;
        const name = node.name ?? node.key?.name;
        while (node && node.type !== 'ClassDeclaration') node = node.parent;
        if (!existingOutputs.get(node?.id?.name)?.has(name)) context.report(descriptor);
      },
    });
    return rule.create(adaptedContext);
  },
};
