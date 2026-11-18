'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/view-data-table/view-generic-data-table';
import { handleFriendRequestAction } from '@/server/alumni/alumni-friend-request';
import type { IAlumniFriendRequest } from '@/types/alumni/alumni-friend-request';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { getColumns } from './columns';
import ViewProfileModal from './view-profile-modal';

interface RequestAcceptListProps {
    data: IAlumniFriendRequest[];
    isLoading: boolean;
    onRefresh: () => void;
    totalItems?: number;
    currentApiParams?: any;
    onSearchParamsChange?: (params: any) => void;
}

export default function RequestAcceptList({
    data,
    isLoading,
    onRefresh,
    totalItems,
    currentApiParams,
    onSearchParamsChange
}: RequestAcceptListProps) {
    const [selectedRows, setSelectedRows] = useState<IAlumniFriendRequest[]>([]);
    const [viewingAlumni, setViewingAlumni] = useState<{ id: number; name: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAction = async (action: 'Accept' | 'Cancel') => {
        if (selectedRows.length === 0) {
            toast.error('Please select at least one request');
            return;
        }

        setIsProcessing(true);
        try {
            // Need to find the request dates for the selected IDs
            const requestData = selectedRows.map((row) => {
                return {
                    ALMST_Id: row.ALMST_Id,
                    ALSFRND_RequestDate: row.ALSFRND_RequestDate || new Date().toISOString()
                };
            });

            const res = await handleFriendRequestAction({
                action: action,
                requestalumniaccept: requestData
            });

            if (res.success) {
                toast.success(action === 'Accept' ? 'Friend requests accepted successfully' : 'Requests canceled successfully');
                setSelectedRows([]);
                onRefresh();
                window.location.reload();
            } else {
                toast.error(res.message || 'Action failed');
            }
            // biome-ignore lint/correctness/noUnusedVariables: <explanation>
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    const columns = getColumns({
        onViewProfile: (id, name) => setViewingAlumni({ id, name })
    });

    return (
        <div className='space-y-4'>
            <GenericDataTable
                columns={columns}
                data={data}
                isLoading={isLoading}
                onRowSelectionChange={(rows) => setSelectedRows(rows)}
                totalItems={totalItems || data.length}
                currentApiParams={currentApiParams}
                onSearchQueryChange={onSearchParamsChange}
                showPagination={true}
                showSearch={true}
            />

            <hr className='my-4' />
            <div className='flex justify-center gap-4 pt-4'>
                <Button
                    onClick={() => handleAction('Accept')}
                    disabled={selectedRows.length === 0 || isProcessing}
                    className='min-w-[150px] bg-primary'>
                    {isProcessing ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <CheckCircle className='mr-2 h-4 w-4' />}
                    Accept Request
                </Button>
                <Button
                    variant='outline'
                    onClick={() => handleAction('Cancel')}
                    disabled={selectedRows.length === 0 || isProcessing}
                    className='min-w-[150px] border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700'>
                    {isProcessing ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <XCircle className='mr-2 h-4 w-4' />}
                    Cancel Request
                </Button>
            </div>

            {viewingAlumni && (
                <ViewProfileModal alumniId={viewingAlumni.id} alumniName={viewingAlumni.name} onClose={() => setViewingAlumni(null)} />
            )}
        </div>
    );
}
