'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericInputField } from '@/components/ui/form/input-fields';
import { Save, X } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useClgRegNoFormat, useSaveClgRegNoFormat } from '@/hooks/college/useClgRegNoFormat';

export function RegNoFormatForm() {
    const { data: initialData, isLoading } = useClgRegNoFormat();
    const { mutate: saveRegNoFormat, isPending: isSaving } = useSaveClgRegNoFormat();

    const methods = useForm({
        defaultValues: {
            acrF_Id: 0,
            acrF_StartingNo: '',
            acrF_NumericWidth: '',
            acrF_SLNo: '',
            acrF_CollegeCodeFlg: false,
            acrF_CCOrderFlg: '',
            acrF_AYCodeFlg: false,
            acrF_AYCodeOrderFlg: '',
            acrF_BranchCodeFlg: false,
            acrF_BranchCodeOrderFlg: '',
            acrF_PrefilZeroFlg: false,
        }
    });

    const { handleSubmit, watch, reset, setValue, setError, clearErrors } = methods;

    useEffect(() => {
        if (initialData?.data?.datalist?.length > 0) {
            reset(initialData.data.datalist[0]);
        }
    }, [initialData, reset]);

    const includeCollegeCode = watch('acrF_CollegeCodeFlg');
    const includeAdmyear = watch('acrF_AYCodeFlg');
    const includeBranchCode = watch('acrF_BranchCodeFlg');

    const onSubmit = (data: any) => {
        const ccOrder = parseInt(data.acrF_CCOrderFlg) || 0;
        const ayOrder = parseInt(data.acrF_AYCodeOrderFlg) || 0;
        const bcOrder = parseInt(data.acrF_BranchCodeOrderFlg) || 0;

        let hasError = false;
        
        if (data.acrF_CollegeCodeFlg && data.acrF_AYCodeFlg && ccOrder === ayOrder) {
            setError('acrF_CCOrderFlg', { message: 'Order Cannot Be Same' });
            setError('acrF_AYCodeOrderFlg', { message: 'Order Cannot Be Same' });
            hasError = true;
        }
        if (data.acrF_CollegeCodeFlg && data.acrF_BranchCodeFlg && ccOrder === bcOrder) {
            setError('acrF_CCOrderFlg', { message: 'Order Cannot Be Same' });
            setError('acrF_BranchCodeOrderFlg', { message: 'Order Cannot Be Same' });
            hasError = true;
        }
        if (data.acrF_AYCodeFlg && data.acrF_BranchCodeFlg && ayOrder === bcOrder) {
            setError('acrF_AYCodeOrderFlg', { message: 'Order Cannot Be Same' });
            setError('acrF_BranchCodeOrderFlg', { message: 'Order Cannot Be Same' });
            hasError = true;
        }

        if (hasError) return;

        clearErrors();
        
        const payload = {
            acrF_Id: data.acrF_Id || 0,
            acrF_CollegeCodeFlg: !!data.acrF_CollegeCodeFlg,
            acrF_CCOrderFlg: ccOrder,
            acrF_AYCodeFlg: !!data.acrF_AYCodeFlg,
            acrF_AYCodeOrderFlg: ayOrder,
            acrF_BranchCodeFlg: !!data.acrF_BranchCodeFlg,
            acrF_BranchCodeOrderFlg: bcOrder,
            acrF_NumericWidth: data.acrF_NumericWidth?.toString() || "",
            acrF_SLNo: parseInt(data.acrF_SLNo) || 0,
            acrF_StartingNo: data.acrF_StartingNo?.toString() || "",
            acrF_PrefilZeroFlg: !!data.acrF_PrefilZeroFlg
        };
        
        saveRegNoFormat(payload, {
            onSuccess: (res) => {
                if (res?.returnval) {
                    alert('Data Saved Successfully');
                } else if (res?.message) {
                    alert(res.message);
                } else {
                    alert('Failed to save data');
                }
            },
            onError: (error: any) => {
                console.error('Save failed:', error);
                alert(error.message || 'Failed to save data');
            }
        });
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto p-4">
                <div className="space-y-4">
                    <GenericInputField name="acrF_StartingNo" label="Start Number" required />
                    <GenericInputField name="acrF_NumericWidth" label="Numeric Width" required />
                    <GenericInputField name="acrF_SLNo" label="SL Number" required />
                </div>

                <div className="space-y-4 pt-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="acrF_CollegeCodeFlg" 
                            checked={includeCollegeCode} 
                            onCheckedChange={(checked) => setValue('acrF_CollegeCodeFlg', checked as boolean)} 
                        />
                        <label htmlFor="acrF_CollegeCodeFlg" className="text-sm font-medium leading-none">Include College Code</label>
                    </div>
                    {includeCollegeCode && (
                        <div className="ml-6">
                            <GenericInputField name="acrF_CCOrderFlg" label="Order No" type="number" required />
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="acrF_AYCodeFlg" 
                            checked={includeAdmyear} 
                            onCheckedChange={(checked) => setValue('acrF_AYCodeFlg', checked as boolean)} 
                        />
                        <label htmlFor="acrF_AYCodeFlg" className="text-sm font-medium leading-none">Include Admission Year</label>
                    </div>
                    {includeAdmyear && (
                        <div className="ml-6">
                            <GenericInputField name="acrF_AYCodeOrderFlg" label="Order No" type="number" required />
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="acrF_BranchCodeFlg" 
                            checked={includeBranchCode} 
                            onCheckedChange={(checked) => setValue('acrF_BranchCodeFlg', checked as boolean)} 
                        />
                        <label htmlFor="acrF_BranchCodeFlg" className="text-sm font-medium leading-none">Include Branch Code</label>
                    </div>
                    {includeBranchCode && (
                        <div className="ml-6">
                            <GenericInputField name="acrF_BranchCodeOrderFlg" label="Order No" type="number" required />
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="acrF_PrefilZeroFlg" 
                            checked={watch('acrF_PrefilZeroFlg')} 
                            onCheckedChange={(checked) => setValue('acrF_PrefilZeroFlg', checked as boolean)} 
                        />
                        <label htmlFor="acrF_PrefilZeroFlg" className="text-sm font-medium leading-none">Prefill with Zero</label>
                    </div>
                </div>

                <div className="flex justify-center space-x-4 border-t pt-4">
                    <Button type="submit" className="w-32 bg-primary" disabled={isLoading || isSaving}>
                        <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button type="button" variant="destructive" onClick={() => reset()} className="w-32" disabled={isLoading || isSaving}>
                        <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}
