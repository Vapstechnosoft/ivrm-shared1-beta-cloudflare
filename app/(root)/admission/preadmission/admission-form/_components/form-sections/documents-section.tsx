'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { Spinner } from '@/components/ui/spinner';
import { useMasterDocument } from '@/hooks/admission/preadmission/useMasters';
import { cn } from '@/lib/utils';
import { Check, Eye, Info, Trash, Upload } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { toast } from 'sonner';

interface DocumentInfo {
    path?: string;
    isUploading?: boolean;
    amsmD_Id?: number;
    documentName?: string;
    file?: File;
}

interface DocumentsSectionProps {
    control: any;
    isSubmitting: boolean;
    uploadedDocuments: DocumentInfo[];
    fatherPhoto: DocumentInfo | null;
    fatherSignature: DocumentInfo | null;
    motherPhoto: DocumentInfo | null;
    motherSignature: DocumentInfo | null;
    handleDocumentUpload: (id: number, file: File, name: string) => void;
    handleDocumentDelete: (id: number, path?: string, name?: string) => void;
    handleFatherPhotoUpload: (file: File) => void;
    handleFatherPhotoDelete: () => void;
    handleFatherSignatureUpload: (file: File) => void;
    handleFatherSignatureDelete: () => void;
    handleMotherPhotoUpload: (file: File) => void;
    handleMotherPhotoDelete: () => void;
    handleMotherSignatureUpload: (file: File) => void;
    handleMotherSignatureDelete: () => void;
}

export function DocumentsSection({
    control,
    isSubmitting,
    uploadedDocuments,
    fatherPhoto,
    fatherSignature,
    motherPhoto,
    motherSignature,
    handleDocumentUpload,
    handleDocumentDelete,
    handleFatherPhotoUpload,
    handleFatherPhotoDelete,
    handleFatherSignatureUpload,
    handleFatherSignatureDelete,
    handleMotherPhotoUpload,
    handleMotherPhotoDelete,
    handleMotherSignatureUpload,
    handleMotherSignatureDelete
}: DocumentsSectionProps) {
    const { data: masterDocsData } = useMasterDocument();
    const masterDocuments = (masterDocsData?.data || []).filter((doc: any) => doc.amsmD_ActiveFlag);

    const FileUploadRow = ({
        label,
        doc,
        onUpload,
        onDelete,
        id
    }: {
        label: string;
        doc: DocumentInfo | null;
        onUpload: (file: File) => void;
        onDelete: () => void;
        id: string;
    }) => (
        <tr className={cn('border-t transition-colors', doc?.path ? 'bg-green-50/30' : 'bg-amber-50/30')}>
            <td className='px-6 py-4'>
                <span className='font-semibold text-gray-700'>{label}</span>
            </td>
            <td className='px-6 py-4'>
                {doc?.isUploading ? (
                    <span className='flex animate-pulse items-center gap-2 text-blue-600'>
                        <Spinner size='sm' /> {label.toLowerCase().includes('photo') ? 'AI Validating...' : 'Uploading...'}
                    </span>
                ) : doc?.path ? (
                    <span className='flex items-center gap-1.5 font-medium text-green-600'>
                        <Check className='h-4 w-4' /> Uploaded
                        {label.toLowerCase().includes('photo') && (
                            <span className='ml-1 rounded bg-green-100 px-1.5 py-0.5 font-semibold text-[10px] text-green-800'>
                                AI Verified
                            </span>
                        )}
                    </span>
                ) : (
                    <span className='flex items-center gap-2 font-medium text-amber-600'>
                        <Info className='h-4 w-4' /> Pending
                    </span>
                )}
            </td>
            <td className='px-6 py-4'>
                <div className='flex items-center'>
                    {!doc?.path || doc.isUploading ? (
                        <label
                            className={cn(
                                'flex h-12 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all',
                                doc?.isUploading
                                    ? 'border-blue-400 bg-blue-50'
                                    : 'border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50'
                            )}>
                            <Upload className='h-5 w-5 text-gray-400' />
                            <span className='mt-1 text-[10px] text-gray-500'>Click to upload</span>
                            <input
                                id={id}
                                type='file'
                                className='hidden'
                                accept='image/*'
                                disabled={doc?.isUploading || isSubmitting}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        if (file.size > 5 * 1024 * 1024) {
                                            toast.error('File size must be less than 5MB');
                                            return;
                                        }
                                        onUpload(file);
                                        e.target.value = '';
                                    }
                                }}
                            />
                        </label>
                    ) : (
                        <div className='group relative h-12 w-20 overflow-hidden rounded border bg-white'>
                            <img src={doc.path} alt={label} className='h-full w-full object-cover' />
                            <div className='absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
                                <Button
                                    size='xs'
                                    variant='ghost'
                                    className='h-6 w-6 p-0 text-white'
                                    onClick={() => window.open(doc.path, '_blank')}>
                                    <Eye className='h-3 w-3' />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </td>
            <td className='px-6 py-4 text-right'>
                {doc?.path && (
                    <Button
                        type='button'
                        variant='destructive'
                        size='sm'
                        className='h-8 w-8 p-0'
                        onClick={onDelete}
                        disabled={isSubmitting}
                        title='Delete'>
                        <Trash className='h-4 w-4' />
                    </Button>
                )}
            </td>
        </tr>
    );

    return (
        <div className='space-y-10'>
            <div className='space-y-4'>
                <h2 className='font-bold text-2xl text-gray-900'>Document Repository</h2>
                <div className='flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4'>
                    <Info className='mt-0.5 h-5 w-5 text-blue-600' />
                    <div className='text-blue-800 text-sm'>
                        <p className='font-semibold'>Self-Attestation Required</p>
                        <p>Please ensure all uploaded documents are self-attested by parents before scanning.</p>
                        <p className='mt-1 text-blue-600 text-xs italic'>Accepted formats: JPG, PNG, PDF (Max 5MB each)</p>
                    </div>
                </div>
            </div>

            {/* General Documents */}
            <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                    <h3 className='font-semibold text-gray-800 text-lg'>Required Documents</h3>
                </div>

                <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
                    <table className='w-full text-left'>
                        <thead>
                            <tr className='border-b bg-gray-50'>
                                <th className='px-6 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider'>Document Name</th>
                                <th className='px-6 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider'>Status</th>
                                <th className='px-6 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider'>File</th>
                                <th className='px-6 py-3 text-right font-bold text-gray-500 text-xs uppercase tracking-wider'>Action</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200'>
                            {masterDocuments.map((masterDoc: any) => {
                                const uploadedDoc = uploadedDocuments.find((d) => d.amsmD_Id === masterDoc.amsmD_Id);
                                return (
                                    <FileUploadRow
                                        key={masterDoc.amsmD_Id}
                                        label={masterDoc.amsmD_DocumentName}
                                        doc={uploadedDoc || null}
                                        onUpload={(file) => handleDocumentUpload(masterDoc.amsmD_Id, file, masterDoc.amsmD_DocumentName)}
                                        onDelete={() =>
                                            handleDocumentDelete(masterDoc.amsmD_Id, uploadedDoc?.path, masterDoc.amsmD_DocumentName)
                                        }
                                        id={`doc_${masterDoc.amsmD_Id}`}
                                    />
                                );
                            })}
                            {masterDocuments.length === 0 && (
                                <tr>
                                    <td colSpan={4} className='px-6 py-10 text-center text-gray-500'>
                                        No master documents found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mandatory/Specific Documents Table */}
            <div className='space-y-4'>
                <h3 className='font-semibold text-gray-800 text-lg'>Family Identification Documents</h3>
                <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
                    <table className='w-full text-left'>
                        <thead>
                            <tr className='border-b bg-gray-50'>
                                <th className='px-6 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider'>Document Name</th>
                                <th className='px-6 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider'>Status</th>
                                <th className='px-6 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider'>File</th>
                                <th className='px-6 py-3 text-right font-bold text-gray-500 text-xs uppercase tracking-wider'>Action</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200'>
                            <FileUploadRow
                                label='Father Photo'
                                doc={fatherPhoto}
                                onUpload={handleFatherPhotoUpload}
                                onDelete={handleFatherPhotoDelete}
                                id='father_photo_input'
                            />
                            <FileUploadRow
                                label='Father Signature'
                                doc={fatherSignature}
                                onUpload={handleFatherSignatureUpload}
                                onDelete={handleFatherSignatureDelete}
                                id='father_sig_input'
                            />
                            <FileUploadRow
                                label='Mother Photo'
                                doc={motherPhoto}
                                onUpload={handleMotherPhotoUpload}
                                onDelete={handleMotherPhotoDelete}
                                id='mother_photo_input'
                            />
                            <FileUploadRow
                                label='Mother Signature'
                                doc={motherSignature}
                                onUpload={handleMotherSignatureUpload}
                                onDelete={handleMotherSignatureDelete}
                                id='mother_sig_input'
                            />
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Facilities Selection */}
            <div className='rounded-2xl border border-gray-800 bg-gray-900 p-8 text-white'>
                <h3 className='mb-6 font-bold text-xl'>School Facilities</h3>
                <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                    <div className='group flex cursor-pointer items-start space-x-4 rounded-xl border border-gray-700 bg-gray-800/50 p-4 transition-colors hover:bg-gray-800'>
                        <Controller
                            name='hostelRequired'
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id='hostelRequired'
                                    checked={field.value || false}
                                    onCheckedChange={field.onChange}
                                    className='mt-1 border-gray-600 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600'
                                />
                            )}
                        />
                        <Label htmlFor='hostelRequired' className='flex-1 cursor-pointer'>
                            <span className='mb-1 block font-bold text-lg transition-colors group-hover:text-blue-400'>
                                Residential Facility (Hostel)
                            </span>
                            <span className='block text-gray-400 text-sm'>
                                Apply for school hostel accommodation for the upcoming academic year.
                            </span>
                        </Label>
                    </div>

                    <div className='group flex cursor-pointer items-start space-x-4 rounded-xl border border-gray-700 bg-gray-800/50 p-4 transition-colors hover:bg-gray-800'>
                        <Controller
                            name='transportRequired'
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id='transportRequired'
                                    checked={field.value || false}
                                    onCheckedChange={field.onChange}
                                    className='mt-1 border-gray-600 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600'
                                />
                            )}
                        />
                        <Label htmlFor='transportRequired' className='flex-1 cursor-pointer'>
                            <span className='mb-1 block font-bold text-lg transition-colors group-hover:text-blue-400'>
                                Transport Facility (School Bus)
                            </span>
                            <span className='block text-gray-400 text-sm'>
                                Opt for school bus services. Routes and stops will be allocated based on availability.
                            </span>
                        </Label>
                    </div>
                </div>
            </div>
        </div>
    );
}
