'use client';

import { getStatusBadge } from '@/components/extras/helpers/helper';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useDeleteMasterQuestion } from '@/hooks/exam/online-exam/useMasters';
import type { IMasterQuestionList } from '@/types/exam/online-exam/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { BookOpen, Layers } from 'lucide-react';
import { useCallback } from 'react';

interface MasterQuestionColumnsProps {
    onOpenOptionsModal: (question: IMasterQuestionList) => void;
    onOpenClassMappingModal: (question: IMasterQuestionList) => void;
}

export const getMasterQuestionColumns = ({
    onOpenOptionsModal,
    onOpenClassMappingModal
}: MasterQuestionColumnsProps): ColumnDef<IMasterQuestionList>[] => [
    {
        accessorKey: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='font-medium'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        size: 70
    },
    {
        accessorKey: 'ismS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' />,
        cell: ({ row }) => <div className='font-semibold text-primary'>{row.getValue('ismS_SubjectName') || 'N/A'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'lmsmoeQ_Question',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Question' />,
        cell: ({ row }) => (
            <div className='max-w-md truncate font-medium text-foreground' title={row.getValue('lmsmoeQ_Question')}>
                {row.getValue('lmsmoeQ_Question')}
            </div>
        ),
        enableSorting: true
    },
    {
        accessorKey: 'lmsmoeQ_Marks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Marks' />,
        cell: ({ row }) => <div className='text-center font-bold'>{row.getValue('lmsmoeQ_Marks')}</div>,
        enableSorting: true,
        size: 90
    },
    {
        accessorKey: 'lmsmoecX_ComplexityName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Complexity' />,
        cell: ({ row }) => <div>{row.getValue('lmsmoecX_ComplexityName') || 'Standard'}</div>,
        enableSorting: true
    },
    {
        id: 'mappings',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Mappings & Options' className='text-center' />,
        cell: ({ row }) => {
            const q = row.original;
            const qId = q.lmsmoeQ_Id || (q as any).lpmoeQ_Id;
            let storedIds: number[] = [];
            try {
                const saved = typeof window !== 'undefined' ? localStorage.getItem(`mapped_classes_q_${qId}`) : null;
                if (saved) storedIds = JSON.parse(saved);
            } catch (_) {}

            const classList = q.classList || [];
            let classLabel = 'Classes';
            if (storedIds.length > 1) {
                classLabel = `Classes (${storedIds.length})`;
            } else if (classList.length > 1) {
                classLabel = `Classes (${classList.length})`;
            } else if ((q as any).asmcL_ClassName && (q as any).asmcL_ClassName !== 'N/A' && (q as any).asmcL_ClassName !== '') {
                classLabel = `Class: ${(q as any).asmcL_ClassName}`;
            }

            return (
                <div className='flex items-center justify-center gap-2'>
                    <Button
                        size='sm'
                        variant='outline'
                        title={classLabel}
                        className='flex h-8 items-center gap-1.5 text-xs hover:border-primary'
                        onClick={() => onOpenClassMappingModal(row.original)}>
                        <Layers className='h-3.5 w-3.5 text-blue-500' />
                        {classLabel}
                    </Button>
                    <Button
                        size='sm'
                        variant='outline'
                        className='flex h-8 items-center gap-1.5 text-xs hover:border-primary'
                        onClick={() => onOpenOptionsModal(row.original)}>
                        <BookOpen className='h-3.5 w-3.5 text-emerald-500' />
                        Options
                    </Button>
                </div>
            );
        },
        enableSorting: false
    },
    {
        accessorKey: 'lmsmoeQ_ActiveFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => getStatusBadge(row.getValue('lmsmoeQ_ActiveFlg') ? 'active' : 'inactive'),
        enableSorting: true,
        size: 100
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        size: 160,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterQuestionList }) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterQuestionList>();

    const handleEdit = useCallback(
        (data: IMasterQuestionList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterQuestionList) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    const { mutateAsync: deleteQuestion } = useDeleteMasterQuestion();

    const handleDelete = useCallback(
        (data: IMasterQuestionList) => {
            const questionId = data.lmsmoeQ_Id || (data as any).lpmoeQ_Id;
            const questionText = data.lmsmoeQ_Question || (data as any).lpmoeQ_Question || 'this question';
            if (confirm(`Are you sure you want to delete "${questionText}"?`)) {
                deleteQuestion(questionId)
                    .then((result: any) => {
                        if (result?.success !== false) {
                            window.location.reload();
                        } else {
                            alert(result?.message || 'Failed to delete');
                        }
                    })
                    .catch(() => alert('Error deleting question'));
            }
        },
        [deleteQuestion]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{
                edit: true,
                delete: true,
                toggle: true
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
            toggleConditionKey='lmsmoeQ_ActiveFlg'
        />
    );
}
