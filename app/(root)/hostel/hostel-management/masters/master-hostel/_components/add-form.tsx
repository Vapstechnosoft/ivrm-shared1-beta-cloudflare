'use client';

import { Button } from '@/components/ui/button';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { FormInput } from '@/components/ui/form/form-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMasterHostel } from '@/hooks/hostel/useMasterHostel';
import { type IMasterHostelForm, masterHostelSchema } from '@/schemas/hostel/master-hostel.schema';
import {
    type ICountry,
    type IEmployee,
    type IFacility,
    type IMess,
    type IState,
    getStates,
    saveHostel
} from '@/server/hostel/hostel-management/masters/hostel';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface AddMasterHostelFormProps {
    onSuccess: () => void;
    countries: ICountry[];
    facilities: IFacility[];
    messes: IMess[];
    employees: IEmployee[];
    initialData?: any;
}

export default function AddMasterHostelForm({
    onSuccess,
    countries,
    facilities,
    messes,
    employees,
    initialData
}: AddMasterHostelFormProps) {
    const { refetchAll } = useMasterHostel();
    const [states, setStates] = useState<IState[]>([]);

    const methods = useForm<IMasterHostelForm>({
        resolver: zodResolver(masterHostelSchema),
        defaultValues: {
            hlmH_Name: '',
            hlmH_ContactNo: '',
            hlmH_TotalCapacity: '',
            hlmH_BoysGirlsFlg: 'Boys',
            hlmH_Address: '',
            ivrmmC_Id: undefined,
            ivrmmS_Id: undefined,
            hlmH_City: '',
            hlmH_Pincode: '',
            hlmH_TotalFloor: '',
            hlmH_TotalRoom: '',
            hlmH_Desc: '',
            hlmhW_WardenType: '',
            selectedFacilityIds: [],
            selectedWardenIds: [],
            selectedMessIds: [],
            hostelPhotos: [],
            hlmH_ActiveFlag: true,
            ...initialData
        },
        mode: 'onChange'
    });

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = methods;

    const selectedCountryId = watch('ivrmmC_Id');
    const hostelPhotos = watch('hostelPhotos') || [];

    useEffect(() => {
        if (initialData) {
            setValue('selectedFacilityIds', initialData?.selectedFacilityIds || []);
            setValue('selectedWardenIds', initialData?.selectedWardenIds || []);
            setValue('selectedMessIds', initialData?.selectedMessIds || []);
        }
    }, [initialData, setValue]);

    // Fetch states when country changes - FIXED VERSION
    useEffect(() => {
        const fetchStates = async () => {
            if (selectedCountryId) {
                try {
                    console.log('Selected Country ID:', selectedCountryId, 'Type:', typeof selectedCountryId);
                    const countryIdNumber = Number(selectedCountryId);
                    console.log('Calling getStates with:', countryIdNumber);

                    const result = await getStates(countryIdNumber);
                    console.log('getStates result:', result);

                    if (result.success && result.data) {
                        console.log('States loaded:', result.data);
                        setStates(result.data);
                        // Reset state field when country changes
                        setValue('ivrmmS_Id', undefined);
                    } else {
                        console.log('No states data or unsuccessful response');
                        setStates([]);
                        setValue('ivrmmS_Id', undefined);
                    }
                } catch (err) {
                    console.error('Failed to fetch states:', err);
                    setStates([]);
                    setValue('ivrmmS_Id', undefined);
                    toast.error('Failed to load states');
                }
            } else {
                console.log('No country selected, clearing states');
                setStates([]);
                setValue('ivrmmS_Id', undefined);
            }
        };

        fetchStates();
    }, [selectedCountryId, setValue]);

    // Pre-load states if editing
    useEffect(() => {
        if (initialData?.ivrmmC_Id) {
            getStates(Number(initialData.ivrmmC_Id))
                .then((res) => {
                    if (res.success && res.data) {
                        setStates(res.data);
                        // If editing and state is set, keep it
                        if (initialData.ivrmmS_Id) {
                            setValue('ivrmmS_Id', initialData.ivrmmS_Id);
                        }
                    }
                })
                .catch((err) => {
                    console.error('Failed to pre-load states:', err);
                    toast.error('Failed to load states');
                });
        }
    }, [initialData, setValue]);

    const onSubmit = async (data: IMasterHostelForm) => {
        try {
            const formData = {
                ...data,
                hlmH_Id: initialData?.hlmH_Id,
                ivrmmC_Id: Number(data.ivrmmC_Id),
                ivrmmS_Id: Number(data.ivrmmS_Id),
                hlmH_TotalCapacity: Number(data.hlmH_TotalCapacity),
                hlmH_Pincode: Number(data.hlmH_Pincode),
                hlmH_TotalFloor: Number(data.hlmH_TotalFloor),
                hlmH_TotalRoom: Number(data.hlmH_TotalRoom)
            };
            const result = await saveHostel(formData);
            if (result.success) {
                toast.success(result.message);
                refetchAll();
                onSuccess();
                if (!initialData) reset();
            } else {
                toast.error(result.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save hostel');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const newDoc = {
                hlmhP_FileName: file.name,
                hlmhP_FilePath: URL.createObjectURL(file),
                filetype: file.name.split('.').pop()
            };
            setValue('hostelPhotos', [...hostelPhotos, newDoc]);
            e.target.value = '';
        }
    };

    const removeDocument = (index: number) => {
        const newDocs = [...hostelPhotos];
        newDocs.splice(index, 1);
        setValue('hostelPhotos', newDocs);
    };

    return (
        <div className='flex w-full flex-col gap-6'>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-md' noValidate>
                    <div className='flex flex-col gap-6 md:flex-row'>
                        {/* Left Column */}
                        <div className='flex flex-1 flex-col gap-4'>
                            <FormInput control={control} name='hlmH_Name' label='Hostel Name' required placeholder='Enter Hostel Name' />

                            <FormInput
                                control={control}
                                name='hlmH_ContactNo'
                                label='Contact No.'
                                required
                                maxLength={10}
                                placeholder='Enter Contact No'
                            />

                            <FormInput
                                control={control}
                                name='hlmH_TotalCapacity'
                                label='Total Capacity'
                                required
                                maxLength={5}
                                placeholder='Enter Total Capacity'
                            />

                            <Controller
                                control={control}
                                name='selectedFacilityIds'
                                render={({ field }) => (
                                    <CustomMultiSelectBox
                                        label='Facility'
                                        isRequired
                                        options={facilities.map((f) => ({ label: f.hlmftY_FacilityName, value: f.hlmftY_Id.toString() }))}
                                        value={field.value?.map(String) || []}
                                        onChange={(vals) => field.onChange(vals.map(Number))}
                                        error={errors.selectedFacilityIds?.message}
                                        isSearchRequired
                                    />
                                )}
                            />

                            <FormInput control={control} name='hlmhW_WardenType' label='Warden Type' placeholder='Enter Warden Type' />

                            <Controller
                                control={control}
                                name='selectedWardenIds'
                                render={({ field }) => (
                                    <CustomMultiSelectBox
                                        label='Warden'
                                        isRequired
                                        options={employees.map((e) => ({
                                            label: `${e.hrmE_EmployeeFullName} : ${e.hrmE_EmployeeCode}`,
                                            value: e.hrmE_Id.toString()
                                        }))}
                                        value={field.value?.map(String) || []}
                                        onChange={(vals) => field.onChange(vals.map(Number))}
                                        error={errors.selectedWardenIds?.message}
                                        isSearchRequired
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name='selectedMessIds'
                                render={({ field }) => (
                                    <CustomMultiSelectBox
                                        label='Mess'
                                        isRequired
                                        options={messes.map((m) => ({ label: m.hlmM_Name, value: m.hlmM_Id.toString() }))}
                                        value={field.value?.map(String) || []}
                                        onChange={(vals) => field.onChange(vals.map(Number))}
                                        error={errors.selectedMessIds?.message}
                                        isSearchRequired
                                    />
                                )}
                            />
                        </div>

                        {/* Right Column */}
                        <div className='flex flex-1 flex-col gap-4'>
                            <div>
                                <Label>
                                    Hostel Category <span className='text-red-500'>*</span>
                                </Label>
                                <div className='flex gap-4 rounded-md border p-2 pt-2'>
                                    <label className='flex cursor-pointer items-center gap-2'>
                                        <input type='radio' value='Boys' {...methods.register('hlmH_BoysGirlsFlg')} />
                                        <span>Boys</span>
                                    </label>
                                    <label className='flex cursor-pointer items-center gap-2'>
                                        <input type='radio' value='Girls' {...methods.register('hlmH_BoysGirlsFlg')} />
                                        <span>Girls</span>
                                    </label>
                                </div>
                                {errors.hlmH_BoysGirlsFlg && <FormError>{errors.hlmH_BoysGirlsFlg.message}</FormError>}
                            </div>

                            <div>
                                <Label>Address</Label>
                                <Controller
                                    control={control}
                                    name='hlmH_Address'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Textarea {...field} placeholder='Enter Address' />
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>

                            <div>
                                <Controller
                                    control={control}
                                    name='ivrmmC_Id'
                                    render={({ field, fieldState }) => (
                                        <div>
                                            <Label>
                                                Country <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select
                                                value={field.value ? String(field.value) : undefined}
                                                onValueChange={(val) => {
                                                    field.onChange(Number(val));
                                                    // Reset state when country changes
                                                    setValue('ivrmmS_Id', undefined);
                                                }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Country' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {countries.map((c) => (
                                                        <SelectItem key={c.ivrmmC_Id} value={c.ivrmmC_Id.toString()}>
                                                            {c.ivrmmC_CountryName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    )}
                                />
                            </div>

                            <div>
                                <Label>
                                    State <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='ivrmmS_Id'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select
                                                value={field.value ? String(field.value) : undefined}
                                                onValueChange={(val) => field.onChange(Number(val))}
                                                disabled={!selectedCountryId || states.length === 0}>
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={states.length === 0 ? 'No states available' : 'Select State'}
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {states.map((s) => (
                                                        <SelectItem key={s.ivrmmS_Id} value={s.ivrmmS_Id.toString()}>
                                                            {s.ivrmmS_Name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>

                            <FormInput control={control} name='hlmH_City' label='City' required placeholder='Enter City Name' />

                            <FormInput
                                control={control}
                                name='hlmH_Pincode'
                                label='Pincode'
                                required
                                maxLength={6}
                                placeholder='Enter Pincode'
                            />

                            <FormInput
                                control={control}
                                name='hlmH_TotalFloor'
                                label='Total Floor'
                                required
                                placeholder='Enter Total Floor'
                            />

                            <FormInput control={control} name='hlmH_TotalRoom' label='Total Room' required placeholder='Enter Total Room' />

                            <div>
                                <Label>Description</Label>
                                <Controller
                                    control={control}
                                    name='hlmH_Desc'
                                    render={({ field }) => <Textarea {...field} placeholder='Enter Description' />}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Document Upload Section */}
                    <div className='mt-4 rounded-md border p-4'>
                        <div className='mb-4 flex items-center justify-between'>
                            <Label className='font-semibold text-base text-blue-600 uppercase'>Hostel Guide Upload</Label>
                            <div className='relative inline-block'>
                                <Button type='button' variant='outline' size='sm' className='bg-blue-600 text-white hover:bg-blue-700'>
                                    +
                                </Button>
                                <input
                                    type='file'
                                    className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
                                    onChange={handleFileUpload}
                                />
                            </div>
                        </div>

                        <div className='overflow-x-auto'>
                            <table className='w-full border-collapse border text-left text-sm'>
                                <thead className='bg-blue-600 text-white'>
                                    <tr>
                                        <th className='border p-2'>SL.NO.</th>
                                        <th className='border p-2'>File</th>
                                        <th className='border p-2 text-center'>View</th>
                                        <th className='border p-2 text-center'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hostelPhotos.length > 0 ? (
                                        hostelPhotos.map((doc, index) => (
                                            <tr key={index}>
                                                <td className='border p-2'>{index + 1}</td>
                                                <td className='cursor-pointer border p-2 text-blue-600 underline'>{doc.hlmhP_FileName}</td>
                                                <td className='border p-2 text-center'>
                                                    <Button type='button' variant='ghost' size='sm'>
                                                        View
                                                    </Button>
                                                </td>
                                                <td className='border p-2 text-center'>
                                                    <Button type='button' variant='ghost' size='sm' onClick={() => removeDocument(index)}>
                                                        <Trash2 className='h-4 w-4 text-red-500' />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className='p-4 text-center text-gray-500'>
                                                No files uploaded yet. Click '+' to add files.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className='flex justify-center gap-2'>
                        <Button type='submit' disabled={isSubmitting}>
                            {isSubmitting ? (initialData ? 'Updating...' : 'Saving...') : initialData ? 'Update' : 'Save'}
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => {
                                reset();
                                onSuccess();
                            }}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
