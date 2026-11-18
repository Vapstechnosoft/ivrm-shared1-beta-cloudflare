'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Search, X, ArrowRightLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
    useTransferLoadData,
    useGetTransferBranches,
    useGetTransferSemesters,
    useSearchTransferStudents,
    useExportToAdmission,
} from '@/hooks/college/useCollegeTransactions';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CourseItem {
    amcO_Id: number;
    amcO_CourseName: string;
    selected: boolean;
}
interface BranchItem {
    amB_Id: number;
    amB_BranchName: string;
    selected: boolean;
}
interface SemesterItem {
    amsE_Id: number;
    amsE_SEMName: string;
    selected: boolean;
}
interface StudentItem {
    pacA_Id: number;
    pasR_Id: number;
    studentname: string;
    amcO_CourseName: string;
    amB_BranchName: string;
    amsE_SEMName: string;
    isSelected: boolean;
}

// ─── Validation Schema ────────────────────────────────────────────────────────

const searchSchema = z.object({
    asmaY_Id: z.coerce.number().min(1, 'Please select Academic Year'),
});

// ─── Multi-Select Checkbox List Component ─────────────────────────────────────

function MultiSelectList<T extends { selected: boolean }>({
    items,
    labelKey,
    onToggleAll,
    onToggleItem,
    allSelected,
    disabled = false,
}: {
    items: T[];
    labelKey: keyof T;
    onToggleAll: (checked: boolean) => void;
    onToggleItem: (item: T, checked: boolean) => void;
    allSelected: boolean;
    disabled?: boolean;
}) {
    const isIndeterminate = !allSelected && items.some((i) => i.selected);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b">
                <Checkbox
                    id={`all-${String(labelKey)}`}
                    checked={allSelected}
                    data-state={isIndeterminate ? 'indeterminate' : undefined}
                    onCheckedChange={(c) => onToggleAll(!!c)}
                    disabled={disabled}
                />
                <label htmlFor={`all-${String(labelKey)}`} className="text-sm font-medium cursor-pointer select-none">
                    All
                </label>
            </div>
            <ScrollArea className="h-40 w-full rounded border px-2">
                <div className="space-y-1 py-1">
                    {items.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">
                            {disabled ? 'Select previous fields first' : 'No items available'}
                        </p>
                    ) : (
                        items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 py-0.5">
                                <Checkbox
                                    id={`item-${String(labelKey)}-${idx}`}
                                    checked={item.selected}
                                    onCheckedChange={(c) => onToggleItem(item, !!c)}
                                />
                                <label
                                    htmlFor={`item-${String(labelKey)}-${idx}`}
                                    className="text-sm cursor-pointer select-none leading-tight"
                                >
                                    {String(item[labelKey])}
                                </label>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TransfrPreAdmtoAdmClgPage() {
    const { data: loadResponse, isLoading: isLoadingData } = useTransferLoadData();
    const { mutateAsync: getBranches, isPending: isBranchLoading } = useGetTransferBranches();
    const { mutateAsync: getSemesters, isPending: isSemesterLoading } = useGetTransferSemesters();
    const { mutateAsync: searchStudents, isPending: isSearching } = useSearchTransferStudents();
    const { mutateAsync: doExport, isPending: isExporting } = useExportToAdmission();

    // Dropdown data
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [courses, setCourses] = useState<CourseItem[]>([]);
    const [branches, setBranches] = useState<BranchItem[]>([]);
    const [semesters, setSemesters] = useState<SemesterItem[]>([]);

    // "Select All" state
    const [allCourses, setAllCourses] = useState(false);
    const [allBranches, setAllBranches] = useState(false);
    const [allSemesters, setAllSemesters] = useState(false);

    // Results
    const [students, setStudents] = useState<StudentItem[]>([]);
    const [showGrid, setShowGrid] = useState(false);
    const [globalSearch, setGlobalSearch] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);

    const form = useForm<{ asmaY_Id: number }>({
        resolver: zodResolver(searchSchema),
        defaultValues: { asmaY_Id: 0 },
    });

    // Load initial data
    useEffect(() => {
        if (loadResponse?.data) {
            const d = loadResponse.data;
            setAcademicYears(d.yearlist || []);
            const courseList: CourseItem[] = (d.courselist || []).map((c: any) => ({ ...c, selected: false }));
            setCourses(courseList);
        }
    }, [loadResponse]);

    // ─── Course Selection ─────────────────────────────────────────────────────

    const getSelectedCourseArray = (list: CourseItem[]) =>
        list.filter((c) => c.selected).map((c) => ({ AMCO_Id: c.amcO_Id }));

    const fetchBranches = async (courseList: CourseItem[]) => {
        setBranches([]);
        setSemesters([]);
        setAllBranches(false);
        setAllSemesters(false);
        const selected = getSelectedCourseArray(courseList);
        if (selected.length === 0) return;
        const res = await getBranches({ courselistarray: selected });
        const branchList: BranchItem[] = (res?.data?.branchlist || []).map((b: any) => ({ ...b, selected: false }));
        setBranches(branchList);
    };

    const handleToggleAllCourses = (checked: boolean) => {
        setAllCourses(checked);
        const updated = courses.map((c) => ({ ...c, selected: checked }));
        setCourses(updated);
        if (!checked) {
            setBranches([]);
            setSemesters([]);
            setAllBranches(false);
            setAllSemesters(false);
        } else {
            fetchBranches(updated);
        }
    };

    const handleToggleCourse = (item: CourseItem, checked: boolean) => {
        const updated = courses.map((c) => (c.amcO_Id === item.amcO_Id ? { ...c, selected: checked } : c));
        setCourses(updated);
        setAllCourses(updated.every((c) => c.selected));
        fetchBranches(updated);
    };

    // ─── Branch Selection ─────────────────────────────────────────────────────

    const getSelectedBranchArray = (list: BranchItem[]) =>
        list.filter((b) => b.selected).map((b) => ({ AMB_Id: b.amB_Id }));

    const fetchSemesters = async (branchList: BranchItem[]) => {
        setSemesters([]);
        setAllSemesters(false);
        const selBranches = getSelectedBranchArray(branchList);
        const selCourses = getSelectedCourseArray(courses);
        if (selBranches.length === 0) return;
        const res = await getSemesters({ courselistarray: selCourses, branchlistarray: selBranches });
        const semList: SemesterItem[] = (res?.data?.semesterlist || []).map((s: any) => ({ ...s, selected: false }));
        setSemesters(semList);
    };

    const handleToggleAllBranches = (checked: boolean) => {
        setAllBranches(checked);
        const updated = branches.map((b) => ({ ...b, selected: checked }));
        setBranches(updated);
        if (!checked) {
            setSemesters([]);
            setAllSemesters(false);
        } else {
            fetchSemesters(updated);
        }
    };

    const handleToggleBranch = (item: BranchItem, checked: boolean) => {
        const updated = branches.map((b) => (b.amB_Id === item.amB_Id ? { ...b, selected: checked } : b));
        setBranches(updated);
        setAllBranches(updated.every((b) => b.selected));
        fetchSemesters(updated);
    };

    // ─── Semester Selection ───────────────────────────────────────────────────

    const handleToggleAllSemesters = (checked: boolean) => {
        setAllSemesters(checked);
        setSemesters((prev) => prev.map((s) => ({ ...s, selected: checked })));
    };

    const handleToggleSemester = (item: SemesterItem, checked: boolean) => {
        const updated = semesters.map((s) => (s.amsE_Id === item.amsE_Id ? { ...s, selected: checked } : s));
        setSemesters(updated);
        setAllSemesters(updated.every((s) => s.selected));
    };

    // ─── Search ───────────────────────────────────────────────────────────────

    const handleSearch = async (values: { asmaY_Id: number }) => {
        const courseArr = getSelectedCourseArray(courses);
        const branchArr = getSelectedBranchArray(branches);
        const semArr = semesters.filter((s) => s.selected).map((s) => ({ AMSE_Id: s.amsE_Id }));

        if (courseArr.length === 0) {
            toast.error('Please select at least one Course');
            return;
        }
        if (branchArr.length === 0) {
            toast.error('Please select at least one Branch');
            return;
        }
        if (semArr.length === 0) {
            toast.error('Please select at least one Semester');
            return;
        }

        const res = await searchStudents({
            ASMAY_Id: values.asmaY_Id,
            courselistarray: courseArr,
            branchlistarray: branchArr,
            semesterlistarray: semArr,
        });

        const list: StudentItem[] = (res?.data?.preAdmtoAdmStuList || []).map((s: any) => ({
            ...s,
            isSelected: false,
        }));

        if (list.length === 0) {
            toast.info('No records found');
            setShowGrid(false);
            return;
        }

        setStudents(list);
        setShowGrid(true);
        setGlobalSearch('');
    };

    const handleCancel = () => {
        form.reset({ asmaY_Id: 0 });
        setCourses((prev) => prev.map((c) => ({ ...c, selected: false })));
        setBranches([]);
        setSemesters([]);
        setAllCourses(false);
        setAllBranches(false);
        setAllSemesters(false);
        setStudents([]);
        setShowGrid(false);
    };

    // ─── Student Selection ────────────────────────────────────────────────────

    const toggleAllStudents = (checked: boolean) => {
        setStudents((prev) => prev.map((s) => ({ ...s, isSelected: checked })));
    };

    const toggleStudent = (pacA_Id: number, checked: boolean) => {
        setStudents((prev) => prev.map((s) => (s.pacA_Id === pacA_Id ? { ...s, isSelected: checked } : s)));
    };

    const selectedStudents = students.filter((s) => s.isSelected);
    const allStudentsSelected = students.length > 0 && students.every((s) => s.isSelected);

    // ─── Export ───────────────────────────────────────────────────────────────

    const handleExport = async () => {
        if (selectedStudents.length === 0) {
            toast.error('Kindly select at least one student');
            return;
        }
        setConfirmOpen(true);
    };

    const confirmExport = async () => {
        setConfirmOpen(false);
        const courseArr = getSelectedCourseArray(courses);
        const branchArr = getSelectedBranchArray(branches);
        const semArr = semesters.filter((s) => s.selected).map((s) => ({ AMSE_Id: s.amsE_Id }));

        const res = await doExport({
            ASMAY_Id: form.getValues('asmaY_Id'),
            courselistarray: courseArr,
            branchlistarray: branchArr,
            semesterlistarray: semArr,
            studentdetails: selectedStudents,
            configurationsettings: {},
        });

        const msg = res?.data?.returnMsg;
        if (msg === 'true') {
            toast.success('Record saved/updated successfully!');
            handleCancel();
        } else if (msg === 'false') {
            toast.error('Record not saved/updated');
        } else if (msg) {
            toast.info(msg);
        } else {
            toast.error('Unexpected response from server');
        }
    };

    // ─── Filter students by global search ────────────────────────────────────

    const filteredStudents = globalSearch.trim()
        ? students.filter((s) =>
              `${s.studentname} ${s.amcO_CourseName} ${s.amB_BranchName} ${s.amsE_SEMName}`
                  .toLowerCase()
                  .includes(globalSearch.toLowerCase())
          )
        : students;

    // ─── Table Columns ────────────────────────────────────────────────────────

    const columns: ColumnDef<StudentItem>[] = [
        {
            id: 'select',
            header: () => (
                <Checkbox
                    checked={allStudentsSelected}
                    data-state={!allStudentsSelected && students.some((s) => s.isSelected) ? 'indeterminate' : undefined}
                    onCheckedChange={(c) => toggleAllStudents(!!c)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.original.isSelected}
                    onCheckedChange={(c) => toggleStudent(row.original.pacA_Id, !!c)}
                    aria-label="Select row"
                />
            ),
            size: 40,
        },
        {
            id: 'slno',
            header: 'SL.NO',
            cell: ({ row }) => row.index + 1,
            size: 60,
        },
        {
            accessorKey: 'studentname',
            header: 'Student Name',
        },
        {
            accessorKey: 'amcO_CourseName',
            header: 'Course',
        },
        {
            accessorKey: 'amB_BranchName',
            header: 'Branch',
        },
        {
            accessorKey: 'amsE_SEMName',
            header: 'Semester',
        },
    ];

    const tableProps = useDataTableProps({ data: filteredStudents, total: filteredStudents.length });

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen">
            <div className="container space-y-4 p-1">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight">Transfer Preadmission To Admission</h1>
                    <p className="text-sm text-muted-foreground">
                        Select academic year, courses, branches and semesters to search and transfer students from preadmission to admission.
                    </p>
                </div>

                {/* Search / Filter Section */}
                <CollapsibleSection title="Search Criteria" defaultOpen={true}>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-5">
                            {/* Academic Year */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="asmaY_Id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Academic Year <span className="text-red-500">*</span></FormLabel>
                                            <Select
                                                value={field.value ? String(field.value) : ''}
                                                onValueChange={(val) => {
                                                    field.onChange(Number(val));
                                                    // Reload courses from initial data when year changes
                                                    if (loadResponse?.data) {
                                                        setCourses((loadResponse.data.courselist || []).map((c: any) => ({ ...c, selected: false })));
                                                        setBranches([]);
                                                        setSemesters([]);
                                                        setAllCourses(false);
                                                        setAllBranches(false);
                                                        setAllSemesters(false);
                                                    }
                                                }}
                                                disabled={isLoadingData}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Academic Year" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {academicYears.map((y) => (
                                                        <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                            {y.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Course / Branch / Semester Multi-Select */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                        Course <span className="text-red-500 font-bold">*</span>
                                    </p>
                                    <MultiSelectList
                                        items={courses}
                                        labelKey="amcO_CourseName"
                                        allSelected={allCourses}
                                        onToggleAll={handleToggleAllCourses}
                                        onToggleItem={handleToggleCourse}
                                        disabled={isLoadingData}
                                    />
                                    {isBranchLoading && <p className="text-xs text-muted-foreground animate-pulse">Loading branches...</p>}
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                        Branch <span className="text-red-500 font-bold">*</span>
                                    </p>
                                    <MultiSelectList
                                        items={branches}
                                        labelKey="amB_BranchName"
                                        allSelected={allBranches}
                                        onToggleAll={handleToggleAllBranches}
                                        onToggleItem={handleToggleBranch}
                                        disabled={branches.length === 0}
                                    />
                                    {isSemesterLoading && <p className="text-xs text-muted-foreground animate-pulse">Loading semesters...</p>}
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                        Semester <span className="text-red-500 font-bold">*</span>
                                    </p>
                                    <MultiSelectList
                                        items={semesters}
                                        labelKey="amsE_SEMName"
                                        allSelected={allSemesters}
                                        onToggleAll={handleToggleAllSemesters}
                                        onToggleItem={handleToggleSemester}
                                        disabled={semesters.length === 0}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-1">
                                <Button type="submit" disabled={isSearching} className="gap-2">
                                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                    {isSearching ? 'Searching...' : 'Search'}
                                </Button>
                                <Button type="button" variant="outline" onClick={handleCancel} className="gap-2">
                                    <X className="h-4 w-4" />
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CollapsibleSection>

                {/* Results Grid */}
                {showGrid && (
                    <CollapsibleSection title="List of Students" defaultOpen={true}>
                        <div className="space-y-3">
                            {/* Stats + Search */}
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-4 text-sm">
                                    <span>
                                        <strong>Total Records:</strong>{' '}
                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                            {students.length}
                                        </span>
                                    </span>
                                    {globalSearch && (
                                        <span>
                                            <strong>Filtered:</strong>{' '}
                                            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold">
                                                {filteredStudents.length}
                                            </span>
                                        </span>
                                    )}
                                    {selectedStudents.length > 0 && (
                                        <span>
                                            <strong>Selected:</strong>{' '}
                                            <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-semibold">
                                                {selectedStudents.length}
                                            </span>
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        className="pl-8 h-9 w-56 text-sm"
                                        placeholder="Search here..."
                                        value={globalSearch}
                                        onChange={(e) => setGlobalSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <GenericDataTable {...tableProps} columns={columns} />

                            {/* Export Button */}
                            <div className="flex justify-center pt-2 border-t">
                                <Button
                                    onClick={handleExport}
                                    disabled={isExporting || selectedStudents.length === 0}
                                    className="gap-2"
                                >
                                    {isExporting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <ArrowRightLeft className="h-4 w-4" />
                                    )}
                                    Export to Admission
                                </Button>
                            </div>
                        </div>
                    </CollapsibleSection>
                )}
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Transfer to Admission?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to transfer <strong>{selectedStudents.length}</strong> student(s) from
                            preadmission to admission. This action cannot be easily undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => toast.info('Record Transfer Cancelled')}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={confirmExport} className="bg-destructive hover:bg-destructive/90">
                            Yes, Transfer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
