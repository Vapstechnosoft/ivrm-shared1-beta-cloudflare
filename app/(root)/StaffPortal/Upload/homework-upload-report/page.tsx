'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FileAttachmentModal } from './_components/file-attachment-modal';
import { HomeworkReportTable } from './_components/homework-report-table';

interface Class {
    ASMCL_Id: number;
    ASMCL_ClassName: string;
    selected?: boolean;
}

interface Section {
    ASMS_Id: number;
    ASMC_SectionName: string;
    selected?: boolean;
}

interface HomeworkReport {
    IHW_Id: number;
    IHW_Topic: string;
    ASMCL_ClassName: string;
    ASMC_SectionName: string;
    ISMS_SubjectName: string;
    IHWUPL_FileName: string;
    IHWUPL_Date: string;
    employeename?: string;
    UserName?: string;
    IHW_Attachment?: string;
    asmaY_Id: number;
}

interface FileAttachment {
    ihwatT_FileName: string;
    ihwatT_Attachment: string;
    ihW_Attachment: string;
}

export default function HomeworkUploadReportPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [classes, setClasses] = useState<Class[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [reportData, setReportData] = useState<HomeworkReport[]>([]);
    const [fromDate, setFromDate] = useState<Date | undefined>();
    const [toDate, setToDate] = useState<Date | undefined>();
    const [searchTerm, setSearchTerm] = useState('');
    const [showReport, setShowReport] = useState(false);
    const [allSelected, setAllSelected] = useState(false);
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [classSearchTerm, setClassSearchTerm] = useState('');
    const [allSectionsSelected, setAllSectionsSelected] = useState(false);
    const [selectedSections, setSelectedSections] = useState<number[]>([]);
    const [sectionSearchTerm, setSectionSearchTerm] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Modal states
    const [showAttachmentModal, setShowAttachmentModal] = useState(false);
    const [selectedAttachments, setSelectedAttachments] = useState<FileAttachment[]>([]);

    // Print and export refs
    const printSectionRef = useRef<HTMLDivElement>(null);
    const excelTableRef = useRef<HTMLTableElement>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm();

    useEffect(() => {
        loadClasses();
    }, []);

    useEffect(() => {
        if (selectedClasses.length === 0) {
            setSections([]);
            setSelectedSections([]);
            setAllSectionsSelected(false);
            return;
        }

        // Mock data - replace with actual API call
        const mockSections: Section[] = [];

        selectedClasses.forEach((classId) => {
            const className = classes.find((c) => c.ASMCL_Id === classId)?.ASMCL_ClassName || `Class ${classId}`;
            mockSections.push({ ASMS_Id: classId * 10 + 1, ASMC_SectionName: `Section A`, selected: false });
            mockSections.push({ ASMS_Id: classId * 10 + 2, ASMC_SectionName: `Section B`, selected: false });
        });

        setSections((prevSections) => {
            const previouslySelected = new Set(prevSections.filter((s) => s.selected).map((s) => s.ASMS_Id));
            return mockSections.map((sec) => ({
                ...sec,
                selected: previouslySelected.has(sec.ASMS_Id)
            }));
        });

        setSelectedSections((prev) => {
            const availableSectionIds = new Set(mockSections.map((s) => s.ASMS_Id));
            const newSelected = prev.filter((id) => availableSectionIds.has(id));
            setAllSectionsSelected(mockSections.length > 0 && newSelected.length === mockSections.length);
            return newSelected;
        });
    }, [selectedClasses, classes]);

    const loadClasses = async () => {
        try {
            // Mock data - replace with actual API call
            const mockClasses: Class[] = [
                { ASMCL_Id: 1, ASMCL_ClassName: 'Class 1', selected: false },
                { ASMCL_Id: 2, ASMCL_ClassName: 'Class 2', selected: false },
                { ASMCL_Id: 3, ASMCL_ClassName: 'Class 3', selected: false },
                { ASMCL_Id: 4, ASMCL_ClassName: 'Class 4', selected: false },
                { ASMCL_Id: 5, ASMCL_ClassName: 'Class 5', selected: false }
            ];
            setClasses(mockClasses);
            setIsLoading(false);
        } catch (error) {
            console.error('Error loading classes:', error);
            setIsLoading(false);
        }
    };

    const toggleAllClasses = (checked: boolean) => {
        setAllSelected(checked);
        setClasses((prev) => prev.map((cls) => ({ ...cls, selected: checked })));
        if (checked) {
            setSelectedClasses(classes.map((cls) => cls.ASMCL_Id));
        } else {
            setSelectedClasses([]);
        }
    };

    const toggleClass = (classId: number, checked: boolean) => {
        setClasses((prev) => prev.map((cls) => (cls.ASMCL_Id === classId ? { ...cls, selected: checked } : cls)));

        setSelectedClasses((prev) => {
            if (checked) {
                return [...prev, classId];
            } else {
                return prev.filter((id) => id !== classId);
            }
        });

        // Update allSelected state
        const updatedClasses = classes.map((cls) => (cls.ASMCL_Id === classId ? { ...cls, selected: checked } : cls));
        setAllSelected(updatedClasses.every((cls) => cls.selected));
    };

    const toggleAllSections = (checked: boolean) => {
        setAllSectionsSelected(checked);
        setSections((prev) => prev.map((sec) => ({ ...sec, selected: checked })));
        if (checked) {
            setSelectedSections(sections.map((sec) => sec.ASMS_Id));
        } else {
            setSelectedSections([]);
        }
    };

    const toggleSection = (sectionId: number, checked: boolean) => {
        setSections((prev) => prev.map((sec) => (sec.ASMS_Id === sectionId ? { ...sec, selected: checked } : sec)));

        setSelectedSections((prev) => {
            if (checked) {
                return [...prev, sectionId];
            } else {
                return prev.filter((id) => id !== sectionId);
            }
        });

        // Update allSelected state
        const updatedSections = sections.map((sec) => (sec.ASMS_Id === sectionId ? { ...sec, selected: checked } : sec));
        setAllSectionsSelected(updatedSections.every((sec) => sec.selected));
    };

    const generateReport = async () => {
        if (!fromDate || !toDate) {
            alert('Please select both From Date and To Date');
            return;
        }

        if (selectedClasses.length === 0) {
            alert('Please select at least one class');
            return;
        }

        if (selectedSections.length === 0) {
            alert('Please select at least one section');
            return;
        }

        try {
            setIsGenerating(true);

            // Mock API call - replace with actual implementation
            const mockReportData: HomeworkReport[] = [
                {
                    IHW_Id: 1,
                    IHW_Topic: 'Mathematics Assignment',
                    ASMCL_ClassName: 'Class 1',
                    ASMC_SectionName: 'Section A',
                    ISMS_SubjectName: 'Mathematics',
                    IHWUPL_FileName: 'math_assignment.pdf',
                    IHWUPL_Date: '2025-01-15',
                    employeename: 'John Teacher',
                    IHW_Attachment: '/uploads/homework/math_assignment.pdf',
                    asmaY_Id: 1
                },
                {
                    IHW_Id: 2,
                    IHW_Topic: 'Science Project',
                    ASMCL_ClassName: 'Class 2',
                    ASMC_SectionName: 'Section B',
                    ISMS_SubjectName: 'Science',
                    IHWUPL_FileName: 'science_project.docx',
                    IHWUPL_Date: '2025-01-16',
                    UserName: 'Jane Teacher',
                    IHW_Attachment: '/uploads/homework/science_project.docx',
                    asmaY_Id: 1
                }
            ];

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setReportData(mockReportData);
            setShowReport(true);
            setIsGenerating(false);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Error generating report');
            setIsGenerating(false);
        }
    };

    const viewAttachments = async (report: HomeworkReport) => {
        try {
            // Mock API call - replace with actual implementation
            const mockAttachments: FileAttachment[] = [
                {
                    ihwatT_FileName: report.IHWUPL_FileName,
                    ihwatT_Attachment: report.IHW_Attachment || '',
                    ihW_Attachment: 'File'
                }
            ];
            setSelectedAttachments(mockAttachments);
            setShowAttachmentModal(true);
        } catch (error) {
            console.error('Error loading attachments:', error);
        }
    };

    const exportToExcel = () => {
        if (reportData.length === 0) {
            alert('No data to export');
            return;
        }

        // Create CSV content
        const headers = ['SL.NO', 'Topic', 'Class Name', 'Section Name', 'Subject', 'File Name', 'Upload Date', 'Upload By'];
        const csvContent = [
            headers.join(','),
            ...reportData.map((item, index) =>
                [
                    index + 1,
                    `"${item.IHW_Topic}"`,
                    `"${item.ASMCL_ClassName}"`,
                    `"${item.ASMC_SectionName}"`,
                    `"${item.ISMS_SubjectName}"`,
                    `"${item.IHWUPL_FileName}"`,
                    `"${format(new Date(item.IHWUPL_Date), 'dd-MM-yyyy')}"`,
                    `"${item.employeename || item.UserName || ''}"`
                ].join(',')
            )
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `homework_report_${format(new Date(), 'dd-MM-yyyy')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const printReport = () => {
        if (reportData.length === 0) {
            alert('No data to print');
            return;
        }

        const printContent = printSectionRef.current?.innerHTML;
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
      <html>
        <head>
          <title>Homework Upload Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; }
            .text-center { text-align: center; }
            .header { margin-bottom: 30px; }
            @media print {
              body { margin: 10px; }
              table { font-size: 12px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 class="text-center">Homework Upload Report</h2>
            <p class="text-center">Date: ${format(new Date(), 'dd/MM/yyyy')}</p>
          </div>
          ${printContent}
        </body>
      </html>
    `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    const clearData = () => {
        window.location.reload();
    };

    const filteredClasses = classes.filter((cls) => cls.ASMCL_ClassName.toLowerCase().includes(classSearchTerm.toLowerCase()));

    const filteredSections = sections.filter((sec) => sec.ASMC_SectionName.toLowerCase().includes(sectionSearchTerm.toLowerCase()));

    if (isLoading) {
        return (
            <div className='flex min-h-screen items-center justify-center'>
                <div className='h-32 w-32 animate-spin rounded-full border-primary border-b-2'></div>
            </div>
        );
    }

    return (
        <div className='container mx-auto space-y-6 p-6'>
            <div className='flex items-center justify-between'>
                <h1 className='font-bold text-3xl'>Homework Upload Report</h1>
            </div>

            {/* Report Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Generate Report</CardTitle>
                    <CardDescription>Select date range and classes to generate homework upload report</CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label>
                                From Date <span className='text-red-500'>*</span>
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant='outline'
                                        className={cn('w-full justify-start text-left font-normal', !fromDate && 'text-muted-foreground')}>
                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                        {fromDate ? format(fromDate, 'PPP') : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0'>
                                    <Calendar mode='single' selected={fromDate} onSelect={setFromDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                To Date <span className='text-red-500'>*</span>
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant='outline'
                                        className={cn('w-full justify-start text-left font-normal', !toDate && 'text-muted-foreground')}>
                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                        {toDate ? format(toDate, 'PPP') : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0'>
                                    <Calendar
                                        mode='single'
                                        selected={toDate}
                                        onSelect={setToDate}
                                        disabled={(date) => (fromDate ? date < fromDate : false)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label>
                                Class Name <span className='text-red-500'>*</span>
                            </Label>
                            <div className='max-h-48 overflow-y-auto rounded-md border p-4'>
                                <div className='space-y-2'>
                                    <div className='mb-4 flex items-center space-x-2 border-b pb-2'>
                                        <Input
                                            placeholder='Search here...'
                                            value={classSearchTerm}
                                            onChange={(e) => setClassSearchTerm(e.target.value)}
                                            className='flex-1'
                                        />
                                    </div>

                                    {classSearchTerm.length === 0 && (
                                        <div className='flex items-center space-x-2 p-2'>
                                            <Checkbox id='select-all' checked={allSelected} onCheckedChange={toggleAllClasses} />
                                            <Label htmlFor='select-all' className='font-medium'>
                                                All
                                            </Label>
                                        </div>
                                    )}

                                    {filteredClasses.map((cls) => (
                                        <div key={cls.ASMCL_Id} className='flex items-center space-x-2 p-2'>
                                            <Checkbox
                                                id={`class-${cls.ASMCL_Id}`}
                                                checked={cls.selected || false}
                                                onCheckedChange={(checked) => toggleClass(cls.ASMCL_Id, checked as boolean)}
                                            />
                                            <Label htmlFor={`class-${cls.ASMCL_Id}`} className='flex-1'>
                                                {cls.ASMCL_ClassName}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Section Name <span className='text-red-500'>*</span>
                            </Label>
                            <div className='max-h-48 overflow-y-auto rounded-md border p-4'>
                                <div className='space-y-2'>
                                    <div className='mb-4 flex items-center space-x-2 border-b pb-2'>
                                        <Input
                                            placeholder='Search here...'
                                            value={sectionSearchTerm}
                                            onChange={(e) => setSectionSearchTerm(e.target.value)}
                                            className='flex-1'
                                        />
                                    </div>

                                    {sectionSearchTerm.length === 0 && (
                                        <div className='flex items-center space-x-2 p-2'>
                                            <Checkbox
                                                id='select-all-sections'
                                                checked={allSectionsSelected}
                                                onCheckedChange={toggleAllSections}
                                            />
                                            <Label htmlFor='select-all-sections' className='font-medium'>
                                                All
                                            </Label>
                                        </div>
                                    )}

                                    {filteredSections.map((sec) => (
                                        <div key={sec.ASMS_Id} className='flex items-center space-x-2 p-2'>
                                            <Checkbox
                                                id={`section-${sec.ASMS_Id}`}
                                                checked={sec.selected || false}
                                                onCheckedChange={(checked) => toggleSection(sec.ASMS_Id, checked as boolean)}
                                            />
                                            <Label htmlFor={`section-${sec.ASMS_Id}`} className='flex-1'>
                                                {sec.ASMC_SectionName}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-center space-x-4'>
                        <Button
                            onClick={generateReport}
                            disabled={
                                isGenerating || !fromDate || !toDate || selectedClasses.length === 0 || selectedSections.length === 0
                            }>
                            {isGenerating ? 'Generating...' : 'Generate Report'}
                        </Button>
                        <Button variant='outline' onClick={clearData}>
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Report Results */}
            {showReport && (
                <HomeworkReportTable
                    reportData={reportData}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onViewAttachments={viewAttachments}
                    onExportToExcel={exportToExcel}
                    onPrint={printReport}
                />
            )}

            {/* Hidden Print Section */}
            <div ref={printSectionRef} className='hidden'>
                <table className='w-full border-collapse border'>
                    <thead>
                        <tr>
                            <th className='border p-2'>SL.NO</th>
                            <th className='border p-2'>Topic</th>
                            <th className='border p-2'>Class Name</th>
                            <th className='border p-2'>Section Name</th>
                            <th className='border p-2'>Subject</th>
                            <th className='border p-2'>File Name</th>
                            <th className='border p-2'>Upload Date</th>
                            <th className='border p-2'>Upload By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((item, index) => (
                            <tr key={item.IHW_Id}>
                                <td className='border p-2 text-center'>{index + 1}</td>
                                <td className='border p-2 text-center'>{item.IHW_Topic}</td>
                                <td className='border p-2 text-center'>{item.ASMCL_ClassName}</td>
                                <td className='border p-2 text-center'>{item.ASMC_SectionName}</td>
                                <td className='border p-2 text-center'>{item.ISMS_SubjectName}</td>
                                <td className='border p-2 text-center'>{item.IHWUPL_FileName}</td>
                                <td className='border p-2 text-center'>{format(new Date(item.IHWUPL_Date), 'dd-MM-yyyy')}</td>
                                <td className='border p-2'>{item.employeename || item.UserName || ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* File Attachment Modal */}
            <FileAttachmentModal
                isOpen={showAttachmentModal}
                onClose={() => setShowAttachmentModal(false)}
                attachments={selectedAttachments}
            />
        </div>
    );
}
