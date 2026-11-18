'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { IInstitutionItem, IMasterAcademicYearMasterList } from '@/types/admission/preadmission/configaration';
import { format } from 'date-fns';
import { Eye, FileSpreadsheet, Printer } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';

interface ViewDetailsFormProps {
    data: IMasterAcademicYearMasterList[];
    institution?: IInstitutionItem;
}

export default function ViewDetailsForm({ data, institution }: ViewDetailsFormProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const [logo, setLogo] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [data]);

    useEffect(() => {
        try {
            const admfigsettings = localStorage.getItem('admfigsettings');
            if (admfigsettings) {
                const parsed = JSON.parse(admfigsettings);
                if (parsed && parsed.length > 0) {
                    setLogo(parsed[0].asC_Logo_Path || '');
                }
            }
        } catch (error) {
            console.error('Error parsing admfigsettings', error);
        }
    }, []);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        pageStyle: '@page { size: auto; margin: 15mm; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }'
    });

    const exportToExcel = () => {
        const exportData = data.map((item, index) => ({
            SLNO: index + 1,
            'Academic year': item.asmaY_Year,
            'From Date': item.asmaY_From_Date ? format(new Date(item.asmaY_From_Date), 'dd/MM/yyyy') : '',
            'To Date': item.asmaY_To_Date ? format(new Date(item.asmaY_To_Date), 'dd/MM/yyyy') : ''
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Academic Years');
        XLSX.writeFile(wb, 'Academic_Year_List_Report.xlsx');
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant='outline' size='sm' className='border-primary text-primary shadow-sm hover:bg-primary/10'>
                    <Eye className='mr-2 h-4 w-4' />
                    View Details
                </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[85vh] max-w-4xl overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle className='text-xl'>ACADEMIC YEAR LIST</DialogTitle>
                </DialogHeader>

                <div className='mb-2 flex justify-end gap-3'>
                    <Button variant='outline' size='sm' onClick={handlePrint} className='border-blue-200 text-blue-600 hover:bg-blue-50'>
                        <Printer className='mr-2 h-4 w-4' /> Print
                    </Button>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={exportToExcel}
                        className='border-green-200 text-green-600 hover:bg-green-50'>
                        <FileSpreadsheet className='mr-2 h-4 w-4' /> Excel
                    </Button>
                </div>

                <div>
                    <div ref={printRef} className='printable-content bg-white p-8 text-black'>
                        {(() => {
                            const displayLogo = institution?.mI_Logo || logo;
                            return displayLogo ? (
                                <div className='flex flex-col items-center justify-center gap-6 border-b pb-4 md:flex-row'>
                                    <img
                                        src={displayLogo}
                                        alt='Institution Logo'
                                        className='h-auto max-h-32 w-auto max-w-full shrink-0 object-contain'
                                    />
                                </div>
                            ) : null;
                        })()}

                        <div className='text-center'>
                            <h2 className='font-bold text-blue-800 text-xl uppercase tracking-wider'>ACADEMIC YEAR LIST REPORT</h2>
                        </div>
                        <div className='rounded-md border print:border-none'>
                            <table className='w-full text-left text-sm print:text-xs'>
                                <thead className='bg-muted/50 font-semibold text-xs uppercase print:bg-gray-100'>
                                    <tr>
                                        <th className='w-16 border-b px-6 py-3 text-center'>SLNO</th>
                                        <th className='border-b px-6 py-3 text-center'>Academic year</th>
                                        <th className='border-b px-6 py-3 text-center'>From Date</th>
                                        <th className='border-b px-6 py-3 text-center'>To Date</th>
                                    </tr>
                                </thead>
                                <tbody className='print:hidden'>
                                    {data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, index) => (
                                        <tr key={item.asmaY_Id} className='border-b last:border-b-0 hover:bg-muted/30'>
                                            <td className='px-6 py-3 text-center'>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                            <td className='px-6 py-3 text-center'>{item.asmaY_Year}</td>
                                            <td className='px-6 py-3 text-center'>
                                                {item.asmaY_From_Date ? format(new Date(item.asmaY_From_Date), 'dd/MM/yyyy') : ''}
                                            </td>
                                            <td className='px-6 py-3 text-center'>
                                                {item.asmaY_To_Date ? format(new Date(item.asmaY_To_Date), 'dd/MM/yyyy') : ''}
                                            </td>
                                        </tr>
                                    ))}
                                    {data.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className='px-6 py-8 text-center text-muted-foreground'>
                                                No academic years found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tbody className='hidden print:table-row-group'>
                                    {data.map((item, index) => (
                                        <tr key={item.asmaY_Id} className='border-b last:border-b-0'>
                                            <td className='px-6 py-3 text-center'>{index + 1}</td>
                                            <td className='px-6 py-3 text-center'>{item.asmaY_Year}</td>
                                            <td className='px-6 py-3 text-center'>
                                                {item.asmaY_From_Date ? format(new Date(item.asmaY_From_Date), 'dd/MM/yyyy') : ''}
                                            </td>
                                            <td className='px-6 py-3 text-center'>
                                                {item.asmaY_To_Date ? format(new Date(item.asmaY_To_Date), 'dd/MM/yyyy') : ''}
                                            </td>
                                        </tr>
                                    ))}
                                    {data.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className='px-6 py-8 text-center text-muted-foreground'>
                                                No academic years found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className='mt-4 flex items-center justify-between print:hidden'>
                            <div className='text-sm text-muted-foreground'>
                                Showing {data.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
                                {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} entries
                            </div>
                            <div className='flex items-center gap-2'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}>
                                    Previous
                                </Button>
                                <div className='text-sm font-medium'>
                                    Page {currentPage} of {Math.ceil(data.length / itemsPerPage) || 1}
                                </div>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(data.length / itemsPerPage)))}
                                    disabled={currentPage === Math.ceil(data.length / itemsPerPage) || data.length === 0}>
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
