'use client';

import ViewProfileModal from '@/app/(root)/alumni/alumni-module/transactions/alumni-friend-request/_components/view-profile-modal';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/view-data-table/view-generic-data-table';
import { sendFriendRequest } from '@/server/alumni/alumni-friend-request';
import type { IAlumniFriendRequest } from '@/types/alumni/alumni-friend-request';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { getColumns } from './columns';

interface RequestListProps {
    data: IAlumniFriendRequest[];
    isLoading: boolean;
    onRefresh: () => void;
    totalItems?: number;
    currentApiParams?: any;
    onSearchParamsChange?: (params: any) => void;
    currentAlumniId: number;
}

export default function RequestList({
    data,
    isLoading,
    onRefresh,
    totalItems,
    currentApiParams,
    onSearchParamsChange,
    currentAlumniId
}: RequestListProps) {
    const [selectedRows, setSelectedRows] = useState<IAlumniFriendRequest[]>([]);
    const [viewingAlumniId, setViewingAlumniId] = useState<number | null>(null);
    const [viewingAlumniName, setViewingAlumniName] = useState<string>('');
    const [isSending, setIsSending] = useState(false);

    const handleSendRequests = async () => {
        if (selectedRows.length === 0) {
            toast.error('Please select at least one record');
            return;
        }

        setIsSending(true);
        try {
            const requestalumni = selectedRows.map((row) => ({
                almsT_Id: currentAlumniId,
                alsfrnD_FriendsId: row.ALMST_Id
            }));
            const res = await sendFriendRequest({
                requestalumni
            });
            if (res.success) {
                toast.success('Friend requests sent successfully');
                setSelectedRows([]);
                onRefresh();
            } else {
                toast.error(res.message || 'Failed to send requests');
            }
            // biome-ignore lint/correctness/noUnusedVariables: <explanation>
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSending(false);
        }
    };

    const handleViewProfile = (id: number, name: string) => {
        setViewingAlumniId(id);
        setViewingAlumniName(name);
    };

    const columns = getColumns({ onViewProfile: handleViewProfile });

    return (
        <div className='space-y-4'>
            <GenericDataTable
                columns={columns}
                data={data}
                totalItems={totalItems || data.length}
                currentApiParams={currentApiParams}
                onSearchQueryChange={onSearchParamsChange}
                isLoading={isLoading}
                onRowSelectionChange={(rows) => setSelectedRows(rows)}
                showPagination={true}
                showSearch={true}
            />

            <hr className='my-4' />
            <div className='flex justify-center pt-4'>
                <Button
                    size='lg'
                    onClick={handleSendRequests}
                    disabled={selectedRows.length === 0 || isSending}
                    className='min-w-[200px]'
                    isLoading={isSending}>
                    <Send className='mr-2 h-4 w-4' /> Send Request
                </Button>
            </div>

            {viewingAlumniId && (
                <ViewProfileModal alumniId={viewingAlumniId} alumniName={viewingAlumniName} onClose={() => setViewingAlumniId(null)} />
            )}
        </div>
    );
}
