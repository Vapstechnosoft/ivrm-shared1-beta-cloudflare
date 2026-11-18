'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetLoginPrivilegeEmployees, useLoginPrivileges } from '@/hooks/admission/preadmission/useLoginPrivilege';
import { useAcademicYearDropdown } from '@/hooks/admission/preadmission/useMasters';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { ILoginPrivilege, ILoginPrivilegeDTO } from '@/types/admission/preadmission/login_privilege';
import { Loader2, X } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { loginPrivilegeColumns } from './_components/columns';
import DeleteLoginPrivilegeForm from './_components/delete-form';

const getResponseList = (response: any, ...keys: string[]) => {
    const candidates = [response, response?.data, response?.data?.data];

    for (const candidate of candidates) {
        for (const key of keys) {
            const value = candidate?.[key];
            if (Array.isArray(value)) return value;
            if (Array.isArray(value?.$values)) return value.$values;
        }
    }

    return [];
};

const getClassSectionIds = (item: any) => ({
    classId: item.asmcL_Id ?? item.asmcl_Id ?? item.asmcl_id ?? item.ASMCL_Id ?? item.classId ?? item.ClassId,
    sectionId: item.asmC_Id ?? item.asmc_Id ?? item.asmc_id ?? item.ASMC_Id ?? item.asms_Id ?? item.ASMS_Id ?? item.sectionId ?? item.SectionId
});

const getClassSectionLabel = (item: any) =>
    item.name ||
    item.label ||
    `${item.asmcL_ClassName || item.asmcl_ClassName || item.ASMCL_ClassName || ''} : ${
        item.asmC_SectionName || item.asmc_SectionName || item.ASMC_SectionName || ''
    }`.replace(/^ : | : $/g, '') ||
    item.classsection ||
    item.classSection ||
    '';

export default function LoginPrivilegePage() {
    return (
        <FormProvider<ILoginPrivilege>>
            <LoginPrivilegePageContent />
        </FormProvider>
    );
}

function LoginPrivilegePageContent() {
    const [role, setRole] = useState<string>('');
    const [selectedStaffId, setSelectedStaffId] = useState<string>('0');

    const {
        data: initialData,
        isLoading,
        refetch,
        createPrivilege,
        isSearching
    } = useLoginPrivileges({
        entryType: Number(role),
        hrmeId: Number(selectedStaffId),
        enabled: role === '2' && selectedStaffId !== '0'
    });
    const [showList, setShowList] = useState(false);
    const [tableData, setTableData] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [showMapping, setShowMapping] = useState(false);
    const [hasSelectionSearchResult, setHasSelectionSearchResult] = useState(false);
    const [classSectionList, setMappingClassSections] = useState<any[]>([]);
    const [subjects, setMappingSubjects] = useState<any[]>([]);

    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));

    const filteredTableData = useMemo(() => {
        if (!searchQuery || !tableData) return tableData || [];
        const lowerQuery = searchQuery.toLowerCase();

        const searchableKeys = ['asmaY_Year', 'userName', 'asmcL_ClassName', 'asmC_SectionName', 'pamS_SubjectName'];

        return tableData.filter((item: any) => {
            return searchableKeys.some((key) => {
                const val = item[key];
                return val !== null && val !== undefined && String(val).toLowerCase().includes(lowerQuery);
            });
        });
    }, [tableData, searchQuery]);

    useEffect(() => {
        try {
            if (initialData) {
                const rawData = (initialData as any)?.data || initialData;

                if (role === '2') {
                    const privileges = getResponseList(initialData, 'loginPrivileges', 'loginPData');
                    const total = rawData.total || rawData.count || privileges.length;
                    setTableData(privileges);
                    setTotalItems(total);

                    const rawClassList = getResponseList(initialData, 'classsectionList', 'classSectionList', 'ClassSectionList');
                    const seenIds = new Set<string>();
                    const csList = rawClassList.reduce((acc: any[], item: any) => {
                        const { classId, sectionId } = getClassSectionIds(item);
                        if (
                            classId == null ||
                            sectionId == null ||
                            !Number.isFinite(Number(classId)) ||
                            !Number.isFinite(Number(sectionId))
                        ) {
                            return acc;
                        }

                        const id = `${classId}-${sectionId}`;
                        if (!seenIds.has(id)) {
                            seenIds.add(id);
                            acc.push({
                                ...item,
                                id,
                                asmcL_Id: Number(classId),
                                asmC_Id: Number(sectionId),
                                label: getClassSectionLabel(item)
                            });
                        }
                        return acc;
                    }, []);
                    setMappingClassSections(csList);

                    const rawSubjectList = getResponseList(initialData, 'subjectList', 'subjectlist', 'SubjectList');
                    if (rawSubjectList.length > 0) setMappingSubjects(rawSubjectList);
                    setShowList(true);
                    setShowMapping(true);
                    return;
                }

                // Extract grid data
                let data: any[] = [];
                let total = 0;

                const candidate = rawData.loginPrivileges || rawData.loginPData;
                if (Array.isArray(candidate)) {
                    data = candidate;
                } else if (Array.isArray(rawData)) {
                    data = rawData;
                }

                total = rawData.total || rawData.count || data.length;

                setTableData(data);
                setTotalItems(total);
                // Grid will only show when onSearchSuccess is called
                // setShowList(true);

                if (!hasSelectionSearchResult) {
                    // Keep the initial grid-provided mapping until a selection search returns.
                    const rawClassList = rawData.classsectionList || [];
                    if (Array.isArray(rawClassList)) {
                        const seenIds = new Set();
                        const csList = rawClassList.reduce((acc: any[], item: any) => {
                            const uniqueId = `${item.asmcL_Id}-${item.asmC_Id}`;
                            if (!seenIds.has(uniqueId)) {
                                seenIds.add(uniqueId);
                                acc.push({
                                    id: uniqueId,
                                    label: item.name || `${item.asmcL_ClassName || ''} : ${item.asmC_SectionName || ''}`.replace(/^ : /, ''),
                                    asmcL_Id: item.asmcL_Id,
                                    asmC_Id: item.asmC_Id
                                });
                            }
                            return acc;
                        }, []);
                        setMappingClassSections(csList);
                    }

                    const rawSubjectList = rawData.subjectList || [];
                    if (Array.isArray(rawSubjectList)) {
                        setMappingSubjects(rawSubjectList);
                    }

                    if ((rawClassList.length > 0 || rawSubjectList.length > 0) && selectedStaffId !== '0') {
                        setShowMapping(true);
                    }
                }
            }
        } catch (error) {
            console.error('Error setting initial data:', error);
            setTableData([]);
        }
    }, [initialData, selectedStaffId, hasSelectionSearchResult, role]);

    const tableProps = {
        data: filteredTableData || [],
        totalItems: filteredTableData.length || 0,
        isLoading,
        error: null,
        success: true
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <PrivilegeForm
                    createPrivilege={createPrivilege}
                    refetch={refetch}
                    isSearching={isSearching}
                    onSearchSuccess={(data, total) => {
                        setTableData(data);
                        setTotalItems(total);
                        setHasSelectionSearchResult(true);
                        setShowList(true);
                    }}
                    role={role}
                    setRole={setRole}
                    selectedStaffId={selectedStaffId}
                    setSelectedStaffId={setSelectedStaffId}
                    showMapping={showMapping}
                    setShowMapping={setShowMapping}
                    classSectionList={classSectionList}
                    setMappingClassSections={setMappingClassSections}
                    subjects={subjects}
                    setMappingSubjects={setMappingSubjects}
                />

                {showList && (
                    <CollapsibleSection
                        defaultOpen={true}
                        title='ATTENDANCE LOGIN PRIVILEGES LIST'
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable<ILoginPrivilege>
                            {...tableProps}
                            columns={loginPrivilegeColumns}
                            isLoading={isLoading}
                            showViewOptions={false}
                            columnPinning={{ right: ['actions'] }}
                            loadingMessage='Loading privileges...'
                            noDataTitle='No Privileges Found'
                            noDataDescription='Assign first privilege'
                        />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}

interface PrivilegeFormProps {
    createPrivilege: (data: ILoginPrivilegeDTO) => Promise<any>;
    refetch: () => void;
    isSearching: boolean;
    onSearchSuccess: (data: any[], total: number) => void;
    role: string;
    setRole: (val: string) => void;
    selectedStaffId: string;
    setSelectedStaffId: (val: string) => void;
    showMapping: boolean;
    setShowMapping: (val: boolean) => void;
    classSectionList: any[];
    setMappingClassSections: (val: any[]) => void;
    subjects: any[];
    setMappingSubjects: (val: any[]) => void;
}

function PrivilegeForm({
    createPrivilege,
    refetch,
    isSearching,
    onSearchSuccess,
    role,
    setRole,
    selectedStaffId,
    setSelectedStaffId,
    showMapping,
    setShowMapping,
    classSectionList,
    setMappingClassSections,
    subjects,
    setMappingSubjects
}: PrivilegeFormProps) {
    const { selectedRow, isDeleteFormOpen, closeDeleteForm } = useFormContext<ILoginPrivilege>();
    const { fetchDataByType, fetchEditData } = useLoginPrivileges();

    const [selectedYearId, setSelectedYearId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Selection states
    const [selectedClassSections, setSelectedClassSections] = useState<string[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

    const { data: yearData } = useAcademicYearDropdown();
    const { data: staffData } = useGetLoginPrivilegeEmployees();

    const academicYears = Array.isArray((yearData as any)?.data) ? (yearData as any)?.data : Array.isArray(yearData) ? yearData : [];
    const staffList = Array.isArray(staffData) ? staffData : [];

    // Temporary list for Type 1 (Subject Teacher)
    const [selectedcls_sec_subs, setSelectedClsSecSubs] = useState<any[]>([]);

    // Search states for mapping boxes
    const [csSearch1, setCsSearch1] = useState('');
    const [subSearch, setSubSearch] = useState('');
    const [csSearchAvail, setCsSearchAvail] = useState('');
    const [csSearchSel, setCsSearchSel] = useState('');
    const searchRequestId = useRef(0);
    const activeSearchKey = useRef<string | null>(null);
    const completedSearchKey = useRef<string | null>(null);

    useEffect(() => {
        const loadEditData = async () => {
            if (selectedRow) {
                if (selectedRow.asmaY_Id) setSelectedYearId(String(selectedRow.asmaY_Id));
                if (selectedRow.hrmE_Id) setSelectedStaffId(String(selectedRow.hrmE_Id));

                const entryType = (selectedRow as any).asalU_EntryTypeFlag || 2;
                setRole(String(entryType));

                try {
                    const response: any = await fetchEditData({
                        asalU_Id: selectedRow.asalU_Id,
                        asaluC_Id: selectedRow.asaluC_Id,
                        asalucS_Id: selectedRow.asalucS_Id
                    });

                    const result = response?.data || response;

                    if (result) {
                        const eId = result.asalU_EntryTypeFlag || (selectedRow as any).asalU_EntryTypeFlag || 2;
                        const yId = result.asmaY_Id || selectedRow.asmaY_Id;
                        const sId = result.hrmE_Id || selectedRow.hrmE_Id || (result as any).ivrmuL_Id;

                        setRole(String(eId));
                        if (yId) setSelectedYearId(String(yId));
                        if (sId) setSelectedStaffId(String(sId));

                        // Populate available lists first to ensure mapping section has data
                        // Using explicit values if available, otherwise undefined to trigger fallback in handleSearch
                        await handleSearch(yId ? String(yId) : undefined, String(eId), sId ? String(sId) : undefined);

                        if (String(eId) === '1') {
                            // Populate Type 1 temp list
                            const staffName = selectedRow.userName || 'Unknown';
                            const editMappings = result.resultClassSectionData || result.resultclasssectionData || [];
                            const editSubjects = result.subjectList || [];

                            const newList = editMappings.map((m: any) => ({
                                username: staffName,
                                cls_sec_id: `${m.asmcL_Id}-${m.asmC_Id}`,
                                cls_sec: m.name || `${m.asmcL_ClassName} : ${m.asmC_SectionName}`,
                                asmcL_Id: m.asmcL_Id,
                                asmC_Id: m.asmC_Id,
                                subs: editSubjects.map((s: any) => ({ ISMS_Id: s.ismS_Id, ISMS_SubjectName: s.ismS_SubjectName }))
                            }));
                            setSelectedClsSecSubs(newList);
                        } else {
                            // Populate Type 2/3 selections
                            const editMappings = result.resultClassSectionData || result.resultclasssectionData || [];
                            setSelectedClassSections(editMappings.map((m: any) => `${m.asmcL_Id}-${m.asmC_Id}`));
                        }
                        setShowMapping(true);
                    }
                } catch (error) {
                    toast.error('Failed to load edit details');
                }
            }
        };
        loadEditData();
    }, [selectedRow]);

    const handleSearch = async (yearId?: string, typeId?: string, staffId?: string, force = false) => {
        const yId = yearId || selectedYearId;
        const tId = typeId || role;
        const sId = staffId || selectedStaffId;

        if (tId === '2') return;

        // Skip search if we don't have basic requirements
        if (!yId || !sId || yId === '0' || sId === '0') {
            return;
        }

        const yIdNum = Number(yId);
        const sIdNum = Number(sId);

        if (Number.isNaN(yIdNum) || Number.isNaN(sIdNum)) {
            toast.error('Invalid selection');
            return;
        }

        const searchKey = `${yIdNum}:${Number(tId)}:${sIdNum}`;
        if (!force && (activeSearchKey.current === searchKey || completedSearchKey.current === searchKey)) return;

        const requestId = ++searchRequestId.current;
        activeSearchKey.current = searchKey;

        try {
            const result: any = await fetchDataByType({
                ASMAY_Id: yIdNum,
                ASALU_EntryTypeFlag: Number(tId),
                HRME_Id: sIdNum
            });

            if (requestId !== searchRequestId.current) return;

            if (result) {
                completedSearchKey.current = searchKey;
                const rawClassList = getResponseList(result, 'classSectionList', 'classsectionList', 'ClassSectionList');
                const seenIds = new Set<string>();
                const csList = rawClassList.reduce((acc: any[], item: any) => {
                    const { classId, sectionId } = getClassSectionIds(item);
                    if (
                        classId == null ||
                        sectionId == null ||
                        !Number.isFinite(Number(classId)) ||
                        !Number.isFinite(Number(sectionId))
                    ) {
                        return acc;
                    }

                    const uniqueId = `${classId}-${sectionId}`;
                    if (!seenIds.has(uniqueId)) {
                        seenIds.add(uniqueId);
                        acc.push({
                            ...item,
                            id: uniqueId,
                            asmcL_Id: Number(classId),
                            asmC_Id: Number(sectionId),
                            label: getClassSectionLabel(item)
                        });
                    }
                    return acc;
                }, []);

                setMappingClassSections(csList);

                const subList = getResponseList(result, 'subjectList', 'subjectlist', 'SubjectList').map((item: any) => ({
                    ...item,
                    ismS_Id: item.ismS_Id ?? item.isms_Id ?? item.ISMS_Id,
                    ismS_SubjectName: item.ismS_SubjectName ?? item.isms_SubjectName ?? item.ISMS_SubjectName
                }));
                if (Array.isArray(subList) && subList.length > 0) {
                    setMappingSubjects(subList);
                }

                const privileges = getResponseList(result, 'loginPrivileges', 'loginPData');
                const total = result.total || result.data?.count || privileges.length;
                onSearchSuccess(privileges, total);
                setShowMapping(true);
            }
        } catch (e) {
            if (requestId === searchRequestId.current) {
                toast.error('Failed to fetch data');
            }
        } finally {
            if (activeSearchKey.current === searchKey) {
                activeSearchKey.current = null;
            }
        }
    };

    const handleClassSectionToggle = (id: string) => {
        if (role === '2' || role === '3') {
            // Transfer logic logic: check/uncheck moves it between columns in view
            setSelectedClassSections((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
        } else {
            // Subject teacher multiselect
            setSelectedClassSections((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
        }
    };

    const handleSubjectToggle = (id: string) => {
        setSelectedSubjects((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const handleAdd = () => {
        if (selectedClassSections.length === 0 || selectedSubjects.length === 0) {
            toast.error('Please select Class-Section and Subject');
            return;
        }

        const selectedStaff = staffList.find((s: any) => String(s.id) === selectedStaffId);
        const staffName = selectedStaff?.userName || selectedStaff?.hrmE_EmployeeName || 'Unknown';

        const updatedList = [...selectedcls_sec_subs];

        selectedClassSections.forEach((csId) => {
            const csObj = classSectionList.find((x) => x.id === csId);
            if (!csObj) return;

            const existingIndex = updatedList.findIndex((item) => item.cls_sec_id === csId);
            const selectedSubsForThisItem = subjects
                .filter((s: any) => selectedSubjects.includes(String(s.ismS_Id)))
                .map((s: any) => ({ ISMS_Id: s.ismS_Id, ISMS_SubjectName: s.ismS_SubjectName }));

            if (existingIndex > -1) {
                // Merge subjects
                const currentSubs = updatedList[existingIndex].subs;
                selectedSubsForThisItem.forEach((newSub: any) => {
                    if (!currentSubs.some((s: any) => s.ISMS_Id === newSub.ISMS_Id)) {
                        currentSubs.push(newSub);
                    }
                });
            } else {
                updatedList.push({
                    username: staffName,
                    cls_sec_id: csId,
                    cls_sec: csObj.label,
                    asmcL_Id: csObj.asmcL_Id,
                    asmC_Id: csObj.asmC_Id,
                    subs: selectedSubsForThisItem
                });
            }
        });

        setSelectedClsSecSubs(updatedList);
        setSelectedClassSections([]);
        setSelectedSubjects([]);
        toast.success('Mapping added to temporary list');
    };

    const handleRemoveTempItem = (index: number) => {
        const newList = [...selectedcls_sec_subs];
        newList.splice(index, 1);
        setSelectedClsSecSubs(newList);
    };

    const handleSave = async () => {
        if (!selectedYearId || !selectedStaffId) {
            toast.error('Please select Year and Staff');
            return;
        }

        setIsSubmitting(true);
        try {
            const classSectionsPayload: { asmcL_Id: number; asmC_Id: number }[] = [];
            const classSectionSubjectsPayload: { asmcL_Id: number; asmC_Id: number; subjectIds: number[] }[] = [];

            if (role === '1') {
                if (selectedcls_sec_subs.length === 0) {
                    toast.error('Please add at least one mapping');
                    setIsSubmitting(false);
                    return;
                }
                selectedcls_sec_subs.forEach((item) => {
                    classSectionSubjectsPayload.push({
                        asmcL_Id: item.asmcL_Id,
                        asmC_Id: item.asmC_Id,
                        subjectIds: item.subs.map((s: any) => s.ISMS_Id)
                    });
                });
            } else {
                if (selectedClassSections.length === 0) {
                    toast.error('Please select at least one Class-Section');
                    setIsSubmitting(false);
                    return;
                }
                selectedClassSections.forEach((id) => {
                    const [cId, sId] = id.split('-').map(Number);
                    classSectionsPayload.push({ asmcL_Id: cId, asmC_Id: sId });
                });
            }

            const payload: ILoginPrivilegeDTO = {
                asalU_Id: selectedRow ? selectedRow.asalU_Id : 0,
                asalU_EntryTypeFlag: Number(role),
                asmaY_Id: Number(selectedYearId),
                hrmE_Id: Number(selectedStaffId),
                classSections: classSectionsPayload,
                classSectionSubjects: classSectionSubjectsPayload
            };

            await createPrivilege(payload);
            handleClear();
            if (role !== '2') {
                await handleSearch(undefined, undefined, undefined, true);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClear = () => {
        setSelectedClassSections([]);
        setSelectedSubjects([]);
        setSelectedClsSecSubs([]);
        setShowMapping(false);
    };

    const handleRefresh = async () => {
        if (role === '2') return;

        if (selectedYearId && selectedStaffId) {
            await handleSearch(undefined, undefined, undefined, true);
        } else {
            refetch();
        }
    };

    return (
        <div className='space-y-4'>
            {/* Top Config Section */}
            <CollapsibleSection
                title='ATTENDANCE LOGIN PRIVILEGES'
                defaultOpen={true}
                variant='outline'
                size='md'
                className='border-t-4 border-t-primary shadow-lg'>
                <div className='p-6'>
                    {/* Role Selection - Centered like legacy */}
                    <div className='mb-8 flex justify-center'>
                        <div className='flex items-center gap-8 rounded-md border px-8 py-3 shadow-sm'>
                            <RadioGroup
                                value={role}
                                onValueChange={async (val) => {
                                    setRole(val);
                                    // Reset selections but keep mapping visible
                                    setShowMapping(true);
                                    setSelectedClsSecSubs([]);
                                    setSelectedClassSections([]);
                                    setSelectedSubjects([]);
                                    setMappingClassSections([]);
                                    setMappingSubjects([]);

                                    // Only fetch if Year and Staff are selected and valid
                                    if (
                                        val !== '2' &&
                                        selectedYearId &&
                                        selectedStaffId &&
                                        !Number.isNaN(Number(selectedYearId)) &&
                                        !Number.isNaN(Number(selectedStaffId))
                                    ) {
                                        handleSearch(selectedYearId, val, selectedStaffId, true);
                                    }
                                }}
                                className='flex flex-wrap items-center gap-8'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='1' id='r_sub' />
                                    <Label htmlFor='r_sub' className='cursor-pointer font-normal'>
                                        Subject Teacher
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='2' id='r_class' />
                                    <Label htmlFor='r_class' className='cursor-pointer font-normal'>
                                        Class Teacher
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='3' id='r_others' />
                                    <Label htmlFor='r_others' className='cursor-pointer font-normal'>
                                        Others
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    <div className='mx-auto max-w-xl space-y-4'>
                        {/* Academic Year */}
                        <div className='flex items-center'>
                            <Label className='w-1/3 pr-4 text-right font-medium text-sm'>
                                Academic Year:<span className='ml-1 text-destructive'>*</span>
                            </Label>
                            <div className='w-2/3'>
                                <Select
                                    value={selectedYearId}
                                    onValueChange={(val) => {
                                        setSelectedYearId(val);
                                        if (role !== '2') {
                                            setMappingClassSections([]);
                                            setMappingSubjects([]);
                                        }
                                        // Auto-search if staff is also selected
                                        if (
                                            role !== '2' &&
                                            selectedStaffId &&
                                            val &&
                                            selectedStaffId !== '0' &&
                                            val !== '0'
                                        ) {
                                            handleSearch(val, role, selectedStaffId, true);
                                        }
                                    }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Please Select' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYears.map((y: any) => (
                                            <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                {y.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* User/Staff */}
                        <div className='flex items-center'>
                            <Label className='w-1/3 pr-4 text-right font-medium text-sm'>
                                User/ Staff:<span className='ml-1 text-destructive'>*</span>
                            </Label>
                            <div className='w-2/3'>
                                <Select
                                    value={selectedStaffId}
                                    onValueChange={(val) => {
                                        setSelectedStaffId(val);
                                        // Auto-search if year is also selected
                                        if (
                                            role !== '2' &&
                                            selectedYearId &&
                                            val &&
                                            selectedYearId !== '0' &&
                                            val !== '0'
                                        ) {
                                            handleSearch(selectedYearId, role, val, true);
                                        }
                                    }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={staffList.length > 0 ? 'Select Staff' : 'No Staff Found'} />
                                    </SelectTrigger>
                                    <SelectContent className='max-h-[300px]'>
                                        {staffList.map((s: any) => (
                                            <SelectItem key={String(s.id || s.hrmE_Id)} value={String(s.id || s.hrmE_Id)}>
                                                {s.userName || s.hrmE_EmployeeName || 'Unknown Staff'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Mapping Section */}
            {showMapping && (
                <CollapsibleSection
                    title='CLASS-SECTION MAPPING'
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='fade-in slide-in-from-top-4 animate-in border-t-4 border-t-primary shadow-lg duration-500'>
                    <div className='p-6'>
                        {/* Checkbox Mapping View (Subject Teacher) */}
                        {role === '1' && (
                            <div className='flex flex-col gap-6'>
                                <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                                    {/* Class-Section Box */}
                                    <div className='overflow-hidden rounded-md border border-border shadow-sm'>
                                        <div className='bg-primary p-2 font-bold text-primary-foreground text-sm'>
                                            Class-Section:<span className='text-red-400'>*</span>
                                        </div>
                                        <div className='border-b p-1'>
                                            <Input
                                                placeholder='Search Class-Section...'
                                                value={csSearch1}
                                                onChange={(e) => setCsSearch1(e.target.value)}
                                                className='h-8 text-sm'
                                            />
                                        </div>
                                        <ScrollArea className='h-[250px] bg-background p-2'>
                                            {classSectionList
                                                .filter((item) => item.label.toLowerCase().includes(csSearch1.toLowerCase()))
                                                .map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className='flex items-center space-x-2 rounded py-1 pl-1 hover:bg-accent hover:text-accent-foreground'>
                                                        <Checkbox
                                                            id={`cs-${item.id}`}
                                                            checked={selectedClassSections.includes(item.id)}
                                                            onCheckedChange={() => handleClassSectionToggle(item.id)}
                                                        />
                                                        <Label htmlFor={`cs-${item.id}`} className='cursor-pointer font-normal text-sm'>
                                                            {item.label}
                                                        </Label>
                                                    </div>
                                                ))}
                                            {classSectionList.length === 0 && (
                                                <div className='py-8 text-center text-muted-foreground text-sm'>
                                                    No Class-Sections Found
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>

                                    {/* Subject Box */}
                                    <div className='overflow-hidden rounded-md border border-border shadow-sm'>
                                        <div className='bg-primary p-2 font-bold text-primary-foreground text-sm'>
                                            Subject:<span className='text-red-400'>*</span>
                                        </div>
                                        <div className='border-b p-1'>
                                            <Input
                                                placeholder='Search Subject...'
                                                value={subSearch}
                                                onChange={(e) => setSubSearch(e.target.value)}
                                                className='h-8 text-sm'
                                            />
                                        </div>
                                        <ScrollArea className='h-[250px] bg-background p-2'>
                                            {subjects
                                                .filter((sub: any) => sub.ismS_SubjectName.toLowerCase().includes(subSearch.toLowerCase()))
                                                .map((sub: any) => (
                                                    <div
                                                        key={sub.ismS_Id}
                                                        className='flex items-center space-x-2 rounded py-1 pl-1 hover:bg-accent hover:text-accent-foreground'>
                                                        <Checkbox
                                                            id={`sub-${sub.ismS_Id}`}
                                                            checked={selectedSubjects.includes(String(sub.ismS_Id))}
                                                            onCheckedChange={() => handleSubjectToggle(String(sub.ismS_Id))}
                                                        />
                                                        <Label
                                                            htmlFor={`sub-${sub.ismS_Id}`}
                                                            className='cursor-pointer font-normal text-sm'>
                                                            {sub.ismS_SubjectName}
                                                        </Label>
                                                    </div>
                                                ))}
                                            {subjects.length === 0 && (
                                                <div className='py-8 text-center text-muted-foreground text-sm'>No Subjects Found</div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                </div>
                                <div className='flex justify-center gap-2'>
                                    <Button variant='default' size='sm' className='w-24' onClick={handleAdd}>
                                        <i className='fa fa-plus mr-1' /> ADD
                                    </Button>
                                    <Button
                                        variant='destructive'
                                        size='sm'
                                        className='w-24'
                                        onClick={() => {
                                            setSelectedClassSections([]);
                                            setSelectedSubjects([]);
                                        }}>
                                        <i className='fa fa-times mr-1' /> CLEAR
                                    </Button>
                                </div>

                                {/* Temp List Display */}
                                {selectedcls_sec_subs.length > 0 && (
                                    <div className='mt-4 overflow-hidden rounded-md border border-border shadow-md'>
                                        <table className='w-full text-sm'>
                                            <thead className='bg-primary text-white'>
                                                <tr>
                                                    <th className='p-2 text-center'>SL NO</th>
                                                    <th className='p-2 text-left'>Employee Name</th>
                                                    <th className='p-2 text-left'>Class-Section</th>
                                                    <th className='p-2 text-left'>Subjects</th>
                                                    <th className='p-2 text-center'>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedcls_sec_subs.map((t, idx) => (
                                                    <tr key={idx} className='border-border border-t hover:bg-muted/50'>
                                                        <td className='p-2 text-center'>{idx + 1}</td>
                                                        <td className='p-2'>{t.username}</td>
                                                        <td className='p-2'>{t.cls_sec}</td>
                                                        <td className='p-2'>
                                                            <div className='flex flex-wrap gap-1'>
                                                                {t.subs.map((s: any) => (
                                                                    <span
                                                                        key={s.ISMS_Id}
                                                                        className='rounded bg-muted px-1.5 py-0.5 text-[10px]'>
                                                                        {s.ISMS_SubjectName}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className='p-2 text-center'>
                                                            <Button
                                                                size='icon'
                                                                variant='ghost'
                                                                className='h-7 w-7 text-destructive hover:bg-destructive/10'
                                                                onClick={() => handleRemoveTempItem(idx)}>
                                                                <X className='h-4 w-4' />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Class Teacher / Others View (Dual Box Mapping) */}
                        {(role === '2' || role === '3') && (
                            <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                                {/* Available Box */}
                                <div className='overflow-hidden rounded-md border border-border bg-white shadow-sm'>
                                    <div className='bg-[#3f51b5] p-2 font-bold text-sm text-white'>
                                        Class-Section<span className='ml-1 text-red-400'>*</span>
                                    </div>
                                    <div className='border-b p-1'>
                                        <Input
                                            placeholder='Search Available Sections...'
                                            value={csSearchAvail}
                                            onChange={(e) => setCsSearchAvail(e.target.value)}
                                            className='h-8 text-sm'
                                        />
                                    </div>
                                    <ScrollArea className='h-[300px] bg-background p-2'>
                                        {classSectionList
                                            .filter(
                                                (x) =>
                                                    !selectedClassSections.includes(x.id) &&
                                                    x.label.toLowerCase().includes(csSearchAvail.toLowerCase())
                                            )
                                            .map((item) => (
                                                <div
                                                    key={item.id}
                                                    className='flex items-center space-x-2 rounded py-1 pl-1 hover:bg-accent hover:text-accent-foreground'>
                                                    <Checkbox
                                                        id={`cs-avail-${item.id}`}
                                                        checked={false}
                                                        onCheckedChange={() => handleClassSectionToggle(item.id)}
                                                    />
                                                    <Label htmlFor={`cs-avail-${item.id}`} className='cursor-pointer font-normal text-sm'>
                                                        {item.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        {classSectionList.filter((x) => !selectedClassSections.includes(x.id)).length === 0 && (
                                            <div className='py-12 text-center text-muted-foreground text-sm'>
                                                No Available Class-Sections
                                            </div>
                                        )}
                                    </ScrollArea>
                                </div>

                                {/* Selected Box */}
                                <div className='overflow-hidden rounded-md border border-border bg-white shadow-sm'>
                                    <div className='bg-[#3f51b5] p-2 font-bold text-sm text-white'>Class-Section</div>
                                    <div className='border-b p-1'>
                                        <Input
                                            placeholder='Search Selected Sections...'
                                            value={csSearchSel}
                                            onChange={(e) => setCsSearchSel(e.target.value)}
                                            className='h-8 text-sm'
                                        />
                                    </div>
                                    <ScrollArea className='h-[300px] p-2'>
                                        {classSectionList
                                            .filter(
                                                (x) =>
                                                    selectedClassSections.includes(x.id) &&
                                                    x.label.toLowerCase().includes(csSearchSel.toLowerCase())
                                            )
                                            .map((item) => (
                                                <div
                                                    key={item.id}
                                                    className='flex items-center space-x-2 rounded py-1 pl-1 hover:bg-accent hover:text-accent-foreground'>
                                                    <Checkbox
                                                        id={`cs-sel-${item.id}`}
                                                        checked={true}
                                                        onCheckedChange={() => handleClassSectionToggle(item.id)}
                                                    />
                                                    <Label htmlFor={`cs-sel-${item.id}`} className='cursor-pointer font-normal text-sm'>
                                                        {item.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        {selectedClassSections.length === 0 && (
                                            <div className='py-12 text-center text-muted-foreground text-sm'>No Selection</div>
                                        )}
                                    </ScrollArea>
                                </div>
                            </div>
                        )}

                        {/* Bottom Actions */}
                        <div className='mt-8 flex justify-center gap-4 border-t pt-6'>
                            <Button className='w-36 bg-primary text-white hover:bg-primary/90' onClick={handleSave} disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <i className='fa fa-floppy-o mr-2' />}
                                SAVE
                            </Button>
                            <Button variant='destructive' className='w-36' onClick={handleClear} disabled={isSubmitting}>
                                <i className='fa fa-times mr-2' /> CANCEL
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>
            )}

            {isDeleteFormOpen && selectedRow && (
                <DeleteLoginPrivilegeForm rowData={selectedRow} onClose={closeDeleteForm} onSuccess={handleRefresh} />
            )}
        </div>
    );
}
