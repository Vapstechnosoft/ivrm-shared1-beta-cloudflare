'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocumentViewClgInitialData, useDocumentViewClgReport, useDocumentViewClgBranch, useDocumentViewClgSemester } from '@/hooks/college/useCollegeReports';
import { IDocumentViewClgStudent } from '@/types/college/reports';
import { FileText, RotateCcw, Search, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getDocumentViewColumns } from './_components/columns';

interface LocalItem {
    id: number;
    name: string;
    selected: boolean;
}

export default function DocumentViewClgPage() {
    const { data: initialData, isLoading: initialLoading } = useDocumentViewClgInitialData();
    const { mutateAsync: getReport, isPending: searchLoading } = useDocumentViewClgReport();
    const { mutateAsync: getBranch } = useDocumentViewClgBranch();
    const { mutateAsync: getSemester } = useDocumentViewClgSemester();

    const [academicYearId, setAcademicYearId] = useState<string>('');

    // Local state for select checklists
    const [courses, setCourses] = useState<LocalItem[]>([]);
    const [branches, setBranches] = useState<LocalItem[]>([]);
    const [semesters, setSemesters] = useState<LocalItem[]>([]);

    // Search filters for checklist columns
    const [courseQuery, setCourseQuery] = useState('');
    const [branchQuery, setBranchQuery] = useState('');
    const [semesterQuery, setSemesterQuery] = useState('');

    const [selectAllCourses, setSelectAllCourses] = useState(false);
    const [selectAllBranches, setSelectAllBranches] = useState(false);
    const [selectAllSemesters, setSelectAllSemesters] = useState(false);

    const [reportData, setReportData] = useState<IDocumentViewClgStudent[]>([]);
    const [showResults, setShowResults] = useState(false);

    // Photo Preview modal state
    const [isPhotoOpen, setIsPhotoOpen] = useState(false);
    const [previewPhotoUrl, setPreviewPhotoUrl] = useState('');
    const [previewPhotoTitle, setPreviewPhotoTitle] = useState('');

    const yearList = initialData?.data?.yearList || initialData?.data?.academicYearList || initialData?.data?.fillyear || [];

    // Populate local lists when initial data changes
    useEffect(() => {
        if (initialData?.data) {
            const rawCourses = initialData.data.courseList || initialData.data.courses || initialData.data.allcourse || initialData.data.admissioncatdrp || initialData.data.admissioncatdrpall || [];
            const rawBranches = initialData.data.branchList || initialData.data.branches || [];
            const rawSemesters = initialData.data.semesterList || initialData.data.semesters || [];

            setCourses(rawCourses.map((c: any) => ({ id: c.amcO_Id, name: c.amcO_CourseName, selected: false })));
            setBranches(rawBranches.map((b: any) => ({ id: b.amB_Id, name: b.amB_BranchName, selected: false })));
            setSemesters(rawSemesters.map((s: any) => ({ id: s.amsE_Id, name: s.amsE_SEMName, selected: false })));
        }
    }, [initialData]);

    // Fetch branches when selected courses change
    useEffect(() => {
        const fetchBranches = async () => {
            const selectedCourses = courses.filter((c) => c.selected).map((c) => c.id);
            if (!academicYearId || selectedCourses.length === 0) {
                return;
            }

            try {
                const payload = {
                    asmaY_Id: Number(academicYearId),
                    courselsttwo: selectedCourses.map(id => ({ amcO_Id: id }))
                };
                const res = await getBranch(payload);
                const rawBranches = res?.data?.branchlisttwo || res?.data?.branchlist || res?.data?.branches || [];
                
                setBranches(prev => {
                    return rawBranches.map((b: any) => {
                        const existing = prev.find((eb) => eb.id === b.amB_Id);
                        return { id: b.amB_Id, name: b.amB_BranchName, selected: existing ? existing.selected : false };
                    });
                });
            } catch (error) {
                console.error("Failed to fetch branches", error);
            }
        };

        fetchBranches();
    }, [courses, academicYearId]);

    // Fetch semesters when selected branches change
    useEffect(() => {
        const fetchSemesters = async () => {
            const selectedCourses = courses.filter((c) => c.selected).map((c) => c.id);
            const selectedBranches = branches.filter((b) => b.selected).map((b) => b.id);
            if (!academicYearId || selectedCourses.length === 0 || selectedBranches.length === 0) {
                return;
            }

            try {
                const payload = {
                    asmaY_Id: Number(academicYearId),
                    courselsttwo: selectedCourses.map(id => ({ amcO_Id: id })),
                    branchlisttwo: selectedBranches.map(id => ({ amB_Id: id }))
                };
                const res = await getSemester(payload);
                let rawSemesters = [];
                if (Array.isArray(res?.data)) {
                    rawSemesters = res.data;
                } else {
                    rawSemesters = res?.data?.semesterlisttwo || res?.data?.semesterlist || res?.data?.semesters || [];
                }
                
                setSemesters(prev => {
                    return rawSemesters.map((s: any) => {
                        const existing = prev.find((es) => es.id === s.amsE_Id);
                        return { id: s.amsE_Id, name: s.amsE_SEMName, selected: existing ? existing.selected : false };
                    });
                });
            } catch (error) {
                console.error("Failed to fetch semesters", error);
            }
        };

        fetchSemesters();
    }, [branches, courses, academicYearId]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!academicYearId) {
            toast.error('Please select Academic Year');
            return;
        }

        const selectedCourses = courses.filter((c) => c.selected).map((c) => c.id);
        const selectedBranches = branches.filter((b) => b.selected).map((b) => b.id);
        const selectedSemesters = semesters.filter((s) => s.selected).map((s) => s.id);

        if (selectedCourses.length === 0) {
            toast.error('Please select at least one Course');
            return;
        }
        if (selectedBranches.length === 0) {
            toast.error('Please select at least one Branch');
            return;
        }
        if (selectedSemesters.length === 0) {
            toast.error('Please select at least one Semester');
            return;
        }

        try {
            const payload = {
                asmaY_Id: Number(academicYearId),
                configurationsettings1: 0,
                courselsttwo: selectedCourses.map(id => ({ amcO_Id: id })),
                branchlisttwo: selectedBranches.map(id => ({ amB_Id: id })),
                semesterlisttwo: selectedSemesters.map(id => ({ amsE_Id: id }))
            };

            const res = await getReport(payload);
            let list = res?.data?.searchstudentDetails || res?.data?.list || res?.data?.registrationList || [];
            
            // Map documents to their respective students if ddoc is returned separately
            if (res?.data?.ddoc && res.data.ddoc.length > 0 && list.length > 0) {
                list = list.map((student: any) => ({
                    ...student,
                    doclist: res.data.ddoc.filter((doc: any) => doc.pacA_Id === student.pacA_Id)
                }));
            }

            setReportData(list);
            setShowResults(true);
            if (list.length > 0) {
                toast.success('Report Generated Successfully');
            } else {
                toast.warning('No Records Found');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate report');
        }
    };

    const handleCancel = () => {
        window.location.reload();
    };

    // Filter local lists by query
    const filteredCourses = useMemo(() => {
        return courses.filter((c) => c.name.toLowerCase().includes(courseQuery.toLowerCase()));
    }, [courses, courseQuery]);

    const filteredBranches = useMemo(() => {
        return branches.filter((b) => b.name.toLowerCase().includes(branchQuery.toLowerCase()));
    }, [branches, branchQuery]);

    const filteredSemesters = useMemo(() => {
        return semesters.filter((s) => s.name.toLowerCase().includes(semesterQuery.toLowerCase()));
    }, [semesters, semesterQuery]);

    const toggleAllCourses = (checked: boolean) => {
        setSelectAllCourses(checked);
        setCourses(courses.map((c) => ({ ...c, selected: checked })));
    };

    const toggleAllBranches = (checked: boolean) => {
        setSelectAllBranches(checked);
        setBranches(branches.map((b) => ({ ...b, selected: checked })));
    };

    const toggleAllSemesters = (checked: boolean) => {
        setSelectAllSemesters(checked);
        setSemesters(semesters.map((s) => ({ ...s, selected: checked })));
    };

    // Callback actions from columns
    const columnsCallbacks = {
        onViewPhoto: (url: string) => {
            setPreviewPhotoUrl(url);
            setPreviewPhotoTitle('Student Photo');
            setIsPhotoOpen(true);
        },
        onViewApplication: (student: IDocumentViewClgStudent) => {
            toast.info(`Viewing application for ${student.name}`);
        },
        onDownload: (url: string, filename: string) => {
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        onViewDoc: (url: string, name: string) => {
            setPreviewPhotoUrl(url);
            setPreviewPhotoTitle(name);
            setIsPhotoOpen(true);
        }
    };

    const columns = useMemo(() => getDocumentViewColumns(columnsCallbacks), []);

    const tableProps = useDataTableProps({
        data: reportData,
        totalItems: reportData.length
    });

    return (
        <div className='container space-y-6 p-1'>
            {/* Filters */}
            <CollapsibleSection
                title='Document View Report'
                description='Filter student document list'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg'>
                <form onSubmit={handleSearch} className='space-y-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                        <div className='space-y-2'>
                            <Label htmlFor='academicYearId'>
                                Academic Year <span className='text-destructive'>*</span>
                            </Label>
                            <Select value={academicYearId} onValueChange={setAcademicYearId}>
                                <SelectTrigger id='academicYearId'>
                                    <SelectValue placeholder={initialLoading ? 'Loading Years...' : 'Select Academic Year'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {yearList.map((year: any) => (
                                        <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                            {year.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        {/* Course checklist */}
                        <div className='space-y-2 border rounded-md p-4 bg-card shadow-sm'>
                            <Label className='font-bold flex justify-between items-center mb-2'>
                                <span>Course Name <span className='text-destructive'>*</span></span>
                            </Label>
                            <InputText
                                placeholder='Search course...'
                                value={courseQuery}
                                onChange={(e) => setCourseQuery(e.target.value)}
                                className='h-8'
                            />
                            <div className='max-h-40 overflow-y-auto space-y-2 pr-2 mt-2 border-t pt-2'>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='all-courses'
                                        checked={selectAllCourses}
                                        onCheckedChange={(c) => toggleAllCourses(c as boolean)}
                                    />
                                    <Label htmlFor='all-courses' className='font-normal cursor-pointer text-sm'>All</Label>
                                </div>
                                {filteredCourses.map((c, index) => (
                                    <div key={`course-${index}-${c.id}`} className='flex items-center space-x-2'>
                                        <Checkbox
                                            id={`course-${index}-${c.id}`}
                                            checked={c.selected}
                                            onCheckedChange={(checked) =>
                                                setCourses(courses.map((item) => (item.id === c.id ? { ...item, selected: checked as boolean } : item)))
                                            }
                                        />
                                        <Label htmlFor={`course-${index}-${c.id}`} className='font-normal cursor-pointer text-sm'>{c.name}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Branch checklist */}
                        <div className='space-y-2 border rounded-md p-4 bg-card shadow-sm'>
                            <Label className='font-bold flex justify-between items-center mb-2'>
                                <span>Branch Name <span className='text-destructive'>*</span></span>
                            </Label>
                            <InputText
                                placeholder='Search branch...'
                                value={branchQuery}
                                onChange={(e) => setBranchQuery(e.target.value)}
                                className='h-8'
                            />
                            <div className='max-h-40 overflow-y-auto space-y-2 pr-2 mt-2 border-t pt-2'>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='all-branches'
                                        checked={selectAllBranches}
                                        onCheckedChange={(c) => toggleAllBranches(c as boolean)}
                                    />
                                    <Label htmlFor='all-branches' className='font-normal cursor-pointer text-sm'>All</Label>
                                </div>
                                {filteredBranches.map((b, index) => (
                                    <div key={`branch-${index}-${b.id}`} className='flex items-center space-x-2'>
                                        <Checkbox
                                            id={`branch-${index}-${b.id}`}
                                            checked={b.selected}
                                            onCheckedChange={(checked) =>
                                                setBranches(branches.map((item) => (item.id === b.id ? { ...item, selected: checked as boolean } : item)))
                                            }
                                        />
                                        <Label htmlFor={`branch-${index}-${b.id}`} className='font-normal cursor-pointer text-sm'>{b.name}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Semester checklist */}
                        <div className='space-y-2 border rounded-md p-4 bg-card shadow-sm'>
                            <Label className='font-bold flex justify-between items-center mb-2'>
                                <span>Semester Name <span className='text-destructive'>*</span></span>
                            </Label>
                            <InputText
                                placeholder='Search semester...'
                                value={semesterQuery}
                                onChange={(e) => setSemesterQuery(e.target.value)}
                                className='h-8'
                            />
                            <div className='max-h-40 overflow-y-auto space-y-2 pr-2 mt-2 border-t pt-2'>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='all-semesters'
                                        checked={selectAllSemesters}
                                        onCheckedChange={(c) => toggleAllSemesters(c as boolean)}
                                    />
                                    <Label htmlFor='all-semesters' className='font-normal cursor-pointer text-sm'>All</Label>
                                </div>
                                {filteredSemesters.map((s, index) => (
                                    <div key={`semester-${index}-${s.id}`} className='flex items-center space-x-2'>
                                        <Checkbox
                                            id={`semester-${index}-${s.id}`}
                                            checked={s.selected}
                                            onCheckedChange={(checked) =>
                                                setSemesters(semesters.map((item) => (item.id === s.id ? { ...item, selected: checked as boolean } : item)))
                                            }
                                        />
                                        <Label htmlFor={`semester-${index}-${s.id}`} className='font-normal cursor-pointer text-sm'>{s.name}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-center gap-4 pt-4 border-t'>
                        <Button type='submit' disabled={searchLoading} className='min-w-[120px]' isLoading={searchLoading} loadingText='Searching...'>
                            <FileText className='mr-2 h-4 w-4' /> Report
                        </Button>
                        <Button type='button' variant='outline' onClick={handleCancel} className='min-w-[120px]'>
                            <RotateCcw className='mr-2 h-4 w-4' /> Cancel
                        </Button>
                    </div>
                </form>
            </CollapsibleSection>

            {/* Results Section */}
            {showResults && (
                <CollapsibleSection
                    title='Students Document List'
                    defaultOpen={true}
                    variant='outline'
                    size='lg'
                    className='shadow-md animate-in slide-in-from-top-4 duration-300'>
                    <GenericDataTable<IDocumentViewClgStudent>
                        {...tableProps}
                        columns={columns}
                        isLoading={searchLoading}
                        error={null}
                        showViewOptions={false}
                        columnPinning={{ right: [] }}
                        loadingMessage='Generating document list...'
                        noDataTitle='No Records Found'
                        noDataDescription='No student details matches the filters selected.'
                    />
                </CollapsibleSection>
            )}

            {/* View Image/File Dialog */}
            <Dialog open={isPhotoOpen} onOpenChange={setIsPhotoOpen}>
                <DialogContent className='max-w-3xl'>
                    <DialogHeader>
                        <DialogTitle>{previewPhotoTitle}</DialogTitle>
                    </DialogHeader>
                    <div className='flex justify-center p-4 border rounded bg-muted/20'>
                        {previewPhotoUrl.toLowerCase().endsWith('.pdf') ? (
                            <iframe src={previewPhotoUrl} className='w-full h-[60vh]' title='PDF Document' />
                        ) : (
                            <img src={previewPhotoUrl} alt={previewPhotoTitle} className='max-h-[60vh] object-contain rounded-md shadow' />
                        )}
                    </div>
                    <div className='flex justify-end gap-2 border-t pt-4'>
                        <Button variant='outline' onClick={() => setIsPhotoOpen(false)}>Close</Button>
                        <Button onClick={() => columnsCallbacks.onDownload(previewPhotoUrl, previewPhotoTitle)}>Download</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
