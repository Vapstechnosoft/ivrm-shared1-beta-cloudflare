'use client';

import { Button } from '@/components/ui/button';
import { ChevronRight, GraduationCap, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { MappingFilterForm } from './_components/mapping-filter-form';
import { StudentMappingTable } from './_components/student-mapping-table';
import {
    getBranchesByCourse,
    getCoursesByYear,
    getInitialDetails,
    getSectionsBySemester,
    getSemestersByBranch,
    saveMappingDetails,
    searchStudentDetails
} from './actions';
import type {
    IAcademicYear,
    ICollegeBranch,
    ICollegeCourse,
    ICollegeSection,
    ICollegeSemester,
    IGroupSubject,
    IStudentMappingRow,
    ISubjectCheckboxItem,
    ISubjectGroup
} from './types';

export default function ClgStudentMappingPage() {
    // Dropdown States
    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [courses, setCourses] = useState<ICollegeCourse[]>([]);
    const [branches, setBranches] = useState<ICollegeBranch[]>([]);
    const [semesters, setSemesters] = useState<ICollegeSemester[]>([]);
    const [sections, setSections] = useState<ICollegeSection[]>([]);
    const [subjectGroups, setSubjectGroups] = useState<ISubjectGroup[]>([]);

    // Filter Selection States
    const [selectedYear, setSelectedYear] = useState<number | undefined>();
    const [selectedCourse, setSelectedCourse] = useState<number | undefined>();
    const [selectedBranch, setSelectedBranch] = useState<number | undefined>();
    const [selectedSemester, setSelectedSemester] = useState<number | undefined>();
    const [selectedSection, setSelectedSection] = useState<number | undefined>();
    const [selectedSubjectGroup, setSelectedSubjectGroup] = useState<number | undefined>();

    // Mapping Limits
    const [maxApplicableSubs, setMaxApplicableSubs] = useState<number>(0);
    const [minApplicableSubs, setMinApplicableSubs] = useState<number>(0);

    // Student & Subject List States
    const [subjectList, setSubjectList] = useState<IGroupSubject[]>([]);
    const [studentRows, setStudentRows] = useState<IStudentMappingRow[]>([]);
    const [saveUpdateMode, setSaveUpdateMode] = useState<'Save' | 'Update'>('Save');
    const [hasSearched, setHasSearched] = useState<boolean>(false);

    // Loading States
    const [isLoadingInitial, setIsLoadingInitial] = useState(false);
    const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    /**
     * Initial Load of All Dropdowns
     */
    const bindInitialData = useCallback(async () => {
        setIsLoadingInitial(true);
        try {
            const res = await getInitialDetails();
            if (res.success && res.data) {
                setAcademicYears(res.data.yearlist || []);
                setCourses(res.data.courseslist || []);
                setBranches(res.data.branchlist || []);
                setSemesters(res.data.semisters || []);
                setSections(res.data.sections || []);
                setSubjectGroups(res.data.subjectgrplist || []);
            } else {
                toast.error(res.message || 'Failed to load initial details');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error loading initial details');
        } finally {
            setIsLoadingInitial(false);
        }
    }, []);

    useEffect(() => {
        bindInitialData();
    }, [bindInitialData]);

    /**
     * Cascading Dropdown Handlers
     */
    const handleSelectYear = async (yearId: number) => {
        setSelectedYear(yearId);
        setSelectedCourse(undefined);
        setSelectedBranch(undefined);
        setSelectedSemester(undefined);
        setSelectedSection(undefined);
        setSelectedSubjectGroup(undefined);
        setCourses([]);
        setBranches([]);
        setSemesters([]);
        setSections([]);
        setSubjectGroups([]);
        setStudentRows([]);
        setSubjectList([]);
        setHasSearched(false);

        setIsLoadingDropdowns(true);
        try {
            const res = await getCoursesByYear({ ASMAY_Id: yearId });
            if (res.success && res.data) {
                setCourses(res.data.courseslist || []);
            } else {
                toast.error(res.message || 'Failed to load courses');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error changing academic year');
        } finally {
            setIsLoadingDropdowns(false);
        }
    };

    const handleSelectCourse = async (courseId: number) => {
        if (!selectedYear) return;
        setSelectedCourse(courseId);
        setSelectedBranch(undefined);
        setSelectedSemester(undefined);
        setSelectedSection(undefined);
        setSelectedSubjectGroup(undefined);
        setBranches([]);
        setSemesters([]);
        setSections([]);
        setSubjectGroups([]);
        setStudentRows([]);
        setSubjectList([]);
        setHasSearched(false);

        setIsLoadingDropdowns(true);
        try {
            const res = await getBranchesByCourse({
                ASMAY_Id: selectedYear,
                AMCO_Id: courseId
            });
            if (res.success && res.data) {
                setBranches(res.data.branchlist || []);
            } else {
                toast.error(res.message || 'Failed to load branches');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error changing course');
        } finally {
            setIsLoadingDropdowns(false);
        }
    };

    const handleSelectBranch = async (branchId: number) => {
        if (!selectedYear || !selectedCourse) return;
        setSelectedBranch(branchId);
        setSelectedSemester(undefined);
        setSelectedSection(undefined);
        setSelectedSubjectGroup(undefined);
        setSemesters([]);
        setSections([]);
        setSubjectGroups([]);
        setStudentRows([]);
        setSubjectList([]);
        setHasSearched(false);

        setIsLoadingDropdowns(true);
        try {
            const res = await getSemestersByBranch({
                ASMAY_Id: selectedYear,
                AMCO_Id: selectedCourse,
                AMB_Id: branchId
            });
            if (res.success && res.data) {
                setSemesters(res.data.semisters || []);
            } else {
                toast.error(res.message || 'Failed to load semesters');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error changing branch');
        } finally {
            setIsLoadingDropdowns(false);
        }
    };

    const handleSelectSemester = async (semId: number) => {
        if (!selectedYear || !selectedCourse || !selectedBranch) return;
        setSelectedSemester(semId);
        setSelectedSection(undefined);
        setSelectedSubjectGroup(undefined);
        setSections([]);
        setSubjectGroups([]);
        setStudentRows([]);
        setSubjectList([]);
        setHasSearched(false);

        setIsLoadingDropdowns(true);
        try {
            const res = await getSectionsBySemester({
                ASMAY_Id: selectedYear,
                AMCO_Id: selectedCourse,
                AMB_Id: selectedBranch,
                AMSE_Id: semId
            });
            if (res.success && res.data) {
                setSections(res.data.sections || []);
                setSubjectGroups(res.data.subjectgrplist || []);
            } else {
                toast.error(res.message || 'Failed to load sections & subject groups');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error changing semester');
        } finally {
            setIsLoadingDropdowns(false);
        }
    };

    const handleSelectSection = (secId: number) => {
        setSelectedSection(secId);
    };

    const handleSelectSubjectGroup = (grpId: number) => {
        setSelectedSubjectGroup(grpId);
        const grp = subjectGroups.find((g) => g.emG_Id === grpId);
        if (grp) {
            setMaxApplicableSubs(grp.emG_MaxAplSubjects || 0);
            setMinApplicableSubs(grp.emG_MinAplSubjects || 0);
        } else {
            setMaxApplicableSubs(0);
            setMinApplicableSubs(0);
        }
    };

    /**
     * Search Student Details
     */
    const handleSearch = async () => {
        if (!selectedYear || !selectedCourse || !selectedBranch || !selectedSemester || !selectedSection || !selectedSubjectGroup) {
            toast.error('Please select all required criteria fields.');
            return;
        }

        setIsSearching(true);
        setStudentRows([]);
        setSubjectList([]);
        setHasSearched(true);

        const payload = {
            ASMAY_Id: selectedYear,
            AMCO_Id: selectedCourse,
            AMB_Id: selectedBranch,
            ACMS_Id: selectedSection,
            AMSE_Id: selectedSemester,
            EMG_Id: selectedSubjectGroup
        };

        try {
            const res = await searchStudentDetails(payload);
            if (res.success && res.data) {
                const studlist = res.data.studlist || [];
                const allSubjects = res.data.allsubject_list || [];
                const studentDetails = res.data.allstudent_details || [];

                if (studlist.length === 0) {
                    toast.warning('No Record Found');
                    return;
                }

                setSubjectList(allSubjects);

                const constructedRows: IStudentMappingRow[] = [];
                let existingMappedStudentCount = 0;

                for (let i = 0; i < studlist.length; i++) {
                    const stu = studlist[i];

                    // Find subjects mapped to this student
                    const mappedSubjectIds = new Set<number>();
                    if (studentDetails.length > 0) {
                        studentDetails.forEach((dt) => {
                            if (dt.amcsT_Id === stu.amcsT_Id) {
                                mappedSubjectIds.add(dt.ismS_Id);
                            }
                        });
                    }

                    const subListView: ISubjectCheckboxItem[] = allSubjects.map((sub) => ({
                        id: sub.ismS_Id,
                        name: sub.ismS_SubjectName,
                        abc: mappedSubjectIds.has(sub.ismS_Id)
                    }));

                    const subList = subListView.filter((item) => item.abc).map((item) => ({ id: item.id, name: item.name, abc: true }));

                    const isRowSelected = subList.length > 0;
                    if (isRowSelected) {
                        existingMappedStudentCount++;
                    }

                    constructedRows.push({
                        amcsT_Id: stu.amcsT_Id,
                        amcsT_Name: stu.amcsT_Name,
                        amcsT_AdmNo: stu.amcsT_AdmNo,
                        amcsT_RegistrationNo: stu.amcsT_RegistrationNo,
                        sub_list: subList,
                        xyz: isRowSelected,
                        sub_list_view: subListView
                    });
                }

                setStudentRows(constructedRows);
                setSaveUpdateMode(existingMappedStudentCount > 0 ? 'Update' : 'Save');
                toast.success(`Found ${constructedRows.length} student record(s).`);
            } else {
                toast.error(res.message || 'Failed to fetch student details');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error searching student details');
        } finally {
            setIsSearching(false);
        }
    };

    /**
     * Toggle All Students
     */
    const handleToggleAllStudents = (checked: boolean) => {
        setStudentRows((prev) =>
            prev.map((row) => ({
                ...row,
                xyz: checked
            }))
        );
    };

    /**
     * Toggle Single Student Row
     */
    const handleToggleStudentRow = (studentId: number, checked: boolean) => {
        setStudentRows((prev) => prev.map((row) => (row.amcsT_Id === studentId ? { ...row, xyz: checked } : row)));
    };

    /**
     * Toggle Subject across all active students (Header checkbox for a subject)
     */
    const handleToggleSubjectForSelectedStudents = (subjectId: number, checked: boolean) => {
        let exceededCount = 0;

        setStudentRows((prev) =>
            prev.map((row) => {
                if (!row.xyz) return row; // Only apply to selected students

                const currentSubListView = row.sub_list_view.map((item) => {
                    if (item.id === subjectId) {
                        return { ...item, abc: checked };
                    }
                    return item;
                });

                const newCheckedCount = currentSubListView.filter((item) => item.abc).length;

                if (checked && maxApplicableSubs > 0 && newCheckedCount > maxApplicableSubs) {
                    exceededCount++;
                    return row; // Do not check if it exceeds max
                }

                const newSubList = currentSubListView
                    .filter((item) => item.abc)
                    .map((item) => ({ id: item.id, name: item.name, abc: true }));

                return {
                    ...row,
                    sub_list_view: currentSubListView,
                    sub_list: newSubList
                };
            })
        );

        if (exceededCount > 0) {
            toast.warning(
                `Cannot select subject for ${exceededCount} student(s) as it exceeds the maximum allowed (${maxApplicableSubs}).`
            );
        }
    };

    /**
     * Toggle Individual Student Subject Checkbox
     */
    const handleToggleStudentSubject = (studentId: number, subjectId: number, checked: boolean) => {
        setStudentRows((prev) =>
            prev.map((row) => {
                if (row.amcsT_Id !== studentId) return row;

                if (checked) {
                    // Check max limit
                    if (maxApplicableSubs > 0 && row.sub_list.length >= maxApplicableSubs) {
                        toast.error(`Beyond The Max. Applicable Subjects (${maxApplicableSubs}) You can't Select`);
                        return row;
                    }
                }

                const updatedSubListView = row.sub_list_view.map((col) => {
                    if (col.id === subjectId) {
                        return { ...col, abc: checked };
                    }
                    return col;
                });

                const updatedSubList = updatedSubListView
                    .filter((col) => col.abc)
                    .map((col) => ({ id: col.id, name: col.name, abc: true }));

                return {
                    ...row,
                    sub_list_view: updatedSubListView,
                    sub_list: updatedSubList
                };
            })
        );
    };

    /**
     * Save Mapping Details
     */
    const handleSave = async () => {
        if (!selectedYear || !selectedCourse || !selectedBranch || !selectedSemester || !selectedSection || !selectedSubjectGroup) {
            toast.error('Invalid filter parameters');
            return;
        }

        const selectedStudents = studentRows.filter((row) => row.xyz);
        if (selectedStudents.length === 0) {
            toast.warning('Please select at least one student.');
            return;
        }

        // Validate min applicable subjects for every selected student
        if (minApplicableSubs > 0) {
            const underMinStudents = selectedStudents.filter((stu) => stu.sub_list.length < minApplicableSubs);
            if (underMinStudents.length > 0) {
                toast.error(
                    `Selected Students Mapped Subjects Count Must Be At Least Equal To Min. Applicable Subjects (${minApplicableSubs}) Of Selected Group.`
                );
                return;
            }
        }

        const payload = {
            ECSTSU_Id: 0,
            ASMAY_Id: selectedYear,
            AMCO_Id: selectedCourse,
            AMB_Id: selectedBranch,
            ACMS_Id: selectedSection,
            AMSE_Id: selectedSemester,
            EMG_Id: selectedSubjectGroup,
            get_list: selectedStudents
        };

        setIsSaving(true);
        try {
            const res = await saveMappingDetails(payload);
            if (res.success && res.data) {
                if (res.data.returnval === true) {
                    if (saveUpdateMode === 'Save') {
                        toast.success('Record saved successfully');
                    } else {
                        toast.success('Record updated successfully');
                    }
                    handleReset();
                } else if (res.data.returnduplicatestatus === true || res.data.returnval === false) {
                    toast.error('Record already exist');
                } else {
                    toast.error(
                        saveUpdateMode === 'Save'
                            ? 'Failed to save, please contact administrator'
                            : 'Failed to update, please contact administrator'
                    );
                }
            } else {
                toast.error(res.message || 'Failed to save subject mapping');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error saving student subject mapping');
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Reset Page
     */
    const handleReset = () => {
        setSelectedYear(undefined);
        setSelectedCourse(undefined);
        setSelectedBranch(undefined);
        setSelectedSemester(undefined);
        setSelectedSection(undefined);
        setSelectedSubjectGroup(undefined);
        setMaxApplicableSubs(0);
        setMinApplicableSubs(0);

        setCourses([]);
        setBranches([]);
        setSemesters([]);
        setSections([]);
        setSubjectGroups([]);

        setStudentRows([]);
        setSubjectList([]);
        setHasSearched(false);

        bindInitialData();
        toast.info('Form cleared.');
    };

    return (
        <div className='fade-in container mx-auto max-w-7xl animate-in space-y-6 p-4 duration-300 sm:p-6 lg:p-8'>
            {/* Breadcrumb Navigation */}
            <div className='flex flex-col gap-2'>
                <nav aria-label='Breadcrumb' className='flex items-center space-x-1.5 text-muted-foreground text-xs'>
                    <Link href='/Exam' className='transition-colors hover:text-foreground'>
                        Exam
                    </Link>
                    <ChevronRight className='h-3.5 w-3.5 opacity-60' />
                    <Link href='/Exam/exam-module' className='transition-colors hover:text-foreground'>
                        Exam Module
                    </Link>
                    <ChevronRight className='h-3.5 w-3.5 opacity-60' />
                    <Link href='/Exam/exam-module/collage' className='transition-colors hover:text-foreground'>
                        College
                    </Link>
                    <ChevronRight className='h-3.5 w-3.5 opacity-60' />
                    <span className='font-medium text-foreground'>Student Mapping</span>
                </nav>

                {/* Page Title Header */}
                <div className='flex flex-col justify-between gap-4 border-b pb-3 sm:flex-row sm:items-center'>
                    <div className='flex items-center space-x-3'>
                        <div className='rounded-xl bg-primary p-2.5 text-primary-foreground shadow-sm'>
                            <GraduationCap className='h-6 w-6' />
                        </div>
                        <div>
                            <h1 className='font-bold text-foreground text-xl tracking-tight sm:text-2xl'>College Student Mapping</h1>
                            <p className='text-muted-foreground text-xs sm:text-sm'>
                                Map and configure elective and core college subjects to students within subject groups
                            </p>
                        </div>
                    </div>

                    <div className='flex items-center gap-2'>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={handleReset}
                            disabled={isLoadingInitial || isLoadingDropdowns || isSearching || isSaving}
                            className='h-9 text-xs'>
                            <RefreshCw className='mr-1.5 h-3.5 w-3.5' />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filter Form Card */}
            <MappingFilterForm
                academicYears={academicYears}
                courses={courses}
                branches={branches}
                semesters={semesters}
                sections={sections}
                subjectGroups={subjectGroups}
                selectedYear={selectedYear}
                selectedCourse={selectedCourse}
                selectedBranch={selectedBranch}
                selectedSemester={selectedSemester}
                selectedSection={selectedSection}
                selectedSubjectGroup={selectedSubjectGroup}
                maxApplicableSubs={maxApplicableSubs}
                minApplicableSubs={minApplicableSubs}
                onSelectYear={handleSelectYear}
                onSelectCourse={handleSelectCourse}
                onSelectBranch={handleSelectBranch}
                onSelectSemester={handleSelectSemester}
                onSelectSection={handleSelectSection}
                onSelectSubjectGroup={handleSelectSubjectGroup}
                onSearch={handleSearch}
                onReset={handleReset}
                isLoadingDropdowns={isLoadingDropdowns}
                isSearching={isSearching}
            />

            {/* Student Mapping Table */}
            {hasSearched && studentRows.length > 0 && (
                <StudentMappingTable
                    studentRows={studentRows}
                    subjectList={subjectList}
                    saveUpdateMode={saveUpdateMode}
                    maxApplicableSubs={maxApplicableSubs}
                    minApplicableSubs={minApplicableSubs}
                    onToggleAllStudents={handleToggleAllStudents}
                    onToggleStudentRow={handleToggleStudentRow}
                    onToggleSubjectForSelectedStudents={handleToggleSubjectForSelectedStudents}
                    onToggleStudentSubject={handleToggleStudentSubject}
                    onSave={handleSave}
                    onCancel={handleReset}
                    isSaving={isSaving}
                />
            )}
        </div>
    );
}
