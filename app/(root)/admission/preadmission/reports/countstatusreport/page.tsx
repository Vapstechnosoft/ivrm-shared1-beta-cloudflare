'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCountStatusReportData, useCountStatusReportInitialDetails } from '@/hooks/admission/preadmission/reports/useCountStatusReport';
import { zodResolver } from '@hookform/resolvers/zod';
import { BarChart2, Search } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import * as z from 'zod';
import { parseAsInteger, useQueryState } from 'nuqs';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const formSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required')
});

type FormValues = z.infer<typeof formSchema>;

export default function CountStatusReport() {
    const { data: initialDetails, isLoading: isInitialLoading } = useCountStatusReportInitialDetails();
    const [admissionData, setAdmissionData] = useState<any[]>([]);
    const [applicationData, setApplicationData] = useState<any[]>([]);
    const [masterCompany, setMasterCompany] = useState<any>(null);
    const [showGraphs, setShowGraphs] = useState(false);

    const statusList = (initialDetails as any)?.data?.statuslist || (initialDetails as any)?.statuslist || [];
    const academicList = (initialDetails as any)?.data?.academicList || (initialDetails as any)?.academicList || [];

    const [page] = useQueryState('page', parseAsInteger.withDefault(1));
    const [pageSize] = useQueryState('page_size', parseAsInteger.withDefault(10));

    const paginatedStatusList = statusList.slice((page - 1) * pageSize, page * pageSize);
    const paginatedApplicationData = applicationData.slice((page - 1) * pageSize, page * pageSize);
    const paginatedAdmissionData = admissionData.slice((page - 1) * pageSize, page * pageSize);

    const { mutate: getReportData, isPending } = useCountStatusReportData();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ASMAY_Id: '0'
        }
    });

    const onSubmit = (data: FormValues) => {
        const payload = {
            ASMAY_Id: Number(data.ASMAY_Id)
        };

        getReportData(payload, {
            onSuccess: (res: any) => {
                const countReportStatus = res?.data?.countreportstatus || res?.countreportstatus || [];
                const applicationStatus = res?.data?.applicationstatus || res?.applicationstatus || [];
                const masterCompanyData = res?.data?.masterCompany || res?.masterCompany || [];

                if (masterCompanyData.length > 0) {
                    setMasterCompany(masterCompanyData[0]);
                } else {
                    setMasterCompany(null);
                }

                if (countReportStatus.length > 0 || applicationStatus.length > 0) {
                    setAdmissionData(countReportStatus);

                    const mappedAppStatus = applicationStatus.map((item: any) => {
                        let statusName = '';
                        if (item.PASRAPS_ID === 787926) statusName = 'APP WAITING';
                        else if (item.PASRAPS_ID === 787927) statusName = 'APP REJECTED';
                        else if (item.PASRAPS_ID === 787928) statusName = 'APP ACCEPTED';
                        else statusName = `Status ${item.PASRAPS_ID}`;

                        return {
                            ...item,
                            statusName,
                            data: item.data
                        };
                    });

                    setApplicationData(mappedAppStatus);
                    setShowGraphs(true);
                } else {
                    setAdmissionData([]);
                    setApplicationData([]);
                    setShowGraphs(false);
                    toast.info('No Record found!!');
                }
            },
            onError: () => {
                toast.error('Failed to fetch data');
            }
        });
    };

    const admissionColumns = [
        { 
            accessorKey: 'sno', 
            header: () => <div className='text-center font-bold text-black uppercase'>SL.NO</div>, 
            cell: (info: any) => <div className='text-center'>{(page - 1) * pageSize + info.row.index + 1}</div> 
        },
        { 
            accessorKey: 'PAMST_Status', 
            header: () => <div className='text-center font-bold text-black uppercase'>Admission Status</div>,
            cell: (info: any) => <div className='text-center'>{info.getValue()}</div> 
        },
        { 
            accessorKey: 'Data_count', 
            header: () => <div className='text-center font-bold text-black uppercase'>Count</div>,
            cell: (info: any) => <div className='text-center'>{info.getValue()}</div> 
        }
    ];

    const applicationColumns = [
        { 
            accessorKey: 'sno', 
            header: () => <div className='text-center font-bold text-black uppercase'>SL.NO</div>, 
            cell: (info: any) => <div className='text-center'>{(page - 1) * pageSize + info.row.index + 1}</div> 
        },
        { 
            accessorKey: 'statusName', 
            header: () => <div className='text-center font-bold text-black uppercase'>Application Status</div>,
            cell: (info: any) => <div className='text-center'>{info.getValue()}</div> 
        },
        { 
            accessorKey: 'data', 
            header: () => <div className='text-center font-bold text-black uppercase'>Count</div>,
            cell: (info: any) => <div className='text-center'>{info.getValue()}</div> 
        }
    ];

    const statusColumns = [
        { 
            accessorKey: 'sno', 
            header: () => <div className='text-center font-bold text-black uppercase'>SL.NO</div>, 
            cell: (info: any) => <div className='text-center'>{(page - 1) * pageSize + info.row.index + 1}</div> 
        },
        { 
            accessorKey: 'pamsT_Status', 
            header: () => <div className='text-center font-bold text-black uppercase'>Status Name</div>,
            cell: (info: any) => <div className='text-center'>{info.getValue()}</div> 
        },
        { 
            accessorKey: 'pamsT_StatusFlag', 
            header: () => <div className='text-center font-bold text-black uppercase'>Status Flag</div>,
            cell: (info: any) => <div className='text-center'>{info.getValue()}</div> 
        }
    ];

    const admissionChartData = admissionData.map((item) => ({
        name: item.PAMST_Status,
        value: item.Data_count
    }));

    const applicationChartData = applicationData.map((item) => ({
        name: item.statusName,
        value: item.data
    }));

    return (
        <div className='flex flex-col gap-4'>
            <Card>
                <CardHeader>
                    <CardTitle>Status Count Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                                <FormField
                                    control={form.control}
                                    name='ASMAY_Id'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Academic Year <span className='text-red-500'>*</span>
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select Academic Year' />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value='0'>ALL</SelectItem>
                                                    {Array.isArray(academicList) &&
                                                        academicList.map((item: any) => (
                                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                {item.asmaY_Year}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className='flex justify-center gap-2'>
                                <Button type='submit' disabled={isPending || isInitialLoading}>
                                    <Search className='mr-2 h-4 w-4' />
                                    Search
                                </Button>
                                {showGraphs && (
                                    <Button type='button' variant='outline' onClick={() => setShowGraphs(!showGraphs)}>
                                        <BarChart2 className='mr-2 h-4 w-4' />
                                        View Graphs
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {masterCompany && (
                <Card>
                    <CardContent className='flex items-center justify-center gap-4 pt-6'>
                        {masterCompany.logo && (
                            <img src={masterCompany.logo} alt={masterCompany.companyname} className='h-20 object-contain' />
                        )}
                        {masterCompany.companyname && (
                            <h2 className='text-3xl font-bold uppercase tracking-wider text-primary'>
                                {masterCompany.companyname}
                            </h2>
                        )}
                    </CardContent>
                </Card>
            )}

            {statusList.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Available Status List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <GenericDataTable 
                            data={paginatedStatusList} 
                            columns={statusColumns} 
                            isLoading={isInitialLoading} 
                            totalItems={statusList.length} 
                        />
                    </CardContent>
                </Card>
            )}

            {applicationData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Application Status Details</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                        <GenericDataTable 
                            data={paginatedApplicationData} 
                            columns={applicationColumns} 
                            isLoading={isPending} 
                            totalItems={applicationData.length} 
                        />

                        {showGraphs && (
                            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                                <div className='h-[300px]'>
                                    <h3 className='mb-4 text-center font-semibold text-sm'>
                                        Chart Representation Of Application Status Count
                                    </h3>
                                    <ResponsiveContainer width='100%' height='100%'>
                                        <BarChart data={applicationChartData}>
                                            <CartesianGrid strokeDasharray='3 3' />
                                            <XAxis dataKey='name' />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey='value' fill='#8884d8' name='Count'>
                                                {applicationChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className='h-[300px]'>
                                    <h3 className='mb-4 text-center font-semibold text-sm'>Application Status Distribution</h3>
                                    <ResponsiveContainer width='100%' height='100%'>
                                        <PieChart>
                                            <Pie
                                                data={applicationChartData}
                                                cx='50%'
                                                cy='50%'
                                                innerRadius={60}
                                                outerRadius={100}
                                                fill='#8884d8'
                                                paddingAngle={5}
                                                dataKey='value'
                                                label>
                                                {applicationChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {admissionData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Status Details</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                        <GenericDataTable 
                            data={paginatedAdmissionData} 
                            columns={admissionColumns} 
                            isLoading={isPending} 
                            totalItems={admissionData.length} 
                        />

                        {showGraphs && (
                            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                                <div className='h-[300px]'>
                                    <h3 className='mb-4 text-center font-semibold text-sm'>
                                        Chart Representation Of Admission Status Count
                                    </h3>
                                    <ResponsiveContainer width='100%' height='100%'>
                                        <BarChart data={admissionChartData}>
                                            <CartesianGrid strokeDasharray='3 3' />
                                            <XAxis dataKey='name' />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey='value' fill='#82ca9d' name='Count'>
                                                {admissionChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className='h-[300px]'>
                                    <h3 className='mb-4 text-center font-semibold text-sm'>Admission Status Distribution</h3>
                                    <ResponsiveContainer width='100%' height='100%'>
                                        <PieChart>
                                            <Pie
                                                data={admissionChartData}
                                                cx='50%'
                                                cy='50%'
                                                innerRadius={60}
                                                outerRadius={100}
                                                fill='#82ca9d'
                                                paddingAngle={5}
                                                dataKey='value'
                                                label>
                                                {admissionChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
