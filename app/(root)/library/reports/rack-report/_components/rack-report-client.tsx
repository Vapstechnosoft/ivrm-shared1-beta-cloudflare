'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useRackReportSearch } from '@/hooks/library/reports/useRackReport';
import { exportToExcel } from '@/lib/export-to-file';
import type { IRackReportGridData, IRackReportRequest } from '@/types/library/reports/rack-report';
import { useState } from 'react';
import { toast } from 'sonner';
import { RackReportColumns } from './columns';
import { ReportForm } from './report-form';

interface RackReportClientProps {
    initialData: any;
}

export function RackReportClient({ initialData }: RackReportClientProps) {
    const [view, setView] = useState<'form' | 'grid'>('form');
    const [reportData, setReportData] = useState<IRackReportGridData[]>([]);

    const searchMutation = useRackReportSearch();

    const extractList = (list: any): any[] => {
        if (!list) return [];
        if (Array.isArray(list)) return list;
        if (list && typeof list === 'object' && '$values' in list && Array.isArray(list.$values)) {
            return list.$values;
        }
        const inner = list.data || list.reportlist || list.griddata || list.alldata || list.rackreport || list;
        if (Array.isArray(inner)) return inner;
        if (inner && typeof inner === 'object' && '$values' in inner && Array.isArray(inner.$values)) {
            return inner.$values;
        }
        return [];
    };

    const handleSearch = (data: IRackReportRequest) => {
        searchMutation.mutate(data, {
            onSuccess: (response: any) => {
                if (response && response.success === false) {
                    toast.error(response.message || 'Failed to fetch report data');
                    return;
                }
                const raw = response?.data ?? response?.reportlist ?? response;
                let list: any[] = [];

                if (Array.isArray(raw)) {
                    list = raw;
                } else if (raw?.$values && Array.isArray(raw.$values)) {
                    list = raw.$values;
                } else if (raw?.reportlist || raw?.griddata || raw?.alldata || raw?.rackreport || raw?.data) {
                    const inner = raw.reportlist || raw.griddata || raw.alldata || raw.rackreport || raw.data;
                    list = extractList(inner);
                }

                const normalizedList: IRackReportGridData[] = list.map((item: any) => ({
                    ...item,
                    lmbanO_AccessionNo:
                        item.lmbanO_AccessionNo ?? item.LMBANO_AccessionNo ?? item.lmbano_AccessionNo ?? item.accessionNo ?? '',
                    lmB_BookTitle: item.lmB_BookTitle ?? item.LMB_BookTitle ?? item.lmb_BookTitle ?? item.bookTitle ?? '',
                    rack_Name: item.rack_Name ?? item.Rack_Name ?? item.rackName ?? item.lmrA_RackName ?? item.LMRA_RackName ?? '',
                    lmrA_FloorName: item.lmrA_FloorName ?? item.lmra_FloorName ?? item.LMRA_FloorName ?? item.floorName ?? '',
                    lmB_BookType: item.lmB_BookType ?? item.LMB_BookType ?? item.lmb_BookType ?? item.bookType ?? '',
                    rack_Location: item.rack_Location ?? item.Rack_Location ?? item.lmrA_Location ?? item.location ?? '',
                    lmbanO_AvialableStatus:
                        item.lmbanO_AvialableStatus ??
                        item.LMBANO_AvialableStatus ??
                        item.lmbano_AvialableStatus ??
                        item.bookStatus ??
                        item.status ??
                        ''
                }));

                setReportData(normalizedList);
                if (normalizedList.length > 0) {
                    setView('grid');
                    toast.success(`Found ${normalizedList.length} records`);
                } else {
                    toast.info('No records found for the selected criteria');
                }
            },
            onError: (error) => {
                console.error(error);
                toast.error('Failed to fetch report data');
            }
        });
    };

    const handlePrint = () => {
        if (reportData.length > 0) {
            window.print();
        }
    };

    const handleExport = () => {
        const columns = [
            { label: 'Accession No.', value: 'lmbanO_AccessionNo' },
            { label: 'Book Title', value: 'lmB_BookTitle' },
            { label: 'Rack Name', value: 'rack_Name' },
            { label: 'Floor Name', value: 'lmrA_FloorName' },
            { label: 'Book Type', value: 'lmB_BookType' },
            { label: 'Location', value: 'rack_Location' },
            { label: 'Book Status', value: 'lmbanO_AvialableStatus' }
        ];

        const formattedData = reportData.map((row) => ({
            ...row,
            lmbanO_AccessionNo: row.lmbanO_AccessionNo || row.lmbano_AccessionNo || '',
            lmB_BookTitle: row.lmB_BookTitle || row.lmb_BookTitle || '',
            rack_Name: row.rack_Name || row.lmrA_RackName || '',
            lmrA_FloorName: row.lmrA_FloorName || row.lmra_FloorName || '',
            lmB_BookType: row.lmB_BookType || row.lmb_BookType || '',
            rack_Location: row.rack_Location || '',
            lmbanO_AvialableStatus: row.lmbanO_AvialableStatus || row.lmbano_AvialableStatus || ''
        }));

        exportToExcel('Rack_Report', JSON.stringify(columns), JSON.stringify(formattedData));
    };

    const handleCancel = () => {
        setReportData([]);
        setView('form');
    };

    return (
        <div className='space-y-4'>
            <CollapsibleSection
                title='Rack Report: Form'
                isOpen={view === 'form'}
                onToggle={() => setView(view === 'form' ? 'grid' : 'form')}
                defaultOpen={true}>
                <ReportForm
                    onSearch={handleSearch}
                    isLoading={searchMutation.isPending}
                    hasData={reportData.length > 0}
                    onPrint={handlePrint}
                    onExport={handleExport}
                    onCancel={handleCancel}
                    initialData={initialData}
                />
            </CollapsibleSection>

            {reportData.length > 0 && (
                <CollapsibleSection
                    title='Rack Report Grid'
                    isOpen={view === 'grid'}
                    onToggle={() => setView(view === 'grid' ? 'form' : 'grid')}
                    defaultOpen={true}>
                    <GenericDataTable
                        columns={RackReportColumns}
                        data={reportData}
                        totalItems={reportData.length}
                        isPaginationRequired={true}
                        isLoading={false}
                    />
                </CollapsibleSection>
            )}
        </div>
    );
}
