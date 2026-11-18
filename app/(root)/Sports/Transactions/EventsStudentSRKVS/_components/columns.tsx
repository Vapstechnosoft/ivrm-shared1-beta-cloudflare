import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useEventsStudentSRKVS } from '@/hooks/sports/useEventsStudentSRKVS';
import type { IEventsStudentSRKVSData, IEventsStudentSRKVSViewDetails } from '@/types/sports/events-student-srkvs';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ViewDetailsModal } from './view-details-modal';

export const eventsStudentSRKVSColumns: ColumnDef<IEventsStudentSRKVSData>[] = [
    {
        accessorKey: 'spccesT_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl No' className='pl-6' />,
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
        accessorKey: 'eventName',
        header: 'Event'
    },
    {
        accessorKey: 'sportsName',
        header: 'Sports Name'
    },
    {
        accessorKey: 'spccmsccG_SportsCCGroupName',
        header: 'Group Name'
    },
    {
        accessorKey: 'categoryName',
        header: 'Category'
    },
    {
        accessorKey: 'compitionLevel',
        header: 'Level'
    },
    {
        accessorKey: 'spccmeV_EventVenue',
        header: 'Venue'
    },
    {
        accessorKey: 'uomName',
        header: 'UOM'
    },
    {
        accessorKey: 'asmaY_Year',
        header: 'Academic Year'
    },
    {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: ({ row }) => {
            const date = row.getValue('startDate') as string;
            return date ? new Date(date).toLocaleDateString() : '';
        }
    },
    {
        accessorKey: 'endDate',
        header: 'End Date',
        cell: ({ row }) => {
            const date = row.getValue('endDate') as string;
            return date ? new Date(date).toLocaleDateString() : '';
        }
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ActionsCell
    }
];

// ... (existing imports moved to top)

function ActionsCell({ row }: { row: Row<IEventsStudentSRKVSData> }) {
    const record = row.original;
    const { deactivateData, fetchViewDetails, updateStudentDetails } = useEventsStudentSRKVS();
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewData, setViewData] = useState<IEventsStudentSRKVSViewDetails[] | null>(null);

    const handleView = async () => {
        try {
            // Check if spccesT_Id exists
            if (!record.spccesT_Id) {
                toast.error('Record ID missing');
                return;
            }

            const response = await fetchViewDetails.mutateAsync(record.spccesT_Id);
            if (response.success && response.data) {
                setViewData(response.data);
                setIsViewOpen(true);
            } else {
                toast.error(response.message || 'Failed to fetch details');
            }
        } catch (error) {
            console.error('View error', error);
            toast.error('Error fetching details');
        }
    };

    return (
        <div className='flex items-center gap-1'>
            <Button
                variant='ghost'
                size='sm'
                onClick={handleView}
                disabled={fetchViewDetails.isPending}
                className='h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700'>
                <Eye className='h-4 w-4' />
                <span className='sr-only'>View</span>
            </Button>
            <ActionButtons
                rowData={record}
                buttons={{
                    edit: true,
                    toggle: true,
                    delete: false
                }}
                onToggle={() => {
                    deactivateData.mutate({
                        id: record.spccesT_Id,
                        activeFlag: !record.spccesT_ActiveFlag
                    });
                }}
                toggleConditionKey='spccesT_ActiveFlag'
            />
            {isViewOpen && (
                <ViewDetailsModal
                    isOpen={isViewOpen}
                    onClose={() => setIsViewOpen(false)}
                    data={viewData}
                    onSave={(updatedData) => {
                        updateStudentDetails.mutate(updatedData, {
                            onSuccess: () => {
                                setIsViewOpen(false);
                            }
                        });
                    }}
                />
            )}
        </div>
    );
}
