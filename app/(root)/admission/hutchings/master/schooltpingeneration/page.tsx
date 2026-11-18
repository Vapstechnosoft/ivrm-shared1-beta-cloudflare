'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, Plus, Printer, Search, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
    useGenerateSchoolTpinMutation,
    useSchoolTpinGenerationInitialDetails,
    useSearchSchoolTpinGenerationMutation
} from '@/hooks/admission/hutchings/useSchoolTpinGeneration';

const formSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required')
});

type FormValues = z.infer<typeof formSchema>;

export default function SchoolTpinGeneration() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [selectedYearName, setSelectedYearName] = useState<string>('');
    const [notGeneratedList, setNotGeneratedList] = useState<any[]>([]);
    const [generatedList, setGeneratedList] = useState<any[]>([]);

    const [isGeneratedModalOpen, setIsGeneratedModalOpen] = useState(false);
    const [isNotGeneratedModalOpen, setIsNotGeneratedModalOpen] = useState(false);

    const printRef = useRef<HTMLDivElement>(null);

    // Fetch initial details (Academic Years)
    const { data: initialDetails, isLoading: isInitialLoading } = useSchoolTpinGenerationInitialDetails();
    const academicYears: any[] = Array.isArray(initialDetails?.data)
        ? initialDetails.data
        : Array.isArray(initialDetails?.getyearlist)
          ? initialDetails.getyearlist
          : [];

    const searchMutation = useSearchSchoolTpinGenerationMutation();
    const generateMutation = useGenerateSchoolTpinMutation();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ASMAY_Id: ''
        }
    });

    const onSubmit = (data: FormValues) => {
        const yearObj = academicYears.find((y: any) => y.asmaY_Id.toString() === data.ASMAY_Id);
        if (yearObj) {
            setSelectedYearName(yearObj.asmaY_Year);
        }

        searchMutation.mutate(
            { ASMAY_Id: Number(data.ASMAY_Id) },
            {
                onSuccess: (res: any) => {
                    let notGen: any[] = [];
                    let gen: any[] = [];
                    const responseData = res?.data || res;

                    if (responseData?.studentList || responseData?.studentList1) {
                        const allStudents = [...(responseData.studentList || []), ...(responseData.studentList1 || [])];
                        notGen = allStudents.filter((s: any) => !s.tpin);
                        gen = allStudents.filter((s: any) => s.tpin);
                    } else {
                        notGen = responseData?.gettpinnotgeneratedliststudent || [];
                        gen = responseData?.gettpingeneratedliststudent || [];
                    }

                    setNotGeneratedList(notGen);
                    setGeneratedList(gen);

                    if (notGen.length > 0 || gen.length > 0) {
                        setReportData([
                            {
                                id: 1,
                                year: yearObj?.asmaY_Year || '',
                                notgeneratedlist: notGen,
                                genereatedlist: gen
                            }
                        ]);
                    } else {
                        setReportData([]);
                        toast.error('No Records Found');
                    }
                },
                onError: () => {
                    toast.error('Failed to fetch data');
                }
            }
        );
    };

    const handleClear = () => {
        form.reset();
        setReportData([]);
        setNotGeneratedList([]);
        setGeneratedList([]);
        setSelectedYearName('');
    };

    const handleGenerateTpin = () => {
        const asmayId = form.getValues('ASMAY_Id');
        if (!asmayId) return;

        generateMutation.mutate(
            { ASMAY_Id: Number(asmayId) },
            {
                onSuccess: (res: any) => {
                    if (res?.success === true || res?.returnval === true) {
                        toast.success(res?.message || 'Tpin Number Generated Successfully');
                        setIsNotGeneratedModalOpen(false);
                        // Re-fetch data
                        onSubmit(form.getValues());
                    } else {
                        toast.error(res?.message || 'Failed to Generate Tpin Number');
                    }
                },
                onError: () => {
                    toast.error('Failed to generate Tpin Number');
                }
            }
        );
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Tpin_Generated_Student_List'
    });

    const mainColumns = [
        {
            id: 'slno',
            header: () => <div className='text-center font-bold text-black'>SL.No.</div>,
            cell: (info: any) => <div className='text-center'>{info.row.index + 1}</div>
        },
        {
            accessorKey: 'year',
            header: () => <div className='text-center font-bold text-black'>Year</div>,
            cell: (info: any) => <div className='text-center'>{info.getValue()}</div>
        },
        {
            id: 'generated',
            header: () => <div className='text-center font-bold text-black'>Tpin Generated Students List</div>,
            cell: (info: any) => {
                const list = info.row.original.genereatedlist;
                if (list && list.length > 0) {
                    return (
                        <div className='text-center'>
                            <Button variant='link' className='h-auto p-0 text-blue-600' onClick={() => setIsGeneratedModalOpen(true)}>
                                View Details <Eye className='ml-1 h-4 w-4' />
                            </Button>
                        </div>
                    );
                }
                return <div className='text-center'>No Students</div>;
            }
        },
        {
            id: 'notGenerated',
            header: () => <div className='text-center font-bold text-black'>Tpin Not Generated Students List</div>,
            cell: (info: any) => {
                const list = info.row.original.notgeneratedlist;
                if (list && list.length > 0) {
                    return (
                        <div className='text-center'>
                            <Button variant='link' className='h-auto p-0 text-blue-600' onClick={() => setIsNotGeneratedModalOpen(true)}>
                                View Details <Eye className='ml-1 h-4 w-4' />
                            </Button>
                        </div>
                    );
                }
                return <div className='text-center'>No Students</div>;
            }
        }
    ];

    const studentColumns = [
        {
            id: 'slno',
            header: () => <div className='text-center font-bold text-black'>SLNO</div>,
            cell: (info: any) => <div className='text-center'>{info.row.index + 1}</div>
        },
        {
            accessorKey: 'studentname',
            header: () => <div className='text-center font-bold text-black'>Student Name</div>,
            cell: (info: any) => <div className='text-center'>{info.getValue()}</div>
        },
        {
            accessorKey: 'admno',
            header: () => <div className='text-center font-bold text-black'>Admno</div>,
            cell: (info: any) => <div className='text-center'>{info.getValue()}</div>
        },
        {
            accessorKey: 'classname',
            header: () => <div className='text-center font-bold text-black'>Class</div>,
            cell: (info: any) => <div className='text-center'>{info.getValue()}</div>
        },
        {
            accessorKey: 'sectionname',
            header: () => <div className='text-center font-bold text-black'>Section</div>,
            cell: (info: any) => <div className='text-center'>{info.getValue()}</div>
        }
    ];

    const generatedStudentColumns = [
        ...studentColumns,
        {
            accessorKey: 'tpin',
            header: () => <div className='text-center font-bold text-black'>Tpin</div>,
            cell: (info: any) => <div className='text-center'>{info.getValue()}</div>
        }
    ];

    return (
        <div className='min-h-screen space-y-6 p-4'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                    <CollapsibleSection
                        title='Tpin Generation'
                        description='Select Academic Year to search'
                        defaultOpen={true}
                        variant='outline'
                        className='shadow-lg'>
                        <div className='mx-auto flex max-w-2xl flex-col items-center justify-center gap-8 bg-white p-6'>
                            <div className='w-full max-w-md'>
                                <FormField
                                    control={form.control}
                                    name='ASMAY_Id'
                                    render={({ field }) => (
                                        <FormItem className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                            <FormLabel className='m-0 text-right font-bold text-sm'>
                                                Academic Year:<span className='text-red-500'>*</span>
                                            </FormLabel>
                                            <div className='space-y-1'>
                                                <Select
                                                    onValueChange={(val) => {
                                                        field.onChange(val);
                                                        setReportData([]); // clear grid on change
                                                    }}
                                                    value={field.value}
                                                    disabled={isInitialLoading}>
                                                    <FormControl>
                                                        <SelectTrigger className='h-8'>
                                                            <SelectValue placeholder='Select Academic Year' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {(Array.isArray(academicYears) ? academicYears : []).map((item: any) => (
                                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                {item.asmaY_Year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className='flex flex-wrap items-center justify-center gap-4'>
                                <Button
                                    type='submit'
                                    disabled={searchMutation.isPending}
                                    className='min-w-[100px] bg-blue-600 text-white hover:bg-blue-700'>
                                    <Search className='mr-2 h-4 w-4' /> Search
                                </Button>
                                <Button
                                    type='button'
                                    onClick={handleClear}
                                    className='min-w-[100px] bg-red-500 text-white hover:bg-red-600'>
                                    <X className='mr-2 h-4 w-4' /> Cancel
                                </Button>
                            </div>
                        </div>
                    </CollapsibleSection>
                </form>
            </Form>

            {reportData.length > 0 && (
                <CollapsibleSection title='Tpin Generation' defaultOpen={true} variant='outline' className='shadow-lg'>
                    <div className='bg-white p-4'>
                        <GenericDataTable
                            data={reportData}
                            columns={mainColumns}
                            isLoading={searchMutation.isPending}
                            isPaginationRequired={true}
                            isSearchRequired={true}
                        />
                    </div>
                </CollapsibleSection>
            )}

            {/* Modal for Tpin Not Generated List */}
            <Dialog open={isNotGeneratedModalOpen} onOpenChange={setIsNotGeneratedModalOpen}>
                <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle>Tpin Not Generated Students List</DialogTitle>
                    </DialogHeader>
                    <div className='mt-4'>
                        <GenericDataTable
                            data={notGeneratedList}
                            columns={studentColumns}
                            isLoading={false}
                            isPaginationRequired={true}
                            isSearchRequired={true}
                        />
                    </div>
                    <DialogFooter className='mt-4 flex gap-2'>
                        <Button variant='outline' onClick={() => setIsNotGeneratedModalOpen(false)}>
                            Close
                        </Button>
                        <Button
                            onClick={handleGenerateTpin}
                            disabled={generateMutation.isPending}
                            className='bg-blue-600 text-white hover:bg-blue-700'>
                            <Plus className='mr-2 h-4 w-4' /> Generate Tpin
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal for Tpin Generated List */}
            <Dialog open={isGeneratedModalOpen} onOpenChange={setIsGeneratedModalOpen}>
                <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle>Tpin Generated Students List</DialogTitle>
                    </DialogHeader>
                    <div className='mt-4'>
                        <GenericDataTable
                            data={generatedList}
                            columns={generatedStudentColumns}
                            isLoading={false}
                            isPaginationRequired={true}
                            isSearchRequired={true}
                        />
                    </div>
                    <DialogFooter className='mt-4 flex gap-2'>
                        <Button variant='outline' onClick={() => setIsGeneratedModalOpen(false)}>
                            Close
                        </Button>
                        <Button onClick={handlePrint} className='bg-gray-200 text-gray-800 hover:bg-gray-300'>
                            <Printer className='mr-2 h-4 w-4' /> Print
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Print Layout */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: 0,
                    height: 0,
                    overflow: 'visible',
                    opacity: 0,
                    pointerEvents: 'none',
                    zIndex: -1
                }}>
                <div ref={printRef} className='p-8 print-preview-container min-h-full w-full bg-white text-black'>
                    <style
                        dangerouslySetInnerHTML={{
                            __html: `
                                @media print {
                                    @page { margin: 0; size: A4 portrait; }
                                    body { visibility: hidden; background: white; }
                                    .print-preview-container { visibility: visible !important; position: absolute; left: 0; top: 0; width: 100%; background: white; color: black; padding: 10mm; }
                                    .print-preview-container * { visibility: visible !important; }
                                }
                            `
                        }}
                    />
                    <div className='mb-6 text-center'>
                        <h4 className='font-bold text-xl'>Tpin Generated Student List</h4>
                        <p className='text-md'>Academic Year: {selectedYearName}</p>
                    </div>
                    <table className='mt-4 w-full border-collapse border border-gray-300 text-sm'>
                        <thead>
                            <tr className='bg-gray-100'>
                                <th className='border border-gray-300 p-2 text-center'>SLNO</th>
                                <th className='border border-gray-300 p-2 text-left'>Student Name</th>
                                <th className='border border-gray-300 p-2 text-left'>Admno</th>
                                <th className='border border-gray-300 p-2 text-left'>Class</th>
                                <th className='border border-gray-300 p-2 text-left'>Section</th>
                                <th className='border border-gray-300 p-2 text-left'>Tpin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {generatedList.map((user, index) => (
                                <tr key={index}>
                                    <td className='border border-gray-300 p-2 text-center'>{index + 1}</td>
                                    <td className='border border-gray-300 p-2 text-left'>{user.studentname}</td>
                                    <td className='border border-gray-300 p-2 text-left'>{user.admno}</td>
                                    <td className='border border-gray-300 p-2 text-left'>{user.classname}</td>
                                    <td className='border border-gray-300 p-2 text-left'>{user.sectionname}</td>
                                    <td className='border border-gray-300 p-2 text-left'>{user.tpin}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
