'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import type { CirculationParameterGridData } from '@/types/library/transactions/circulationParameter';
import type { ColumnDef } from '@tanstack/react-table';

interface ColumnProps {
    onEdit: (data: CirculationParameterGridData) => void;
    onToggleStatus: (data: CirculationParameterGridData) => void;
    isToggling?: boolean;
}

export const createCirculationParameterColumns = ({
    onEdit,
    onToggleStatus,
    isToggling
}: ColumnProps): ColumnDef<CirculationParameterGridData>[] => {
    return [
        {
            id: 'index',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL.No.' className='w-full pl-4' />,
            cell: ({ row, table }) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                const continuousIndex = pageIndex * pageSize + row.index + 1;
                return <div className='w-full pl-4'>{continuousIndex}</div>;
            },
            size: 70,
            enableSorting: false
        },
        {
            id: 'categoryOrType',
            accessorFn: (row) =>
                row.lbcpA_IssueRefFlg ||
                row.catgname ||
                row.lmB_BookType ||
                (row.BOOKFLAG === 'NBP' || row.lmB_BookTypeflag === 'NBP' ? row.lmC_CategoryName || 'Non-Book' : 'Issue'),
            header: ({ column }) => <DataTableColumnHeader column={column} title='Book Type/Category' />,
            cell: ({ row }) => (
                <div>
                    {row.original.lbcpA_IssueRefFlg ||
                        row.original.catgname ||
                        row.original.lmB_BookType ||
                        (row.original.BOOKFLAG === 'NBP' || row.original.lmB_BookTypeflag === 'NBP'
                            ? row.original.lmC_CategoryName || 'Non-Book'
                            : 'Issue')}
                </div>
            )
        },
        {
            id: 'targetGroup',
            accessorFn: (row) => {
                if (row.asmcL_ClassName) return `Class ${row.asmcL_ClassName}`;
                if ((row.schclgflag === 'STUDENT' || row.lbcpA_Flg === 'STUDENT') && row.type_Name) return `Class ${row.type_Name}`;
                return row.hrmgT_EmployeeGroupType || row.hrmD_DepartmentName || row.guest_Name || row.type_Name || row.schclgflag || '-';
            },
            header: ({ column }) => <DataTableColumnHeader column={column} title='Member / Class' />,
            cell: ({ row }) => {
                const orig = row.original;
                const className =
                    orig.asmcL_ClassName || (orig.schclgflag === 'STUDENT' || orig.lbcpA_Flg === 'STUDENT' ? orig.type_Name : undefined);
                return (
                    <div>
                        {className
                            ? `Class ${className}`
                            : orig.hrmgT_EmployeeGroupType ||
                              orig.hrmD_DepartmentName ||
                              orig.guest_Name ||
                              orig.type_Name ||
                              orig.schclgflag ||
                              '-'}
                    </div>
                );
            }
        },
        {
            id: 'maxIssueItems',
            accessorFn: (row) =>
                row.param_NoOfItems ??
                row.lbcpaS_NoOfItems ??
                row.max_Issue_Items ??
                row.lmC_MaxIssueItems ??
                row.max_issue_items ??
                row.Max_Issue_Items ??
                0,
            header: ({ column }) => <DataTableColumnHeader column={column} title='No. Of Item' />,
            cell: ({ row }) => (
                <div>
                    {row.original.param_NoOfItems ??
                        row.original.lbcpaS_NoOfItems ??
                        row.original.max_Issue_Items ??
                        row.original.lmC_MaxIssueItems ??
                        row.original.max_issue_items ??
                        row.original.Max_Issue_Items ??
                        0}
                </div>
            )
        },
        {
            id: 'maxIssueDays',
            accessorFn: (row) =>
                row.param_IssueDays ??
                row.lbcpaS_IssueDays ??
                row.max_Issue_Days ??
                row.lmC_MaxIssueDays ??
                row.max_issue_days ??
                row.Max_Issue_Days ??
                0,
            header: ({ column }) => <DataTableColumnHeader column={column} title='Issue Days' />,
            cell: ({ row }) => (
                <div>
                    {row.original.param_IssueDays ??
                        row.original.lbcpaS_IssueDays ??
                        row.original.max_Issue_Days ??
                        row.original.lmC_MaxIssueDays ??
                        row.original.max_issue_days ??
                        row.original.Max_Issue_Days ??
                        0}
                </div>
            )
        },
        {
            id: 'maxRenewals',
            accessorFn: (row) =>
                row.param_NoOfRenewals ??
                row.lbcpaS_NoOfRenewals ??
                row.max_No_Renewals ??
                row.lmC_MaxRenewals ??
                row.max_no_renewals ??
                row.Max_No_Renewals ??
                0,
            header: ({ column }) => <DataTableColumnHeader column={column} title='Max Renewals' />,
            cell: ({ row }) => (
                <div>
                    {row.original.param_NoOfRenewals ??
                        row.original.lbcpaS_NoOfRenewals ??
                        row.original.max_No_Renewals ??
                        row.original.lmC_MaxRenewals ??
                        row.original.max_no_renewals ??
                        row.original.Max_No_Renewals ??
                        0}
                </div>
            )
        },
        {
            id: 'actions',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='pl-2 text-start' />,
            cell: ({ row }) => {
                const orig = row.original;
                const isActive =
                    orig.circ_ActiveFlag ??
                    orig.param_ActiveFlg ??
                    orig.lbcpaS_ActiveFlg ??
                    orig.lbcpa_ActiveFlg ??
                    orig.lbcpA_ActiveFlg ??
                    orig.lnbcpa_ActiveFlg ??
                    orig.lmC_ActiveFlag ??
                    (orig as any).asmcL_ActiveFlag ??
                    (orig as any).hrmgT_ActiveFlag ??
                    (orig as any).activeFlag ??
                    true;

                const rowWithNormalizedActive = {
                    ...orig,
                    circ_ActiveFlag: isActive
                };

                return (
                    <ActionButtons
                        rowData={rowWithNormalizedActive}
                        buttons={{ edit: true, toggle: true, delete: false, copy: false }}
                        onEdit={() => onEdit(orig)}
                        onToggle={() => onToggleStatus(orig)}
                        toggleConditionKey='circ_ActiveFlag'
                        disabled={{ edit: false, toggle: isToggling }}
                        className='justify-start'
                    />
                );
            },
            size: 160,
            enableSorting: false
        }
    ];
};
