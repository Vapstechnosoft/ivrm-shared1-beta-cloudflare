'use client';

import { Checkbox } from '@/components/ui/checkbox';
import type { ColumnDef, HeaderContext } from '@tanstack/react-table';
import { GenericDataTable, type GenericDataTableProps } from './generic-data-table';

type GenericDataTableAllRowsProps<T> = Omit<GenericDataTableProps<T>, 'columns' | 'preserveSelectionAcrossPages'> & {
    columns: ColumnDef<T>[];
    selectionColumnId?: string;
};

export function GenericDataTableAllRows<T>({ columns, selectionColumnId = 'select', ...props }: GenericDataTableAllRowsProps<T>) {
    if (!columns.some((column) => column.id === selectionColumnId)) {
        throw new Error(`GenericDataTableAllRows requires a selection column with id "${selectionColumnId}".`);
    }

    const columnsWithAllRowsSelection = columns.map((column) =>
        column.id === selectionColumnId
            ? {
                  ...column,
                  id: selectionColumnId,
                  header: ({ table }: HeaderContext<T, unknown>) => {
                      const rows = table.getFilteredRowModel().rows;
                      const selectedCount = rows.filter((row) => row.getIsSelected()).length;
                      const allSelected = rows.length > 0 && selectedCount === rows.length;

                      return (
                          <Checkbox
                              checked={allSelected || (selectedCount > 0 && 'indeterminate')}
                              onCheckedChange={(checked) =>
                                  table.setRowSelection((selection) => {
                                      const nextSelection = { ...selection };
                                      for (const row of rows) {
                                          if (checked) {
                                              nextSelection[row.id] = true;
                                          } else {
                                              delete nextSelection[row.id];
                                          }
                                      }
                                      return nextSelection;
                                  })
                              }
                              aria-label='Select all rows'
                          />
                      );
                  }
              }
            : column
    );

    return <GenericDataTable {...props} columns={columnsWithAllRowsSelection} preserveSelectionAcrossPages />;
}
