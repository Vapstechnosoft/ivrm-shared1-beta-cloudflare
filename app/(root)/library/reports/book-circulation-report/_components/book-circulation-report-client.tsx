'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useBookCirculationReportSearch } from '@/hooks/library/reports/useBookCirculationReport';
import { exportToExcel } from '@/lib/export-to-file';
import type { IBookCirculationReportGridData, IBookCirculationReportRequest } from '@/types/library/reports/book-circulation-report';
import { useState } from 'react';
import { toast } from 'sonner';
import { getColumns } from './columns';
import { ReportForm } from './report-form';

interface BookCirculationReportClientProps {
    initialData: any;
}

export function BookCirculationReportClient({ initialData }: BookCirculationReportClientProps) {
    const [view, setView] = useState<'form' | 'grid'>('form');
    const [reportData, setReportData] = useState<IBookCirculationReportGridData[]>([]);
    const [memberType, setMemberType] = useState<string>('Student');

    const searchMutation = useBookCirculationReportSearch();

    const handleSearch = (data: IBookCirculationReportRequest) => {
        setMemberType(data.AGType);
        searchMutation.mutate(data, {
            onSuccess: (response: any) => {
                if (response && typeof response === 'object' && response.success === false) {
                    toast.error(response.error || 'Failed to fetch report data.');
                    return;
                }
                let list: any[] = [];
                if (Array.isArray(response)) {
                    list = response;
                } else if (response && typeof response === 'object') {
                    const possibleList = Array.isArray(response.data)
                        ? response.data
                        : response.reportlist ||
                          response.reportList ||
                          response.gridList ||
                          response.gridlist ||
                          response.alldata ||
                          response.data ||
                          response;
                    if (Array.isArray(possibleList)) {
                        list = possibleList;
                    } else if (possibleList && typeof possibleList === 'object' && '$values' in possibleList) {
                        list = possibleList.$values;
                    }
                }
                setReportData(list);
                if (list.length > 0) {
                    setView('grid');
                    toast.success(`Found ${list.length} records.`);
                } else {
                    toast.info('No records found for the selected criteria');
                }
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
            exportToExcel('Book_Circulation_Report', JSON.stringify([]), JSON.stringify(reportData));
        }
    };

    return (
        <div className='space-y-4 print:p-0'>
            <CollapsibleSection
                title='Book Circulation Report: Form'
                isOpen={view === 'form'}
                onToggle={() => setView(view === 'form' ? 'grid' : 'form')}
                defaultOpen={true}
                className='print:hidden'>
                <ReportForm
                    onSearch={handleSearch}
                    isLoading={searchMutation.isPending}
                    onPrint={handlePrint}
                    onExport={handleExport}
                    hasData={reportData.length > 0}
                    initialData={initialData}
                    onCancel={() => {
                        setReportData([]);
                        setView('form');
                    }}
                />
            </CollapsibleSection>

            {reportData.length > 0 && (
                <div className='w-full print:m-0'>
                    <CollapsibleSection
                        title='Book Circulation Report'
                        defaultOpen={true}
                        className='bg-white shadow-sm print:border-none print:shadow-none'>
                        <div className='space-y-4 p-4'>
                            {/* Records Count Row */}
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-2'>
                                    <span className='font-bold text-slate-700 text-xs'>Total Grid Records :</span>
                                    <span className='rounded-full bg-slate-500 px-2 py-0.5 font-bold text-[10px] text-white'>
                                        {reportData.length}
                                    </span>
                                </div>
                            </div>

                            <GenericDataTable
                                columns={getColumns(memberType)}
                                data={reportData}
                                totalItems={reportData.length}
                                isPaginationRequired={true}
                                isLoading={false}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </div>
    );
}
