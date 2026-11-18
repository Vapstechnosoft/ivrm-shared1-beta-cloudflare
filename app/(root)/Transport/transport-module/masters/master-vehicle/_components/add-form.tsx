'use client';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useMasterFuelType, useMasterVehicle, useMasterVehicleType } from '@/hooks/transport/transportmodule/usemasters';
import { uploadDocument } from '@/server/document_upload';
import { saveMasterVehicle } from '@/server/transport/transport-module/masters/master-vehicle';

import type { IMasterVehicleDocument } from '@/types/transport/transport-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, Loader2, Minus, Plus, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
    TRMV_VehicleName: z
        .string()
        .min(1, 'Vehicle Name is required')
        .regex(/^[a-zA-Z0-9\s]+$/, 'Only Alphabets, Numbers and Spaces Allowed'),
    TRMFT_Id: z.coerce.number().min(1, 'Fuel Type is required'),
    TRMVT_Id: z.coerce.number().min(1, 'Vehicle Type is required'),
    TRMV_PurchaseDate: z.date({ required_error: 'Date of Purchase is required', invalid_type_error: 'Date of Purchase is required' }),
    TRMV_VehicleNo: z
        .string()
        .min(1, 'Vehicle No is required')
        .regex(/^[a-zA-Z0-9\-\s]+$/, 'Invalid Vehicle No Format'),
    TRMV_ChassisNo: z
        .string()
        .min(1, 'Chassis No is required')
        .regex(/^[a-zA-Z0-9]+$/, 'Only Alphanumeric Allowed')
        .max(16, 'Chassis No cannot exceed 16 characters'),
    TRMV_EngineNo: z
        .string()
        .min(1, 'Engine No is required')
        .regex(/^[a-zA-Z0-9]+$/, 'Only Alphanumeric Allowed'),
    TRMV_PurchasedFrom: z.string().min(1, 'Purchased From is required'),
    TRMV_Cost: z.coerce.number().min(1, 'Approximate Cost is required'),
    TRMV_Capacity: z.coerce.number().min(1, 'Capacity must be valid'),
    TRMV_Desc: z.string().min(1, 'Description is required'),
    TRMV_CompanyName: z.string().min(1, 'Company Name is required'),
    TRMV_RegistrationDate: z.date().optional(),
    TRMV_ManufacturedDate: z.date().optional(),
    TRMV_RegFCUpToDate: z.date().optional(),
    TRMV_SWDOff: z
        .string()
        .min(1, 'S/W/D Off is required')
        .regex(/^[a-zA-Z0-9\s]+$/, 'Only Alphabets, Numbers and Spaces Allowed'),
    TRMV_Address: z.string().min(1, 'Address is required'),
    TRMV_OwnersName: z.string().min(1, 'Owner Name is required'),

    // Additional Fields
    TRMV_Model: z.string().optional(),
    TRMV_Fuel: z.string().optional(),
    TRMV_Manufacturer: z.string().optional(),
    TRMV_Class: z.string().optional(),
    TRMV_Color: z.string().optional(),
    TRMV_Body: z.string().optional(),
    TRMV_NoOfCylinder: z.coerce.number().optional(),
    TRMV_WheelBase: z.string().optional(),
    TRMV_UnladenWeight: z.coerce.number().optional(),
    TRMV_CC: z.string().optional(),
    TRMV_TaxUpTo: z.string().optional(),

    // File Uploads
    TRMV_VehicleImage: z.string().optional(),
    vehicleDocuments: z.array(z.any()).optional()
});

export default function AddVehicleForm({ onClose }: { onClose: () => void }) {
    const { refetchAll } = useMasterVehicle();
    const { data: fuelTypes } = useMasterFuelType();
    const { data: vehicleTypes } = useMasterVehicleType();
    const [currentTab, setCurrentTab] = useState('start');

    // File Upload State
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [isViewing, setIsViewing] = useState(false);
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const fileInputRefs = useRef<Array<HTMLInputElement | null>>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
        defaultValues: {
            TRMV_PurchaseDate: undefined as unknown as Date,
            TRMV_VehicleName: '',
            TRMFT_Id: 0,
            TRMVT_Id: 0,
            TRMV_VehicleNo: '',
            TRMV_ChassisNo: '',
            TRMV_EngineNo: '',
            TRMV_PurchasedFrom: '',
            TRMV_Cost: 0,
            TRMV_Capacity: 0,
            TRMV_Desc: '',
            TRMV_CompanyName: '',
            TRMV_SWDOff: '',
            TRMV_Address: '',
            TRMV_OwnersName: '',
            TRMV_Model: '',
            TRMV_Fuel: '',
            TRMV_Manufacturer: '',
            TRMV_Class: '',
            TRMV_Color: '',
            TRMV_Body: '',
            TRMV_NoOfCylinder: 0,
            TRMV_WheelBase: '',
            TRMV_UnladenWeight: 0,
            TRMV_CC: '',
            TRMV_TaxUpTo: '',
            vehicleDocuments: [{ cfilepath: '', cfilename: '', cfiledesc: '', isUploading: false }]
        }
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const {
        fields: fileFields,
        append: appendFile,
        remove: removeFile,
        update: updateFile
    } = useFieldArray({
        control: form.control,
        name: 'vehicleDocuments'
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        updateFile(index, { ...fileFields[index], isUploading: true, cfilename: file.name });

        const formData = new FormData();
        formData.append('File', file);

        try {
            const uploadRes: any = await uploadDocument(formData);

            console.log('response', uploadRes);
            let path = '';
            if (uploadRes?.success && typeof uploadRes.data === 'string') {
                path = uploadRes.data;
            } else if (uploadRes?.success && Array.isArray(uploadRes.data) && uploadRes.data.length > 0) {
                path = uploadRes.data[0].path || uploadRes.data[0];
            } else if (typeof uploadRes === 'string') {
                path = uploadRes;
            } else if (uploadRes?.path) {
                path = uploadRes.path as string;
            } else if (Array.isArray(uploadRes) && uploadRes.length > 0 && uploadRes[0].path) {
                path = uploadRes[0].path;
            }

            if (path) {
                updateFile(index, { ...fileFields[index], isUploading: false, cfilename: file.name, cfilepath: path });
            } else {
                updateFile(index, { ...fileFields[index], isUploading: false });
                toast.error('Failed to get file path');
            }
        } catch (error) {
            updateFile(index, { ...fileFields[index], isUploading: false });
            toast.error('Failed to upload file');
        }
    };

    const handleViewImage = (url: string) => {
        setViewingImage(url);
        setIsViewing(true);
    };

    // Fields that live on the START tab — must all be valid before proceeding
    const startTabFields: (keyof z.infer<typeof formSchema>)[] = [
        'TRMV_VehicleName',
        'TRMFT_Id',
        'TRMVT_Id',
        'TRMV_PurchaseDate',
        'TRMV_VehicleNo',
        'TRMV_ChassisNo',
        'TRMV_EngineNo',
        'TRMV_PurchasedFrom',
        'TRMV_Capacity',
        'TRMV_Cost',
        'TRMV_CompanyName',
        'TRMV_SWDOff',
        'TRMV_OwnersName',
        'TRMV_Desc',
        'TRMV_Address'
    ];

    const handleNext = async () => {
        const isValid = await form.trigger(startTabFields);
        if (isValid) {
            setCurrentTab('end');
        }
    };

    // Also gate direct tab-click navigation to END
    const handleTabChange = async (value: string) => {
        if (value === 'end') {
            const isValid = await form.trigger(startTabFields);
            if (!isValid) return; // block the switch; errors are already shown
        }
        setCurrentTab(value);
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            let vehicleImagePath = '';

            // 1. Upload Image
            if (selectedImage) {
                const formData = new FormData();
                formData.append('File', selectedImage);
                const uploadRes: any = await uploadDocument(formData);
                if (uploadRes?.success && typeof uploadRes.data === 'string') {
                    vehicleImagePath = uploadRes.data;
                } else if (uploadRes?.success && Array.isArray(uploadRes.data) && uploadRes.data.length > 0) {
                    vehicleImagePath = uploadRes.data[0].path || uploadRes.data[0];
                } else if (typeof uploadRes === 'string') {
                    vehicleImagePath = uploadRes;
                } else if (uploadRes?.path) {
                    vehicleImagePath = uploadRes.path as string;
                } else if (Array.isArray(uploadRes) && uploadRes.length > 0 && uploadRes[0].path) {
                    vehicleImagePath = uploadRes[0].path;
                }
            }

            // 2. Upload Documents
            const uploadedDocs: IMasterVehicleDocument[] = (values.vehicleDocuments || [])
                .filter((doc) => doc.cfilepath)
                .map((doc) => ({
                    cfilename: doc.cfilename || '',
                    cfiledesc: doc.cfiledesc || doc.cfilename || '',
                    cfilepath: doc.cfilepath as string
                }));

            const payload = {
                ...values,
                TRMV_Id: 0,
                TRMV_PurchaseDate: values.TRMV_PurchaseDate ? values.TRMV_PurchaseDate.toISOString() : undefined,
                TRMV_RegistrationDate: values.TRMV_RegistrationDate ? values.TRMV_RegistrationDate.toISOString() : undefined,
                TRMV_ManufacturedDate: values.TRMV_ManufacturedDate ? values.TRMV_ManufacturedDate.toISOString() : undefined,
                TRMV_RegFCUpToDate: values.TRMV_RegFCUpToDate ? values.TRMV_RegFCUpToDate.toISOString() : undefined,
                TRMV_VehicleImage: vehicleImagePath,
                vehicleDocuments: uploadedDocs
            };
            console.log('pay vehicle', payload);
            const response = await saveMasterVehicle(payload);

            if (response.message === 'Add') {
                if (response.retrunval === true) {
                    toast.success('Record Saved Successfully');
                    refetchAll();
                    onClose();
                } else {
                    toast.error('Failed To Saved Record');
                }
            } else if (response.message === 'Duplicate') {
                toast.error('Record Already Exists');
            } else {
                toast.error('Something went wrong');
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <Tabs value={currentTab} onValueChange={handleTabChange} className='w-full'>
                    <TabsList className='flex w-full gap-1 rounded-lg border border-border bg-muted p-1'>
                        <TabsTrigger
                            value='start'
                            className='flex-1 rounded-md px-6 py-2 font-semibold text-sm transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground data-[state=active]:shadow-md data-[state=inactive]:hover:bg-accent data-[state=inactive]:hover:text-accent-foreground'>
                            START
                        </TabsTrigger>
                        <TabsTrigger
                            value='end'
                            className='flex-1 rounded-md px-6 py-2 font-semibold text-sm transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground data-[state=active]:shadow-md data-[state=inactive]:hover:bg-accent data-[state=inactive]:hover:text-accent-foreground'>
                            END
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value='start' className='space-y-4 pt-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <FormField
                                control={form.control}
                                name='TRMV_VehicleName'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Vehicle Name <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Enter Vehicle Name' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMFT_Id'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Fuel Type <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Fuel Type' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {fuelTypes?.data?.map((fuel: any) => (
                                                    <SelectItem key={fuel.trmfT_Id} value={fuel.trmfT_Id.toString()}>
                                                        {fuel.trmfT_FuelType}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMVT_Id'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Vehicle Type <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Vehicle Type' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {vehicleTypes?.data?.map((vc: any) => (
                                                    <SelectItem key={vc.trmvT_Id} value={vc.trmvT_Id.toString()}>
                                                        {vc.trmvT_VehicleType}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_PurchaseDate'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Date Of Purchase <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <DatePicker date={field.value} setDate={field.onChange} placeholder='Select Date' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_VehicleNo'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Vehicle No <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Enter Vehicle No' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_ChassisNo'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Chassis No <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Enter Chassis No' maxLength={16} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_EngineNo'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Engine No <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Enter Engine No' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_PurchasedFrom'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Purchased From <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Enter Purchased From' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_Capacity'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Seating <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type='number'
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                placeholder='Enter Capacity'
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_Cost'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Approximate Cost <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type='number'
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                placeholder='Enter Cost'
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_CompanyName'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Company Name <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Enter Company Name' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_SWDOff'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            S/W/D OFF <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Enter S/W/D OFF' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_OwnersName'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Owner Name <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Enter Owner Name' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_Desc'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Description <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder='Enter Description' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_Address'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Address <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder='Enter Address' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Image Upload in First Tab */}
                            <div className='col-span-1 space-y-2 md:col-span-2'>
                                <FormLabel>Vehicle Photo</FormLabel>
                                <div className='flex items-center gap-4'>
                                    <div className='relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border-2 border-gray-300 border-dashed bg-gray-50'>
                                        {imagePreview ? (
                                            <img src={imagePreview} alt='Preview' className='h-full w-full object-cover' />
                                        ) : (
                                            <Upload className='h-8 w-8 text-gray-400' />
                                        )}
                                        <Input
                                            type='file'
                                            accept='image/*'
                                            className='absolute inset-0 cursor-pointer opacity-0'
                                            onChange={handleImageChange}
                                            id='vehicle-image-input'
                                        />
                                    </div>
                                    <div className='flex-1'>
                                        <p className='mb-2 text-gray-500 text-sm'>Upload vehicle photo (JPG, PNG). Max 2MB.</p>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            size='sm'
                                            onClick={() => document.getElementById('vehicle-image-input')?.click()}>
                                            Select Image
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='mt-4 flex justify-end'>
                            <Button type='button' onClick={handleNext} className='bg-primary text-white'>
                                Next
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value='end' className='space-y-4 pt-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <FormField
                                control={form.control}
                                name='TRMV_Model'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Model Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Enter Model Name' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_RegistrationDate'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Registration Date</FormLabel>
                                        <DatePicker date={field.value} setDate={field.onChange} placeholder='Select Date' />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_Manufacturer'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Manufacturer Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Enter Manufacturer Name' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_ManufacturedDate'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Manufactured Date</FormLabel>
                                        <DatePicker date={field.value} setDate={field.onChange} placeholder='Select Date' />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_Fuel'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fuel</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Enter Fuel' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_Class'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Class</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Enter Class' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_Color'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Colour</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Enter Colour' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_Body'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Body</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Enter Body' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_NoOfCylinder'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>No Of Cylinder</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='number'
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                placeholder='Enter No Of Cylinder'
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_WheelBase'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Wheel Base</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Enter Wheel Base' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_UnladenWeight'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unladen Weight</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='number'
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                placeholder='Enter Unladen Weight'
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_CC'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>STDG/SLPRCC</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Enter STDG/SLPRCC' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_TaxUpTo'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tax UpTo</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder='Enter Tax UpTo' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='TRMV_RegFCUpToDate'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>REG/FC UpTo</FormLabel>
                                        <DatePicker date={field.value} setDate={field.onChange} placeholder='Select Date' />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Documents Section in End Tab */}
                        <div className='mt-6 border-t pt-4'>
                            <h3 className='mb-4 font-semibold text-lg'>Transport Documents</h3>
                            <div className='overflow-x-auto'>
                                <table className='w-full table-auto border-collapse border text-left text-sm'>
                                    <thead className='bg-muted'>
                                        <tr>
                                            <th className='w-12 border p-2 text-center'>SL. NO</th>
                                            <th className='border p-2 text-center'>Description</th>
                                            <th className='border p-2 text-center'>Upload File</th>
                                            <th className='border p-2 text-center'>File Name</th>
                                            <th className='w-16 border p-2 text-center'>View</th>
                                            <th className='w-16 border p-2 text-center'>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fileFields.map((item, index) => (
                                            <tr key={item.id} className='border-b'>
                                                <td className='border p-2 text-center'>{index + 1}</td>
                                                <td className='border p-2'>
                                                    <Controller
                                                        control={form.control}
                                                        name={`vehicleDocuments.${index}.cfiledesc`}
                                                        render={({ field }) => (
                                                            <Input
                                                                {...field}
                                                                placeholder='e.g., Insurance Policy'
                                                                className='h-9 text-xs'
                                                                value={field.value || ''}
                                                            />
                                                        )}
                                                    />
                                                </td>
                                                <td className='border p-2'>
                                                    <div className='flex justify-center'>
                                                        <input
                                                            ref={(el) => {
                                                                fileInputRefs.current[index] = el;
                                                            }}
                                                            type='file'
                                                            accept='image/*'
                                                            className='hidden'
                                                            onChange={(e) => handleFileUpload(e, index)}
                                                        />
                                                        <Button
                                                            type='button'
                                                            variant='outline'
                                                            size='sm'
                                                            onClick={() => fileInputRefs.current[index]?.click()}
                                                            className='h-8'
                                                            disabled={(item as any).isUploading}>
                                                            {(item as any).isUploading ? (
                                                                <>
                                                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                                    Uploading...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Upload className='mr-2 h-4 w-4' />
                                                                    Choose File
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </td>
                                                <td className='border p-2'>
                                                    <Controller
                                                        control={form.control}
                                                        name={`vehicleDocuments.${index}.cfilename`}
                                                        render={({ field }) => (
                                                            <Input
                                                                {...field}
                                                                readOnly
                                                                disabled
                                                                placeholder='No file chosen'
                                                                className='h-9 bg-muted text-xs'
                                                                value={field.value || ''}
                                                            />
                                                        )}
                                                    />
                                                </td>
                                                <td className='border p-2 text-center'>
                                                    <Controller
                                                        control={form.control}
                                                        name={`vehicleDocuments.${index}.cfilepath`}
                                                        render={({ field }) => (
                                                            <Button
                                                                type='button'
                                                                variant='ghost'
                                                                size='sm'
                                                                onClick={() => handleViewImage(field.value || '')}
                                                                disabled={!field.value || (item as any).isUploading}
                                                                className={!field.value ? 'cursor-not-allowed opacity-50' : ''}>
                                                                {(item as any).isUploading ? (
                                                                    <Loader2 className='h-4 w-4 animate-spin text-gray-400' />
                                                                ) : (
                                                                    <Eye className='h-4 w-4 text-blue-600' />
                                                                )}
                                                            </Button>
                                                        )}
                                                    />
                                                </td>
                                                <td className='border p-2 text-center'>
                                                    <div className='flex justify-center gap-1'>
                                                        {fileFields.length > 1 && (
                                                            <Button
                                                                type='button'
                                                                size='icon'
                                                                variant='destructive'
                                                                className='h-8 w-8'
                                                                onClick={() => removeFile(index)}
                                                                disabled={(item as any).isUploading}>
                                                                <Minus className='h-4 w-4' />
                                                            </Button>
                                                        )}
                                                        {index === fileFields.length - 1 && (
                                                            <Button
                                                                type='button'
                                                                size='icon'
                                                                variant='outline'
                                                                className='h-8 w-8'
                                                                onClick={() =>
                                                                    appendFile({
                                                                        cfilepath: '',
                                                                        cfilename: '',
                                                                        cfiledesc: '',
                                                                        isUploading: false
                                                                    })
                                                                }>
                                                                <Plus className='h-4 w-4' />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {isViewing && viewingImage && (
                                    <div
                                        onClick={() => {
                                            setIsViewing(false);
                                            setViewingImage(null);
                                        }}
                                        className='fixed inset-0 z-50 flex items-center justify-center bg-black/80'>
                                        <img src={viewingImage} alt='preview' className='max-h-[90%] max-w-[90%] rounded-lg shadow-lg' />
                                        <Button
                                            onClick={() => {
                                                setIsViewing(false);
                                                setViewingImage(null);
                                            }}
                                            className='absolute top-4 right-4'
                                            variant='destructive'
                                            size='icon'>
                                            <X className='h-4 w-4' />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='mt-4 flex justify-between gap-2'>
                            <Button type='button' variant='outline' onClick={() => setCurrentTab('start')}>
                                Previous
                            </Button>
                            <div className='flex gap-2'>
                                <Button type='button' variant='outline' onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button type='submit'>Save</Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </form>
        </Form>
    );
}
