'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/extension/field';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Trash2, RotateCcw, UserMinus, Search, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { AllottedStudentsTable } from './allotted-students-table';
import {
    useGetClgSectionAllotmentAcademicCourses,
    useGetClgSectionAllotmentBranches,
    useGetClgSectionAllotmentSemesters,
    useGetClgSectionAllotmentStudents,
    useSaveClgSectionAllotment
} from '@/hooks/college/useClgSectionAllotment';
import { IClgSectionAllotmentStudent } from '@/types/college/transactions';

interface DeleteSectionTabProps {
    initialData: any;
    refetchAll: () => void;
}

export function DeleteSectionTab({ initialData, refetchAll }: DeleteSectionTabProps) {
    const [asmaY_Id, setAsmaY_Id] = useState<string>('');
    const [amcO_Id, setAmcO_Id] = useState<string>('');
    const [amB_Id, setAmB_Id] = useState<string>('');
    const [amsE_Id, setAmsE_Id] = useState<string>('');
    const [acmS_Id, setAcmS_Id] = useState<string>('');

    // Default lists from initialData (defensive against any casing / structure)
    const yearList: any[] =
        initialData?.yearList ||
        initialData?.yearlist ||
        initialData?.YearList ||
        initialData?.accyearlist ||
        initialData?.data?.yearList ||
        initialData?.data?.yearlist ||
        (Array.isArray(initialData) ? initialData : []);

    const initialCourses: any[] =
        initialData?.courselistdata ||
        initialData?.courselist ||
        initialData?.courseList ||
        initialData?.data?.courselistdata ||
        initialData?.data?.courselist ||
        [];

    const initialBranches: any[] =
        initialData?.coursebranchlist ||
        initialData?.courseBranchList ||
        initialData?.branchList ||
        initialData?.branchlist ||
        initialData?.data?.coursebranchlist ||
        [];

    const initialSemesters: any[] =
        initialData?.semlistdata ||
        initialData?.semlist ||
        initialData?.semList ||
        initialData?.semesters ||
        initialData?.data?.semlistdata ||
        [];

    const sectionList: any[] =
        initialData?.sectionList ||
        initialData?.sectionlist ||
        initialData?.SectionList ||
        initialData?.data?.sectionList ||
        initialData?.data?.sectionlist ||
        [];

    // Dynamic dropdown lists seeded by initialData
    const [courseList, setCourseList] = useState<any[]>(initialCourses);
    const [branchList, setBranchList] = useState<any[]>(initialBranches);
    const [semList, setSemList] = useState<any[]>(initialSemesters);

    // Keep dropdown lists synced when initialData loads
    useEffect(() => {
        if (initialCourses.length > 0 && courseList.length === 0) {
            setCourseList(initialCourses);
        }
        if (initialBranches.length > 0 && branchList.length === 0) {
            setBranchList(initialBranches);
        }
        if (initialSemesters.length > 0 && semList.length === 0) {
            setSemList(initialSemesters);
        }
    }, [initialData]);

    // Students
    const [students, setStudents] = useState<IClgSectionAllotmentStudent[]>([]);
    const [allottedStudents, setAllottedStudents] = useState<IClgSectionAllotmentStudent[]>([]);
    const [allYearStudents, setAllYearStudents] = useState<IClgSectionAllotmentStudent[]>([]);
    const [searchStudent, setSearchStudent] = useState('');
    const [sortKey, setSortKey] = useState<'name' | 'admNo'>('name');
    const [sortAsc, setSortAsc] = useState(true);

    // Mutations
    const getCoursesMutation = useGetClgSectionAllotmentAcademicCourses();
    const getBranchesMutation = useGetClgSectionAllotmentBranches();
    const getSemestersMutation = useGetClgSectionAllotmentSemesters();
    const getStudentsMutation = useGetClgSectionAllotmentStudents();
    const saveMutation = useSaveClgSectionAllotment();

    useEffect(() => {
        if (yearList.length > 0 && !asmaY_Id) {
            const first = yearList[0];
            const defaultYear = (first?.asmaY_Id ?? first?.ASMAY_Id ?? first?.asmay_Id ?? first?.id)?.toString() || '';
            setAsmaY_Id(defaultYear);
            if (defaultYear) {
                handleYearChange(defaultYear);
            }
        }
    }, [yearList]);

    // Handle Academic Year Change
    const handleYearChange = async (yearId: string) => {
        setAsmaY_Id(yearId);
        setAmcO_Id('');
        setAmB_Id('');
        setAmsE_Id('');
        setAcmS_Id('');
        setStudents([]);
        setAllottedStudents([]);
        setAllYearStudents([]);

        if (!yearId) {
            setCourseList(initialCourses);
            setBranchList(initialBranches);
            setSemList(initialSemesters);
            return;
        }

        try {
            const res = await getCoursesMutation.mutateAsync({ ASMAY_Id: Number(yearId) });
            const data = res?.data || res;

            const fetchedStudents = data?.studentList || data?.studentlist || (Array.isArray(data) ? data : []);
            if (fetchedStudents.length > 0) {
                setAllYearStudents(fetchedStudents);
            }

            const courses =
                data?.courselistdata ||
                data?.courselist ||
                data?.courseList ||
                data?.courses ||
                [];
            if (courses.length > 0) {
                setCourseList(courses);
            } else if (initialCourses.length > 0) {
                setCourseList(initialCourses);
            } else if (fetchedStudents.length === 0) {
                setCourseList([]);
                toast.warning('No courses found');
            }
        } catch {
            if (initialCourses.length > 0) {
                setCourseList(initialCourses);
            } else {
                toast.error('Failed to load courses');
            }
        }
    };

    // Handle Course Change
    const handleCourseChange = async (courseId: string) => {
        setAmcO_Id(courseId);
        setAmB_Id('');
        setAmsE_Id('');
        setAcmS_Id('');
        setStudents([]);
        setAllottedStudents([]);

        if (!courseId || !asmaY_Id) {
            setBranchList(initialBranches);
            setSemList(initialSemesters);
            return;
        }

        try {
            const res = await getBranchesMutation.mutateAsync({
                ASMAY_Id: Number(asmaY_Id),
                AMCO_Id: Number(courseId)
            });
            const data = res?.data || res;
            const branches =
                data?.coursebranchlist ||
                data?.courseBranchList ||
                data?.branchlist ||
                data?.branches ||
                (Array.isArray(data) ? data : []);
            if (branches.length > 0) {
                setBranchList(branches);
            } else if (initialBranches.length > 0) {
                setBranchList(initialBranches);
            } else {
                setBranchList([]);
                toast.warning('No branches found');
            }
        } catch {
            if (initialBranches.length > 0) {
                setBranchList(initialBranches);
            } else {
                toast.error('Failed to load branches');
            }
        }
    };

    // Handle Branch Change
    const handleBranchChange = async (branchId: string) => {
        setAmB_Id(branchId);
        setAmsE_Id('');
        setAcmS_Id('');
        setStudents([]);
        setAllottedStudents([]);

        if (!branchId || !asmaY_Id || !amcO_Id) {
            setSemList(initialSemesters);
            return;
        }

        try {
            const res = await getSemestersMutation.mutateAsync({
                ASMAY_Id: Number(asmaY_Id),
                AMCO_Id: Number(amcO_Id),
                AMB_Id: Number(branchId)
            });
            const data = res?.data || res;
            const sems =
                data?.semlistdata ||
                data?.semlist ||
                data?.semList ||
                data?.semesters ||
                (Array.isArray(data) ? data : []);
            if (sems.length > 0) {
                setSemList(sems);
            } else if (initialSemesters.length > 0) {
                setSemList(initialSemesters);
            } else {
                setSemList([]);
                toast.warning('No semesters found');
            }
        } catch {
            if (initialSemesters.length > 0) {
                setSemList(initialSemesters);
            } else {
                toast.error('Failed to load semesters');
            }
        }
    };

    // Handle Semester Change
    const handleSemesterChange = (semId: string) => {
        setAmsE_Id(semId);
        setAcmS_Id('');
        setStudents([]);
        setAllottedStudents([]);
    };

    // Handle Section Change -> Load Students
    const handleSectionChange = async (secId: string) => {
        setAcmS_Id(secId);
        setStudents([]);

        if (!secId || !asmaY_Id || !amcO_Id || !amB_Id || !amsE_Id) return;

        try {
            const res = await getStudentsMutation.mutateAsync({
                ASMAY_Id: Number(asmaY_Id),
                AMCO_Id: Number(amcO_Id),
                AMB_Id: Number(amB_Id),
                AMSE_Id: Number(amsE_Id),
                ACMS_Id: Number(secId),
                SectionAllotmentType: 'Delete'
            });
            const data = res?.data || res;

            const studentsList = data?.studentListYear || data?.studentList || data?.studentlist || data?.students || [];
            if (studentsList.length > 0) {
                setStudents(studentsList);
            } else {
                toast.info('No students found to delete section');
            }

            if (data?.sectionAllotedStudentList?.length > 0) {
                setAllottedStudents(data.sectionAllotedStudentList);
            } else {
                setAllottedStudents([]);
            }
        } catch {
            toast.error('Failed to load students');
        }
    };

    // Filter & Sort
    const filteredStudents = useMemo(() => {
        let list = students.filter((s) => {
            const name = (s.studentName || `${s.amcsT_FirstName || ''} ${s.amcsT_LastName || ''}`).toLowerCase();
            const adm = (s.amcsT_AdmNo || '').toLowerCase();
            const term = searchStudent.toLowerCase();
            return name.includes(term) || adm.includes(term);
        });

        list.sort((a, b) => {
            const valA =
                sortKey === 'name'
                    ? (a.studentName || a.amcsT_FirstName || '').toLowerCase()
                    : (a.amcsT_AdmNo || '').toLowerCase();
            const valB =
                sortKey === 'name'
                    ? (b.studentName || b.amcsT_FirstName || '').toLowerCase()
                    : (b.amcsT_AdmNo || '').toLowerCase();
            if (valA < valB) return sortAsc ? -1 : 1;
            if (valA > valB) return sortAsc ? 1 : -1;
            return 0;
        });

        return list;
    }, [students, searchStudent, sortKey, sortAsc]);

    const allSelected = useMemo(
        () => filteredStudents.length > 0 && filteredStudents.every((s) => s.Selected),
        [filteredStudents]
    );

    const toggleSelectAll = (checked: boolean) => {
        const ids = new Set(filteredStudents.map((s) => s.amsT_Id ?? s.amcsT_Id ?? s.acysT_Id ?? s.AMST_Id));
        setStudents((prev) =>
            prev.map((s) => {
                const id = s.amsT_Id ?? s.amcsT_Id ?? s.acysT_Id ?? s.AMST_Id;
                return ids.has(id) ? { ...s, Selected: checked } : s;
            })
        );
    };

    const toggleSelect = (student: IClgSectionAllotmentStudent) => {
        const id = student.amsT_Id ?? student.amcsT_Id ?? student.acysT_Id ?? student.AMST_Id;
        setStudents((prev) =>
            prev.map((s) => {
                const sId = s.amsT_Id ?? s.amcsT_Id ?? s.acysT_Id ?? s.AMST_Id;
                return sId === id ? { ...s, Selected: !s.Selected } : s;
            })
        );
    };

    // Clear
    const handleClear = () => {
        const first = yearList[0];
        setAsmaY_Id((first?.asmaY_Id ?? first?.ASMAY_Id ?? first?.id)?.toString() || '');
        setAmcO_Id('');
        setAmB_Id('');
        setAmsE_Id('');
        setAcmS_Id('');
        setCourseList(initialCourses);
        setBranchList(initialBranches);
        setSemList(initialSemesters);
        setStudents([]);
        setAllottedStudents([]);
    };

    // Delete Section
    const handleDelete = async () => {
        const selected = students.filter((s) => s.Selected);
        if (selected.length === 0) {
            Swal.fire('Warning', 'Kindly select at least one record to delete', 'warning');
            return;
        }

        const confirm = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to remove section allotment for ${selected.length} student(s).`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel'
        });

        if (!confirm.isConfirmed) return;

        try {
            const payload = {
                SectionAllotmentType: 'Delete',
                ASMAY_Id: Number(asmaY_Id),
                AMSE_Id: Number(amsE_Id),
                AMB_Id: Number(amB_Id),
                AMCO_Id: Number(amcO_Id),
                ACMS_Id: Number(acmS_Id),
                resultData1: selected
            };

            const res = await saveMutation.mutateAsync(payload);
            const data = res?.data || res;
            const isSuccess = res?.success || data?.returnVal || data?.returnval;

            if (isSuccess) {
                Swal.fire('Success', data?.returnMsg || 'Selected Record Deleted Successfully', 'success');
                handleSectionChange(acmS_Id);
                refetchAll();
            } else {
                Swal.fire('Error', data?.returnMsg || 'Failed to delete section allotment', 'error');
            }
        } catch {
            toast.error('Something went wrong. Please contact administrator.');
        }
    };

    return (
        <div className='space-y-6'>
            {/* Filter Section */}
            <CollapsibleSection
                title='Delete Student Section - Selection Parameters'
                icon={<UserMinus className='h-5 w-5 text-destructive' />}
                defaultOpen={true}
                variant='default'
                size='lg'>
                <div className='grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3'>
                    <div className='space-y-2'>
                        <Label className='font-bold text-xs uppercase tracking-wider text-muted-foreground'>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>
                        <Select value={asmaY_Id} onValueChange={handleYearChange}>
                            <SelectTrigger className='h-10'>
                                <SelectValue placeholder='Select Academic Year' />
                            </SelectTrigger>
                            <SelectContent>
                                {yearList.map((y: any, idx: number) => {
                                    const yId = (y.asmaY_Id ?? y.ASMAY_Id ?? y.asmay_Id ?? y.id ?? idx).toString();
                                    const yName = y.asmaY_Year ?? y.ASMAY_Year ?? y.asmay_Year ?? y.yearName ?? yId;
                                    return (
                                        <SelectItem key={yId} value={yId}>
                                            {yName}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='space-y-2'>
                        <Label className='font-bold text-xs uppercase tracking-wider text-muted-foreground'>
                            Course <span className='text-red-500'>*</span>
                        </Label>
                        <Select value={amcO_Id} onValueChange={handleCourseChange} disabled={!asmaY_Id}>
                            <SelectTrigger className='h-10'>
                                <SelectValue placeholder='Select Course' />
                            </SelectTrigger>
                            <SelectContent>
                                {courseList.map((c: any, idx: number) => {
                                    const cId = (c.amcO_Id ?? c.AMCO_Id ?? c.amco_Id ?? c.id ?? idx).toString();
                                    const cName = c.amcO_CourseName ?? c.AMCO_CourseName ?? c.amco_CourseName ?? c.courseName ?? cId;
                                    return (
                                        <SelectItem key={cId} value={cId}>
                                            {cName}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='space-y-2'>
                        <Label className='font-bold text-xs uppercase tracking-wider text-muted-foreground'>
                            Branch <span className='text-red-500'>*</span>
                        </Label>
                        <Select value={amB_Id} onValueChange={handleBranchChange} disabled={!amcO_Id}>
                            <SelectTrigger className='h-10'>
                                <SelectValue placeholder='Select Branch' />
                            </SelectTrigger>
                            <SelectContent>
                                {branchList.map((b: any, idx: number) => {
                                    const bId = (b.amB_Id ?? b.AMB_Id ?? b.amb_Id ?? b.id ?? idx).toString();
                                    const bName = b.amB_BranchName ?? b.AMB_BranchName ?? b.amb_BranchName ?? b.branchName ?? bId;
                                    return (
                                        <SelectItem key={bId} value={bId}>
                                            {bName}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='space-y-2'>
                        <Label className='font-bold text-xs uppercase tracking-wider text-muted-foreground'>
                            Semester <span className='text-red-500'>*</span>
                        </Label>
                        <Select value={amsE_Id} onValueChange={handleSemesterChange} disabled={!amB_Id}>
                            <SelectTrigger className='h-10'>
                                <SelectValue placeholder='Select Semester' />
                            </SelectTrigger>
                            <SelectContent>
                                {semList.map((s: any, idx: number) => {
                                    const sId = (s.amsE_Id ?? s.AMSE_Id ?? s.amse_Id ?? s.id ?? idx).toString();
                                    const sName = s.amsE_SEMName ?? s.AMSE_SEMName ?? s.amse_SEMName ?? s.semName ?? sId;
                                    return (
                                        <SelectItem key={sId} value={sId}>
                                            {sName}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='space-y-2'>
                        <Label className='font-bold text-xs uppercase tracking-wider text-muted-foreground'>
                            Section <span className='text-red-500'>*</span>
                        </Label>
                        <Select value={acmS_Id} onValueChange={handleSectionChange} disabled={!amsE_Id}>
                            <SelectTrigger className='h-10'>
                                <SelectValue placeholder='Select Section' />
                            </SelectTrigger>
                            <SelectContent>
                                {sectionList.map((sec: any, idx: number) => {
                                    const secId = (sec.acmS_Id ?? sec.ACMS_Id ?? sec.acms_Id ?? sec.id ?? idx).toString();
                                    const secName = sec.acmS_SectionName ?? sec.ACMS_SectionName ?? sec.acms_SectionName ?? sec.sectionName ?? secId;
                                    return (
                                        <SelectItem key={secId} value={secId}>
                                            {secName}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Students List for Section */}
            <CollapsibleSection
                title='Students in Section'
                defaultOpen={true}
                variant='outline'
                size='lg'>
                <div className='p-6 space-y-4'>
                    <div className='flex items-center justify-between pb-2'>
                        <div className='flex items-center gap-2'>
                            <span className='font-semibold text-sm'>Allotted Students</span>
                            <Badge variant='secondary' className='rounded-full'>
                                {students.length}
                            </Badge>
                        </div>
                        <div className='relative w-56'>
                            <Search className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
                            <Input
                                placeholder='Search students...'
                                value={searchStudent}
                                onChange={(e) => setSearchStudent(e.target.value)}
                                className='h-8 pl-8 text-xs'
                            />
                        </div>
                    </div>

                    <div className='max-h-96 overflow-y-auto rounded-lg border border-border/60 bg-background'>
                        <Table>
                            <TableHeader className='sticky top-0 z-10 bg-muted/80 backdrop-blur-sm'>
                                <TableRow className='hover:bg-transparent'>
                                    <TableHead className='w-12 text-center font-bold'>SL.NO</TableHead>
                                    <TableHead className='w-12 text-center'>
                                        <Checkbox
                                            checked={allSelected}
                                            onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                                        />
                                    </TableHead>
                                    <TableHead
                                        className='cursor-pointer font-bold'
                                        onClick={() => {
                                            setSortKey('name');
                                            setSortAsc(!sortAsc);
                                        }}>
                                        <div className='flex items-center gap-1'>
                                            Student Name
                                            <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                        </div>
                                    </TableHead>
                                    <TableHead className='font-bold'>Course</TableHead>
                                    <TableHead className='font-bold'>Branch</TableHead>
                                    <TableHead className='font-bold'>Semester</TableHead>
                                    <TableHead className='font-bold'>Section</TableHead>
                                    <TableHead
                                        className='cursor-pointer font-bold'
                                        onClick={() => {
                                            setSortKey('admNo');
                                            setSortAsc(!sortAsc);
                                        }}>
                                        <div className='flex items-center gap-1'>
                                            Adm. No.
                                            <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className='h-24 text-center text-muted-foreground text-xs'>
                                            No students found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStudents.map((student, idx) => (
                                        <TableRow
                                            key={student.amsT_Id ?? student.amcsT_Id ?? student.acysT_Id ?? idx}
                                            className={`transition-colors cursor-pointer ${student.Selected ? 'bg-destructive/10' : 'hover:bg-muted/50'}`}
                                            onClick={() => toggleSelect(student)}>
                                            <TableCell className='text-center text-xs text-muted-foreground'>{idx + 1}</TableCell>
                                            <TableCell className='text-center' onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={!!student.Selected}
                                                    onCheckedChange={() => toggleSelect(student)}
                                                />
                                            </TableCell>
                                            <TableCell className='font-medium text-xs text-foreground'>
                                                {student.studentName ||
                                                    [student.amcsT_FirstName, student.amcsT_MiddleName, student.amcsT_LastName]
                                                        .filter(Boolean)
                                                        .join(' ')}
                                            </TableCell>
                                            <TableCell className='text-xs'>{student.amcO_CourseName || '-'}</TableCell>
                                            <TableCell className='text-xs'>{student.amB_BranchName || '-'}</TableCell>
                                            <TableCell className='text-xs'>{student.amsE_SEMName || '-'}</TableCell>
                                            <TableCell className='text-xs'>{student.acmS_SectionName || '-'}</TableCell>
                                            <TableCell className='font-mono text-xs text-muted-foreground'>
                                                {student.amcsT_AdmNo || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className='flex items-center justify-center gap-4 pt-4 border-t border-border/60'>
                        <Button
                            type='button'
                            variant='destructive'
                            onClick={handleDelete}
                            disabled={saveMutation.isPending || !students.some((s) => s.Selected)}
                            className='shadow-md transition-all hover:scale-105 active:scale-95'>
                            <Trash2 className='mr-2 h-4 w-4' />
                            {saveMutation.isPending ? 'Deleting...' : 'Delete Section Allotment'}
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleClear}
                            className='shadow-sm transition-all hover:scale-105 active:scale-95'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Clear
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Bottom Table: Allotted Students List */}
            <AllottedStudentsTable
                title='Section Allotted Student List'
                students={allottedStudents}
            />
        </div>
    );
}
