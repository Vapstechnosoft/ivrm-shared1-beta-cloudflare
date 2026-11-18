'use client';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { EmployeeLoanItem } from '@/types/hrms/employee-loan';
import type { Row } from '@tanstack/react-table';

interface ActionsCellProps {
    row: Row<EmployeeLoanItem>;
    onToggleActive: (id: number, currentStatus: boolean) => void;
}

export function ActionsCell({ row, onToggleActive }: ActionsCellProps) {
    const { openEditForm } = useFormContext<EmployeeLoanItem>();

    const handleEdit = (data: EmployeeLoanItem) => {
        openEditForm(data);
    };

    const handleToggle = (data: EmployeeLoanItem) => {
        onToggleActive(data.HREL_Id, data.HREL_ActiveFlag);
    };

    return (
        <ActionButtons
            rowData={row.original}
            buttons={{ edit: true, toggle: true }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='HREL_ActiveFlag'
        />
    );
}
