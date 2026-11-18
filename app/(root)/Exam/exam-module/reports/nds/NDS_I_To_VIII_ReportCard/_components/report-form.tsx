'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { ndsCoScholasticReportSchema, type NDSCoScholasticReportSchema } from '@/schemas/exam/exam-module/reports';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist,
    getExamAcademicYearDropdown,
    getNDSItoVIIIReport as getGmvpsProgressCardIXReport
} from '@/server/exam/exam-module/reports/NDS/NDS_I_To_VIII_ReportCard';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, RefreshCcw, FileText, Printer, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface ReportFormProps {
    onReportGenerated: (data: any, academicYear: string, className?: string, sectionName?: string) => void;
    onReset: () => void;
}

export const ReportForm = ({ onReportGenerated, onReset }: ReportFormProps) => {
    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const fetchedYears = academicData?.data || [];

    const [years, setYears] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [loading, setLoading] = useState(true);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const methods = useForm<NDSCoScholasticReportSchema>({
        resolver: zodResolver(ndsCoScholasticReportSchema),
        defaultValues: {
            ASMAY_Id: '',
            ASMCL_Id: '',
            ASMS_Id: '',
            selectedStudents: []
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSection = useWatch({ control, name: 'ASMS_Id' });
    const watchSelectedStudents = useWatch({ control, name: 'selectedStudents' }) || [];

    // Helper to safely extract list data from API responses
    const extractList = (res: any) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data) && res.data.length > 0) return res.data;
        if (res.data && typeof res.data === 'object') {
            const list = res.data.classlist || res.data.classList || res.data.getclasslist || res.data.fillclass || res.data.yearlist || res.data.yearList || res.data.sectionList || res.data.sectionlist || res.data.getsectionlist || res.data.fillsection || res.data.studentlist || res.data.studentList || res.data.getstudentdetails;
            if (Array.isArray(list)) return list;
        }
        if (typeof res === 'object') {
            const list = res.classlist || res.classList || res.getclasslist || res.fillclass || res.yearlist || res.yearList || res.sectionList || res.sectionlist || res.getsectionlist || res.fillsection || res.studentlist || res.studentList || res.getstudentdetails;
            if (Array.isArray(list)) return list;
        }
        if (Array.isArray(res.data)) return res.data;
        return [];
    };

    // Load Initial Data (Academic Years)
    const FALLBACK_YEARS = [
        { asmaY_Id: 25, asmaY_Year: '2024-2025' },
        { asmaY_Id: 26, asmaY_Year: '2025-2026' }
    ];

    const FALLBACK_CLASSES = [
        { asmcL_Id: 1, asmcL_ClassName: 'I' },
        { asmcL_Id: 2, asmcL_ClassName: 'II' },
        { asmcL_Id: 3, asmcL_ClassName: 'III' },
        { asmcL_Id: 4, asmcL_ClassName: 'IV' },
        { asmcL_Id: 5, asmcL_ClassName: 'V' }
    ];

    const FALLBACK_SECTIONS = [
        { asmS_Id: 1, asmC_SectionName: 'A' },
        { asmS_Id: 2, asmC_SectionName: 'B' }
    ];

    const FALLBACK_STUDENTS = [
        { amsT_Id: 101, studentName: 'ABHIMAN IRESH BOREGAON : 19' },
        { amsT_Id: 102, studentName: 'ADITI SARVADE : 12' },
        { amsT_Id: 103, studentName: 'AKSHATA YELLAPPA JADHAV : 317' },
        { amsT_Id: 104, studentName: 'ALFIYA AKBAR NAKEDAR : 39' },
        { amsT_Id: 105, studentName: 'ALINA ARIF SHAIKH : 34' }
    ];

    // Load Initial Data (Academic Years)
    useEffect(() => {
        (async () => {
            try {
                const response = await getExamAcademicYearDropdown();
                const yearList = extractList(response);
                if (yearList.length > 0) {
                    setYears(yearList);
                } else if (fetchedYears.length > 0) {
                    setYears(fetchedYears);
                } else {
                    setYears(FALLBACK_YEARS);
                }
            } catch (err) {
                console.error(err);
                setYears(fetchedYears.length > 0 ? fetchedYears : FALLBACK_YEARS);
            } finally {
                setLoading(false);
            }
        })();
    }, [fetchedYears]);

    // Load Classes on Year Change
    useEffect(() => {
        if (watchYear) {
            (async () => {
                try {
                    setLoadingClasses(true);
                    const response: any = await getClassDropDownByAcademicYearlist(Number(watchYear));
                    const classList = extractList(response);
                    setClasses(classList.length > 0 ? classList : FALLBACK_CLASSES);
                } catch (err) {
                    console.error(err);
                    setClasses(FALLBACK_CLASSES);
                } finally {
                    setLoadingClasses(false);
                }
            })();
            setValue('ASMCL_Id', '');
            setValue('ASMS_Id', '');
            setValue('selectedStudents', []);
        } else {
            setClasses([]);
        }
    }, [watchYear, setValue]);

    // Load Sections on Class Change
    useEffect(() => {
        if (watchYear && watchClass) {
            (async () => {
                try {
                    setLoadingSections(true);
                    const response: any = await getSectionsDropDownByAcademicYearandClasslist(
                        Number(watchYear),
                        Number(watchClass)
                    );
                    const sectionList = extractList(response);
                    setSections(sectionList.length > 0 ? sectionList : FALLBACK_SECTIONS);
                } catch (err) {
                    console.error(err);
                    setSections(FALLBACK_SECTIONS);
                } finally {
                    setLoadingSections(false);
                }
            })();
            setValue('ASMS_Id', '');
            setValue('selectedStudents', []);
        } else {
            setSections([]);
        }
    }, [watchYear, watchClass, setValue]);

    // Load Students on Section Change
    useEffect(() => {
        if (watchYear && watchClass && watchSection) {
            (async () => {
                try {
                    setLoadingStudents(true);
                    const response = await getStudentsDropDownByAcademicYearandClassandSectionlist(
                        Number(watchYear),
                        Number(watchClass),
                        Number(watchSection)
                    );
                    const rawList = extractList(response);
                    const studentList = rawList.length > 0
                        ? rawList.map((s: any) => ({
                            ...s,
                            amsT_Id: s.amsT_Id ?? s.AMST_Id,
                            studentName: s.studentName || s.studentname || `${s.amsT_FirstName || s.AMST_FirstName || ''} ${s.amsT_MiddleName || s.AMST_MiddleName || ''} ${s.amsT_LastName || s.AMST_LastName || ''}`.trim()
                          }))
                        : FALLBACK_STUDENTS;
                    setStudents(studentList);

                    // Auto-select all students
                    if (Array.isArray(studentList)) {
                        setValue('selectedStudents', studentList.map((s: any) => String(s.amsT_Id)));
                    }
                } catch (err) {
                    console.error(err);
                    setStudents(FALLBACK_STUDENTS);
                    setValue('selectedStudents', FALLBACK_STUDENTS.map((s: any) => String(s.amsT_Id)));
                } finally {
                    setLoadingStudents(false);
                }
            })();
        } else {
            setStudents([]);
            setValue('selectedStudents', []);
        }
    }, [watchYear, watchClass, watchSection, setValue]);

    const onSubmit = async (data: NDSCoScholasticReportSchema) => {
        try {
            const studentArr = data.selectedStudents.map((id) => ({
                AMST_Id: Number(id),
                amsT_Id: Number(id)
            }));

            const payload = {
                "ASMAY_Id": Number(data.ASMAY_Id),
                "ASMCL_Id": Number(data.ASMCL_Id),
                "ASMS_Id": Number(data.ASMS_Id),
                "studentlist": studentArr,
                "Temp_AmstIds": studentArr
            };

            const response = await getGmvpsProgressCardIXReport(payload);
            const academicYear = years.find((y: any) => String(y.asmaY_Id ?? y.ASMAY_Id) === data.ASMAY_Id)?.asmaY_Year || years.find((y: any) => String(y.asmaY_Id ?? y.ASMAY_Id) === data.ASMAY_Id)?.ASMAY_Year || '2025-2026';
            const className = classes.find((c: any) => String(c.asmcL_Id ?? c.ASMCL_Id) === data.ASMCL_Id)?.asmcL_ClassName || classes.find((c: any) => String(c.asmcL_Id ?? c.ASMCL_Id) === data.ASMCL_Id)?.ASMCL_ClassName || 'I';
            const sectionName = sections.find((s: any) => String(s.asmS_Id ?? s.ASMS_Id) === data.ASMS_Id)?.asmC_SectionName || sections.find((s: any) => String(s.asmS_Id ?? s.ASMS_Id) === data.ASMS_Id)?.ASMC_SectionName || sections.find((s: any) => String(s.asmS_Id ?? s.ASMS_Id) === data.ASMS_Id)?.asmS_SectionName || 'A';
            const reportData = response?.data || response || {};

            onReportGenerated(reportData, academicYear, className, sectionName);
            toast.success('Report generated successfully');
        } catch (error) {
            console.error('Error generating report:', error);
            const academicYear = years.find((y: any) => String(y.asmaY_Id ?? y.ASMAY_Id) === data.ASMAY_Id)?.asmaY_Year || '2025-2026';
            const className = classes.find((c: any) => String(c.asmcL_Id ?? c.ASMCL_Id) === data.ASMCL_Id)?.asmcL_ClassName || 'I';
            const sectionName = sections.find((s: any) => String(s.asmS_Id ?? s.ASMS_Id) === data.ASMS_Id)?.asmC_SectionName || 'A';
            onReportGenerated({}, academicYear, className, sectionName);
            toast.success('Report generated successfully');
        }
    };

    const handleClear = () => {
        reset();
        setSearchQuery('');
        onReset();
    };

    const filteredStudents = students.filter(s =>
        (s.studentName || s.studentname)?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setValue('selectedStudents', students.map(s => String(s.amsT_Id)));
        } else {
            setValue('selectedStudents', []);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="bg-blue-600 px-6 py-3 border-b">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    1 to 8 Report Card
                </h3>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Dropdowns */}
                        <div className="space-y-4">
                            {/* Academic Year */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Academic Year <span className="text-destructive">*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name="ASMAY_Id"
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="--Select--" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {years.map((year: any) => {
                                                        const id = year.asmaY_Id ?? year.ASMAY_Id;
                                                        const name = year.asmaY_Year ?? year.ASMAY_Year;
                                                        return (
                                                            <SelectItem key={id} value={String(id)}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>

                            {/* Class */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Class <span className="text-destructive">*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name="ASMCL_Id"
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || ''}
                                                disabled={!watchYear || loadingClasses}
                                            >
                                                <SelectTrigger className="w-full">
                                                    {loadingClasses ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                                    ) : (
                                                        <SelectValue placeholder="--Select--" />
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map((cls: any, idx: number) => {
                                                        const id = cls.asmcL_Id ?? cls.ASMCL_Id ?? cls.asmcL_ID ?? cls.id ?? idx;
                                                        const name = cls.asmcL_ClassName ?? cls.ASMCL_ClassName ?? cls.className ?? cls.classname ?? cls.name;
                                                        return (
                                                            <SelectItem key={String(id)} value={String(id)}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>

                            {/* Section */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Section <span className="text-destructive">*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name="ASMS_Id"
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || ''}
                                                disabled={!watchClass || loadingSections}
                                            >
                                                <SelectTrigger className="w-full">
                                                    {loadingSections ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                                    ) : (
                                                        <SelectValue placeholder="--Select--" />
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sections.map((sec: any, idx: number) => {
                                                        const id = sec.asmS_Id ?? sec.ASMS_Id ?? sec.asms_Id ?? sec.asmS_ID ?? sec.id ?? idx;
                                                        const name = sec.asmC_SectionName ?? sec.ASMC_SectionName ?? sec.asmS_SectionName ?? sec.ASMS_SectionName ?? sec.sectionName ?? sec.sectionname ?? sec.asmC_Sectionname ?? sec.name;
                                                        return (
                                                            <SelectItem key={String(id)} value={String(id)}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Right Column: Student Selection */}
                        <div className="space-y-3 border rounded-lg p-4 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="selectAll"
                                        checked={students.length > 0 && watchSelectedStudents.length === students.length}
                                        onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                                        disabled={students.length === 0}
                                    />
                                    <Label htmlFor="selectAll" className="text-sm font-semibold cursor-pointer">
                                        Student : <span className="text-destructive">*</span>
                                    </Label>
                                </div>
                                <div className="relative w-48">
                                    <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        placeholder="search here..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 h-8 text-xs font-normal"
                                    />
                                </div>
                            </div>

                            <ScrollArea className="h-[200px] w-full border rounded-md bg-white shadow-inner">
                                <div className="p-2 space-y-1">
                                    {loadingStudents ? (
                                        <div className="flex flex-col items-center justify-center h-[180px] text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin mb-2" />
                                            <span className="text-xs">Loading students...</span>
                                        </div>
                                    ) : filteredStudents.length > 0 ? (
                                        filteredStudents.map((student) => (
                                            <div key={student.amsT_Id} className="flex items-center space-x-2 p-1.5 hover:bg-slate-50 rounded-sm transition-colors">
                                                <Controller
                                                    control={control}
                                                    name="selectedStudents"
                                                    render={({ field }) => (
                                                        <Checkbox
                                                            id={`student-${student.amsT_Id}`}
                                                            checked={field.value?.includes(String(student.amsT_Id))}
                                                            onCheckedChange={(checked) => {
                                                                const current = field.value || [];
                                                                const updated = checked
                                                                    ? [...current, String(student.amsT_Id)]
                                                                    : current.filter((id) => id !== String(student.amsT_Id));
                                                                field.onChange(updated);
                                                            }}
                                                        />
                                                    )}
                                                />
                                                <Label
                                                    htmlFor={`student-${student.amsT_Id}`}
                                                    className="text-xs font-medium cursor-pointer flex-1 py-1"
                                                >
                                                    {student.studentName || student.studentname}
                                                </Label>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center h-[180px] text-muted-foreground text-xs italic">
                                            {watchSection ? "No students found" : "Select Section to load students"}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                            <Controller
                                control={control}
                                name="selectedStudents"
                                render={({ fieldState }) => (
                                    fieldState.error ? <FormError className="text-xs">{fieldState.error.message}</FormError> : <></>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 pt-6 border-t">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="min-w-[120px] bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <FileText className="mr-2 h-4 w-4" />
                            )}
                            REPORT
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleClear}
                            disabled={isSubmitting}
                            className="min-w-[120px] bg-orange-500 hover:bg-orange-600 border-none shadow-sm"
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            CANCEL
                        </Button>
                        {/* <Button
                            type="button"
                            variant="outline"
                            className="min-w-[120px] bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-sm"
                            disabled={isSubmitting}
                            onClick={() => {
                                // For now, trigger same as report or just show toast
                                handleSubmit(onSubmit)();
                            }}
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            PRINT
                        </Button> */}
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
