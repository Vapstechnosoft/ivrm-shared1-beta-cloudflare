'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getAlumniFriendRequestReceivedData } from '@/server/alumni/alumni-friend-request';
import type { IAlumniFriendRequest } from '@/types/alumni/alumni-friend-request';
import { Calendar, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import RequestAcceptList from './_components/request-accept-list';

export default function AlumniFriendRequestAcceptPage() {
    const [requests, setRequests] = useState<IAlumniFriendRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [apiParams, setApiParams] = useState<any>({ page: 1, page_size: 10 });

    const loadData = useCallback(async (params = apiParams) => {
        setIsLoading(true);
        try {
            const res = await getAlumniFriendRequestReceivedData();
            if (res.success && res.data) {
                setTotalItems(res.total || 0);
                // Backend returns data in friendrequestlist array based on legacy code
                // But let's check both response.data and response.friendrequestlist
                const d = res.data as any;
                // If res.data is an array, it's the list. If it has friendrequestlist, use that.
                const list = (Array.isArray(d) ? d : d?.friendrequestlist) || [];

                // Map to frontend structure
                const mappedList = list.map((item: any) => ({
                    ALMST_Id: item.student_id || item.almsT_Id || item.ALMST_Id,
                    // biome-ignore lint/style/useTemplate: <explanation>
                    studentname:
                        item.studentname || (item.ALMST_FirstName ? item.ALMST_FirstName + ' ' + (item.ALMST_LastName || '') : 'Unknown'),
                    ASMAY_Year: item.asmay_year || item.asmaY_Year || item.ASMAY_Year,
                    ALSFRND_RequestDate: item.alsfrnd_requestdate || item.alsfrnD_RequestDate || item.ALSFRND_RequestDate,
                    ALSFRND_AcceptedDate: item.alsfrnd_accepteddate || item.alsfrnD_AcceptedDate || item.ALSFRND_AcceptedDate,
                    ALSFRND_AcceptFlag: item.alsfrnd_acceptflag || item.alsfrnD_AcceptFlag || item.ALSFRND_AcceptFlag
                }));

                // De-duplicate by ALMST_Id
                const uniqueRequests = Array.from(
                    new Map(mappedList.filter((r: any) => r.ALMST_Id).map((r: any) => [r.ALMST_Id, r])).values()
                ) as IAlumniFriendRequest[];

                setRequests(uniqueRequests);
            }
        } catch (error) {
            console.error('Failed to load requests:', error);
            toast.error('Failed to load friend requests');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSearchParamsChange = (newParams: any) => {
        setApiParams(newParams);
        loadData(newParams);
    };

    return (
        <div className='container min-h-screen space-y-6 p-4'>
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='font-bold text-2xl tracking-tight'>Alumni Friend Requests</h2>
                    <p className='mt-1 flex items-center gap-1 text-muted-foreground text-sm'>
                        <Users className='h-4 w-4' />
                        Manage incoming connection requests from other alumni
                    </p>
                </div>
                <div className='rounded-full border bg-muted/50 px-3 py-1.5 text-muted-foreground text-sm'>
                    <span className='flex items-center gap-2'>
                        <Calendar className='h-4 w-4' />
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </span>
                </div>
            </div>

            <CollapsibleSection
                title={
                    <div className='flex items-center gap-2'>
                        <span>Friend Request Status</span>
                        {requests.length > 0 && (
                            <span className='rounded-full bg-primary px-2 py-0.5 font-bold text-[10px] text-primary-foreground'>
                                {requests.length}
                            </span>
                        )}
                    </div>
                }
                defaultOpen={true}
                variant='default'>
                <RequestAcceptList
                    data={requests}
                    isLoading={isLoading}
                    onRefresh={loadData}
                    totalItems={totalItems}
                    currentApiParams={apiParams}
                    onSearchParamsChange={handleSearchParamsChange}
                />
            </CollapsibleSection>
        </div>
    );
}
