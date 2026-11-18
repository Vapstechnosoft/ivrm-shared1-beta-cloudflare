import type { ColumnDef } from '@tanstack/react-table';

export const getDynamicColumns = (columns: { columnID: string; columnName: string }[]): ColumnDef<any>[] => {
    return columns.map((col) => ({
        accessorKey: col.columnID,
        header: col.columnName,
        cell: ({ row }) => {
            const value = row.original[col.columnID];
            return <div className='text-center'>{value || '--'}</div>;
        }
    }));
};
