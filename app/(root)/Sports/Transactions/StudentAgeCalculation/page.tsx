'use client';

import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { DatePicker } from '@/components/ui/date-picker';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudentAgeCalculation } from '@/hooks/sports/useStudentAgeCalculation';
import { type StudentAgeCalculationFormData, studentAgeCalculationSchema } from '@/schemas/sports/transactions/student-age-calculation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { use, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const createColumns = () => [
    {
        id: 'SPCCAC_Id',
        accessorKey: 'id',
        header: ({ column }: any) => <DataTableColumnHeader column={column} title='SL. No.' />,
        cell: ({ row, table }: any) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        }
    },
    {
        id: 'ASMAY_Year',
        accessorKey: 'asmaY_Year',
        header: ({ column }: any) => <DataTableColumnHeader column={column} title='Academic Year' />,
        enableSorting: true
    },
    {
        id: 'studentName',
        accessorKey: 'studentName',
        header: ({ column }: any) => <DataTableColumnHeader column={column} title='Student Name' />,
        enableSorting: true
    },
    {
        id: 'ASMCL_ClassName',
        accessorKey: 'asmcL_ClassName',
        header: ({ column }: any) => <DataTableColumnHeader column={column} title='Class' />,
        enableSorting: true
    },
    {
        id: 'ASMC_SectionName',
        accessorKey: 'asmC_SectionName',
        header: ({ column }: any) => <DataTableColumnHeader column={column} title='Section' />,
        enableSorting: true
    },
    {
        id: 'Age_Years',
        accessorKey: 'age_Years',
        header: ({ column }: any) => <DataTableColumnHeader column={column} title='Age Year' />,
        enableSorting: true
    },
    {
        id: 'Age_Months',
        accessorKey: 'age_Months',
        header: ({ column }: any) => <DataTableColumnHeader column={column} title='Month' />,
        enableSorting: true
    },
    {
        id: 'Age_Days',
        accessorKey: 'age_Days',
        header: ({ column }: any) => <DataTableColumnHeader column={column} title="Day's" />,
        enableSorting: true
    }
];

export default function StudentAgeCalculationPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { loadData, refetchAll, studentsData, saveData } = useStudentAgeCalculation(searchParams);
    const initialData = loadData; // Alias for backward compatibility in this page
    const [studentOptions, setStudentOptions] = useState<{ label: string; value: string }[]>([]);
    const [resetKey, setResetKey] = useState(0);

    const columns = useMemo(() => createColumns(), []);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm<StudentAgeCalculationFormData>({
        resolver: zodResolver(studentAgeCalculationSchema),
        defaultValues: {
            ASMAY_Id: undefined,
            ASMCL_Id: undefined,
            ASMS_Id: undefined,
            student: [],
            Till_Date: undefined
        }
    });

    const watchClass = watch('ASMCL_Id');
    const watchSection = watch('ASMS_Id');
    const watchAcademicYear = watch('ASMAY_Id');

    useEffect(() => {
        if (watchAcademicYear && watchClass && watchSection) {
            studentsData.mutate(
                {
                    ASMAY_Id: watchAcademicYear,
                    AMST_Id: 0,
                    ASMCL_Id: watchClass,
                    ASMS_Id: watchSection
                },
                {
                    onSuccess: (res: any) => {
                        if (res.success && res.data) {
                            setStudentOptions(res.data.map((s: any) => ({ label: s.label, value: s.id.toString() })));
                        } else {
                            setStudentOptions([]);
                        }
                    }
                }
            );
        } else {
            setStudentOptions([]);
        }
    }, [watchAcademicYear, watchClass, watchSection]);

    const onSubmit = (data: StudentAgeCalculationFormData) => {
        saveData.mutate(data, {
            onSuccess: (res: any) => {
                if (res.success) {
                    initialData.refetch();
                }
            }
        });
    };

    const onCancel = () => {
        reset();
        setStudentOptions([]);
        setResetKey((prev: number) => prev + 1);
    };

    const handlePrint = () => {
        const data = initialData.data?.data?.records || [];
        if (data.length === 0) {
            toast.error('No data found to print');
            return;
        }

        const printWindow = window.open('', '', 'width=1200,height=800');
        if (!printWindow) {
            toast.error('Unable to open print window. Please disable pop-up blockers.');
            return;
        }

        const columnHeaders = ['SL. No.', 'Academic Year', 'Student Name', 'Class', 'Section', 'Age Year', 'Month', "Day's"];
        const tableHead = columnHeaders.map((col) => `<th>${col}</th>`).join('');

        const tableRows = data
            .map((item: any, index: number) => {
                return `<tr>
                <td>${index + 1}</td>
                <td>${item.asmaY_Year ?? ''}</td>
                <td>${item.studentName ?? ''}</td>
                <td>${item.asmcL_ClassName ?? ''}</td>
                <td>${item.asmC_SectionName ?? ''}</td>
                <td>${item.age_Years ?? ''}</td>
                <td>${item.age_Months ?? ''}</td>
                <td>${item.age_Days ?? ''}</td>
            </tr>`;
            })
            .join('');

        printWindow.document.write(`
            <html>
            <head>
                <title>Age Calculation Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h3 { text-align: center; color: #333; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #333; padding: 8px; font-size: 12px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    tr:nth-child(even) { background-color: #fafafa; }
                    @media print {
                        body { padding: 0; }
                        table { page-break-inside: auto; }
                        tr { page-break-inside: avoid; page-break-after: auto; }
                        thead { display: table-header-group; }
                    }
                </style>
            </head>
            <body>
                <h3>Age Calculation Report</h3>
                <table>
                    <thead><tr>${tableHead}</tr></thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </body>
            </html>
        `);

        printWindow.document.close();

        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    const tableProps = {
        ...useDataTableProps(initialData.data?.data, { dataKey: 'records', totalKey: 'total' }),
        success: initialData.data?.success,
        errorMessage: initialData.data?.message
    };

    const academicYears = initialData.data?.data?.academicYears || [];
    const classes = initialData.data?.data?.classes || [];
    const sections = initialData.data?.data?.sections || [];

    return (
        <div className='space-y-6'>
            <CollapsibleSection title='Age Calculation Entry' defaultOpen={true}>
                <CardContent key={resetKey}>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='ASMAY_Id'
                                    render={({ field }) => (
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Academic Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears.map((year: any) => (
                                                    <SelectItem key={year.id} value={year.id.toString()}>
                                                        {year.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.ASMAY_Id && <span className='text-destructive text-sm'>{errors.ASMAY_Id.message}</span>}
                            </div>

                            <div className='space-y-2'>
                                <Label>
                                    Class <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='ASMCL_Id'
                                    render={({ field }) => (
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Class' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes.map((cls: any) => (
                                                    <SelectItem key={cls.id} value={cls.id.toString()}>
                                                        {cls.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.ASMCL_Id && <span className='text-destructive text-sm'>{errors.ASMCL_Id.message}</span>}
                            </div>

                            <div className='space-y-2'>
                                <Label>
                                    Section <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='ASMS_Id'
                                    render={({ field }) => (
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Section' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sections.map((sec: any) => (
                                                    <SelectItem key={sec.id} value={sec.id.toString()}>
                                                        {sec.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.ASMS_Id && <span className='text-destructive text-sm'>{errors.ASMS_Id.message}</span>}
                            </div>

                            <div className='space-y-2'>
                                <Label>
                                    Student Name <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='student'
                                    render={({ field }) => (
                                        <MultiSelect
                                            key={`multi-${resetKey}`}
                                            options={studentOptions}
                                            onValueChange={(vals) => field.onChange(vals.map(Number))}
                                            defaultValue={field.value?.map(String) || []}
                                            placeholder='Select Student'
                                            variant='default'
                                            maxCount={3}
                                        />
                                    )}
                                />
                                {errors.student && <span className='text-destructive text-sm'>{errors.student.message}</span>}
                            </div>

                            <div className='space-y-2'>
                                <Label>
                                    Age Till Date <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='Till_Date'
                                    render={({ field }) => <DatePicker date={field.value} setDate={(date) => field.onChange(date)} />}
                                />
                                {errors.Till_Date && <span className='text-destructive text-sm'>{errors.Till_Date.message}</span>}
                            </div>
                        </div>

                        <div className='flex justify-center space-x-2'>
                            <Button type='submit' disabled={saveData.isPending}>
                                {saveData.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                                Save
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                className='transition-all duration-200 hover:scale-105'
                                onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button type='button' variant='secondary' onClick={handlePrint}>
                                Print
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </CollapsibleSection>

            <CollapsibleSection title='Age Calculated Records' defaultOpen={true} size='lg'>
                <GenericDataTable<any>
                    {...tableProps}
                    columns={columns}
                    isLoading={initialData.isLoading}
                    error={initialData.error}
                    showSearchColumns={true}
                    loadingMessage='Loading age calculations...'
                />
            </CollapsibleSection>
        </div>
    );
}
