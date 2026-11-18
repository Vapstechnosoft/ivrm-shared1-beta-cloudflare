'use client';

import { Button } from '@/components/ui/button';
import { checkImportValidation, saveImportedData } from '@/server/admission/preadmission/masters/admission_import';
import { Loader2, Save, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import ImportForm from './_components/import-form';
import PreviewTable from './_components/preview-table';

export default function StudentImportPage() {
    const [importedData, setImportedData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [isValidated, setIsValidated] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isValidating, setIsValidating] = useState(false);

    const handleDataLoaded = async (data: any[], cols: string[]) => {
        setImportedData(data);
        setHeaders(cols);
        setIsValidated(false);

        // Auto-validate upon upload
        await performValidation(data);
    };

    const performValidation = async (data: any[]) => {
        setIsValidating(true);
        try {
            // Ensure data is a plain object to avoid Next.js Server Action errors
            const plainData = JSON.parse(JSON.stringify(data));
            const response = await checkImportValidation({ newlstget1: plainData });

            if (response.stuStatus && response.stuStatus !== '') {
                Swal.fire({
                    icon: 'warning',
                    title: 'Validation Failed',
                    text: String(response.stuStatus),
                    confirmButtonColor: '#3085d6'
                });
                setImportedData([]); // Clear data if validation fails as per legacy logic
                setHeaders([]);
            } else if (response.success === false && response.message) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Failed',
                    text: response.message,
                    confirmButtonColor: '#3085d6'
                });
                setImportedData([]);
                setHeaders([]);
            } else {
                setIsValidated(true);
                toast.success('Excel data validated successfully!');
            }
        } catch (error) {
            console.error('Validation error:', error);
            toast.error('Failed to validate excel data');
        } finally {
            setIsValidating(false);
        }
    };

    const handleSave = async () => {
        if (!isValidated) {
            toast.error('Please validate the data first');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                // Ensure data is a plain object to avoid Next.js Server Action errors
                newlstget1: JSON.parse(JSON.stringify(importedData))
            };
            const response = await saveImportedData(payload);

            // Support legacy responses where success is indicated by 'true' at the start of message or stuStatus
            const responseMessage = String(response.message || response.stuStatus || '');
            const isSuccess = response.success || response.stuStatus === 'true' || responseMessage.toLowerCase().startsWith('true');
            
            let displayMessage = responseMessage;
            if (displayMessage.toLowerCase().startsWith('true')) {
                displayMessage = displayMessage.substring(4).trim();
            }

            if (isSuccess) {
                Swal.fire({
                    icon: 'success',
                    title: 'Import Result',
                    text: displayMessage || ('Failed And Saved Count ' + (response.returnMsg || ''))
                }).then(() => {
                    window.location.reload();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Save Failed',
                    text: displayMessage || 'An error occurred while saving the data'
                });
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('An error occurred while saving the data');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClear = () => {
        setImportedData([]);
        setHeaders([]);
        setIsValidated(false);
    };

    return (
        <div className='fade-in container mx-auto animate-in space-y-8 py-8 duration-500'>
            {/* Header section with page title */}
            <div className='flex flex-col space-y-2'>
                <h1 className='bg-gradient-to-r from-primary to-primary/60 bg-clip-text font-extrabold text-3xl text-transparent tracking-tight'>
                    Excel Data Import
                </h1>
                <p className='text-muted-foreground'>Upload and manage student data imports effectively from Microsoft Excel files.</p>
            </div>

            {/* Import Form Section */}
            <ImportForm onDataLoaded={handleDataLoaded} onClear={handleClear} />

            {/* Preview and Save Section */}
            {importedData.length > 0 && (
                <div className='slide-in-from-bottom-4 animate-in space-y-6 duration-300'>
                    <PreviewTable data={importedData} headers={headers} isLoading={isValidating} />

                    <div className='flex items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/20 py-8'>
                        <Button
                            size='lg'
                            onClick={handleSave}
                            disabled={!isValidated || isSaving || isValidating}
                            className='min-w-[150px] shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-primary/40'>
                            {isSaving ? <Loader2 className='mr-2 h-5 w-5 animate-spin' /> : <Save className='mr-2 h-5 w-5' />}
                            {isSaving ? 'Saving...' : 'Save Data'}
                        </Button>
                        <Button
                            variant='outline'
                            size='lg'
                            onClick={handleClear}
                            disabled={isSaving}
                            className='min-w-[150px] transition-all duration-300 hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive'>
                            <X className='mr-2 h-5 w-5' />
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
