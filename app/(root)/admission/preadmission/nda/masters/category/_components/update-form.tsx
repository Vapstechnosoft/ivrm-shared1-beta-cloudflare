'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { useMasterCategory } from '@/hooks/admission/preadmission/useMasters';
import { masterCategorySchema } from '@/schemas/admission/preadmission/masters';
import { addOrUpdateMasterCategory } from '@/server/admission/preadmission/masters/category';
import { deleteDocument, uploadDocument } from '@/server/document_upload';
import type { IMasterCategoryList } from '@/types/admission/preadmission/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterCategorySchema.addOrUpdate>;

interface UpdateMasterCategoryFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: IMasterCategoryList;
}

export default function UpdateMasterCategoryForm({ onSuccess, className = '', selectedRow: row }: UpdateMasterCategoryFormProps) {
    const { refetchAll } = useMasterCategory();
    // Add these state declarations after the useForm hook
    const [uploadedLogo, setUploadedLogo] = useState<{
        document_Path: string;
        documentName: string;
        isUploading: boolean;
    } | null>(null);
    const [logoError, setLogoError] = useState<string>('');

    const {
        control,
        setValue,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterCategorySchema.addOrUpdate),
        mode: 'onChange'
    });

    useEffect(() => {
        if (row) {
            reset({
                amC_Id: row.amC_Id,
                amC_Name: row.amC_Name,
                amC_Address: row.amC_Address,
                amC_Type: row.amC_Type
            });
        }
    }, [row, reset, setValue]);

    // Add this useEffect after the existing one
    useEffect(() => {
        if (row?.amC_FilePath?.includes('blob.core')) {
            setUploadedLogo({
                document_Path: row.amC_FilePath,
                documentName: row.amC_Logo || 'Existing Logo',
                isUploading: false
            });
        } else {
            setUploadedLogo(null);
        }
    }, [row]);

    const handleLogoUpload = async (file: File) => {
        try {
            // Allowed file types
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                toast.error(' Only PNG, JPG, and JPEG formats are allowed');
                return;
            }

            // Restrict file size to 2MB
            if (file.size > 2 * 1024 * 1024) {
                toast.error('File size should not exceed 2MB');
                return;
            }

            setUploadedLogo({
                document_Path: '',
                documentName: file.name,
                isUploading: true
            });
            setLogoError('');

            const formData = new FormData();
            formData.append('file', file);
            formData.append('SubContainerName', 'logo_category');

            const response = await uploadDocument(formData);

            if (response.success && response.data) {
                setUploadedLogo({
                    document_Path: response.data as string,
                    documentName: file.name,
                    isUploading: false
                });
                toast.success('Logo uploaded successfully');
            } else {
                throw new Error(response.message || 'Upload failed');
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Upload failed';
            setLogoError(errorMessage);
            setUploadedLogo(null);
            toast.error(`Failed to upload logo: ${errorMessage}`);
        }
    };

    const handleLogoDelete = async () => {
        if (!uploadedLogo) return;

        try {
            // Only call delete API if it's a newly uploaded file (not the original from row)
            if (uploadedLogo.document_Path !== row.amC_FilePath) {
                const response = await deleteDocument(uploadedLogo.document_Path);
                if (!response.success) {
                    throw new Error(response.message || 'Delete failed');
                }
            }

            setUploadedLogo(null);
            toast.success('Logo removed successfully');
        } catch (_error: any) {
            toast.error('Failed to delete logo');
        }
    };

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const { amC_Id, amC_Name, amC_Address, amC_Type } = data;
            const payload = {
                AMC_Id: amC_Id,
                AMC_Name: amC_Name,
                AMC_Address: amC_Address,
                AMC_Type: amC_Type,
                AMC_RegNoPrefix: '',
                amC_Logo: uploadedLogo?.documentName || '',
                amC_FilePath: uploadedLogo?.document_Path || '',
                AMC_ActiveFlag: 1
            };

            const response = await addOrUpdateMasterCategory(payload);

            if (response.success) {
                toast.success(response.message);
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Replace your existing handleReset function
    const handleReset = () => {
        reset({
            amC_Id: row.amC_Id,
            amC_Name: row.amC_Name,
            amC_Address: row.amC_Address,
            amC_Type: row.amC_Type
        });

        // Reset logo to original state from row
        if (row?.amC_FilePath?.includes('blob.core')) {
            setUploadedLogo({
                document_Path: row.amC_FilePath,
                documentName: row.amC_Logo || 'Existing Logo',
                isUploading: false
            });
        } else {
            setUploadedLogo(null);
        }
        setLogoError('');
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-1'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                        <InputText
                            label='Category Name'
                            placeholder='Enter Category Name'
                            required
                            id='amC_Name'
                            {...register('amC_Name')}
                            defaultValue={row.amC_Name}
                            error={errors.amC_Name?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    {/* Root Error */}

                    {/* Root Error */}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Updating...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Update Master Category
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
