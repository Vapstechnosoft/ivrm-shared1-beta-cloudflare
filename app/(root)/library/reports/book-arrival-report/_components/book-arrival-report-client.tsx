'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useBookArrivalReportSearch } from '@/hooks/library/reports/useBookArrivalReport';
import { exportToExcel } from '@/lib/export-to-file';
import type { IBookArrivalReportGridData, IBookArrivalReportRequest } from '@/types/library/reports/book-arrival-report';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import { BookArrivalReportColumns } from './columns';
import { ReportForm } from './report-form';

interface BookArrivalReportClientProps {
    initialData: any;
}

export function BookArrivalReportClient({ initialData }: BookArrivalReportClientProps) {
    const [view, setView] = useState<'form' | 'grid'>('form');
    const [reportData, setReportData] = useState<IBookArrivalReportGridData[]>([]);

    const searchMutation = useBookArrivalReportSearch();

    const extractList = (list: any): any[] => {
        if (!list) return [];
        if (Array.isArray(list)) return list;
        if (list && typeof list === 'object' && '$values' in list && Array.isArray(list.$values)) {
            return list.$values;
        }
        const inner = list.data || list.reportlist || list.griddata || list.alldata || list.bookarrivaldetails || list;
        if (Array.isArray(inner)) return inner;
        if (inner && typeof inner === 'object' && '$values' in inner && Array.isArray(inner.$values)) {
            return inner.$values;
        }
        return [];
    };

    const handleSearch = (data: IBookArrivalReportRequest) => {
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
                } else if (raw?.reportlist || raw?.griddata || raw?.alldata || raw?.bookarrivaldetails || raw?.data) {
                    const inner = raw.reportlist || raw.griddata || raw.alldata || raw.bookarrivaldetails || raw.data;
                    list = extractList(inner);
                }

                const normalizedList: IBookArrivalReportGridData[] = list.map((item: any) => ({
                    ...item,
                    lmbanO_AccessionNo:
                        item.lmbanO_AccessionNo ??
                        item.LMBANO_AccessionNo ??
                        item.lmbano_AccessionNo ??
                        item.accessionNo ??
                        item.lmbanO_Accession_No ??
                        '',
                    lmB_BookTitle: item.lmB_BookTitle ?? item.LMB_BookTitle ?? item.bookTitle ?? item.book_title ?? '',
                    lmD_DepartmentName: item.lmD_DepartmentName ?? item.LMD_DepartmentName ?? item.departmentName ?? item.dept_name ?? '',
                    authorName: item.authorName ?? item.AuthorName ?? item.lma_AuthorName ?? item.LMA_AuthorName ?? item.author_name ?? '',
                    lmB_BookType: item.lmB_BookType ?? item.LMB_BookType ?? item.bookType ?? '',
                    lmB_CallNo: item.lmB_CallNo ?? item.LMB_CallNo ?? item.callNo ?? '',
                    lmB_PurchaseDate: item.lmB_PurchaseDate ?? item.LMB_PurchaseDate ?? item.purchaseDate ?? item.lmB_PurDate ?? '',
                    lmB_EntryDate: item.lmB_EntryDate ?? item.LMB_EntryDate ?? item.entryDate ?? '',
                    lmL_LanguageName: item.lmL_LanguageName ?? item.LML_LanguageName ?? item.languageName ?? item.lang_name ?? '',
                    lmB_PurOrDonated: item.lmB_PurOrDonated ?? item.LMB_PurOrDonated ?? item.purOrDonated ?? '-',
                    lmB_ISBNNo: item.lmB_ISBNNo ?? item.LMB_ISBNNo ?? item.isbnNo ?? '',
                    lmB_ClassNo: item.lmB_ClassNo ?? item.LMB_ClassNo ?? item.classNo ?? '',
                    lmP_PublisherName: item.lmP_PublisherName ?? item.LMP_PublisherName ?? item.publisherName ?? ''
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
            { label: 'Accession No.', value: 'lmbanO_AccessionNo' },
            { label: 'Book Title', value: 'lmB_BookTitle' },
            { label: 'Department Name', value: 'lmD_DepartmentName' },
            { label: 'Author Name', value: 'authorName' },
            { label: 'Book Type', value: 'lmB_BookType' },
            { label: 'Call No', value: 'lmB_CallNo' },
            { label: 'Purchase Date', value: 'lmB_PurchaseDate' },
            { label: 'Entry Date', value: 'lmB_EntryDate' },
            { label: 'Language Name', value: 'lmL_LanguageName' }
        ];

        const formattedData = reportData.map((row) => {
            let purchaseDate = row.lmB_PurchaseDate || '-';
            if (row.lmB_PurchaseDate) {
                try {
                    const d = new Date(row.lmB_PurchaseDate);
                    if (!Number.isNaN(d.getTime())) {
                        purchaseDate = format(d, 'dd-MM-yyyy');
                    }
                } catch {
                    // keep original
                }
            }

            let entryDate = row.lmB_EntryDate || '-';
            if (row.lmB_EntryDate) {
                try {
                    const d = new Date(row.lmB_EntryDate);
                    if (!Number.isNaN(d.getTime())) {
                        entryDate = format(d, 'dd-MM-yyyy');
                    }
                } catch {
                    // keep original
                }
            }

            return {
                ...row,
                lmB_PurchaseDate: purchaseDate,
                lmB_EntryDate: entryDate
            };
        });

        exportToExcel('Book_Arrival_Report', JSON.stringify(columns), JSON.stringify(formattedData));
    };

    const handleCancel = () => {
        setReportData([]);
        setView('form');
    };

    return (
        <div className='space-y-4'>
            <CollapsibleSection
                title='Book Arrival Report: Form'
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
                    title='Book Arrival Report Grid'
                    isOpen={view === 'grid'}
                    onToggle={() => setView(view === 'grid' ? 'form' : 'grid')}
                    defaultOpen={true}>
                    <GenericDataTable
                        columns={BookArrivalReportColumns}
                        data={reportData}
                        totalItems={reportData.length}
                        isPaginationRequired={true}
                        isLoading={false}
                        columnPinning={{ right: ['actions'] }}
                    />
                </CollapsibleSection>
            )}
        </div>
    );
}
