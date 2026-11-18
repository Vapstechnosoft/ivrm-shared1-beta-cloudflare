'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/extension/field';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Save, RotateCcw, Hash, Search, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { AllottedStudentsTable } from './allotted-students-table';
import {
    useGetClgSectionAllotmentAcademicCourses,
    useGetClgSectionAllotmentBranches,
    useGetClgSectionAllotmentSemesters,
    useGetClgSectionAllotmentStudentsByURN,
    useSaveClgSectionAllotmentRollNo
} from '@/hooks/college/useClgSectionAllotment';
import { IClgSectionAllotmentStudent } from '@/types/college/transactions';

interface UpdateRollNoTabProps {
    initialData: any;
    refetchAll: () => void;
}

export function UpdateRollNoTab({ initialData, refetchAll }: UpdateRollNoTabProps) {
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

    // Students for Roll No Assignment
    const [editableStudents, setEditableStudents] = useState<IClgSectionAllotmentStudent[]>([]);
    const [allottedStudents, setAllottedStudents] = useState<IClgSectionAllotmentStudent[]>([]);
    const [searchStudent, setSearchStudent] = useState('');
    const [sortKey, setSortKey] = useState<string>('amcsT_FirstName');
    const [sortAsc, setSortAsc] = useState(true);

    // Mutations
    const getCoursesMutation = useGetClgSectionAllotmentAcademicCourses();
    const getBranchesMutation = useGetClgSectionAllotmentBranches();
    const getSemestersMutation = useGetClgSectionAllotmentSemesters();
    const getStudentsByURNMutation = useGetClgSectionAllotmentStudentsByURN();
    const saveRollNoMutation = useSaveClgSectionAllotmentRollNo();

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

    // Handle Year Change
    const handleYearChange = async (yearId: string) => {
        setAsmaY_Id(yearId);
        setAmcO_Id('');
        setAmB_Id('');
        setAmsE_Id('');
        setAcmS_Id('');
        setEditableStudents([]);
        setAllottedStudents([]);

        if (!yearId) {
            setCourseList(initialCourses);
            setBranchList(initialBranches);
            setSemList(initialSemesters);
            return;
        }

        try {
            const res = await getCoursesMutation.mutateAsync({ ASMAY_Id: Number(yearId) });
            const data = res?.data || res;
            const courses =
                data?.courselistdata ||
                data?.courselist ||
                data?.courseList ||
                data?.courses ||
                (Array.isArray(data) ? data : []);
            if (courses.length > 0) {
                setCourseList(courses);
            } else if (initialCourses.length > 0) {
                setCourseList(initialCourses);
            } else {
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
        setEditableStudents([]);
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
        setEditableStudents([]);
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
        setEditableStudents([]);
        setAllottedStudents([]);
    };

    // Handle Section Change -> Load Students for Roll No
    const handleSectionChange = async (secId: string) => {
        setAcmS_Id(secId);
        setEditableStudents([]);
        setAllottedStudents([]);

        if (!secId || !asmaY_Id || !amcO_Id || !amB_Id || !amsE_Id) return;

        try {
            const res = await getStudentsByURNMutation.mutateAsync({
                ASMAY_Id: Number(asmaY_Id),
                AMSE_Id: Number(amsE_Id),
                AMB_Id: Number(amB_Id),
                AMCO_Id: Number(amcO_Id),
                ACMS_Id: Number(secId)
            });
            const data = res?.data || res;

            if (data?.count > 0 || data?.updateRollNo?.length > 0) {
                const list = (data.updateRollNo || []).map((s: any, idx: number) => ({
                    ...s,
                    pdays: s.pdays || (idx + 1).toString()
                }));
                setEditableStudents(list);
                setAllottedStudents(data.updateRollNo1 || []);
            } else {
                toast.info('No students found for selected class/section');
            }
        } catch {
            toast.error('Failed to load students for roll numbers');
        }
    };

    // Roll number change & duplicate validation
    const handleRollNoChange = (index: number, val: string) => {
        // Numbers only
        const clean = val.replace(/[^0-9]/g, '');

        if (clean !== '') {
            const isDup = editableStudents.some((s, idx) => idx !== index && s.pdays?.toString() === clean);
            if (isDup) {
                Swal.fire('Duplicate Roll No', `Roll Number ${clean} is already assigned to another student in this list.`, 'warning');
                return;
            }
        }

        setEditableStudents((prev) => {
            const copy = [...prev];
            copy[index] = { ...copy[index], pdays: clean };
            return copy;
        });
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
        setEditableStudents([]);
        setAllottedStudents([]);
    };

    // Save Roll Numbers
    const handleSave = async () => {
        if (!asmaY_Id || !amcO_Id || !amB_Id || !amsE_Id || !acmS_Id) {
            Swal.fire('Validation Error', 'Please select all required parameters', 'warning');
            return;
        }

        if (editableStudents.length === 0) {
            Swal.fire('Notice', 'No students to update roll numbers for', 'warning');
            return;
        }

        // Validate that all students have roll numbers
        const missing = editableStudents.some((s) => !s.pdays || s.pdays.toString().trim() === '');
        if (missing) {
            Swal.fire('Validation Error', 'Please ensure all students have a valid Roll Number entered.', 'warning');
            return;
        }

        try {
            const payload = {
                updateRollNo: editableStudents,
                SectionAllotmentType: 'updateroll',
                ASMAY_Id: Number(asmaY_Id),
                AMSE_Id: Number(amsE_Id),
                AMB_Id: Number(amB_Id),
                AMCO_Id: Number(amcO_Id),
                ACMS_Id: Number(acmS_Id)
            };

            const res = await saveRollNoMutation.mutateAsync(payload);
            const data = res?.data || res;
            const isSuccess = res?.success || data?.returnval || data?.returnVal;

            if (isSuccess) {
                Swal.fire('Success', data?.returnMsg || 'Roll Numbers Updated Successfully', 'success');
                handleSectionChange(acmS_Id);
                refetchAll();
            } else {
                Swal.fire('Error', data?.returnMsg || 'Failed to update roll numbers', 'error');
            }
        } catch {
            toast.error('Something went wrong. Please contact administrator.');
        }
    };

    // Filter & Sort
    const filteredStudents = useMemo(() => {
        let list = editableStudents.filter((s) => {
            const name = (s.studentName || `${s.amcsT_FirstName || ''} ${s.amcsT_LastName || ''}`).toLowerCase();
            const adm = (s.amcsT_AdmNo || '').toLowerCase();
            const roll = (s.pdays || '').toString().toLowerCase();
            const term = searchStudent.toLowerCase();
            return name.includes(term) || adm.includes(term) || roll.includes(term);
        });

        list.sort((a: any, b: any) => {
            const valA = (a[sortKey] || '').toString().toLowerCase();
            const valB = (b[sortKey] || '').toString().toLowerCase();
            if (valA < valB) return sortAsc ? -1 : 1;
            if (valA > valB) return sortAsc ? 1 : -1;
            return 0;
        });

        return list;
    }, [editableStudents, searchStudent, sortKey, sortAsc]);

    return (
        <div className='space-y-6'>
            {/* Filter Section */}
            <CollapsibleSection
                title='Update Roll Number - Parameters'
                icon={<Hash className='h-5 w-5 text-primary' />}
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

            {/* Editable Roll Numbers Table */}
            {editableStudents.length > 0 && (
                <CollapsibleSection
                    title='Assign Student Roll Numbers'
                    defaultOpen={true}
                    variant='outline'
                    size='lg'>
                    <div className='p-6 space-y-4'>
                        <div className='flex items-center justify-between pb-2'>
                            <div className='flex items-center gap-2'>
                                <span className='font-semibold text-sm'>Students in Section</span>
                                <Badge variant='secondary' className='rounded-full'>
                                    {editableStudents.length}
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

                        <div className='overflow-x-auto rounded-lg border border-border/60 bg-background'>
                            <Table>
                                <TableHeader className='bg-muted/70'>
                                    <TableRow className='hover:bg-transparent'>
                                        <TableHead className='w-12 text-center font-bold'>SL.NO</TableHead>
                                        <TableHead
                                            className='cursor-pointer font-bold'
                                            onClick={() => {
                                                setSortKey('amcsT_FirstName');
                                                setSortAsc(!sortAsc);
                                            }}>
                                            <div className='flex items-center gap-1'>
                                                Student Name
                                                <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                            </div>
                                        </TableHead>
                                        <TableHead className='font-bold'>Branch</TableHead>
                                        <TableHead className='font-bold'>Sem</TableHead>
                                        <TableHead className='font-bold'>Course</TableHead>
                                        <TableHead className='font-bold text-center'>Section</TableHead>
                                        <TableHead
                                            className='cursor-pointer font-bold'
                                            onClick={() => {
                                                setSortKey('amcsT_AdmNo');
                                                setSortAsc(!sortAsc);
                                            }}>
                                            <div className='flex items-center gap-1'>
                                                Adm. No.
                                                <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                            </div>
                                        </TableHead>
                                        <TableHead className='font-bold text-center'>Present Roll No</TableHead>
                                        <TableHead className='font-bold text-center w-32'>
                                            New Roll No. <span className='text-red-500'>*</span>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className='h-24 text-center text-muted-foreground text-xs'>
                                                No students found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredStudents.map((student, idx) => {
                                            const originalIndex = editableStudents.indexOf(student);
                                            return (
                                                <TableRow key={idx} className='hover:bg-muted/40 transition-colors'>
                                                    <TableCell className='text-center text-xs text-muted-foreground'>{idx + 1}</TableCell>
                                                    <TableCell className='font-medium text-xs text-foreground'>
                                                        {student.studentName ||
                                                            [student.amcsT_FirstName, student.amcsT_MiddleName, student.amcsT_LastName]
                                                                .filter(Boolean)
                                                                .join(' ')}
                                                    </TableCell>
                                                    <TableCell className='text-xs'>{student.amB_BranchName || '-'}</TableCell>
                                                    <TableCell className='text-xs'>{student.amsE_SEMName || '-'}</TableCell>
                                                    <TableCell className='text-xs'>{student.amcO_CourseName || '-'}</TableCell>
                                                    <TableCell className='text-center text-xs'>
                                                        <Badge variant='outline'>{student.acmS_SectionName || '-'}</Badge>
                                                    </TableCell>
                                                    <TableCell className='font-mono text-xs text-muted-foreground'>
                                                        {student.amcsT_AdmNo || '-'}
                                                    </TableCell>
                                                    <TableCell className='text-center font-mono text-xs text-muted-foreground'>
                                                        {student.acysT_RollNo || '-'}
                                                    </TableCell>
                                                    <TableCell className='text-center'>
                                                        <Input
                                                            type='text'
                                                            maxLength={4}
                                                            value={student.pdays ?? ''}
                                                            onChange={(e) => handleRollNoChange(originalIndex, e.target.value)}
                                                            className='h-8 w-24 text-center font-bold text-xs mx-auto focus:border-primary'
                                                            placeholder='Roll No'
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className='flex items-center justify-center gap-4 pt-4 border-t border-border/60'>
                            <Button
                                type='button'
                                onClick={handleSave}
                                disabled={saveRollNoMutation.isPending || editableStudents.length === 0}
                                className='shadow-md transition-all hover:scale-105 active:scale-95'>
                                <Save className='mr-2 h-4 w-4' />
                                {saveRollNoMutation.isPending ? 'Updating...' : 'Save Roll Numbers'}
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
            )}

            {/* Bottom Table: Allotted Students with Assigned Roll Numbers */}
            <AllottedStudentsTable
                title='Section Allotted Student List'
                students={allottedStudents}
                showRollNo={true}
            />
        </div>
    );
}
