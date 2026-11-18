'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { usePurchaseDonateReportSearch } from '@/hooks/library/reports/usePurchaseDonateReport';
import { exportToExcel } from '@/lib/utils';
import type { IPurchaseDonateReportGridData, IPurchaseDonateReportRequest } from '@/types/library/reports/purchase-donate-report';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { columns } from './_components/columns';
import { ReportForm } from './_components/report-form';

export default function PurchaseDonateReportPage() {
    const [reportData, setReportData] = useState<IPurchaseDonateReportGridData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const searchMutation = usePurchaseDonateReportSearch();

    const handleSearch = (data: IPurchaseDonateReportRequest) => {
        searchMutation.mutate(data, {
            onSuccess: (response: any) => {
                if (response && response.success === false) {
                    toast.error(response.message || 'Failed to fetch report data');
                    return;
                }
                const raw = response?.data ?? response?.reportlist ?? response?.alldata ?? response;
                let list: any[] = [];

                if (Array.isArray(raw)) {
                    list = raw;
                } else if (raw?.$values && Array.isArray(raw.$values)) {
                    list = raw.$values;
                } else if (raw?.reportlist || raw?.griddata || raw?.alldata || raw?.purchaselist || raw?.donatelist || raw?.data) {
                    const inner = raw.reportlist || raw.griddata || raw.alldata || raw.purchaselist || raw.donatelist || raw.data;
                    list = Array.isArray(inner) ? inner : inner?.$values && Array.isArray(inner.$values) ? inner.$values : [];
                }

                const finalData = Array.isArray(list) ? list : [];
                setReportData(finalData);
                if (finalData.length > 0) {
                    toast.success(`Found ${finalData.length} records`);
                } else {
                    toast.info('No records found for the selected criteria');
                }
            },
            onError: (error: any) => {
                toast.error(error?.message || 'Failed to fetch report data');
                console.error(error);
            }
        });
    };

    const handlePrint = () => {
        if (reportData.length > 0) {
            window.print();
        }
    };

    const handleExport = () => {
        if (reportData.length > 0) {
            exportToExcel(reportData, 'Purchase_Donate_Report');
        }
    };

    const filteredData = reportData.filter((item) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase().trim();
        return Object.values(item).some((val) => {
            if (val === null || val === undefined) return false;
            return String(val).toLowerCase().includes(term);
        });
    });

    return (
        <div className='space-y-6 print:m-0 print:p-0'>
            <div className='print:hidden'>
                <ReportForm
                    onSearch={handleSearch}
                    isLoading={searchMutation.isPending}
                    onPrint={handlePrint}
                    onExport={handleExport}
                    onCancel={() => {
                        setReportData([]);
                        setSearchTerm('');
                    }}
                    hasData={reportData.length > 0}
                />
            </div>

            {reportData.length > 0 && (
                <div className='mx-auto max-w-5xl print:m-0 print:max-w-none'>
                    <CollapsibleSection
                        title='Purchase / Donate Reports'
                        defaultOpen={true}
                        className='bg-white shadow-sm print:border-none print:shadow-none'>
                        <div className='space-y-4 p-4 print:p-0 print:pt-4'>
                            {/* Records Count & Search Row */}
                            <div className='flex items-center justify-between print:hidden'>
                                <div className='flex items-center gap-2'>
                                    <span className='font-bold text-slate-700 text-xs'>Total Grid Records :</span>
                                    <span className='rounded-full bg-slate-500 px-2 py-0.5 font-bold text-[10px] text-white'>
                                        {reportData.length}
                                    </span>
                                </div>
                                <div className='relative w-64'>
                                    <Search className='-translate-y-1/2 absolute top-1/2 left-2 h-3.5 w-3.5 text-slate-400' />
                                    <input
                                        type='text'
                                        placeholder='search here...'
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className='w-full rounded-sm border py-1.5 pr-3 pl-8 text-xs focus:outline-none focus:ring-1 focus:ring-[#3f51b5]'
                                    />
                                </div>
                            </div>

                            <div className='print:block'>
                                <GenericDataTable columns={columns} data={filteredData} isLoading={false} />
                            </div>
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </div>
    );
}
