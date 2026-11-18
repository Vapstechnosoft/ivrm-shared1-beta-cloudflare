'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { exportToExcel } from '@/lib/export-to-file';
import { getMasterCaste } from '@/server/admission/preadmission/masters/caste';
import type { IMasterCasteList } from '@/types/admission/preadmission/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { Download, Eye, Printer } from 'lucide-react';
import { useRef, useState } from 'react';

const columns: ColumnDef<IMasterCasteList>[] = [
    {
        accessorKey: 'imC_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='w-full pl-6 font-bold text-black' />,
        cell: ({ row }) => <div className='w-full pl-6'>{row.index + 1}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'imC_CasteName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Caste Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('imC_CasteName')}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'imC_CasteDesc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Caste Description' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('imC_CasteDesc')}</div>,
        enableSorting: false
    }
];

export default function ViewDetailsDialog() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [casteList, setCasteList] = useState<IMasterCasteList[]>([]);
    const [masterCompany, setMasterCompany] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handleOpenDialog = async () => {
        setIsLoading(true);
        setIsDialogOpen(true);
        try {
            const response = await getMasterCaste({ page: 1, page_size: 10000 });
            if (response?.data) {
                const data = response.data as any;
                setCasteList(data.casteList || data || []);
                setMasterCompany(data.masterCompany || []);
            } else {
                setCasteList([]);
                setMasterCompany([]);
            }
        } catch (error) {
            console.error('Failed to fetch caste details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        const content = printRef.current?.innerHTML;
        if (!content) return;

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write(`
                <html>
                    <head>
                        <title>Master Caste List Report</title>
                        <style>
                            @page { margin: 15mm; }
                            body { font-family: Arial, sans-serif; color: black; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 14px; }
                            th { background-color: #f3f4f6 !important; font-weight: bold; }
                        </style>
                    </head>
                    <body>
                        ${content}
                    </body>
                </html>
            `);
            doc.close();

            // Wait a brief moment for images/styles to process
            setTimeout(() => {
                if (iframe.contentWindow) {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                }
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            }, 250);
        }
    };

    const handleExportExcel = () => {
        const excelColumns = JSON.stringify([
            { label: 'Sl.No', value: 'index' },
            { label: 'Caste Name', value: 'imC_CasteName' },
            { label: 'Caste Description', value: 'imC_CasteDesc' }
        ]);

        const excelContent = JSON.stringify(
            casteList.map((item, index) => ({
                ...item,
                index: index + 1
            }))
        );

        exportToExcel('Master_Caste_List_Report', excelColumns, excelContent);
    };

    return (
        <>
            <Button
                type='button'
                onClick={handleOpenDialog}
                className='w-fit bg-[#3f51b5] text-white transition-all duration-200 hover:scale-90 hover:bg-[#3f51b5]/90'>
                <Eye className='mr-2 h-4 w-4' />
                View Details
            </Button>
            {isDialogOpen && (
                <AdaptiveDialog
                    title='Master Caste List Report'
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    className='max-w-3xl'>
                    <AdaptiveBody className='flex flex-col gap-5'>
                        {masterCompany && masterCompany.length > 0 && (
                            <div className='mt-2 flex flex-col items-center justify-center gap-2 border-b pb-4'>
                                <div className='flex flex-col items-center gap-4 sm:flex-row'>
                                    {masterCompany[0].log && (
                                        <img src={masterCompany[0].log} alt='Company Logo' className='h-16 w-auto object-contain' />
                                    )}
                                    {/* <h1 className='text-2xl font-bold text-primary text-center sm:text-left'>
                                        {masterCompany[0].companyname}
                                    </h1> */}
                                </div>
                                <h2 className='mt-2 font-semibold text-lg text-muted-foreground uppercase'>Master Caste List Report</h2>
                            </div>
                        )}
                        <div className='my-2 max-h-[60vh] overflow-y-auto rounded-lg border p-3 shadow-sm'>
                            <GenericDataTable<IMasterCasteList>
                                data={casteList}
                                totalItems={casteList.length}
                                columns={columns}
                                isLoading={isLoading}
                                error={null}
                                showViewOptions={false}
                                isPaginationRequired={false}
                                isSearchRequired={false}
                                loadingMessage='Loading details...'
                                noDataTitle='No Details Found'
                                noDataDescription='No related details available'
                            />
                        </div>
                    </AdaptiveBody>
                    <AdaptiveFooter className='flex w-full items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <Button
                                variant='outline'
                                onClick={handleExportExcel}
                                type='button'
                                disabled={isLoading || casteList.length === 0}
                                className='gap-2'>
                                <Download className='h-4 w-4' />
                                Export Excel
                            </Button>
                            <Button
                                variant='outline'
                                onClick={handlePrint}
                                type='button'
                                disabled={isLoading || casteList.length === 0}
                                className='gap-2'>
                                <Printer className='h-4 w-4' />
                                Print
                            </Button>
                        </div>
                        <Button variant='destructive' onClick={() => setIsDialogOpen(false)} type='button'>
                            Close
                        </Button>
                    </AdaptiveFooter>
                </AdaptiveDialog>
            )}

            {/* Hidden Print Component */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                <div ref={printRef} style={{ width: '210mm', padding: '32px', color: 'black', backgroundColor: 'white' }}>
                    {masterCompany && masterCompany.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
                            {masterCompany[0].log && (
                                <img src={masterCompany[0].log} alt='Company Logo' style={{ height: '64px', objectFit: 'contain' }} />
                            )}
                        </div>
                    )}
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>
                        Master Caste List Report
                    </h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Sl.No</th>
                                <th>Caste Name</th>
                                <th>Caste Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {casteList.map((item, index) => (
                                <tr key={item.imC_Id}>
                                    <td>{index + 1}</td>
                                    <td>{item.imC_CasteName}</td>
                                    <td>{item.imC_CasteDesc}</td>
                                </tr>
                            ))}
                            {casteList.length === 0 && (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: 'center', color: '#6b7280' }}>
                                        No details found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
