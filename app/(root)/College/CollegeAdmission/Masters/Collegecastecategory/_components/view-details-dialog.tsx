'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Button } from '@/components/ui/button';
import { getInitialData } from '@/server/college/CollegeAdmission/Masters/college-caste-category';
import type { ICollegeCasteCategory } from '@/types/college/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { Download, Eye, Printer } from 'lucide-react';
import { useRef, useState } from 'react';
import { exportToExcel } from '@/lib/export-to-file';

const columns: ColumnDef<ICollegeCasteCategory>[] = [
    {
        accessorKey: 'imcC_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='w-full pl-6 font-bold text-black' />,
        cell: ({ row }) => <div className='w-full pl-6'>{row.index + 1}</div>,
        enableSorting: false,
    },
    {
        accessorKey: 'imcC_CategoryName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Caste Category Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('imcC_CategoryName')}</div>,
        enableSorting: false,
    },
    {
        accessorKey: 'imcC_CategoryDesc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Description' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('imcC_CategoryDesc')}</div>,
        enableSorting: false,
    }
];

export default function ViewDetailsDialog() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [categoryList, setCategoryList] = useState<ICollegeCasteCategory[]>([]);
    const [masterCompany, setMasterCompany] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handleOpenDialog = async () => {
        setIsLoading(true);
        setIsDialogOpen(true);
        try {
            const response = await getInitialData();
            if (response?.data) {
                const data = response.data as any;
                setCategoryList(data.castecategoryname || data.list || []);
                setMasterCompany(data.masterCompany || []);
            } else {
                setCategoryList([]);
                setMasterCompany([]);
            }
        } catch (error) {
            console.error('Failed to fetch details:', error);
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
                        <title>Master College Caste Category Report</title>
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
            { label: 'Caste Category Name', value: 'imcC_CategoryName' },
            { label: 'Description', value: 'imcC_CategoryDesc' }
        ]);

        const excelContent = JSON.stringify(
            categoryList.map((item, index) => ({
                ...item,
                index: index + 1
            }))
        );

        exportToExcel('Master_College_Caste_Category_Report', excelColumns, excelContent);
    };

    return (
        <>
            {/* <Button type='button' onClick={handleOpenDialog} className='w-fit transition-all duration-200 hover:scale-90 bg-[#3f51b5] hover:bg-[#3f51b5]/90 text-white'>
                <Eye className='mr-2 h-4 w-4' />
                View Details
            </Button> */}
            {isDialogOpen && (
                <AdaptiveDialog title='Master College Caste Category Report' isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} className='max-w-4xl'>
                    <AdaptiveBody className='flex flex-col gap-5'>
                        {masterCompany && masterCompany.length > 0 && (
                            <div className='flex flex-col items-center justify-center gap-2 border-b pb-4 mt-2'>
                                <div className='flex flex-col sm:flex-row items-center gap-4'>
                                    {masterCompany[0].log && (
                                        <img src={masterCompany[0].log} alt='Company Logo' className='h-16 w-auto object-contain' />
                                    )}
                                </div>
                                <h2 className='text-lg font-semibold text-muted-foreground uppercase mt-2'>
                                    Master College Caste Category Report
                                </h2>
                            </div>
                        )}
                        <div className='my-2 max-h-[60vh] overflow-y-auto rounded-lg border p-3 shadow-sm'>
                            <GenericDataTable<ICollegeCasteCategory>
                                data={categoryList}
                                totalItems={categoryList.length}
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
                    <AdaptiveFooter className='flex justify-between items-center w-full'>
                        <div className='flex items-center gap-2'>
                            <Button variant='outline' onClick={handleExportExcel} type='button' disabled={isLoading || categoryList.length === 0} className='gap-2'>
                                <Download className='h-4 w-4' />
                                Export Excel
                            </Button>
                            <Button variant='outline' onClick={handlePrint} type='button' disabled={isLoading || categoryList.length === 0} className='gap-2'>
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
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>Master College Caste Category Report</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Sl.No</th>
                                <th>Caste Category Name</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categoryList.map((item, index) => (
                                <tr key={item.imcC_Id}>
                                    <td>{index + 1}</td>
                                    <td>{item.imcC_CategoryName}</td>
                                    <td>{item.imcC_CategoryDesc}</td>
                                </tr>
                            ))}
                            {categoryList.length === 0 && (
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
