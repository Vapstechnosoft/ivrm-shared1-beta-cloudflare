'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Save,
    RotateCcw,
    GitCompare,
    Search,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import {
    useGetClgSectionAllotmentAcademicCourses,
    useGetClgSectionAllotmentBranches,
    useGetClgSectionAllotmentSemesters,
    useGetClgSectionAllotmentCBSStudents,
    useSaveClgSectionAllotmentCourseBranch
} from '@/hooks/college/useClgSectionAllotment';
import { IChangedCourseBranchItem, IClgSectionAllotmentStudent } from '@/types/college/transactions';

interface ChangeCourseBranchTabProps {
    initialData: any;
    refetchAll: () => void;
}

export function ChangeCourseBranchTab({ initialData, refetchAll }: ChangeCourseBranchTabProps) {
    // Form selections
    const [asmaY_Id, setAsmaY_Id] = useState<string>('');
    const [amcO_Id_Old, setAmcO_Id_Old] = useState<string>('');
    const [amB_Id_Old, setAmB_Id_Old] = useState<string>('');
    const [amsE_Id_Old, setAmsE_Id_Old] = useState<string>('');

    const [amcO_Id_New, setAmcO_Id_New] = useState<string>('');
    const [amB_Id_New, setAmB_Id_New] = useState<string>('');
    const [amcsT_Id, setAmcsT_Id] = useState<string>('');

    // Default lists from initialData (defensive against any casing / structure)
    const yearList: any[] = useMemo(() => {
        return (
            initialData?.yearList ||
            initialData?.yearlist ||
            initialData?.YearList ||
            initialData?.accyearlist ||
            initialData?.data?.yearList ||
            initialData?.data?.yearlist ||
            (Array.isArray(initialData) ? initialData : [])
        );
    }, [initialData]);

    const initialCourses: any[] = useMemo(() => {
        return (
            initialData?.courselistdata ||
            initialData?.courselist ||
            initialData?.courseList ||
            initialData?.data?.courselistdata ||
            initialData?.data?.courselist ||
            []
        );
    }, [initialData]);

    const initialBranches: any[] = useMemo(() => {
        return (
            initialData?.coursebranchlist ||
            initialData?.courseBranchList ||
            initialData?.branchList ||
            initialData?.branchlist ||
            initialData?.data?.coursebranchlist ||
            []
        );
    }, [initialData]);

    const initialSemesters: any[] = useMemo(() => {
        return (
            initialData?.semlistdata ||
            initialData?.semlist ||
            initialData?.semList ||
            initialData?.semesters ||
            initialData?.data?.semlistdata ||
            []
        );
    }, [initialData]);

    // Dynamic Lists seeded with initialData
    const [oldCourseList, setOldCourseList] = useState<any[]>(initialCourses);
    const [oldBranchList, setOldBranchList] = useState<any[]>(initialBranches);
    const [oldSemList, setOldSemList] = useState<any[]>(initialSemesters);

    const [newCourseList, setNewCourseList] = useState<any[]>(initialCourses);
    const [newBranchList, setNewBranchList] = useState<any[]>(initialBranches);
    const [studentList, setStudentList] = useState<IClgSectionAllotmentStudent[]>([]);
    const [changedList, setChangedList] = useState<IChangedCourseBranchItem[]>([]);

    // Keep dropdown lists synced when initialData loads
    useEffect(() => {
        if (initialCourses.length > 0 && oldCourseList.length === 0) {
            setOldCourseList(initialCourses);
            setNewCourseList(initialCourses);
        }
        if (initialBranches.length > 0 && oldBranchList.length === 0) {
            setOldBranchList(initialBranches);
            setNewBranchList(initialBranches);
        }
        if (initialSemesters.length > 0 && oldSemList.length === 0) {
            setOldSemList(initialSemesters);
        }
    }, [initialData, initialCourses, initialBranches, initialSemesters]);

    // Grid Search & Pagination
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<string>('Student_Name');
    const [sortAsc, setSortAsc] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Mutations
    const getCoursesMutation = useGetClgSectionAllotmentAcademicCourses();
    const getBranchesMutation = useGetClgSectionAllotmentBranches();
    const getSemestersMutation = useGetClgSectionAllotmentSemesters();
    const getCBSStudentsMutation = useGetClgSectionAllotmentCBSStudents();
    const saveMutation = useSaveClgSectionAllotmentCourseBranch();

    // Initial Changed Course Branch List from server response
    useEffect(() => {
        const rawChanged =
            initialData?.changedcoursebranchlist ||
            initialData?.changedCourseBranchList ||
            initialData?.data?.changedcoursebranchlist ||
            [];
        if (Array.isArray(rawChanged)) {
            setChangedList(rawChanged);
        }
    }, [initialData]);

    // Auto-select first Academic Year
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
        setAmcO_Id_Old('');
        setAmB_Id_Old('');
        setAmsE_Id_Old('');
        setAmcO_Id_New('');
        setAmB_Id_New('');
        setAmcsT_Id('');

        setStudentList([]);

        if (!yearId) {
            setOldCourseList(initialCourses);
            setNewCourseList(initialCourses);
            setOldBranchList(initialBranches);
            setNewBranchList(initialBranches);
            setOldSemList(initialSemesters);
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
                setOldCourseList(courses);
                setNewCourseList(courses);
            } else if (initialCourses.length > 0) {
                setOldCourseList(initialCourses);
                setNewCourseList(initialCourses);
            } else {
                setOldCourseList([]);
                setNewCourseList([]);
                toast.warning('No courses found for the selected academic year');
            }
        } catch {
            if (initialCourses.length > 0) {
                setOldCourseList(initialCourses);
                setNewCourseList(initialCourses);
            } else {
                toast.error('Failed to load courses');
            }
        }
    };

    // Handle Old Course Change -> load Old Branches
    const handleOldCourseChange = async (courseId: string) => {
        setAmcO_Id_Old(courseId);
        setAmB_Id_Old('');
        setAmsE_Id_Old('');
        setAmcO_Id_New('');
        setAmB_Id_New('');
        setAmcsT_Id('');

        setOldBranchList([]);
        setOldSemList([]);
        setNewBranchList([]);
        setStudentList([]);

        if (!courseId || !asmaY_Id) return;

        try {
            const res = await getBranchesMutation.mutateAsync({
                ASMAY_Id: Number(asmaY_Id),
                AMCO_Id: Number(courseId)
            });
            const data = res?.data || res;
            const branches = data?.coursebranchlist || data?.courseBranchList || data?.branchlist || data?.branches || [];
            if (branches.length > 0) {
                setOldBranchList(branches);
            } else {
                toast.warning('No branches found for the selected course');
            }
        } catch {
            toast.error('Failed to load branches');
        }
    };

    // Handle Old Branch Change -> load Old Semesters
    const handleOldBranchChange = async (branchId: string) => {
        setAmB_Id_Old(branchId);
        setAmsE_Id_Old('');
        setAmcO_Id_New('');
        setAmB_Id_New('');
        setAmcsT_Id('');

        setOldSemList([]);
        setNewBranchList([]);
        setStudentList([]);

        if (!branchId || !asmaY_Id || !amcO_Id_Old) return;

        try {
            const res = await getSemestersMutation.mutateAsync({
                ASMAY_Id: Number(asmaY_Id),
                AMCO_Id: Number(amcO_Id_Old),
                AMB_Id: Number(branchId)
            });
            const data = res?.data || res;
            const sems = data?.semlist || data?.semList || data?.semesters || [];
            if (sems.length > 0) {
                setOldSemList(sems);
            } else {
                toast.warning('No semesters found for the selected branch');
            }
        } catch {
            toast.error('Failed to load semesters');
        }
    };

    // Handle Old Semester Change -> load eligible students and initialize target options
    const handleOldSemChange = async (semId: string) => {
        setAmsE_Id_Old(semId);
        setAmcO_Id_New('');
        setAmB_Id_New('');
        setAmcsT_Id('');
        setNewBranchList([]);
        setStudentList([]);

        if (!semId || !asmaY_Id || !amcO_Id_Old || !amB_Id_Old) return;

        try {
            const res = await getCBSStudentsMutation.mutateAsync({
                ASMAY_Id: Number(asmaY_Id),
                AMCO_Id: Number(amcO_Id_Old),
                AMB_Id: Number(amB_Id_Old),
                AMSE_Id: Number(semId)
            });
            const data = res?.data || res;
            const students =
                data?.studentList4ys ||
                data?.studentList ||
                data?.studentList2 ||
                data?.studentlist ||
                [];

            if (students.length > 0) {
                setStudentList(students);
            } else {
                toast.info('No students found for course and branch transfer in this semester');
            }

            // Ensure new course options are available
            if (data?.newcourselist && Array.isArray(data.newcourselist) && data.newcourselist.length > 0) {
                setNewCourseList(data.newcourselist);
            }
        } catch {
            toast.error('Failed to load students for transfer');
        }
    };

    // Handle New Course Change -> load New Branches
    const handleNewCourseChange = async (newCourseId: string) => {
        setAmcO_Id_New(newCourseId);
        setAmB_Id_New('');
        setNewBranchList([]);

        if (!newCourseId || !asmaY_Id) return;

        try {
            const res = await getBranchesMutation.mutateAsync({
                ASMAY_Id: Number(asmaY_Id),
                AMCO_Id: Number(newCourseId)
            });
            const data = res?.data || res;
            const branches = data?.coursebranchlist || data?.courseBranchList || data?.branchlist || data?.branches || [];
            if (branches.length > 0) {
                // If same course is selected as old, filter out the old branch to avoid identical mapping
                if (newCourseId === amcO_Id_Old) {
                    setNewBranchList(branches.filter((b: any) => {
                        const bId = (b.amB_Id ?? b.AMB_Id ?? b.id)?.toString();
                        return bId !== amB_Id_Old;
                    }));
                } else {
                    setNewBranchList(branches);
                }
            } else {
                toast.warning('No branches found for selected new course');
            }
        } catch {
            toast.error('Failed to load new branches');
        }
    };

    // Reset Form
    const handleReset = () => {
        setAmcO_Id_Old('');
        setAmB_Id_Old('');
        setAmsE_Id_Old('');
        setAmcO_Id_New('');
        setAmB_Id_New('');
        setAmcsT_Id('');

        setOldCourseList(initialCourses);
        setNewCourseList(initialCourses);
        setOldBranchList(initialBranches);
        setNewBranchList(initialBranches);
        setOldSemList(initialSemesters);
        setStudentList([]);
    };

    // Submit / Save Course & Branch Transfer
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!asmaY_Id) {
            toast.warning('Please select an Academic Year');
            return;
        }
        if (!amcO_Id_Old) {
            toast.warning('Please select Old Course');
            return;
        }
        if (!amB_Id_Old) {
            toast.warning('Please select Old Branch');
            return;
        }
        if (!amsE_Id_Old) {
            toast.warning('Please select Old Semester');
            return;
        }
        if (!amcO_Id_New) {
            toast.warning('Please select New Course');
            return;
        }
        if (!amB_Id_New) {
            toast.warning('Please select New Branch');
            return;
        }
        if (!amcsT_Id) {
            toast.warning('Please select a Student');
            return;
        }

        // Validate that user is not picking the exact same course and branch
        if (amcO_Id_Old === amcO_Id_New && amB_Id_Old === amB_Id_New) {
            toast.warning('New Course and Branch cannot be identical to the Old Course and Branch');
            return;
        }

        const selectedStudent = studentList.find(
            (s) => (s.amcsT_Id ?? s.amsT_Id ?? s.AMST_Id)?.toString() === amcsT_Id
        );
        const studentDisplayName = selectedStudent
            ? `${selectedStudent.amcsT_FirstName || ''} ${selectedStudent.amcsT_MiddleName || ''} ${selectedStudent.amcsT_LastName || ''}`.trim() || selectedStudent.studentName
            : 'Selected Student';

        const oldCourseName = oldCourseList.find((c) => (c.amcO_Id ?? c.AMCO_Id)?.toString() === amcO_Id_Old)?.amcO_CourseName || 'Current Course';
        const newCourseName = newCourseList.find((c) => (c.amcO_Id ?? c.AMCO_Id)?.toString() === amcO_Id_New)?.amcO_CourseName || 'New Course';

        const confirm = await Swal.fire({
            title: 'Confirm Course & Branch Change',
            html: `
                <div class="text-left text-sm space-y-2">
                    <p>Are you sure you want to change Course & Branch for:</p>
                    <p class="font-bold text-primary">${studentDisplayName}</p>
                    <div class="rounded-lg bg-muted p-3 space-y-1">
                        <p><span class="text-muted-foreground">From:</span> <strong>${oldCourseName}</strong></p>
                        <p><span class="text-muted-foreground">To:</span> <strong>${newCourseName}</strong></p>
                    </div>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Change Course & Branch',
            cancelButtonText: 'Cancel',
            customClass: {
                confirmButton: 'bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md',
                cancelButton: 'bg-muted text-foreground hover:bg-muted/80 px-4 py-2 rounded-md ml-2'
            },
            buttonsStyling: false
        });

        if (!confirm.isConfirmed) return;

        try {
            const payload = {
                ASMAY_Id: Number(asmaY_Id),
                AMCO_Id_Old: Number(amcO_Id_Old),
                AMB_Id_Old: Number(amB_Id_Old),
                ASME_Id_Old: Number(amsE_Id_Old),
                AMCO_Id_New: Number(amcO_Id_New),
                AMB_Id_New: Number(amB_Id_New),
                AMCST_Id: Number(amcsT_Id)
            };

            const res = await saveMutation.mutateAsync(payload);
            const data = res?.data || res;

            if (data?.returnval === true || data?.returnVal === true || data?.message === 'Record Saved Successfully' || res?.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Transferred Successfully',
                    text: 'Student Course and Branch has been updated successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });

                if (data?.changedcoursebranchlist && Array.isArray(data.changedcoursebranchlist)) {
                    setChangedList(data.changedcoursebranchlist);
                } else {
                    refetchAll();
                }

                handleReset();
            } else if (data?.message) {
                toast.info(data.message);
            } else {
                toast.success('Course & Branch transfer request processed');
                refetchAll();
                handleReset();
            }
        } catch {
            toast.error('An error occurred while saving the Course and Branch change');
        }
    };

    // Filtered & Sorted Changed List
    const filteredChangedList = useMemo(() => {
        let list = changedList.filter((item) => {
            const term = search.toLowerCase();
            const student = (item.Student_Name || item.studentName || `${item.amcsT_FirstName || ''} ${item.amcsT_LastName || ''}`).toLowerCase();
            const admNo = (item.amcsT_AdmNo || '').toLowerCase();
            const year = (item.years || item.asmaY_Year || '').toLowerCase();
            const oldC = (item.old_CourseName || '').toLowerCase();
            const oldB = (item.old_BranchName || '').toLowerCase();
            const oldS = (item.old_SEMName || '').toLowerCase();
            const newC = (item.New_CourseName || '').toLowerCase();
            const newB = (item.New_BranchName || '').toLowerCase();
            const newS = (item.new_SEMName || '').toLowerCase();

            return (
                student.includes(term) ||
                admNo.includes(term) ||
                year.includes(term) ||
                oldC.includes(term) ||
                oldB.includes(term) ||
                oldS.includes(term) ||
                newC.includes(term) ||
                newB.includes(term) ||
                newS.includes(term)
            );
        });

        list.sort((a: any, b: any) => {
            const valA = (a[sortKey] || '').toString().toLowerCase();
            const valB = (b[sortKey] || '').toString().toLowerCase();
            if (valA < valB) return sortAsc ? -1 : 1;
            if (valA > valB) return sortAsc ? 1 : -1;
            return 0;
        });

        return list;
    }, [changedList, search, sortKey, sortAsc]);

    const totalPages = Math.ceil(filteredChangedList.length / itemsPerPage) || 1;
    const paginatedChangedList = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredChangedList.slice(start, start + itemsPerPage);
    }, [filteredChangedList, currentPage]);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortAsc(!sortAsc);
        } else {
            setSortKey(key);
            setSortAsc(true);
        }
    };

    // Label for current semester to display in New Semester field
    const selectedOldSemName = useMemo(() => {
        if (!amsE_Id_Old) return '';
        const found = oldSemList.find((s) => (s.amsE_Id ?? s.AMSE_Id)?.toString() === amsE_Id_Old);
        return found?.amsE_SEMName || found?.semesterName || '';
    }, [amsE_Id_Old, oldSemList]);

    const selectedYearName = useMemo(() => {
        if (!asmaY_Id) return '';
        const found = yearList.find((y) => (y.asmaY_Id ?? y.ASMAY_Id)?.toString() === asmaY_Id);
        return found?.asmaY_Year || found?.year || '';
    }, [asmaY_Id, yearList]);

    return (
        <div className='space-y-6'>
            {/* Form Section */}
            <CollapsibleSection
                title='Change Course and Branch'
                icon={<GitCompare className='h-5 w-5 text-primary' />}
                defaultOpen={true}
                variant='default'
                size='lg'>
                <form onSubmit={handleSave} className='space-y-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {/* Left Card: Current / Old Course and Branch Details */}
                        <Card className='border-border/70 shadow-sm'>
                            <CardContent className='p-5 space-y-4'>
                                <div className='flex items-center gap-2 border-b border-border/60 pb-3'>
                                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                                        <GraduationCap className='h-4 w-4' />
                                    </div>
                                    <div>
                                        <h4 className='font-semibold text-sm text-foreground'>Current (Old) Details</h4>
                                        <p className='text-xs text-muted-foreground'>Existing student academic assignment</p>
                                    </div>
                                </div>

                                {/* Academic Year */}
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-medium'>
                                        Academic Year <span className='text-destructive'>*</span>
                                    </Label>
                                    <Select value={asmaY_Id} onValueChange={handleYearChange}>
                                        <SelectTrigger className='h-9 text-xs'>
                                            <SelectValue placeholder='-- Select Academic Year --' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearList.map((y: any) => {
                                                const id = (y.asmaY_Id ?? y.ASMAY_Id ?? y.asmay_Id ?? y.id)?.toString();
                                                const name = y.asmaY_Year ?? y.ASMAY_Year ?? y.year ?? id;
                                                return (
                                                    <SelectItem key={id} value={id} className='text-xs'>
                                                        {name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Old Course */}
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-medium'>
                                        Old Course <span className='text-destructive'>*</span>
                                    </Label>
                                    <Select
                                        value={amcO_Id_Old}
                                        onValueChange={handleOldCourseChange}
                                        disabled={!asmaY_Id || oldCourseList.length === 0}>
                                        <SelectTrigger className='h-9 text-xs'>
                                            <SelectValue placeholder={oldCourseList.length === 0 ? 'No courses available' : '-- Select Course --'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {oldCourseList.map((c: any) => {
                                                const id = (c.amcO_Id ?? c.AMCO_Id ?? c.id)?.toString();
                                                const name = c.amcO_CourseName ?? c.AMCO_CourseName ?? c.courseName ?? id;
                                                return (
                                                    <SelectItem key={id} value={id} className='text-xs'>
                                                        {name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Old Branch */}
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-medium'>
                                        Old Branch <span className='text-destructive'>*</span>
                                    </Label>
                                    <Select
                                        value={amB_Id_Old}
                                        onValueChange={handleOldBranchChange}
                                        disabled={!amcO_Id_Old || oldBranchList.length === 0}>
                                        <SelectTrigger className='h-9 text-xs'>
                                            <SelectValue placeholder={oldBranchList.length === 0 ? 'No branches available' : '-- Select Branch --'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {oldBranchList.map((b: any) => {
                                                const id = (b.amB_Id ?? b.AMB_Id ?? b.id)?.toString();
                                                const name = b.amB_BranchName ?? b.AMB_BranchName ?? b.branchName ?? id;
                                                return (
                                                    <SelectItem key={id} value={id} className='text-xs'>
                                                        {name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Old Semester */}
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-medium'>
                                        Old Semester <span className='text-destructive'>*</span>
                                    </Label>
                                    <Select
                                        value={amsE_Id_Old}
                                        onValueChange={handleOldSemChange}
                                        disabled={!amB_Id_Old || oldSemList.length === 0}>
                                        <SelectTrigger className='h-9 text-xs'>
                                            <SelectValue placeholder={oldSemList.length === 0 ? 'No semesters available' : '-- Select Semester --'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {oldSemList.map((s: any) => {
                                                const id = (s.amsE_Id ?? s.AMSE_Id ?? s.id)?.toString();
                                                const name = s.amsE_SEMName ?? s.AMSE_SEMName ?? s.semesterName ?? id;
                                                return (
                                                    <SelectItem key={id} value={id} className='text-xs'>
                                                        {name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right Card: New / Target Course and Branch Details & Student Selection */}
                        <Card className='border-border/70 shadow-sm'>
                            <CardContent className='p-5 space-y-4'>
                                <div className='flex items-center gap-2 border-b border-border/60 pb-3'>
                                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600'>
                                        <ArrowRight className='h-4 w-4' />
                                    </div>
                                    <div>
                                        <h4 className='font-semibold text-sm text-foreground'>Target (New) Details</h4>
                                        <p className='text-xs text-muted-foreground'>Destination academic assignment & student</p>
                                    </div>
                                </div>

                                {/* Target Academic Year (Read-only matching Old Academic Year) */}
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-medium text-muted-foreground'>
                                        Academic Year <span className='text-destructive'>*</span>
                                    </Label>
                                    <Input
                                        value={selectedYearName || 'Select Academic Year on left'}
                                        disabled
                                        className='h-9 text-xs bg-muted/50 cursor-not-allowed font-medium'
                                    />
                                </div>

                                {/* New Course */}
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-medium'>
                                        New Course <span className='text-destructive'>*</span>
                                    </Label>
                                    <Select
                                        value={amcO_Id_New}
                                        onValueChange={handleNewCourseChange}
                                        disabled={!amsE_Id_Old || newCourseList.length === 0}>
                                        <SelectTrigger className='h-9 text-xs'>
                                            <SelectValue placeholder={newCourseList.length === 0 ? 'Select Old Semester first' : '-- Select New Course --'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {newCourseList.map((c: any) => {
                                                const id = (c.amcO_Id ?? c.AMCO_Id ?? c.id)?.toString();
                                                const name = c.amcO_CourseName ?? c.AMCO_CourseName ?? c.courseName ?? id;
                                                return (
                                                    <SelectItem key={id} value={id} className='text-xs'>
                                                        {name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* New Branch */}
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-medium'>
                                        New Branch <span className='text-destructive'>*</span>
                                    </Label>
                                    <Select
                                        value={amB_Id_New}
                                        onValueChange={setAmB_Id_New}
                                        disabled={!amcO_Id_New || newBranchList.length === 0}>
                                        <SelectTrigger className='h-9 text-xs'>
                                            <SelectValue placeholder={newBranchList.length === 0 ? 'No branches available' : '-- Select New Branch --'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {newBranchList.map((b: any) => {
                                                const id = (b.amB_Id ?? b.AMB_Id ?? b.id)?.toString();
                                                const name = b.amB_BranchName ?? b.AMB_BranchName ?? b.branchName ?? id;
                                                return (
                                                    <SelectItem key={id} value={id} className='text-xs'>
                                                        {name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* New Semester (Inherited & locked to Old Semester) */}
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-medium text-muted-foreground'>
                                        New Semester <span className='text-destructive'>*</span>
                                    </Label>
                                    <Input
                                        value={selectedOldSemName || 'Inherited from Old Semester'}
                                        disabled
                                        className='h-9 text-xs bg-muted/50 cursor-not-allowed font-medium'
                                    />
                                </div>

                                {/* Student Dropdown */}
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-medium'>
                                        Student <span className='text-destructive'>*</span>
                                    </Label>
                                    <Select
                                        value={amcsT_Id}
                                        onValueChange={setAmcsT_Id}
                                        disabled={!amsE_Id_Old || studentList.length === 0}>
                                        <SelectTrigger className='h-9 text-xs'>
                                            <SelectValue
                                                placeholder={
                                                    studentList.length === 0
                                                        ? amsE_Id_Old
                                                            ? 'No eligible students found'
                                                            : 'Select Old Semester first'
                                                        : '-- Select Student --'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent className='max-h-56'>
                                            {studentList.map((st: any) => {
                                                const id = (st.amcsT_Id ?? st.amsT_Id ?? st.AMST_Id ?? st.id)?.toString();
                                                const name = [
                                                    st.amcsT_FirstName,
                                                    st.amcsT_MiddleName,
                                                    st.amcsT_LastName
                                                ].filter(Boolean).join(' ') || st.studentName || id;
                                                const adm = st.amcsT_AdmNo ? ` (${st.amcsT_AdmNo})` : '';

                                                return (
                                                    <SelectItem key={id} value={id} className='text-xs'>
                                                        {name}{adm}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex items-center justify-center gap-3 pt-2'>
                        <Button
                            type='submit'
                            disabled={saveMutation.isPending}
                            className='flex items-center gap-2 px-6 h-9 text-xs font-medium shadow-sm'>
                            {saveMutation.isPending ? (
                                <>
                                    <Loader2 className='h-3.5 w-3.5 animate-spin' />
                                    <span>Saving Transfer...</span>
                                </>
                            ) : (
                                <>
                                    <Save className='h-3.5 w-3.5' />
                                    <span>Save Transfer</span>
                                </>
                            )}
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleReset}
                            disabled={saveMutation.isPending}
                            className='flex items-center gap-2 px-6 h-9 text-xs font-medium'>
                            <RotateCcw className='h-3.5 w-3.5' />
                            <span>Clear</span>
                        </Button>
                    </div>
                </form>
            </CollapsibleSection>

            {/* Changed Student List Table */}
            <div className='rounded-xl border border-border/80 bg-card p-5 shadow-sm space-y-4'>
                <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4'>
                    <div className='flex items-center gap-3'>
                        <h3 className='font-semibold text-base tracking-tight text-foreground'>
                            Changed Course and Branch Student List
                        </h3>
                        <div className='flex items-center gap-2'>
                            <Badge variant='outline' className='rounded-full px-2.5 py-0.5 text-xs font-semibold'>
                                Total: {changedList.length}
                            </Badge>
                            {search && (
                                <Badge variant='secondary' className='rounded-full px-2.5 py-0.5 text-xs font-semibold'>
                                    Found: {filteredChangedList.length}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className='relative w-full max-w-xs'>
                        <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder='Search in table...'
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className='h-9 pl-9 text-xs'
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
                                    onClick={() => handleSort('years')}>
                                    <div className='flex items-center gap-1'>
                                        Academic Year
                                        <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className='cursor-pointer font-bold'
                                    onClick={() => handleSort('old_CourseName')}>
                                    <div className='flex items-center gap-1'>
                                        Old Course
                                        <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className='cursor-pointer font-bold'
                                    onClick={() => handleSort('old_BranchName')}>
                                    <div className='flex items-center gap-1'>
                                        Old Branch
                                        <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className='cursor-pointer font-bold'
                                    onClick={() => handleSort('old_SEMName')}>
                                    <div className='flex items-center gap-1'>
                                        Old Sem
                                        <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className='cursor-pointer font-bold'
                                    onClick={() => handleSort('New_CourseName')}>
                                    <div className='flex items-center gap-1'>
                                        New Course
                                        <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className='cursor-pointer font-bold'
                                    onClick={() => handleSort('New_BranchName')}>
                                    <div className='flex items-center gap-1'>
                                        New Branch
                                        <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className='cursor-pointer font-bold'
                                    onClick={() => handleSort('new_SEMName')}>
                                    <div className='flex items-center gap-1'>
                                        New Sem
                                        <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className='cursor-pointer font-bold'
                                    onClick={() => handleSort('Student_Name')}>
                                    <div className='flex items-center gap-1'>
                                        Student Name
                                        <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                    </div>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedChangedList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className='h-24 text-center text-xs text-muted-foreground'>
                                        {changedList.length === 0 ? 'No changed course & branch records found.' : 'No matching records found.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedChangedList.map((item, idx) => {
                                    const serialNo = (currentPage - 1) * itemsPerPage + idx + 1;
                                    const studentName = item.Student_Name || item.studentName || `${item.amcsT_FirstName || ''} ${item.amcsT_LastName || ''}`.trim();
                                    return (
                                        <TableRow key={idx} className='text-xs hover:bg-muted/30'>
                                            <TableCell className='text-center font-medium'>{serialNo}</TableCell>
                                            <TableCell className='text-left'>{item.years || item.asmaY_Year || '-'}</TableCell>
                                            <TableCell className='text-left'>{item.old_CourseName || '-'}</TableCell>
                                            <TableCell className='text-left'>{item.old_BranchName || '-'}</TableCell>
                                            <TableCell className='text-left'>{item.old_SEMName || '-'}</TableCell>
                                            <TableCell className='text-left font-medium text-emerald-600 dark:text-emerald-400'>
                                                {item.New_CourseName || '-'}
                                            </TableCell>
                                            <TableCell className='text-left font-medium text-emerald-600 dark:text-emerald-400'>
                                                {item.New_BranchName || '-'}
                                            </TableCell>
                                            <TableCell className='text-left'>{item.new_SEMName || '-'}</TableCell>
                                            <TableCell className='text-left font-medium'>{studentName || '-'}</TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className='flex items-center justify-between border-t border-border/60 pt-3'>
                        <div className='text-xs text-muted-foreground'>
                            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                            {Math.min(currentPage * itemsPerPage, filteredChangedList.length)} of {filteredChangedList.length} entries
                        </div>
                        <div className='flex items-center gap-2'>
                            <Button
                                variant='outline'
                                size='icon'
                                className='h-8 w-8'
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}>
                                <ChevronLeft className='h-4 w-4' />
                            </Button>
                            <span className='text-xs font-medium text-muted-foreground'>
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant='outline'
                                size='icon'
                                className='h-8 w-8'
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}>
                                <ChevronRight className='h-4 w-4' />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
