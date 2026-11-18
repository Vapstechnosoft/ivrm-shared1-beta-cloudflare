import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DateField } from '@/components/ui/dateField';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type StudentRequestConfirmValues, studentRequestConfirmSchema } from '@/schemas/hostel/transactions/hostel-confirmations.schema';
import { approveStudentRequest, rejectStudentRequest } from '@/server/hostel/hostel-management/transactions/student-request-actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2, Minus, Save, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function StudentConfirmForm({
    onSaveSuccess,
    processData,
    rooms
}: {
    onSaveSuccess: () => void;
    processData: any;
    rooms: any[];
}) {
    const [loading, setLoading] = useState(false);

    const methods = useForm<StudentRequestConfirmValues>({
        resolver: zodResolver(studentRequestConfirmSchema),
        defaultValues: {
            HLHSREQ_Id: processData.HLHSREQ_Id as number,
            HLHSREQC_Id: (processData.HLHSREQC_Id || 0) as number,
            HLHSREQC_Remarks: '',
            HRMRM_Id: processData.HRMRM_Id ? String(processData.HRMRM_Id) : undefined,
            HLHSREQ_RequestDate: processData.HLHSREQ_RequestDate ? new Date(processData.HLHSREQ_RequestDate) : undefined
        }
    });

    const { control, handleSubmit, reset } = methods;

    async function handleApprove(values: StudentRequestConfirmValues) {
        if (!values.HRMRM_Id) {
            toast.error('Please select a room for approval');
            return;
        }
        setLoading(true);
        try {
            const result = await approveStudentRequest({
                ...values,
                HRMRM_Id: Number.parseInt(values.HRMRM_Id)
            });
            if (result?.returnval === true) {
                toast.success('Request approved!');
                onSaveSuccess();
            } else {
                toast.error('Failed to approve request');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    }

    async function handleReject(values: StudentRequestConfirmValues) {
        setLoading(true);
        try {
            const result = await rejectStudentRequest(values);
            if (result?.returnval === true) {
                toast.success('Request rejected!');
                onSaveSuccess();
            } else {
                toast.error('Failed to reject request');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    }

    const ReadOnlyField = ({ label, value }: { label: string; value: any }) => (
        <div className='flex items-center space-x-2 py-1'>
            <Label className='w-40 text-left font-medium text-gray-700'>{label}</Label>
            <span className='text-gray-500'>:</span>
            <span className='flex-1 truncate pl-4 font-semibold text-blue-900'>{value || '-'}</span>
        </div>
    );

    return (
        <Card className='border-t-4 border-t-[#4255a7] shadow-md'>
            <CardHeader className='flex flex-row items-center justify-between border-b bg-white px-4 py-2'>
                <CardTitle className='font-bold text-[#4255a7] text-sm uppercase'>STUDENT REQUEST/CONFIRM</CardTitle>
                <Minus className='h-4 w-4 cursor-pointer text-gray-400' />
            </CardHeader>
            <CardContent className='p-6'>
                <FormProvider {...methods}>
                    <form className='space-y-6'>
                        {/* Status and Date Header */}
                        <div className='flex items-center justify-between border-b pb-4'>
                            <div className='flex items-center'>
                                <Label className='min-w-[120px] font-medium text-gray-700'>Request Status</Label>
                                <span className='text-gray-500'>:</span>
                                <span className='px-4 font-bold text-blue-900'>{processData.HLHSREQ_BookingStatus || 'Waiting'}</span>
                            </div>
                            <div className='flex items-center font-medium text-sm'>
                                <span className='text-gray-700'>Date :</span>
                                <span className='ml-2 text-gray-900'>{format(new Date(), 'dd-MM-yyyy')}</span>
                            </div>
                        </div>

                        {/* Two Column Grid */}
                        <div className='grid grid-cols-1 gap-x-20 gap-y-2 md:grid-cols-2'>
                            <div className='space-y-1'>
                                <ReadOnlyField label='Student Name' value={processData.studentName} />
                                <ReadOnlyField label='Adm No' value={processData.AMCST_AdmNo} />
                                <ReadOnlyField label='Hostel Name.' value={processData.HLMH_Name} />

                                <div className='flex items-center py-1'>
                                    <Label className='w-40 text-left font-medium text-gray-700'>
                                        Request Date:<span className='text-red-500'>*</span>
                                    </Label>
                                    <span className='mr-4 text-gray-500'>:</span>
                                    <div className='flex-1'>
                                        <Controller
                                            control={control}
                                            name='HLHSREQ_RequestDate'
                                            defaultValue={
                                                (processData.HLHSREQ_RequestDate
                                                    ? new Date(processData.HLHSREQ_RequestDate)
                                                    : undefined) as any
                                            }
                                            render={({ field, fieldState }) => (
                                                <DateField field={field} fieldState={fieldState} label='' placeholder='Select date' />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className='space-y-1'>
                                <ReadOnlyField label='Course' value={processData.AMCO_CourseName} />
                                <ReadOnlyField label='Reg No.' value={processData.AMCST_RegistrationNo} />
                                <ReadOnlyField label='Room Category' value={processData.HLMRCA_RoomCategory} />

                                <div className='flex items-center py-1'>
                                    <Label className='w-40 text-left font-medium text-gray-700'>
                                        Room Name:<span className='text-red-500'>*</span>
                                    </Label>
                                    <span className='mr-4 text-gray-500'>:</span>
                                    <div className='flex-1'>
                                        <Controller
                                            control={control}
                                            name='HRMRM_Id'
                                            render={({ field, fieldState }) => (
                                                <div className='w-full'>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='--Select--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {rooms.map((r) => (
                                                                <SelectItem key={r.hrmrM_Id} value={String(r.hrmrM_Id)}>
                                                                    {r.hrmrM_RoomNo}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mess Type and AC/Single Boxes */}
                        <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                            <div className='flex items-center space-x-20 rounded-md border bg-white p-1.5 shadow-sm'>
                                <Label className='w-32 pl-4 font-medium text-gray-700'>Mess Type:</Label>
                                <div className='flex items-center space-x-6'>
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox checked={processData.HLHSREQ_MessFlag === 'Veg'} disabled />
                                        <Label className='font-medium text-sm'>Veg</Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox checked={processData.HLHSREQ_MessFlag === 'Non-Veg'} disabled />
                                        <Label className='font-medium text-sm'>Non-Veg</Label>
                                    </div>
                                </div>
                            </div>

                            <div className='flex items-center justify-center space-x-12 rounded-md border bg-white p-1.5 shadow-sm'>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox checked={!!processData.HLHSREQ_ACRoomFlg} disabled />
                                    <Label className='font-medium text-sm'>AC</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox checked={!!processData.HLHSREQ_SingleRoomFlg} disabled />
                                    <Label className='font-medium text-sm'>Single</Label>
                                </div>
                            </div>
                        </div>

                        {/* Remarks Row */}
                        <div className='grid grid-cols-1 gap-8 pt-2 md:grid-cols-2'>
                            <div className='flex items-start space-x-4'>
                                <Label className='w-36 pt-2 font-medium text-gray-700'>Request Remarks</Label>
                                <div className='flex-1'>
                                    <Textarea
                                        value={processData.HLHSREQ_Remarks || ''}
                                        readOnly
                                        className='min-h-[60px] border-gray-300 bg-gray-50'
                                    />
                                </div>
                            </div>
                            <div className='flex items-start space-x-4'>
                                <Label className='w-36 pt-2 font-medium text-gray-700'>Approved Remarks</Label>
                                <div className='flex-1'>
                                    <Controller
                                        control={control}
                                        name='HLHSREQC_Remarks'
                                        render={({ field, fieldState }) => (
                                            <div className='w-full'>
                                                <Textarea {...field} className='min-h-[60px] border-gray-300' placeholder='' />
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex items-center justify-center gap-4 pt-6'>
                            <Button
                                type='button'
                                disabled={loading}
                                onClick={handleSubmit(handleApprove)}
                                className='w-32 rounded-md bg-[#4255a7] font-bold text-white text-xs uppercase shadow-md hover:bg-[#354486]'>
                                {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-3 w-3' />}
                                APPROVED
                            </Button>
                            <Button
                                type='button'
                                disabled={loading}
                                onClick={handleSubmit(handleReject)}
                                className='w-32 rounded-md bg-[#4255a7] font-bold text-white text-xs uppercase shadow-md hover:bg-[#354486]'>
                                {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-3 w-3' />}
                                REJECTED
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => reset()}
                                className='w-32 rounded-md border-none bg-[#ff5c33] font-bold text-white text-xs uppercase shadow-md hover:bg-[#e64d26]'>
                                <XCircle className='mr-2 h-3 w-3' />
                                CANCEL
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CardContent>
        </Card>
    );
}
