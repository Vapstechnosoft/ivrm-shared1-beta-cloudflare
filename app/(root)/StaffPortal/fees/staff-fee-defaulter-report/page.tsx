'use client';

import { useStaffFeeDefaulterReport } from '@/hooks/staff-portal/useStaffFeeDefaulterReport';
import type { IDefaulterStudent, IFeeDefaulterSearchRequest, IFeeDefaulterSearchResponse } from '@/types/staff-portal/fee-defaulter-report';
import { CreditCard, List } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import FeeDefaulterFilter from './_components/filter';
import FeeDefaulterTable from './_components/report-table';

export default function StaffFeeDefaulterReportPage() {
    const { initialData, getClasses, getTerms, getSections, getGroups, search, saveRemark } = useStaffFeeDefaulterReport();

    const [searchData, setSearchData] = useState<IFeeDefaulterSearchResponse | null>(null);
    const [lastParams, setLastParams] = useState<IFeeDefaulterSearchRequest | null>(null);

    const handleSearch = (params: IFeeDefaulterSearchRequest) => {
        setLastParams(params);
        search.mutate(params, {
            onSuccess: (res) => {
                const hasData =
                    res.data?.studentalldata?.length ||
                    res.data?.groupalldata?.length ||
                    res.data?.headalldata?.length ||
                    res.data?.classalldata?.length;

                if (hasData) {
                    setSearchData(res.data);
                } else {
                    toast.error('No defaulter records found for the selected criteria');
                    setSearchData(null);
                }
            },
            onError: (err) => {
                toast.error('Error generating report: ' + err);
            }
        });
    };

    const handleSaveRemarks = (students: IDefaulterStudent[]) => {
        if (!lastParams) return;
        saveRemark.mutate(
            { ASMAY_Id: lastParams.ASMAY_Id, remarkarray: students },
            {
                onSuccess: (res) => {
                    if (res.data?.message === 'Add') {
                        toast.success('Remarks saved successfully');
                        handleSearch(lastParams);
                    } else {
                        toast.error(res.data?.message || 'Failed to save remarks');
                    }
                },
                onError: (err) => {
                    toast.error('An error occurred while saving remarks: ' + err);
                }
            }
        );
    };

    return (
        <div className='container mx-auto min-h-screen space-y-8 p-4 pb-12'>
            <div className='flex items-center gap-3 border-primary/10 border-b pb-4'>
                <div className='rounded-lg bg-primary/10 p-2'>
                    <CreditCard className='h-6 w-6 text-primary' />
                </div>
                <div>
                    <h1 className='font-bold text-2xl text-primary tracking-tight'>Fee Defaulter Report</h1>
                    <p className='text-muted-foreground text-sm'>Detailed student fee pending analysis and management</p>
                </div>
            </div>

            <FeeDefaulterFilter
                initialData={initialData ?? undefined}
                isLoading={search.isPending}
                onSearch={handleSearch}
                onReset={() => setSearchData(null)}
                getClasses={async (y) => {
                    const res = await getClasses.mutateAsync(y);
                    return res.data?.fillclass || [];
                }}
                getTerms={async (y, r) => {
                    const res = await getTerms.mutateAsync({ asmaY_Id: y, reportType: r });
                    return res.data || { fillterms: [], customlist: [], grouplist: [] };
                }}
                getSections={async (y, c) => {
                    const res = await getSections.mutateAsync({ asmaY_Id: y, asmcL_Id: c });
                    return res.data?.fillsection || [];
                }}
                getGroups={async (ids, r) => {
                    const res = await getGroups.mutateAsync({ customIds: ids, reportType: r });
                    return res.data?.grouplist || [];
                }}
            />

            {searchData && lastParams && (
                <div className='fade-in slide-in-from-bottom-4 animate-in space-y-4 duration-500'>
                    <div className='flex items-center justify-between border-primary border-l-4 px-1 pl-4'>
                        <h2 className='font-bold text-lg text-primary/80 uppercase tracking-wider'>Report Results</h2>
                    </div>
                    <FeeDefaulterTable data={searchData} onSaveRemarks={handleSaveRemarks} showRemarks={lastParams.radioval === 'FSW'} />
                </div>
            )}

            {!searchData && !search.isPending && (
                <div className='mx-auto flex max-w-2xl flex-col items-center justify-center rounded-2xl border-2 border-primary/10 border-dashed bg-muted/5 py-24 text-muted-foreground opacity-60'>
                    <div className='mb-4 rounded-full bg-muted/10 p-4'>
                        <List className='h-10 w-10 opacity-20' />
                    </div>
                    <p className='font-medium text-foreground/70 text-xl'>No report generated</p>
                    <p className='text-sm'>Select criteria above and click 'Show Report' to view defaulter data.</p>
                </div>
            )}
        </div>
    );
}
