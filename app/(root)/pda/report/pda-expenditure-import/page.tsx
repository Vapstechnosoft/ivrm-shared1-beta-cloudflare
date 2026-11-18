'use client';

import PDAExpenditureImportForm from '@/app/(root)/pda/report/pda-expenditure-import/_components/PDAExpenditureImportForm';
import PDAExpenditureImportGrid from '@/app/(root)/pda/report/pda-expenditure-import/_components/PDAExpenditureImportGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePDAAcademicYear } from '@/hooks/pda/usePDACommon';
import { checkPDAExpenditureValidation, savePDAExpenditureImport } from '@/server/pda/report/pda-expenditure-import';
import type { IPDAExpenditureImportRow } from '@/types/pda/report/pda-expenditure-import';
import { Loader2, RotateCcw, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function PDAExpenditureImportPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [importedData, setImportedData] = useState<IPDAExpenditureImportRow[]>([]);
    0;
    const [selectedAsmayId, setSelectedAsmayId] = useState<number | null>(null);
    const [trnType, setTrnType] = useState<'Debit' | 'Credit'>('Debit');
    const [totalAmount, setTotalAmount] = useState(0);

    const { data: yearsRes, isLoading: loadingYears } = usePDAAcademicYear();

    const getArray = (data: any): any[] => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (data.$values && Array.isArray(data.$values)) return data.$values;
        return [];
    };

    const academicYearsList = getArray(yearsRes?.data?.data || yearsRes?.data?.fillyear || yearsRes?.data);

    const handleImport = async (data: IPDAExpenditureImportRow[]) => {
        try {
            const validationResponse = await checkPDAExpenditureValidation({ newlstget1: data });
            if (validationResponse.data?.stuStatus) {
                toast.error(validationResponse.data.stuStatus);
                setImportedData([]);
                setTotalAmount(0);
                return;
            }

            setImportedData(data);
            const total = data.reduce((sum, row) => sum + (Number(row.Amount) || 0), 0);
            setTotalAmount(total);
            toast.success(`${data.length} records imported successfully`);
        } catch (error) {
            console.error('Validation error:', error);
            toast.error('Error validating imported data');
        }
    };

    const handleSave = async () => {
        if (!selectedAsmayId) {
            toast.error('Please select an Academic Year');
            return;
        }

        if (importedData.length === 0) {
            toast.error('No data to save. Please import an Excel file first.');
            return;
        }

        setSaving(true);
        try {
            const formattedData = importedData.map((row) => {
                // Convert DD/MM/YYYY to YYYY/MM/DD
                const dateParts = row.Date.split('/');
                const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : row.Date;

                return {
                    AMST_AdmNo: row.RollNumber,
                    PDAE_Date: formattedDate,
                    PDAE_TotAmount: Number(row.Amount),
                    AMST_FirstName: row.StudentName,
                    Particular: row.Particulars,
                    VoucherNo: row.VoucherNo,
                    remarks: ''
                };
            });

            const payload = {
                FeeReceiptimport: formattedData,
                ASMAY_Id: selectedAsmayId,
                PDAR_ModeOfPayment: trnType
            };

            const response = await savePDAExpenditureImport(payload);
            if (response.data?.returnval) {
                toast.success(`Records Saved -- ${response.data.studentdata}`);
                // Reload page or reset state
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                toast.error('Please Select Correct File Format');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Error saving data');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        window.location.reload();
    };

    if (loadingYears) {
        return (
            <div className='flex h-[400px] items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        );
    }

    return (
        <div className='fade-in container animate-in space-y-8 p-6 duration-500'>
            <div className='flex items-center justify-between'>
                <div></div>
            </div>

            <Card className='border-none bg-white/50 shadow-xl backdrop-blur-sm'>
                <CardHeader className='border-b bg-gray-50/50'>
                    <CardTitle className='font-semibold text-gray-800 text-xl'>Import Configuration</CardTitle>
                </CardHeader>
                <CardContent className='p-6'>
                    <PDAExpenditureImportForm
                        academicYears={academicYearsList}
                        selectedAsmayId={selectedAsmayId}
                        setSelectedAsmayId={setSelectedAsmayId}
                        trnType={trnType}
                        setTrnType={setTrnType}
                        onImport={handleImport}
                    />

                    <div className='mt-6 flex justify-center gap-4 pt-6'>
                        <Button
                            onClick={handleSave}
                            disabled={saving || importedData.length === 0}
                            className='h-10 w-40 rounded-md bg-gradient-to-r from-orange-600 to-orange-700 font-bold text-white shadow-md transition-all hover:from-orange-700 hover:to-orange-800 active:scale-95 disabled:opacity-50'>
                            {saving ? (
                                <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className='mr-2 h-4 w-4' />
                                    Save Records
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={handleCancel}
                            disabled={saving}
                            variant='outline'
                            className='h-10 w-32 rounded-md border-gray-200 font-bold shadow-md hover:scale-105 hover:bg-gray-50 active:scale-95 disabled:opacity-50'>
                            <RotateCcw className='mr-2 h-4 w-4 text-gray-500' />
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {importedData.length > 0 && (
                <div className='slide-in-from-bottom-4 animate-in space-y-6 duration-500'>
                    <Card className='border-none shadow-xl'>
                        <CardHeader className='flex flex-row items-center justify-between border-b bg-gray-50/50'>
                            <CardTitle className='font-semibold text-gray-800 text-xl'>Imported Data Preview</CardTitle>
                            <div className='rounded-full bg-primary/10 px-4 py-2 font-medium text-primary text-sm'>
                                Total Amount:{' '}
                                {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </CardHeader>
                        <CardContent className='p-0'>
                            <PDAExpenditureImportGrid data={importedData} />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
