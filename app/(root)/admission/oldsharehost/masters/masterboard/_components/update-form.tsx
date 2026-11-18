'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';

import { type MasterBoardFormValues, masterBoardSchema } from '@/schemas/admission/oldsharedhost/masters/master-board';
import { getMasterBoardDetails, saveMasterBoard } from '@/server/admission/oldsharedhost/masters/master-board';
import type { IMasterBoard } from '@/types/admission/oldsharedhost/masters/master-board';

export default function UpdateMasterBoardForm({ onSuccess }: { onSuccess: () => void }) {
    const { selectedRow, closeAddForm } = useFormContext<IMasterBoard>();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<MasterBoardFormValues>({
        resolver: zodResolver(masterBoardSchema),
        defaultValues: {
            ivrmmB_Id: 0,
            ivrmmB_Name: '',
            ivrmmB_Description: ''
        }
    });

    useEffect(() => {
        if (selectedRow) {
            // 1. Instantly bind the row data we already have from the table
            const initialId = selectedRow.ivrmmB_Id || (selectedRow as any).IVRMMB_Id || (selectedRow as any).ivrmmB_id || 0;
            const initialName = selectedRow.ivrmmB_Name || (selectedRow as any).IVRMMB_Name || (selectedRow as any).ivrmmB_name || '';
            const initialDescription =
                selectedRow.ivrmmB_Description || (selectedRow as any).IVRMMB_Description || (selectedRow as any).ivrmmB_description || '';

            form.reset({
                ivrmmB_Id: initialId,
                ivrmmB_Name: initialName,
                ivrmmB_Description: initialDescription
            });

            // 2. Fetch fresh details from backend to ensure we have the absolute latest
            getMasterBoardDetails(initialId).then((res) => {
                if (res.success && res.data) {
                    let freshData = null;
                    if (Array.isArray(res.data) && res.data.length > 0) {
                        freshData = res.data[0];
                    } else if (res.data.editboard && res.data.editboard.length > 0) {
                        freshData = res.data.editboard[0];
                    } else if (res.data.boardList && res.data.boardList.length > 0) {
                        freshData = res.data.boardList[0];
                    }

                    if (freshData) {
                        form.reset({
                            ivrmmB_Id: freshData.ivrmmB_Id || freshData.IVRMMB_Id || freshData.ivrmmB_id || initialId,
                            ivrmmB_Name: freshData.ivrmmB_Name || freshData.IVRMMB_Name || freshData.ivrmmB_name || initialName,
                            ivrmmB_Description:
                                freshData.ivrmmB_Description ||
                                freshData.IVRMMB_Description ||
                                freshData.ivrmmB_description ||
                                initialDescription
                        });
                    }
                }
            });
        }
    }, [selectedRow, form]);

    const onSubmit = async (values: MasterBoardFormValues) => {
        setIsSaving(true);
        try {
            const response = await saveMasterBoard(values);
            if (response.success || response.returnval === 'Add' || response.returnval === 'Update') {
                toast.success('Record Updated Successfully');
                onSuccess();
            } else if (response.returnval === 'Duplicate') {
                toast.error('Master Board Already Exists');
            } else {
                toast.error(response.message || 'Operation Failed');
            }
        } catch (error) {
            toast.error('An error occurred while updating.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='mx-auto max-w-2xl space-y-6 p-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {/* Board Name */}
                    <FormField
                        control={form.control}
                        name='ivrmmB_Name'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Board Name <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='Enter Board Name'
                                        maxLength={50}
                                        onPaste={(e) => e.preventDefault()}
                                        {...field}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                            field.onChange(val);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Board Description */}
                    <FormField
                        control={form.control}
                        name='ivrmmB_Description'
                        render={({ field }) => (
                            <FormItem className='col-span-1 md:col-span-2'>
                                <FormLabel>
                                    Board Description <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder='Enter Board Description'
                                        maxLength={100}
                                        rows={3}
                                        onPaste={(e) => e.preventDefault()}
                                        {...field}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                            field.onChange(val);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Actions */}
                <div className='mt-6 flex items-center justify-start gap-4 border-t pt-4'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => window.location.reload()}
                        disabled={isSaving}
                        className='min-w-24 font-semibold shadow-sm hover:bg-slate-50'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSaving}
                        className='min-w-24 border-0 bg-[#ff6b35] font-semibold text-white shadow-sm hover:bg-[#e05b25]'>
                        {isSaving ? <Spinner className='mr-2 h-4 w-4 text-white' /> : <Save className='mr-2 h-4 w-4' />}
                        Update Master Board
                    </Button>
                </div>
            </form>
        </Form>
    );
}
