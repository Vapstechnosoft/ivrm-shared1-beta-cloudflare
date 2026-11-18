import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { uploadDocument } from '@/server/document_upload';
import type { BookRegisterPayload } from '@/types/library/masters/bookRegister';
import { Eye, Minus, Plus, Trash, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

export default function TabAuthorDetails({
    dropdownData,
    onSave,
    onPrevious,
    onCancel,
    onClear,
    isSaving
}: {
    dropdownData: any;
    onSave: () => void;
    onPrevious: () => void;
    onCancel: () => void;
    onClear: () => void;
    isSaving?: boolean;
}) {
    const {
        control,
        register,
        setValue,
        formState: { errors }
    } = useFormContext<BookRegisterPayload>();

    const lmAU_Id = useWatch({ control, name: 'lmAU_Id' });
    const [isMasterAuthor, setIsMasterAuthor] = useState(false);

    useEffect(() => {
        if (lmAU_Id) {
            setIsMasterAuthor(true);
        }
    }, [lmAU_Id]);

    const {
        fields: accessionFields,
        append: appendAccession,
        remove: removeAccession
    } = useFieldArray({
        control,
        name: 'accessionList'
    });

    const {
        fields: uploadFields,
        append: appendUpload,
        remove: removeUpload
    } = useFieldArray({
        control,
        name: 'attachementList'
    });

    useEffect(() => {
        if (uploadFields.length === 0) {
            appendUpload({ lmbA_FileName: '', lmbA_FilePath: '' });
        }
    }, [uploadFields, appendUpload]);

    const [numCopies, setNumCopies] = useState<string>('');

    const handleAddCopies = () => {
        const count = Number.parseInt(numCopies);
        if (isNaN(count) || count <= 0) return;

        for (let i = 0; i < count; i++) {
            appendAccession({ lmbanO_No: '', lmbanO_AvialableStatus: 'Available' });
        }
        setNumCopies('');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!allowedTypes.includes(file.type)) {
            toast.error('File Must Be Upload jpeg,Png,pdf, Document');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should be less than 5 MB');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('SubContainerName', 'library_book_attachments');

            const response = await uploadDocument(formData);
            if (response.success && response.data) {
                setValue(`attachementList.${index}.lmbA_FilePath`, response.data);
                setValue(`attachementList.${index}.lmbA_FileName`, file.name);
                toast.success('File uploaded successfully');
            } else {
                toast.error(response.message || 'Upload failed');
            }
        } catch (error: any) {
            toast.error('An error occurred during upload');
        } finally {
            e.target.value = '';
        }
    };

    const rawData = dropdownData?.data || dropdownData;
    const rackList = rawData?.racklist || rawData?.rackList || dropdownData?.racklist || dropdownData?.rackList || [];
    const accessoriesList = rawData?.accessorieslist || rawData?.accessoriesList || dropdownData?.accessorieslist || dropdownData?.accessoriesList || [];
    const authorList = rawData?.authorlist || rawData?.authorList || dropdownData?.authorlist || dropdownData?.authorList || [];

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex flex-col gap-6 lg:flex-row'>
                {/* AUTHOR ENTRY & PRICE DETAILS */}
                <div className='flex-1 space-y-4 rounded-md border p-4'>
                    <h3 className='border-b pb-2 font-bold text-blue-800 uppercase tracking-wide'>Author Entry & Price Details</h3>

                    <div className='flex items-center space-x-2'>
                        <Checkbox
                            id='master-author'
                            checked={isMasterAuthor}
                            onCheckedChange={(checked) => {
                                setIsMasterAuthor(checked as boolean);
                                if (!checked) {
                                    setValue('lmAU_Id', undefined);
                                } else {
                                    setValue('lmB_AuthorFirstName', '');
                                    setValue('lmB_AuthorMiddleName', '');
                                    setValue('lmB_AuthorLastName', '');
                                }
                            }}
                        />
                        <Label htmlFor='master-author'>Master Author</Label>
                    </div>

                    <div className='grid grid-cols-1 gap-4'>
                        {isMasterAuthor ? (
                            <div className='flex flex-col gap-1.5'>
                                <Label>
                                    Author Name <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='lmAU_Id'
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(val) => {
                                                const id = Number(val);
                                                field.onChange(id);
                                                const selectedAuthor = authorList.find((item: any) => {
                                                    const itemId =
                                                        item.lmaU_Id ||
                                                        item.lmau_Id ||
                                                        item.LMAU_Id ||
                                                        item.lmA_Id ||
                                                        item.lma_Id ||
                                                        item.LMA_Id ||
                                                        item.id ||
                                                        item.value;
                                                    return itemId === id;
                                                });
                                                if (selectedAuthor) {
                                                    const fName =
                                                        selectedAuthor.lmaU_AuthorFirstName ||
                                                        selectedAuthor.lmau_AuthorFirstName ||
                                                        selectedAuthor.LMAU_AuthorFirstName ||
                                                        selectedAuthor.lmA_AuthorFirstName ||
                                                        selectedAuthor.lma_AuthorFirstName ||
                                                        '';
                                                    const mName =
                                                        selectedAuthor.lmA_AuthorMiddleName || selectedAuthor.lma_AuthorMiddleName || '';
                                                    const lName =
                                                        selectedAuthor.lmA_AuthorLastName || selectedAuthor.lma_AuthorLastName || '';
                                                    setValue('lmB_AuthorFirstName', fName);
                                                    setValue('lmB_AuthorMiddleName', mName);
                                                    setValue('lmB_AuthorLastName', lName);
                                                }
                                            }}
                                            value={field.value ? field.value.toString() : undefined}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='--Select Author--' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {authorList.map((item: any, idx: number) => {
                                                    const authorId =
                                                        item.lmaU_Id ??
                                                        item.lmau_Id ??
                                                        item.LMAU_Id ??
                                                        item.lmA_Id ??
                                                        item.lma_Id ??
                                                        item.LMA_Id ??
                                                        item.authorId ??
                                                        item.id ??
                                                        item.value;
                                                    const authorName =
                                                        item.lmaU_AuthorFirstName ||
                                                        item.lmau_AuthorFirstName ||
                                                        item.LMAU_AuthorFirstName ||
                                                        item.lmA_AuthorFirstName ||
                                                        item.lma_AuthorFirstName ||
                                                        item.authorName ||
                                                        item.name ||
                                                        item.label ||
                                                        String(authorId);
                                                    const middleName = item.lmA_AuthorMiddleName || item.lma_AuthorMiddleName || item.lmaU_AuthorMiddleName || '';
                                                    const lastName = item.lmA_AuthorLastName || item.lma_AuthorLastName || item.lmaU_AuthorLastName || '';
                                                    const fullName = [authorName, middleName, lastName].filter(Boolean).join(' ');
                                                    if (authorId === undefined || authorId === null) return null;
                                                    return (
                                                        <SelectItem key={`${authorId}-${idx}`} value={authorId.toString()}>
                                                            {fullName || authorName}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        ) : (
                            <>
                                <InputText label='First Name' required {...register('lmB_AuthorFirstName')} />
                                <InputText label='Middle Name' {...register('lmB_AuthorMiddleName')} />
                                <InputText label='Last Name' {...register('lmB_AuthorLastName')} />
                            </>
                        )}

                        <div className='flex flex-col gap-1.5'>
                            <Label>
                                Book Status <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='lmbanO_AvialableStatus'
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select Status--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Available'>Available</SelectItem>
                                            <SelectItem value='Lost'>Lost</SelectItem>
                                            <SelectItem value='Issued'>Issued</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className='flex flex-col gap-1.5'>
                            <Label>
                                Rack name <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='lmrA_Id'
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? field.value.toString() : undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--select field--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rackList.map((item: any, idx: number) => {
                                                const rackId = item.lmrA_Id ?? item.lmra_Id ?? item.LMRA_Id ?? item.rackId ?? item.id ?? item.value;
                                                const rackName =
                                                    item.lmrA_RackName || item.lmra_RackName || item.LMRA_RackName || item.rackName || item.name || String(rackId);
                                                if (rackId === undefined || rackId === null) return null;
                                                return (
                                                    <SelectItem key={`${rackId}-${idx}`} value={rackId.toString()}>
                                                        {rackName}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <InputText label='Price/copy' type='number' {...register('lmB_Price')} />

                        <div className='flex flex-col gap-1.5'>
                            <Label>Discount Type</Label>
                            <Controller
                                control={control}
                                name='mB_Disc_Type'
                                render={({ field }) => (
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className='flex gap-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Rs' id='d-rs' />
                                            <Label htmlFor='d-rs'>Rs</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='percentage' id='d-perc' />
                                            <Label htmlFor='d-perc'>% age</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        <InputText label='Discount(Amt)' type='number' {...register('mB_Discount')} />
                        <InputText label='Total Price' type='number' {...register('lmB_NetPrice')} readOnly className='bg-gray-50' />
                    </div>
                </div>

                {/* ACCESSORIES DETAILS & ACCESSION */}
                <div className='flex-1 space-y-6'>
                    <div className='space-y-4 rounded-md border p-4'>
                        <h3 className='border-b pb-2 font-bold text-blue-800 uppercase tracking-wide'>Accessories Details</h3>
                        <div className='flex flex-col gap-1.5'>
                            <Label>Accessories</Label>
                            <Controller
                                control={control}
                                name='lmaC_Id'
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? field.value.toString() : undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accessoriesList.map((item: any, idx: number) => {
                                                const accId = item.lmaC_Id ?? item.lmac_Id ?? item.LMAC_Id ?? item.accessoryId ?? item.id ?? item.value;
                                                const accName =
                                                    item.lmaC_AccessoriesName ||
                                                    item.lmac_AccessoriesName ||
                                                    item.LMAC_AccessoriesName ||
                                                    item.accessoriesName ||
                                                    item.name ||
                                                    item.label ||
                                                    String(accId);
                                                if (accId === undefined || accId === null) return null;
                                                return (
                                                    <SelectItem key={`${accId}-${idx}`} value={accId.toString()}>
                                                        {accName}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className='flex items-center space-x-2'>
                            <Controller
                                control={control}
                                name='with_Accessories'
                                render={({ field }) => <Checkbox id='with-acc' checked={field.value} onCheckedChange={field.onChange} />}
                            />
                            <Label htmlFor='with-acc'>With Accessories</Label>
                        </div>
                    </div>

                    <div className='space-y-4 rounded-md border p-4'>
                        <h3 className='border-b pb-2 text-center font-bold text-blue-800 uppercase tracking-wide'>Accession</h3>
                        <div className='flex items-end gap-2'>
                            <div className='flex-1'>
                                <Label>
                                    No. Of Copies <span className='text-red-500'>*</span>
                                </Label>
                                <InputText
                                    value={numCopies}
                                    onChange={(e) => setNumCopies(e.target.value)}
                                    placeholder='Enter No. Of Copies'
                                />
                            </div>
                            <Button type='button' onClick={handleAddCopies} className='bg-orange-500 px-6 hover:bg-orange-600'>
                                OK
                            </Button>
                        </div>

                        <div className='max-h-[200px] overflow-auto rounded-md border'>
                            <Table>
                                <TableHeader className='bg-blue-600'>
                                    <TableRow>
                                        <TableHead className='text-white'>SL No</TableHead>
                                        <TableHead className='text-white'>Accession No</TableHead>
                                        <TableHead className='w-10 text-white'></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {accessionFields.map((field, index) => (
                                        <TableRow key={field.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                <InputText {...register(`accessionList.${index}.lmbanO_No` as const)} className='h-8' />
                                            </TableCell>
                                            <TableCell>
                                                <Button type='button' variant='ghost' size='icon' onClick={() => removeAccession(index)}>
                                                    <Trash className='h-4 w-4 text-destructive' />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Section */}
            <div className='rounded-md border p-4'>
                <div className='mb-2 text-red-500 text-xs italic'>
                    * File Must Be Upload jpeg,Png,pdf, Document
                    <br />* File size should be less than 5 MB
                </div>
                <div className='max-h-[250px] overflow-auto rounded-md border'>
                    <Table>
                        <TableHeader className='sticky top-0 z-10 bg-blue-600'>
                            <TableRow>
                                <TableHead className='w-16 text-center text-white'>SL.No.</TableHead>
                                <TableHead className='text-white'>Upload</TableHead>
                                <TableHead className='w-20 text-center text-white'>View</TableHead>
                                <TableHead className='w-24 text-center text-white'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {uploadFields.map((field, index) => (
                                <UploadRow
                                    key={field.id}
                                    index={index}
                                    onUpload={(e) => handleFileUpload(e, index)}
                                    onAdd={() => appendUpload({ lmbA_FileName: '', lmbA_FilePath: '' })}
                                    onRemove={() => removeUpload(index)}
                                    isLast={index === uploadFields.length - 1}
                                    showRemove={uploadFields.length > 1 || index > 0}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-center gap-2 border-t pt-4'>
                <Button
                    type='button'
                    variant='default'
                    onClick={onPrevious}
                    className='bg-blue-600 px-6 font-bold text-xs uppercase hover:bg-blue-700'>
                    Previous
                </Button>
                <Button
                    type='button'
                    variant='destructive'
                    onClick={onClear}
                    className='bg-red-500 px-6 font-bold text-xs uppercase hover:bg-red-600'>
                    Clear
                </Button>
                <Button
                    type='button'
                    variant='warning'
                    onClick={onCancel}
                    className='bg-orange-500 px-6 font-bold text-xs uppercase hover:bg-orange-600'>
                    Cancel
                </Button>
                <Button
                    type='button'
                    variant='default'
                    onClick={onSave}
                    isLoading={isSaving}
                    disabled={isSaving}
                    className='bg-blue-800 px-6 font-bold text-xs uppercase hover:bg-blue-900'>
                    Save
                </Button>
            </div>
        </div>
    );
}

function UploadRow({
    index,
    onUpload,
    onAdd,
    onRemove,
    isLast,
    showRemove
}: {
    index: number;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAdd: () => void;
    onRemove: () => void;
    isLast: boolean;
    showRemove: boolean;
}) {
    const { control } = useFormContext<BookRegisterPayload>();
    const fileName = useWatch({ control, name: `attachementList.${index}.lmbA_FileName` });
    const filePath = useWatch({ control, name: `attachementList.${index}.lmbA_FilePath` });

    return (
        <TableRow>
            <TableCell className='text-center'>{index + 1}</TableCell>
            <TableCell>
                <div className='relative flex justify-center'>
                    <input
                        id={`file-upload-${index}`}
                        type='file'
                        className='hidden'
                        onChange={onUpload}
                        accept='.jpg,.jpeg,.png,.pdf,.doc,.docx'
                    />
                    <Button
                        type='button'
                        onClick={() => document.getElementById(`file-upload-${index}`)?.click()}
                        className='flex h-8 w-44 items-center justify-center gap-1 border border-gray-400 bg-yellow-400 px-2 font-bold text-[11px] text-black shadow-sm transition-all hover:bg-yellow-500'>
                        <Upload className='h-3.5 w-3.5 text-blue-700' />
                        <span className='truncate'>{fileName || 'Choose File'}</span>
                    </Button>
                </div>
            </TableCell>
            <TableCell className='text-center'>
                {filePath ? (
                    <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-blue-600'
                        onClick={() => window.open(filePath, '_blank')}>
                        <Eye className='h-4 w-4' />
                    </Button>
                ) : (
                    '-'
                )}
            </TableCell>
            <TableCell>
                <div className='flex items-center justify-center gap-1'>
                    {isLast && (
                        <Button type='button' variant='ghost' size='icon' className='h-8 w-8 text-blue-600' onClick={onAdd}>
                            <Plus className='h-4 w-4' />
                        </Button>
                    )}
                    {showRemove && (
                        <Button type='button' variant='ghost' size='icon' className='h-8 w-8 text-red-500' onClick={onRemove}>
                            <Minus className='h-4 w-4' />
                        </Button>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
}
