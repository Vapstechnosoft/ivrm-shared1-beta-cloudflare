'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Download, FileText, Loader2, Printer, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
    useDocumentViewReportData,
    useDocumentViewReportInitialDetails,
    useDocumentViewReportStudent
} from '@/hooks/admission/oldsharehost/reports/useDocumentViewReport';

const formSchema = z
    .object({
        TC_allorind: z.enum(['1', '2']),
        casteorcategory: z.enum(['1', '2', '3']).optional(),
        amsmD_Idqwe: z.string().optional(),
        asmaY_Id: z.string().min(1, 'Academic Year is required'),
        asmcL_Id: z.string().min(1, 'Class is required'),
        asmS_Id: z.string().min(1, 'Section is required'),
        stdid: z.string().optional()
    })
    .superRefine((data, ctx) => {
        if (data.TC_allorind === '2') {
            if (!data.amsmD_Idqwe) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Document Name is required',
                    path: ['amsmD_Idqwe']
                });
            }
        } else if (data.TC_allorind === '1') {
            if (!data.stdid) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Student is required',
                    path: ['stdid']
                });
            }
        }
    });

type FormValues = z.infer<typeof formSchema>;

export default function DocumentViewReportAdmPage() {
    const { data: initialData, isLoading: isInitialLoading } = useDocumentViewReportInitialDetails();
    const studentMutation = useDocumentViewReportStudent();
    const reportMutation = useDocumentViewReportData();

    const [studentList, setStudentList] = useState<any[]>([]);

    // Grid states
    const [studentWiseReport, setStudentWiseReport] = useState<any[]>([]);
    const [docWiseReport, setDocWiseReport] = useState<any[]>([]);
    const [selectedStudentReport, setSelectedStudentReport] = useState<any[]>([]);
    const [selectedDocReport, setSelectedDocReport] = useState<any[]>([]);
    const [reportType, setReportType] = useState<'student' | 'document' | null>(null);
    const [reportMeta, setReportMeta] = useState<any>({});
    const [logoPath, setLogoPath] = useState<string>('');

    const [isGenerating, setIsGenerating] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const studentPrintRef = useRef<HTMLDivElement>(null);
    const docPrintRef = useRef<HTMLDivElement>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            TC_allorind: '1',
            casteorcategory: '3',
            amsmD_Idqwe: '',
            asmaY_Id: '',
            asmcL_Id: '',
            asmS_Id: '',
            stdid: ''
        }
    });

    const watchTC_allorind = form.watch('TC_allorind');
    const watchAsmaY_Id = form.watch('asmaY_Id');
    const watchAsmcL_Id = form.watch('asmcL_Id');
    const watchAsmS_Id = form.watch('asmS_Id');

    useEffect(() => {
        if (watchTC_allorind === '1' && watchAsmaY_Id && watchAsmcL_Id && watchAsmS_Id) {
            fetchStudents();
        } else {
            setStudentList([]);
        }
    }, [watchTC_allorind, watchAsmaY_Id, watchAsmcL_Id, watchAsmS_Id]);

    const fetchStudents = async () => {
        if (watchAsmS_Id === '0') return; // Do not fetch students if 'All' sections is selected (only valid for doc wise)

        try {
            const payload = {
                asmaY_Id: watchAsmaY_Id,
                asmcL_Id: watchAsmcL_Id,
                asmS_Id: watchAsmS_Id
            };
            const res = await studentMutation.mutateAsync(payload);
            if (res?.data?.studentdetails) {
                setStudentList(res.data.studentdetails);
            } else {
                setStudentList([]);
                toast.info('No Students Found');
            }
        } catch (error) {
            toast.error('Failed to fetch students');
        }
    };

    const onSubmit = async (data: FormValues) => {
        try {
            setIsGenerating(true);

            const payload = {
                AMST_Id: data.TC_allorind === '1' ? Number(data.stdid) : 0,
                asmaY_Id: Number(data.asmaY_Id),
                asmcL_Id: Number(data.asmcL_Id),
                asmS_Id: Number(data.asmS_Id),
                STDORDOC: data.TC_allorind,
                SUBORNOT: data.TC_allorind === '2' ? Number(data.casteorcategory) : 0,
                AMSMD_Id: data.TC_allorind === '2' ? Number(data.amsmD_Idqwe) : 0
            };

            const res = await reportMutation.mutateAsync(payload);
            const reportData = res?.data?.studentdetails || [];

            if (reportData.length > 0) {
                // Enrich data with selected state and file type
                const enrichedData = reportData.map((item: any) => {
                    let filetype = '';
                    if (item.docpath) {
                        const parts = item.docpath.split('.');
                        filetype = parts[parts.length - 1]?.toLowerCase();
                    }
                    return {
                        ...item,
                        selected: false,
                        filetype
                    };
                });

                // Get meta info for display
                const selectedClass = initialData?.data?.classname?.find((c: any) => c.asmcL_Id.toString() === data.asmcL_Id);
                const selectedSection = initialData?.data?.section?.find((s: any) => s.asmS_Id.toString() === data.asmS_Id);
                const selectedYear = initialData?.data?.year?.find((y: any) => y.asmaY_Id.toString() === data.asmaY_Id);

                let headerName = '';
                if (data.TC_allorind === '1') {
                    const selectedStudent = studentList.find((s: any) => s.amsT_Id.toString() === data.stdid);
                    headerName = selectedStudent ? selectedStudent.studentname : '';
                } else {
                    const selectedDoc = initialData?.data?.document?.find((d: any) => d.amsmD_Id.toString() === data.amsmD_Idqwe);
                    headerName = selectedDoc ? selectedDoc.amsmD_DocumentName : '';
                }

                setReportMeta({
                    headerName: headerName,
                    className: selectedClass?.asmcL_ClassName || '',
                    sectionName: selectedSection?.asmC_SectionName || '',
                    yearName: selectedYear?.asmaY_Year || ''
                });

                if (res?.data?.logo?.length > 0) {
                    setLogoPath(res.data.logo[0].logo);
                } else {
                    setLogoPath('');
                }

                if (data.TC_allorind === '1') {
                    setStudentWiseReport(enrichedData);
                    setSelectedStudentReport([]);
                    setDocWiseReport([]);
                    setSelectedDocReport([]);
                    setReportType('student');
                } else {
                    setDocWiseReport(enrichedData);
                    setSelectedDocReport([]);
                    setStudentWiseReport([]);
                    setSelectedStudentReport([]);
                    setReportType('document');
                }
            } else {
                setStudentWiseReport([]);
                setDocWiseReport([]);
                setSelectedStudentReport([]);
                setSelectedDocReport([]);
                setReportType(null);
                toast.info('No Records Found');
            }
        } catch (error) {
            toast.error('Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClear = () => {
        window.location.reload();
    };

    const handlePrint = () => {
        const dataToPrint = reportType === 'student' ? selectedStudentReport : selectedDocReport;

        if (dataToPrint.length === 0) {
            toast.warning('Please Select Atleast One Record');
            return;
        }

        const activeRef = reportType === 'student' ? studentPrintRef : docPrintRef;
        if (!activeRef.current) return;

        const printContent = activeRef.current.innerHTML;
        const printWindow = window.open('', '_blank', 'width=1000,height=800');

        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Document View Report</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                            @media print {
                                @page { size: auto; margin: 5mm; }
                                body { padding: 0; margin: 0; font-family: Arial, sans-serif; }
                            }
                        </style>
                    </head>
                    <body onload="setTimeout(function() { window.print(); }, 500);">
                        ${printContent}
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    // Columns for Student Wise
    const studentWiseColumns = [
        {
            id: 'select',
            header: ({ table }: any) => (
                <div className='text-center'>
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label='Select all'
                    />
                </div>
            ),
            cell: ({ row }: any) => (
                <div className='text-center'>
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label='Select row'
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false
        },
        {
            accessorKey: 'sno',
            header: () => <div className='text-center font-bold'>SL.NO</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.index + 1}</div>
        },
        {
            accessorKey: 'docname',
            header: () => <div className='text-center font-bold'>Document Name</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.docname}</div>
        },
        {
            accessorKey: 'statuss',
            header: () => <div className='text-center font-bold'>Status</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.statuss}</div>
        },
        {
            accessorKey: 'submited',
            header: () => <div className='text-center font-bold'>Remarks</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.submited}</div>
        },
        {
            id: 'document',
            header: () => <div className='text-center font-bold'>Document</div>,
            cell: ({ row }: any) => {
                const { docpath, filetype } = row.original;
                if (!docpath) return null;
                if (filetype === 'pdf') {
                    return (
                        <div className='flex justify-center'>
                            <span className='font-bold'>PDF</span>
                        </div>
                    );
                } else if (filetype === 'jpg' || filetype === 'jpeg' || filetype === 'png') {
                    return (
                        <div className='flex justify-center'>
                            <img src={docpath} alt='Document' className='h-12 w-12 object-cover' />
                        </div>
                    );
                }
                return null;
            }
        },
        {
            id: 'action',
            header: () => <div className='text-center font-bold'>Action</div>,
            cell: ({ row }: any) => {
                const { docpath, filetype } = row.original;
                if (!docpath) return null;
                if (filetype === 'pdf') {
                    return (
                        <div className='flex justify-center'>
                            <a
                                href={docpath}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='flex items-center gap-1 font-bold text-orange-500 hover:underline'>
                                <Download className='h-4 w-4' /> Download PDF
                            </a>
                        </div>
                    );
                } else if (filetype === 'jpg' || filetype === 'jpeg' || filetype === 'png') {
                    return (
                        <div className='flex justify-center'>
                            <button type='button' onClick={() => setPreviewImage(docpath)} className='text-blue-600 hover:underline'>
                                View
                            </button>
                        </div>
                    );
                }
                return null;
            }
        }
    ];

    // Columns for Document Wise
    const docWiseColumns = [
        {
            id: 'select',
            header: ({ table }: any) => (
                <div className='text-center'>
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label='Select all'
                    />
                </div>
            ),
            cell: ({ row }: any) => (
                <div className='text-center'>
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label='Select row'
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false
        },
        {
            accessorKey: 'sno',
            header: () => <div className='text-center font-bold'>SL.NO</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.index + 1}</div>
        },
        {
            accessorKey: 'studentnam',
            header: () => <div className='text-center font-bold'>Student Name</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.studentnam}</div>
        },
        {
            accessorKey: 'admno',
            header: () => <div className='text-center font-bold'>Admno</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.admno}</div>
        },
        {
            accessorKey: 'classname',
            header: () => <div className='text-center font-bold'>Class</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.classname}</div>
        },
        {
            accessorKey: 'sectionname',
            header: () => <div className='text-center font-bold'>Section</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.sectionname}</div>
        },
        {
            accessorKey: 'statuss',
            header: () => <div className='text-center font-bold'>Status</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.statuss}</div>
        },
        {
            accessorKey: 'submited',
            header: () => <div className='text-center font-bold'>Remarks</div>,
            cell: ({ row }: any) => <div className='text-center'>{row.original.submited}</div>
        },
        {
            id: 'document',
            header: () => <div className='text-center font-bold'>Document</div>,
            cell: ({ row }: any) => {
                const { docpath, filetype } = row.original;
                if (!docpath) return null;
                if (filetype === 'pdf') {
                    return (
                        <div className='flex justify-center'>
                            <span className='font-bold'>PDF</span>
                        </div>
                    );
                } else if (filetype === 'jpg' || filetype === 'jpeg' || filetype === 'png') {
                    return (
                        <div className='flex justify-center'>
                            <img src={docpath} alt='Document' className='h-12 w-12 object-cover' />
                        </div>
                    );
                }
                return null;
            }
        },
        {
            id: 'action',
            header: () => <div className='text-center font-bold'>Action</div>,
            cell: ({ row }: any) => {
                const { docpath, filetype } = row.original;
                if (!docpath) return null;
                if (filetype === 'pdf') {
                    return (
                        <div className='flex justify-center'>
                            <a
                                href={docpath}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='flex items-center gap-1 font-bold text-orange-500 hover:underline'>
                                <Download className='h-4 w-4' /> Download PDF
                            </a>
                        </div>
                    );
                } else if (filetype === 'jpg' || filetype === 'jpeg' || filetype === 'png') {
                    return (
                        <div className='flex justify-center'>
                            <button type='button' onClick={() => setPreviewImage(docpath)} className='text-blue-600 hover:underline'>
                                View
                            </button>
                        </div>
                    );
                }
                return null;
            }
        }
    ];

    const yearList = initialData?.data?.year || [];
    const classList = initialData?.data?.classname || [];
    const sectionList = initialData?.data?.section || [];
    const documentList = initialData?.data?.document || [];

    return (
        <>
            <div className='min-h-screen space-y-6 bg-gray-50 p-4 print:hidden'>
                {/* Modal for image preview */}
                {previewImage && (
                    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 print:hidden'>
                        <div className='flex max-h-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white'>
                            <div className='flex items-center justify-between border-b p-4'>
                                <h3 className='font-bold text-lg'>Document Preview</h3>
                                <button onClick={() => setPreviewImage(null)} className='text-gray-500 hover:text-red-500'>
                                    <X className='h-6 w-6' />
                                </button>
                            </div>
                            <div className='flex flex-1 justify-center overflow-auto bg-gray-100 p-4'>
                                <img src={previewImage} alt='Preview' className='max-h-[80vh] max-w-full object-contain' />
                            </div>
                        </div>
                    </div>
                )}

                <div className='print:hidden'>
                    <CollapsibleSection title='Document View Report' defaultOpen={true} variant='outline' className='shadow-md'>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 rounded-lg bg-white p-6'>
                            <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
                                {/* Column 1 */}
                                <div className='space-y-6'>
                                    <Controller
                                        name='TC_allorind'
                                        control={form.control}
                                        render={({ field }) => (
                                            <div className='rounded-md bg-gray-100 p-4 text-center'>
                                                <RadioGroup
                                                    onValueChange={(val) => {
                                                        field.onChange(val);
                                                        form.setValue('amsmD_Idqwe', '');
                                                        form.clearErrors();
                                                    }}
                                                    value={field.value}
                                                    className='flex flex-row justify-center space-x-4'>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='1' id='student-wise' />
                                                        <Label htmlFor='student-wise'>Student Wise</Label>
                                                    </div>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='2' id='doc-wise' />
                                                        <Label htmlFor='doc-wise'>Document Wise</Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        )}
                                    />

                                    {watchTC_allorind === '2' && (
                                        <>
                                            <Controller
                                                name='casteorcategory'
                                                control={form.control}
                                                render={({ field }) => (
                                                    <div className='rounded-md bg-gray-100 p-4 text-center'>
                                                        <RadioGroup
                                                            onValueChange={field.onChange}
                                                            value={field.value}
                                                            className='flex flex-row justify-center space-x-4'>
                                                            <div className='flex items-center space-x-2'>
                                                                <RadioGroupItem value='1' id='not-submit' />
                                                                <Label htmlFor='not-submit'>Not Submit</Label>
                                                            </div>
                                                            <div className='flex items-center space-x-2'>
                                                                <RadioGroupItem value='2' id='submit' />
                                                                <Label htmlFor='submit'>Submit</Label>
                                                            </div>
                                                            <div className='flex items-center space-x-2'>
                                                                <RadioGroupItem value='3' id='both' />
                                                                <Label htmlFor='both'>Both</Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </div>
                                                )}
                                            />

                                            <div className='space-y-2'>
                                                <Label className='flex items-center space-x-2 font-bold text-sm'>
                                                    <span className='w-32'>
                                                        Document Name:<span className='text-red-500'>*</span>
                                                    </span>
                                                    <div className='flex-1'>
                                                        <Controller
                                                            name='amsmD_Idqwe'
                                                            control={form.control}
                                                            render={({ field }) => (
                                                                <Select
                                                                    value={field.value}
                                                                    onValueChange={field.onChange}
                                                                    disabled={isInitialLoading}>
                                                                    <SelectTrigger className='w-full'>
                                                                        <SelectValue placeholder='--Select--' />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {documentList.map((doc: any) => (
                                                                            <SelectItem key={doc.amsmD_Id} value={doc.amsmD_Id.toString()}>
                                                                                {doc.amsmD_DocumentName}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                    </div>
                                                </Label>
                                                {form.formState.errors.amsmD_Idqwe && (
                                                    <span className='ml-34 block text-red-500 text-sm'>
                                                        {form.formState.errors.amsmD_Idqwe.message}
                                                    </span>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Column 2 */}
                                <div className='space-y-6'>
                                    <div className='space-y-2'>
                                        <Label className='flex items-center space-x-2 font-bold text-sm'>
                                            <span className='w-32'>
                                                Academic Year:<span className='text-red-500'>*</span>
                                            </span>
                                            <div className='flex-1'>
                                                <Controller
                                                    name='asmaY_Id'
                                                    control={form.control}
                                                    render={({ field }) => (
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={field.onChange}
                                                            disabled={isInitialLoading}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='Select' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {yearList.map((yr: any) => (
                                                                    <SelectItem key={yr.asmaY_Id} value={yr.asmaY_Id.toString()}>
                                                                        {yr.asmaY_Year}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>
                                        </Label>
                                        {form.formState.errors.asmaY_Id && (
                                            <span className='ml-34 block text-red-500 text-sm'>
                                                {form.formState.errors.asmaY_Id.message}
                                            </span>
                                        )}
                                    </div>

                                    <div className='space-y-2'>
                                        <Label className='flex items-center space-x-2 font-bold text-sm'>
                                            <span className='w-32'>
                                                Class:<span className='text-red-500'>*</span>
                                            </span>
                                            <div className='flex-1'>
                                                <Controller
                                                    name='asmcL_Id'
                                                    control={form.control}
                                                    render={({ field }) => (
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={field.onChange}
                                                            disabled={isInitialLoading}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='Select' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {classList.map((cls: any) => (
                                                                    <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                                        {cls.asmcL_ClassName}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>
                                        </Label>
                                        {form.formState.errors.asmcL_Id && (
                                            <span className='ml-34 block text-red-500 text-sm'>
                                                {form.formState.errors.asmcL_Id.message}
                                            </span>
                                        )}
                                    </div>

                                    <div className='space-y-2'>
                                        <Label className='flex items-center space-x-2 font-bold text-sm'>
                                            <span className='w-32'>
                                                Section:<span className='text-red-500'>*</span>
                                            </span>
                                            <div className='flex-1'>
                                                <Controller
                                                    name='asmS_Id'
                                                    control={form.control}
                                                    render={({ field }) => (
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={field.onChange}
                                                            disabled={isInitialLoading}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='Select' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {watchTC_allorind === '2' && <SelectItem value='0'>All</SelectItem>}
                                                                {sectionList.map((sec: any) => (
                                                                    <SelectItem key={sec.asmS_Id} value={sec.asmS_Id.toString()}>
                                                                        {sec.asmC_SectionName}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>
                                        </Label>
                                        {form.formState.errors.asmS_Id && (
                                            <span className='ml-34 block text-red-500 text-sm'>
                                                {form.formState.errors.asmS_Id.message}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Column 3 */}
                                <div className='space-y-6'>
                                    {watchTC_allorind === '1' && (
                                        <div className='space-y-2'>
                                            <Label className='flex items-center space-x-2 font-bold text-sm'>
                                                <span className='w-32'>
                                                    Student:<span className='text-red-500'>*</span>
                                                </span>
                                                <div className='flex-1'>
                                                    <Controller
                                                        name='stdid'
                                                        control={form.control}
                                                        render={({ field }) => (
                                                            <Select
                                                                value={field.value}
                                                                onValueChange={field.onChange}
                                                                disabled={studentMutation.isPending || studentList.length === 0}>
                                                                <SelectTrigger className='w-full'>
                                                                    <SelectValue placeholder='Select' />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {studentList.map((stu: any) => (
                                                                        <SelectItem key={stu.amsT_Id} value={stu.amsT_Id.toString()}>
                                                                            {stu.studentname}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                </div>
                                            </Label>
                                            {form.formState.errors.stdid && (
                                                <span className='ml-34 block text-red-500 text-sm'>
                                                    {form.formState.errors.stdid.message}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className='mt-6 flex justify-center gap-4 border-t pt-6'>
                                <Button
                                    type='submit'
                                    disabled={isGenerating}
                                    className='min-w-[120px] bg-indigo-600 font-bold text-white hover:bg-indigo-700'>
                                    {isGenerating ? (
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    ) : (
                                        <FileText className='mr-2 h-4 w-4' />
                                    )}
                                    Report
                                </Button>

                                <Button type='button' onClick={handleClear} variant='destructive' className='min-w-[120px] font-bold'>
                                    <X className='mr-2 h-4 w-4' />
                                    Cancel
                                </Button>

                                {reportType && (
                                    <Button
                                        type='button'
                                        onClick={handlePrint}
                                        className='min-w-[120px] bg-gray-600 font-bold text-white hover:bg-gray-700'>
                                        <Printer className='mr-2 h-4 w-4' />
                                        Print
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CollapsibleSection>
                </div>

                {reportType === 'student' && studentWiseReport.length > 0 && (
                    <div className='print:hidden'>
                        <CollapsibleSection
                            title='Document View Report (Student Wise)'
                            defaultOpen={true}
                            variant='outline'
                            className='mt-6 shadow-md'>
                            <div className='space-y-6 rounded-lg bg-white p-6'>
                                <div className='text-center'>
                                    <h4 className='font-bold text-xl uppercase underline'>DOCUMENT SUBMITED REPORT</h4>
                                </div>
                                <div className='mx-auto grid max-w-4xl grid-cols-1 gap-4 text-sm md:grid-cols-2'>
                                    <div className='flex'>
                                        <span className='w-32 font-bold'>Student Name:</span>
                                        <span className='font-semibold'>{reportMeta.headerName}</span>
                                    </div>
                                    <div className='flex'>
                                        <span className='w-32 font-bold'>Year:</span>
                                        <span className='font-semibold'>{reportMeta.yearName}</span>
                                    </div>
                                    <div className='flex'>
                                        <span className='w-32 font-bold'>Class:</span>
                                        <span className='font-semibold'>{reportMeta.className}</span>
                                    </div>
                                    <div className='flex'>
                                        <span className='w-32 font-bold'>Section:</span>
                                        <span className='font-semibold'>{reportMeta.sectionName}</span>
                                    </div>
                                </div>

                                <GenericDataTable
                                    data={studentWiseReport}
                                    columns={studentWiseColumns}
                                    isLoading={isGenerating}
                                    isPaginationRequired={true}
                                    onRowSelectionChange={(updatedData: any) => setSelectedStudentReport(updatedData)}
                                />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}

                {reportType === 'document' && docWiseReport.length > 0 && (
                    <div className='print:hidden'>
                        <CollapsibleSection
                            title='Document View Report (Document Wise)'
                            defaultOpen={true}
                            variant='outline'
                            className='mt-6 shadow-md'>
                            <div className='space-y-6 rounded-lg bg-white p-6'>
                                <div className='text-center'>
                                    <h4 className='font-bold text-xl uppercase underline'>
                                        DOCUMENT SUBMITED REPORT : {reportMeta.headerName}
                                    </h4>
                                </div>

                                <GenericDataTable
                                    data={docWiseReport}
                                    columns={docWiseColumns}
                                    isLoading={isGenerating}
                                    isPaginationRequired={true}
                                    onRowSelectionChange={(updatedData: any) => setSelectedDocReport(updatedData)}
                                />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
            </div>

            {/* Print Section for Student Wise */}
            {reportType === 'student' && selectedStudentReport.length > 0 && (
                <div className='hidden'>
                    <div ref={studentPrintRef} className='w-full bg-white p-4 text-black'>
                        {logoPath && (
                            <div className='mb-4 flex justify-center'>
                                <img src={logoPath} alt='Institution Logo' className='h-20 object-contain' />
                            </div>
                        )}
                        <div className='mb-6 text-center'>
                            <h4 className='font-bold text-xl uppercase underline'>DOCUMENT SUBMITED REPORT</h4>
                        </div>

                        <div className='mb-4 flex flex-wrap gap-x-12 gap-y-2 font-bold text-sm'>
                            <div>Student Name : {reportMeta.headerName}</div>
                            <div>Year : {reportMeta.yearName}</div>
                            <div>Class : {reportMeta.className}</div>
                            <div>Section : {reportMeta.sectionName}</div>
                        </div>

                        <table className='mt-4 w-full border-collapse border border-black'>
                            <thead className='bg-gray-100 font-bold'>
                                <tr>
                                    <th className='border border-black p-2 text-center'>SL. No.</th>
                                    <th className='border border-black p-2 text-center'>Document Name</th>
                                    <th className='border border-black p-2 text-center'>Status</th>
                                    <th className='border border-black p-2 text-center'>Remarks</th>
                                    <th className='border border-black p-2 text-center' style={{ width: '30%' }}>
                                        Document
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedStudentReport.map((user, index) => (
                                    <tr key={index}>
                                        <td className='border border-black p-2 text-center'>{index + 1}</td>
                                        <td className='border border-black p-2'>{user.docname}</td>
                                        <td className='border border-black p-2'>{user.statuss}</td>
                                        <td className='border border-black p-2'>{user.submited}</td>
                                        <td className='border border-black p-2 text-center'>
                                            {user.docpath &&
                                                (user.filetype === 'pdf' ? (
                                                    <span className='font-bold'>PDF Document</span>
                                                ) : (
                                                    <img src={user.docpath} alt='Document' className='mx-auto h-16 w-16 object-cover' />
                                                ))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={5} className='border-black border-t py-4 text-center font-semibold text-sm'>
                                        Date: {format(new Date(), 'dd/MM/yyyy')} | UserName: User
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* Print Section for Document Wise */}
            {reportType === 'document' && selectedDocReport.length > 0 && (
                <div className='hidden'>
                    <div ref={docPrintRef} className='w-full bg-white p-4 text-black'>
                        {logoPath && (
                            <div className='mb-4 flex justify-center'>
                                <img src={logoPath} alt='Institution Logo' className='h-20 object-contain' />
                            </div>
                        )}
                        <div className='mb-6 text-center'>
                            <h4 className='font-bold text-xl uppercase underline'>DOCUMENT SUBMITED REPORT : {reportMeta.headerName}</h4>
                        </div>

                        <table className='mt-4 w-full border-collapse border border-black text-sm'>
                            <thead className='bg-gray-100 font-bold'>
                                <tr>
                                    <th className='border border-black p-2 text-center'>SL. No.</th>
                                    <th className='border border-black p-2 text-center'>Student Name</th>
                                    <th className='border border-black p-2 text-center'>Admno</th>
                                    <th className='border border-black p-2 text-center'>Class</th>
                                    <th className='border border-black p-2 text-center'>Section</th>
                                    <th className='border border-black p-2 text-center'>Status</th>
                                    <th className='border border-black p-2 text-center'>Remarks</th>
                                    <th className='border border-black p-2 text-center' style={{ width: '20%' }}>
                                        Document
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedDocReport.map((user, index) => (
                                    <tr key={index}>
                                        <td className='border border-black p-2 text-center'>{index + 1}</td>
                                        <td className='border border-black p-2'>{user.studentnam}</td>
                                        <td className='border border-black p-2'>{user.admno}</td>
                                        <td className='border border-black p-2'>{user.classname}</td>
                                        <td className='border border-black p-2'>{user.sectionname}</td>
                                        <td className='border border-black p-2'>{user.statuss}</td>
                                        <td className='border border-black p-2'>{user.submited}</td>
                                        <td className='border border-black p-2 text-center'>
                                            {user.docpath &&
                                                (user.filetype === 'pdf' ? (
                                                    <span className='font-bold'>PDF Document</span>
                                                ) : (
                                                    <img src={user.docpath} alt='Document' className='mx-auto h-16 w-16 object-cover' />
                                                ))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={8} className='border-black border-t py-4 text-center font-semibold text-sm'>
                                        Date: {format(new Date(), 'dd/MM/yyyy')} | UserName: User
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}
