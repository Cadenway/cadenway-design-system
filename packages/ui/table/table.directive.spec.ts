import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CwTableBody } from './table-body.directive';
import { CwTableCaption } from './table-caption.directive';
import { CwTableCell } from './table-cell.directive';
import { CwTableContainer } from './table-container.component';
import { CwTableEmpty } from './table-empty.directive';
import { CwTableFooter } from './table-footer.directive';
import { CwTableHead } from './table-head.directive';
import { CwTableHeader } from './table-header.directive';
import { CwTableRow } from './table-row.directive';
import { CwTable } from './table.directive';

@Component({
  imports: [
    CwTable,
    CwTableBody,
    CwTableCaption,
    CwTableCell,
    CwTableContainer,
    CwTableEmpty,
    CwTableFooter,
    CwTableHead,
    CwTableHeader,
    CwTableRow,
  ],
  template: `
    <cw-table-container>
      <table cwTable size="sm">
        <caption cwTableCaption>
          Stockage par espace, au 12 nov.
        </caption>
        <thead cwTableHeader>
          <tr cwTableRow>
            <th cwTableHead>Espace</th>
            <th cwTableHead align="end">Pièces jointes</th>
          </tr>
        </thead>
        <tbody cwTableBody>
          <tr cwTableRow>
            <th cwTableHead scope="row">Produit</th>
            <td cwTableCell align="end">1,2 Go</td>
          </tr>
        </tbody>
        <tfoot cwTableFooter>
          <tr cwTableRow>
            <td cwTableCell>Total</td>
            <td cwTableCell align="end">1,2 Go</td>
          </tr>
        </tfoot>
      </table>
    </cw-table-container>
    <table cwTable aria-label="Temps passé, semaine 47">
      <tbody cwTableBody>
        <tr cwTableRow>
          <td cwTableEmpty colspan="3">Aucune saisie de temps cette semaine.</td>
        </tr>
      </tbody>
    </table>
  `,
})
class Host {}

describe('CwTable', () => {
  let host: HTMLElement;

  beforeEach(() => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    host = fixture.nativeElement as HTMLElement;
  });

  function headerNamed(name: string): HTMLTableCellElement {
    const found = Array.from(host.querySelectorAll('th')).find(
      (element) => element.textContent.trim() === name,
    );
    if (!found) throw new Error(`No header named ${name}`);
    return found;
  }

  it('keeps the native table semantics and exposes its size', () => {
    const table = host.querySelector('table');

    expect(table?.caption?.textContent.trim()).toBe('Stockage par espace, au 12 nov.');
    expect(table?.tHead?.rows).toHaveLength(1);
    expect(table?.tFoot?.rows).toHaveLength(1);
    expect(table?.dataset['size']).toBe('sm');
  });

  it('scopes headers to their column unless another scope is given', () => {
    expect(headerNamed('Espace').getAttribute('scope')).toBe('col');
    expect(headerNamed('Pièces jointes').getAttribute('scope')).toBe('col');
    expect(headerNamed('Produit').getAttribute('scope')).toBe('row');
  });

  it('keeps the container out of the tab order while the table fits', () => {
    expect(host.querySelector('cw-table-container')?.hasAttribute('tabindex')).toBe(false);
  });

  it('spans the empty state over the columns', () => {
    const empty = Array.from(host.querySelectorAll('td')).find(
      (cell) => cell.textContent.trim() === 'Aucune saisie de temps cette semaine.',
    );
    expect(empty?.colSpan).toBe(3);
  });
});
