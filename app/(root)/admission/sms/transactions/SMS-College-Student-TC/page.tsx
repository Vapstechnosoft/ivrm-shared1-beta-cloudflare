'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { DatePicker } from '@/components/ui/date-picker';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
    getInitialData,
    onBranchChange,
    onCourseChange,
    onSemesterChange,
    onStudentChange,
    onYearChange,
    saveTC,
    searchFilter
} from '@/server/admission/sms/transactions/sms-college-student-tc';
import type { ISMSCollegeStudentTCDetails } from '@/types/admission/sms/transactions/sms-college-student-tc';
import { format } from 'date-fns';
import { Eraser, Save, User } from 'lucide-react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function SMSCollegeStudentTCPage() {
    // Initial Data
    const [years, setYears] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [semesters, setSemesters] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [config, setConfig] = useState<any>(null);

    // Filter State
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [selectedBranch, setSelectedBranch] = useState<string>('');
    const [selectedSemester, setSelectedSemester] = useState<string>('');
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [admSelection, setAdmSelection] = useState<string>('All');
    const [studentStatus, setStudentStatus] = useState<string>('S');
    const [tempTC, setTempTC] = useState<boolean>(false);
    const [admNoName, setAdmNoName] = useState<string>('N');

    // Student Details State
    const [studentDetails, setStudentDetails] = useState<ISMSCollegeStudentTCDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Form State (Details)
    const [promotionDate, setPromotionDate] = useState<Date | undefined>(new Date());
    const [medInstruction, setMedInstruction] = useState<string>('');
    const [languagesStudied, setLanguagesStudied] = useState<string>('');
    const [electivesStudied, setElectivesStudied] = useState<string>('');
    const [scholarship, setScholarship] = useState<string>('');
    const [medicallyExamined, setMedicallyExamined] = useState<string>('');
    const [tcNo, setTcNo] = useState<string>('');
    const [appDate, setAppDate] = useState<Date | undefined>(new Date());
    const [leavingReason, setLeavingReason] = useState<string>('');
    const [tcDate, setTcDate] = useState<Date | undefined>(new Date());
    const [lastAttendedDate, setLastAttendedDate] = useState<Date | undefined>(new Date());
    const [schoolDays, setSchoolDays] = useState<string>('');
    const [attendedDays, setAttendedDays] = useState<string>('');
    const [feePaid, setFeePaid] = useState<string>('');
    const [feeConcession, setFeeConcession] = useState<string>('');
    const [lastExamDetails, setLastExamDetails] = useState<string>('');
    const [results, setResults] = useState<string>('');
    const [failDetails, setFailDetails] = useState<string>('');
    const [promotionQualified, setPromotionQualified] = useState<string>('');
    const [qualifiedStatus, setQualifiedStatus] = useState<string>('');
    const [nccDetails, setNccDetails] = useState<string>('');
    const [extraActivities, setExtraActivities] = useState<string>('');
    const [conduct, setConduct] = useState<string>('');
    const [remarks, setRemarks] = useState<string>('');

    // Dues (Read Only)
    const [feeDue, setFeeDue] = useState<number>(0);
    const [libDue, setLibDue] = useState<number>(0);
    const [storeDue, setStoreDue] = useState<number>(0);
    const [pdaDue, setPdaDue] = useState<number>(0);

    // UI helpers
    const [studentSearchOpen, setStudentSearchOpen] = useState(false);
    const [studentSearchTerm, setStudentSearchTerm] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const res = await getInitialData();
            if (res.success && res.data) {
                setYears(res.data.getyear);
                setConfig(res.data.getconfigurationdetails?.[0]);
            }
        } catch (error) {
            toast.error('Failed to load initial data');
        }
    };

    const handleYearChange = async (val: string) => {
        setSelectedYear(val);
        setCourses([]);
        setBranches([]);
        setSemesters([]);
        setSections([]);
        setSelectedCourse('');
        setSelectedBranch('');
        setSelectedSemester('');
        setSelectedSection('');
        setSelectedStudent(null);
        setStudentDetails(null);

        try {
            const res = await onYearChange(Number(val));
            if (res.success && res.data) {
                setCourses(res.data.getcourse);
            }
        } catch (error) {
            toast.error('Error fetching courses');
        }
    };

    const handleCourseChange = async (val: string) => {
        setSelectedCourse(val);
        setBranches([]);
        setSemesters([]);
        setSections([]);
        setSelectedBranch('');
        setSelectedSemester('');
        setSelectedSection('');

        try {
            const res = await onCourseChange(Number(selectedYear), Number(val));
            if (res.success && res.data) {
                setBranches(res.data.getbranch);
            }
        } catch (error) {
            toast.error('Error fetching branches');
        }
    };

    const handleBranchChange = async (val: string) => {
        setSelectedBranch(val);
        setSemesters([]);
        setSections([]);
        setSelectedSemester('');
        setSelectedSection('');

        try {
            const res = await onBranchChange(Number(selectedYear), Number(selectedCourse), Number(val));
            if (res.success && res.data) {
                setSemesters(res.data.getsemester);
            }
        } catch (error) {
            toast.error('Error fetching semesters');
        }
    };

    const handleSemesterChange = async (val: string) => {
        setSelectedSemester(val);
        setSections([]);
        setSelectedSection('');

        try {
            const res = await onSemesterChange(Number(selectedYear), Number(selectedCourse), Number(selectedBranch), Number(val));
            if (res.success && res.data) {
                setSections(res.data.getssection);
            }
        } catch (error) {
            toast.error('Error fetching sections');
        }
    };

    const handleSectionChange = async (val: string) => {
        setSelectedSection(val);
        // Additional logic maybe?
    };

    const handleStudentSearch = async (term: string) => {
        setStudentSearchTerm(term);
        if (term.length >= 2) {
            const data = {
                ASMAY_Id: Number(selectedYear),
                AMCO_Id: admSelection === 'All' ? 0 : Number(selectedCourse),
                AMB_Id: admSelection === 'All' ? 0 : Number(selectedBranch),
                AMSE_Id: admSelection === 'All' ? 0 : Number(selectedSemester),
                ACMS_Id: admSelection === 'All' ? 0 : Number(selectedSection),
                searchfilter: term,
                AMCST_SOL: studentStatus,
                allorindividual: admSelection,
                adm_num_flag: admNoName
            };
            try {
                const res = await searchFilter(data);
                if (res.success && res.data) {
                    setStudents(res.data);
                }
            } catch (error) {
                console.error('Search failed');
            }
        }
    };

    const handleStudentSelect = async (student: any) => {
        setSelectedStudent(student);
        setStudentSearchOpen(false);
        setLoading(true);

        const data = {
            ASMAY_Id: Number(selectedYear),
            AMCO_Id: admSelection === 'All' ? 0 : Number(selectedCourse),
            AMB_Id: admSelection === 'All' ? 0 : Number(selectedBranch),
            AMSE_Id: admSelection === 'All' ? 0 : Number(selectedSemester),
            ACMS_Id: admSelection === 'All' ? 0 : Number(selectedSection),
            AMCST_Id: student.amcsT_Id,
            AMCST_SOL: studentStatus,
            adm_num_flag: admNoName
        };

        try {
            const res = await onStudentChange(data);
            if (res.success && res.data) {
                const sd = res.data.getstudentdetails?.[0];
                const ad = res.data.getstudentattendancedetails?.[0];
                const fd = res.data.getstudentfeedetails?.[0];
                const sub = res.data.getstudentlanguagesubjects;

                setStudentDetails(sd);

                // Populate Form
                if (sd) {
                    setMedInstruction(sd.ACSTC_MediumOfINStruction || '');
                    setScholarship(sd.ACSTC_Scholarship || '');
                    setMedicallyExamined(sd.ACSTC_MedicallyExam || '');
                    setTcNo(sd.ACSTC_TCNO || '');
                    setLeavingReason(sd.ACSTC_LeavingReason || '');
                    setFeeConcession(sd.ACSTC_FeeConcession || '');
                    setLastExamDetails(sd.ACSTC_LastExamDetails || '');
                    setResults(sd.ACSTC_Result || '');
                    setFailDetails(sd.ACSTC_ResultDetails || '');
                    setPromotionQualified(sd.ACSTC_Qual_PromotionFlag || '');
                    setQualifiedStatus(sd.ACSTC_Qual_Course || '');
                    setNccDetails(sd.ACSTC_NCCDetails || '');
                    setExtraActivities(sd.ACSTC_ExtraActivities || '');
                    setConduct(sd.ACSTC_Conduct || '');
                    setRemarks(sd.ACSTC_Remarks || '');

                    setPromotionDate(sd.ACSTC_PromotionDate ? new Date(sd.ACSTC_PromotionDate) : new Date());
                    setAppDate(sd.ACSTC_TCApplicationDate ? new Date(sd.ACSTC_TCApplicationDate) : new Date());
                    setTcDate(sd.ACSTC_TCDate ? new Date(sd.ACSTC_TCDate) : new Date());
                }

                if (ad) {
                    setSchoolDays(ad.classheld?.toString() || '');
                    setAttendedDays(ad.classattened?.toString() || '');
                    setLastAttendedDate(ad.lastdate ? new Date(ad.lastdate) : new Date());
                }

                if (fd) {
                    setFeeDue(fd.balance || 0);
                    setFeePaid(fd.balance > 0 ? 'No' : 'Yes');
                }

                if (sub) {
                    const l = sub
                        .filter((s) => s.flag === 1)
                        .map((s) => s.subjectname)
                        .join(', ');
                    const e = sub
                        .filter((s) => s.flag !== 1)
                        .map((s) => s.subjectname)
                        .join(', ');
                    setLanguagesStudied(l);
                    setElectivesStudied(e);
                }
            } else {
                toast.error('Could not fetch student details');
            }
        } catch (error) {
            toast.error('Error fetching student details');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // Validation logic
        if (!selectedYear || !selectedStudent || !tcNo || !appDate || !tcDate || !leavingReason) {
            toast.warning('Please fill in all mandatory fields');
            return;
        }

        if (feeDue > 0 && config?.admC_TCAllowBalanceFlg === 1 && !tempTC) {
            toast.error('Fees are due. TC cannot be issued unless Temporary TC is selected.');
            return;
        }

        const data = {
            AMCST_Id: selectedStudent.amcsT_Id,
            ACSTC_TCNO: tcNo,
            ACSTC_TCApplicationDate: appDate.toDateString(),
            ACSTC_LeavingReason: leavingReason,
            ACSTC_TCDate: tcDate.toDateString(),
            ACSTC_TCIssueDate: tcDate.toDateString(),
            ACSTC_LastAttendedDate: lastAttendedDate?.toDateString(),
            ACSTC_WorkingDays: Number.parseInt(schoolDays),
            ACSTC_AttendedDays: Number.parseInt(attendedDays),
            ACSTC_PromotionDate: promotionDate?.toDateString(),
            ACSTC_MediumOfINStruction: medInstruction,
            ACSTC_LanguageStudied: languagesStudied,
            ACSTC_ElectivesStudied: electivesStudied,
            ACSTC_Scholarship: scholarship,
            ACSTC_MedicallyExam: medicallyExamined,
            ACSTC_FeePaid: feePaid,
            ACSTC_FeeConcession: feeConcession,
            ACSTC_LastExamDetails: lastExamDetails,
            ACSTC_Result: results,
            ACSTC_ResultDetails: failDetails,
            ACSTC_Qual_PromotionFlag: promotionQualified,
            ACSTC_Qual_Course: qualifiedStatus,
            ACSTC_NCCDetails: nccDetails,
            ACSTC_ExtraActivities: extraActivities,
            ACSTC_Conduct: conduct,
            ACSTC_Remarks: remarks,
            ACSTC_TemporaryFlag: tempTC ? 1 : 0,
            ACSTC_ActiveFlag: studentStatus,
            Fee_Due_Amnt: feeDue,
            Library_Due_Amnt: libDue,
            Store_Canteen_Due: storeDue,
            PDA_Due: pdaDue,
            ASMAY_Id: Number(selectedYear),
            allorindividual: admSelection
        };

        try {
            const res = await saveTC(data);
            if (res.success) {
                toast.success('TC Details Saved Successfully');
                handleClearAll();
            } else {
                toast.error(res.message || 'Error saving record');
            }
        } catch (error) {
            toast.error('Failed to save TC details');
        }
    };

    const handleClearAll = () => {
        setStudentDetails(null);
        setSelectedStudent(null);
        setCourses([]);
        setBranches([]);
        setSemesters([]);
        setSections([]);
        setSelectedYear('');
        setSelectedCourse('');
        setSelectedBranch('');
        setSelectedSemester('');
        setSelectedSection('');
        setTcNo('');
        setLeavingReason('');
        setMedInstruction('');
        setLanguagesStudied('');
        setElectivesStudied('');
        setScholarship('');
        setMedicallyExamined('');
        setSchoolDays('');
        setAttendedDays('');
        setFeePaid('');
        setFeeConcession('');
        setLastExamDetails('');
        setResults('');
        setFailDetails('');
        setPromotionQualified('');
        setQualifiedStatus('');
        setNccDetails('');
        setExtraActivities('');
        setConduct('');
        setRemarks('');
        toast.info('Form cleared');
    };

    return (
        <div className='flex flex-col gap-6 p-6'>
            {/* Filter Section */}
            <CollapsibleSection title='Student TC Selection' defaultOpen={true}>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <div className='space-y-4'>
                        <div className='flex items-center gap-4 rounded-lg border bg-secondary/20 p-4'>
                            <RadioGroup value={admSelection} onValueChange={setAdmSelection} className='flex gap-4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='All' id='all' />
                                    <Label htmlFor='all'>All</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Indi' id='indi' />
                                    <Label htmlFor='indi'>Individual</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                            <Select value={selectedYear} onValueChange={handleYearChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((y) => (
                                        <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                            {y.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Course <span className='text-red-500'>*</span>
                            </Label>
                            <Select value={selectedCourse} onValueChange={handleCourseChange} disabled={admSelection === 'All'}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Course' />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((c) => (
                                        <SelectItem key={c.amcO_Id} value={c.amcO_Id.toString()}>
                                            {c.amcO_CourseName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Branch <span className='text-red-500'>*</span>
                            </Label>
                            <Select value={selectedBranch} onValueChange={handleBranchChange} disabled={admSelection === 'All'}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Branch' />
                                </SelectTrigger>
                                <SelectContent>
                                    {branches.map((b) => (
                                        <SelectItem key={b.amB_Id} value={b.amB_Id.toString()}>
                                            {b.amB_BranchName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Semester <span className='text-red-500'>*</span>
                            </Label>
                            <Select value={selectedSemester} onValueChange={handleSemesterChange} disabled={admSelection === 'All'}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Semester' />
                                </SelectTrigger>
                                <SelectContent>
                                    {semesters.map((s) => (
                                        <SelectItem key={s.amsE_Id} value={s.amsE_Id.toString()}>
                                            {s.amsE_SEMName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Section <span className='text-red-500'>*</span>
                            </Label>
                            <Select value={selectedSection} onValueChange={handleSectionChange} disabled={admSelection === 'All'}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Section' />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map((s) => (
                                        <SelectItem key={s.acmS_Id} value={s.acmS_Id.toString()}>
                                            {s.acmS_SectionName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className='space-y-4'>
                        <div className='space-y-2 rounded-lg border p-4'>
                            <Label>Selection Type</Label>
                            <RadioGroup value={studentStatus} onValueChange={setStudentStatus} className='grid grid-cols-2 gap-4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='S' id='s' />
                                    <Label htmlFor='s'>Active</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='L' id='l' />
                                    <Label htmlFor='l'>Left</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='D' id='d' />
                                    <Label htmlFor='d'>Deactive</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='T' id='t' />
                                    <Label htmlFor='t'>Temporary</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className='flex items-center space-x-2 rounded-lg border p-4'>
                            <Checkbox id='tempTC' checked={tempTC} onCheckedChange={(val) => setTempTC(!!val)} />
                            <Label htmlFor='tempTC' className='cursor-pointer font-medium'>
                                Temporary TC
                            </Label>
                        </div>

                        <div className='space-y-2 rounded-lg border p-4'>
                            <Label>Label Format</Label>
                            <RadioGroup value={admNoName} onValueChange={setAdmNoName} className='flex gap-4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='A' id='a_n' />
                                    <Label htmlFor='a_n'>Adm. No : Name</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='N' id='n_a' />
                                    <Label htmlFor='n_a'>Name : Adm. No</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Student Name <span className='text-red-500'>*</span>
                            </Label>
                            <Popover open={studentSearchOpen} onOpenChange={setStudentSearchOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant='outline'
                                        role='combobox'
                                        aria-expanded={studentSearchOpen}
                                        className='w-full justify-between'>
                                        {selectedStudent ? selectedStudent.studentName : 'Select or Search Student...'}
                                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-[400px] p-0'>
                                    <Command shouldFilter={false}>
                                        <CommandInput
                                            placeholder='Type 2+ chars to search...'
                                            value={studentSearchTerm}
                                            onValueChange={handleStudentSearch}
                                        />
                                        <CommandList>
                                            <CommandEmpty>No students found.</CommandEmpty>
                                            <CommandGroup>
                                                {students.map((s) => (
                                                    <CommandItem
                                                        key={s.amcsT_Id}
                                                        value={s.amcsT_Id}
                                                        onSelect={() => handleStudentSelect(s)}>
                                                        <Check
                                                            className={cn(
                                                                'mr-2 h-4 w-4',
                                                                selectedStudent?.amcsT_Id === s.amcsT_Id ? 'opacity-100' : 'opacity-0'
                                                            )}
                                                        />
                                                        {s.studentName}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Student Details Section */}
            {studentDetails && (
                <CollapsibleSection title='Student Profile' defaultOpen={true}>
                    <div className='flex flex-col gap-6 md:flex-row'>
                        <div className='grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                            {[
                                { label: 'Student Name', value: studentDetails.studentname },
                                { label: 'Reg No', value: studentDetails.regno },
                                { label: 'Adm No', value: studentDetails.admno },
                                { label: 'Course', value: studentDetails.coursename },
                                { label: 'Branch', value: studentDetails.branchname },
                                { label: 'Semester', value: studentDetails.semestername },
                                { label: 'Section', value: studentDetails.sectionname },
                                { label: 'Father Name', value: studentDetails.fathername }
                            ].map((item) => (
                                <div key={item.label} className='space-y-1'>
                                    <p className='font-medium text-muted-foreground text-sm'>{item.label}</p>
                                    <p className='font-bold'>{item.value || '-'}</p>
                                </div>
                            ))}
                        </div>
                        <div className='flex shrink-0 items-center justify-center p-4'>
                            <div className='flex h-40 w-40 items-center justify-center overflow-hidden rounded-xl border border-primary/20 bg-muted shadow-inner'>
                                {studentDetails.studentphoto ? (
                                    <img src={studentDetails.studentphoto} alt='Profile' className='h-full w-full object-cover' />
                                ) : (
                                    <User className='h-16 w-16 text-muted-foreground' />
                                )}
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>
            )}

            {/* Form Details Section */}
            {studentDetails && (
                <CollapsibleSection title='TC Transaction Details' defaultOpen={true}>
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        {/* Admission & Dates */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-lg'>Admission & Dates</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-2'>
                                        <Label>Admission date</Label>
                                        <Input
                                            value={studentDetails.doa ? format(new Date(studentDetails.doa), 'dd-MM-yyyy') : '-'}
                                            disabled
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Promotion Date</Label>
                                        <DatePicker date={promotionDate} setDate={setPromotionDate} />
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <Label>Medium of Instruction</Label>
                                    <Input value={medInstruction} onChange={(e) => setMedInstruction(e.target.value)} />
                                </div>
                                <div className='space-y-2'>
                                    <Label>Languages Studied</Label>
                                    <Input value={languagesStudied} onChange={(e) => setLanguagesStudied(e.target.value)} />
                                </div>
                                <div className='space-y-2'>
                                    <Label>Electives Studied</Label>
                                    <Input value={electivesStudied} onChange={(e) => setElectivesStudied(e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* TC Metadata */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-lg'>TC Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='space-y-2'>
                                    <Label>
                                        TC Number <span className='text-red-500'>*</span>
                                    </Label>
                                    <Input value={tcNo} onChange={(e) => setTcNo(e.target.value)} placeholder='Enter TC No' />
                                </div>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-2'>
                                        <Label>
                                            Application Date <span className='text-red-500'>*</span>
                                        </Label>
                                        <DatePicker date={appDate} setDate={setAppDate} />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>
                                            TC Issue Date <span className='text-red-500'>*</span>
                                        </Label>
                                        <DatePicker date={tcDate} setDate={setTcDate} />
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <Label>
                                        Leaving Reason <span className='text-red-500'>*</span>
                                    </Label>
                                    <Textarea
                                        value={leavingReason}
                                        onChange={(e) => setLeavingReason(e.target.value)}
                                        className='min-h-[80px]'
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Attendance Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-lg'>Attendance Details</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='space-y-2'>
                                    <Label>
                                        Last Date of Attendance <span className='text-red-500'>*</span>
                                    </Label>
                                    <DatePicker date={lastAttendedDate} setDate={setLastAttendedDate} />
                                </div>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-2'>
                                        <Label>
                                            No. of College Days <span className='text-red-500'>*</span>
                                        </Label>
                                        <Input type='number' value={schoolDays} onChange={(e) => setSchoolDays(e.target.value)} />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>
                                            No. of Attended Days <span className='text-red-500'>*</span>
                                        </Label>
                                        <Input type='number' value={attendedDays} onChange={(e) => setAttendedDays(e.target.value)} />
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <Label>Scholarship</Label>
                                    <Input value={scholarship} onChange={(e) => setScholarship(e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Academics & Exam */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-lg'>Academics & Exam</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-2'>
                                        <Label>Last Exam Details</Label>
                                        <Input value={lastExamDetails} onChange={(e) => setLastExamDetails(e.target.value)} />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Results</Label>
                                        <Input value={results} onChange={(e) => setResults(e.target.value)} />
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <Label>Failure Details (if any)</Label>
                                    <Input value={failDetails} onChange={(e) => setFailDetails(e.target.value)} />
                                </div>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-2'>
                                        <Label>Qualified For Promotion?</Label>
                                        <Input
                                            value={promotionQualified}
                                            onChange={(e) => setPromotionQualified(e.target.value)}
                                            placeholder='Yes/No'
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>
                                            Qualified Status <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select value={qualifiedStatus} onValueChange={setQualifiedStatus}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='--Select--' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='Granted'>Granted</SelectItem>
                                                <SelectItem value='Promoted'>Promoted</SelectItem>
                                                <SelectItem value='Detained'>Detained</SelectItem>
                                                <SelectItem value='Not Applicable'>Not Applicable</SelectItem>
                                                <SelectItem value='Pass Certificate Awarded'>Pass Certificate Awarded</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Fees & Balance */}
                        <Card className='md:col-span-2'>
                            <CardHeader>
                                <CardTitle className='text-lg'>Fees & Balance Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
                                    <div className='space-y-2'>
                                        <Label>Fee Paid Status</Label>
                                        <Input value={feePaid} disabled className='bg-muted font-bold' />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Fee Due</Label>
                                        <Input value={feeDue.toFixed(2)} disabled className='font-bold text-red-500' />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Library Due</Label>
                                        <Input value={libDue.toFixed(2)} disabled />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Canteen/PDA Due</Label>
                                        <Input value={(storeDue + pdaDue).toFixed(2)} disabled />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Remarks & Others */}
                        <div className='space-y-6 md:col-span-2'>
                            <Card>
                                <CardHeader>
                                    <CardTitle className='text-lg'>Remarks & Conduct</CardTitle>
                                </CardHeader>
                                <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                    <div className='space-y-2'>
                                        <Label>
                                            Conduct / Character <span className='text-red-500'>*</span>
                                        </Label>
                                        <Input value={conduct} onChange={(e) => setConduct(e.target.value)} />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>General Remarks</Label>
                                        <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className='mt-8 flex justify-center gap-4'>
                        <Button size='lg' onClick={handleSave} className='min-w-[150px] gap-2'>
                            <Save className='h-5 w-5' /> Save TC Details
                        </Button>
                        <Button size='lg' variant='outline' onClick={handleClearAll} className='min-w-[150px] gap-2'>
                            <Eraser className='h-5 w-5' /> Clear All
                        </Button>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
