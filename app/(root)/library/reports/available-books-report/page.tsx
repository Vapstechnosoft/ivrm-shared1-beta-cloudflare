'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useAvailableBooksReportSearch } from '@/hooks/library/reports/useAvailableBooksReport';
import { exportToExcel } from '@/lib/export-to-file';
import type { IAvailableBooksReportGridData, IAvailableBooksReportRequest } from '@/types/library/reports/available-books-report';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import { AvailableBooksReportColumns } from './_components/columns';
import { ReportForm } from './_components/report-form';

export default function AvailableBooksReportPage() {
    const [view, setView] = useState<'form' | 'grid'>('form');
    const [reportData, setReportData] = useState<IAvailableBooksReportGridData[]>([]);

    const searchMutation = useAvailableBooksReportSearch();

    const extractList = (list: any): any[] => {
        if (!list) return [];
        if (Array.isArray(list)) return list;
        if (list && typeof list === 'object' && '$values' in list) return list.$values;
        const inner = list.data || list.$values;
        if (Array.isArray(inner)) return inner;
        if (inner && typeof inner === 'object' && '$values' in inner) return inner.$values;
        return [];
    };

    const handleSearch = (data: IAvailableBooksReportRequest) => {
        searchMutation.mutate(data, {
            onSuccess: (response: any) => {
                if (response && response.success === false) {
                    toast.error(response.message || 'Failed to fetch report data');
                    return;
                }
                const raw = response?.data ?? response;
                let list: any[] = [];

                if (Array.isArray(raw)) {
                    list = raw;
                } else if (raw?.$values && Array.isArray(raw.$values)) {
                    list = raw.$values;
                } else if (raw?.reportlist || raw?.reportdata || raw?.griddata || raw?.alldata || raw?.availablebookreport) {
                    const inner = raw.reportlist || raw.reportdata || raw.griddata || raw.alldata || raw.availablebookreport;
                    list = extractList(inner);
                } else if (raw?.data) {
                    list = extractList(raw.data);
                }

                const normalizedList: IAvailableBooksReportGridData[] = list.map((item: any) => ({
                    ...item,
                    lmB_EntryDate: item.lmB_EntryDate ?? item.LMB_EntryDate ?? item.entryDate ?? '',
                    lmbanO_AccessionNo:
                        item.lmbanO_AccessionNo ?? item.LMBANO_AccessionNo ?? item.lmbano_AccessionNo ?? item.accessionNo ?? '',
                    lmB_BookTitle: item.lmB_BookTitle ?? item.LMB_BookTitle ?? item.bookTitle ?? '',
                    lmB_BookType: item.lmB_BookType ?? item.LMB_BookType ?? item.bookType ?? '',
                    lmD_DepartmentName: item.lmD_DepartmentName ?? item.LMD_DepartmentName ?? item.departmentName ?? '',
                    authorName: item.authorName ?? item.AuthorName ?? item.lma_AuthorName ?? item.LMA_AuthorName ?? '',
                    lmP_PublisherName: item.lmP_PublisherName ?? item.LMP_PublisherName ?? item.publisherName ?? '',
                    lmL_LanguageName: item.lmL_LanguageName ?? item.LML_LanguageName ?? item.languageName ?? '',
                    lmS_SubjectName: item.lmS_SubjectName ?? item.LMS_SubjectName ?? item.subjectName ?? '',
                    lmB_PurOrDonated: item.lmB_PurOrDonated ?? item.LMB_PurOrDonated ?? item.purOrDonated ?? '-'
                }));

                setReportData(normalizedList);

                if (normalizedList.length > 0) {
                    setView('grid');
                    toast.success(`Found ${normalizedList.length} records`);
                } else {
                    toast.info('No records found for the selected criteria');
                }
            }
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        const columns = [
            { label: 'Entry Date', value: 'lmB_EntryDate' },
            { label: 'Accession No', value: 'lmbanO_AccessionNo' },
            { label: 'Book Title', value: 'lmB_BookTitle' },
            { label: 'Book Type', value: 'lmB_BookType' },
            { label: 'Department', value: 'lmD_DepartmentName' },
            { label: 'Author', value: 'authorName' },
            { label: 'Publisher', value: 'lmP_PublisherName' },
            { label: 'Language', value: 'lmL_LanguageName' },
            { label: 'Subject', value: 'lmS_SubjectName' },
            { label: 'Purchased/Donated', value: 'lmB_PurOrDonated' }
        ];

        const formattedData = reportData.map((row) => {
            let formattedDate = row.lmB_EntryDate || '-';
            if (row.lmB_EntryDate) {
                try {
                    const d = new Date(row.lmB_EntryDate);
                    if (!Number.isNaN(d.getTime())) {
                        formattedDate = format(d, 'dd/MM/yyyy');
                    }
                } catch {
                    // ignore
                }
            }
            return {
                ...row,
                lmB_EntryDate: formattedDate
            };
        });

        exportToExcel('Available_Books_Report', JSON.stringify(columns), JSON.stringify(formattedData));
    };

    const handleCancel = () => {
        setReportData([]);
        setView('form');
    };

    return (
        <div className='space-y-4'>
            <CollapsibleSection
                title='Available Books Report'
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
                />
            </CollapsibleSection>

            {reportData.length > 0 && (
                <CollapsibleSection
                    title='Available Book Report Grid'
                    isOpen={view === 'grid'}
                    onToggle={() => setView(view === 'grid' ? 'form' : 'grid')}
                    defaultOpen={true}>
                    <GenericDataTable
                        columns={AvailableBooksReportColumns}
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
