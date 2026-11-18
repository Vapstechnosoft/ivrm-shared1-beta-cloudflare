import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useBMICalculation } from '@/hooks/sports/useBMICalculation';
import type { IBMICalculation } from '@/types/sports/transactions/bmi-calculation';
import type { ColumnDef } from '@tanstack/react-table';

export const bmiCalculationColumns: ColumnDef<IBMICalculation>[] = [
    {
        id: 'id',
        accessorKey: 'spccshW_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Year' />,
        enableSorting: true
    },
    {
        id: 'studentName',
        accessorKey: 'studentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        enableSorting: true
    },
    {
        accessorKey: 'amsT_AdmNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adm No.' />,
        enableSorting: true
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        enableSorting: true
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
        enableSorting: true
    },
    {
        accessorKey: 'asondate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='As On Date' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccshW_Height',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Height' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccshW_Weight',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Weight' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccshW_BMI',
        header: ({ column }) => <DataTableColumnHeader column={column} title='BMI' />,
        enableSorting: true
    },
    {
        accessorKey: 'spccshW_BMIRemark',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remark' />,
        enableSorting: true,
        cell: ({ row }) => {
            const remark = row.original.spccshW_BMIRemark || row.original.SPCCSHW_BMIRemark;
            let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
            if (remark === 'Normal') variant = 'default';
            if (remark === 'Overweight') variant = 'secondary';
            if (remark === 'Obese' || remark === 'Extreme Obese') variant = 'destructive';

            return <Badge variant={variant}>{remark}</Badge>;
        }
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const { deactivate } = useBMICalculation();
            const { openEditForm } = useFormContext<IBMICalculation>();

            return (
                <ActionButtons
                    rowData={row.original}
                    buttons={{
                        edit: true,
                        toggle: true,
                        delete: false
                    }}
                    onEdit={() => openEditForm(row.original)}
                    onToggle={(data) => {
                        deactivate.mutate(data.spccshW_Id || data.SPCCSHW_Id || 0);
                    }}
                    toggleConditionKey='spccmhW_ActiveFlag'
                />
            );
        }
    }
];
