'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type {
    IClass,
    ICustomGroup,
    IFeeDefaulterInitialData,
    IFeeDefaulterSearchRequest,
    IFeeGroup,
    IFeeTerm,
    ISection
} from '@/types/staff-portal/fee-defaulter-report';
import { format } from 'date-fns';
import { CalendarIcon, FileText, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FilterProps {
    initialData?: IFeeDefaulterInitialData;
    onSearch: (params: IFeeDefaulterSearchRequest) => void;
    onReset: () => void;
    isLoading: boolean;
    getClasses: (y: number) => Promise<IClass[]>;
    getTerms: (y: number, r: string) => Promise<{ fillterms: IFeeTerm[]; customlist: ICustomGroup[]; grouplist: IFeeGroup[] }>;
    getSections: (y: number, c: number) => Promise<ISection[]>;
    getGroups: (ids: number[], r: string) => Promise<IFeeGroup[]>;
}

export default function FeeDefaulterFilter({
    initialData,
    onSearch,
    onReset,
    isLoading,
    getClasses,
    getTerms,
    getSections,
    getGroups
}: FilterProps) {
    const [result, setResult] = useState<'FGW' | 'FHW' | 'FCW' | 'FSW'>('FSW');
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [customGroups, setCustomGroups] = useState<ICustomGroup[]>([]);
    const [feeGroups, setFeeGroups] = useState<IFeeGroup[]>([]);
    const [feeTerms, setFeeTerms] = useState<IFeeTerm[]>([]);
    const [classes, setClasses] = useState<IClass[]>([]);
    const [sections, setSections] = useState<ISection[]>([]);
    const [allTermsChecked, setAllTermsChecked] = useState(false);
    const [allGroupsChecked, setAllGroupsChecked] = useState(false);

    const [active, setActive] = useState(true);
    const [deactive, setDeactive] = useState(false);
    const [left, setLeft] = useState(false);
    const [remarks, setRemarks] = useState(false);
    const [date, setDate] = useState<Date>(new Date());
    const [due, setDue] = useState<'duedate' | 'tillduedate'>('duedate');

    const configGroupOrTerm = initialData?.accountdetails?.[0]?.fmC_GroupOrTermFlg || 'T';

    useEffect(() => {
        if (initialData?.adcyear) {
            // No auto-select
        }
    }, [initialData]);

    const handleYearChange = async (val: string) => {
        setSelectedYear(val);
        const [clsRes, termRes] = await Promise.all([getClasses(Number(val)), getTerms(Number(val), configGroupOrTerm)]);
        setClasses(clsRes);
        setCustomGroups(termRes.customlist.map((c) => ({ ...c, fmgG_Id_chk: true, fmgG_Id_chk1: true })));
        setFeeGroups(termRes.grouplist.map((g) => ({ ...g, fmG_Id_chk: true, fmG_Id_chk1: true })));
        setFeeTerms(termRes.fillterms.map((t) => ({ ...t, fmT_Id_chk: false })));
        setSelectedClass('');
        setSections([]);
    };

    const handleClassChange = async (val: string) => {
        setSelectedClass(val);
        const res = await getSections(Number(selectedYear), Number(val));
        setSections(res);
        setSelectedSection('');
    };

    const handleCustomGroupToggle = async (id: number, checked: boolean) => {
        const updated = customGroups.map((c) => (c.fmgG_Id === id ? { ...c, fmgG_Id_chk: checked, fmgG_Id_chk1: checked } : c));
        setCustomGroups(updated);

        const selectedIds = updated.filter((c) => (configGroupOrTerm === 'T' ? c.fmgG_Id_chk : c.fmgG_Id_chk1)).map((c) => c.fmgG_Id);
        if (selectedIds.length > 0) {
            const res = await getGroups(selectedIds, configGroupOrTerm);
            setFeeGroups(res.map((g) => ({ ...g, fmG_Id_chk: true, fmG_Id_chk1: true })));
        } else {
            setFeeGroups([]);
        }
    };

    const handleFeeGroupToggle = (id: number, checked: boolean) => {
        setFeeGroups((prev) => prev.map((g) => (g.fmG_Id === id ? { ...g, fmG_Id_chk: checked, fmG_Id_chk1: checked } : g)));
    };

    const handleAllGroupsToggle = (checked: boolean) => {
        setAllGroupsChecked(checked);
        setFeeGroups((prev) => prev.map((g) => ({ ...g, fmG_Id_chk: checked, fmG_Id_chk1: checked })));
    };

    const handleAllTermsToggle = (checked: boolean) => {
        setAllTermsChecked(checked);
        setFeeTerms((prev) => prev.map((t) => ({ ...t, fmT_Id_chk: checked })));
    };

    const handleTermToggle = (id: number, checked: boolean) => {
        setFeeTerms((prev) => prev.map((t) => (t.fmT_Id === id ? { ...t, fmT_Id_chk: checked } : t)));
    };

    const handleSearch = () => {
        const params: IFeeDefaulterSearchRequest = {
            ASMAY_Id: Number(selectedYear),
            radioval: result,
            reporttype: 'date', // As per Angular "rpttyp" default or toggle
            active,
            deactive,
            left,
            ASMCL_Id: Number(selectedClass),
            AMSC_Id: Number(selectedSection),
            FMG_Ids: feeGroups.filter((g) => (configGroupOrTerm === 'T' ? g.fmG_Id_chk : g.fmG_Id_chk1)).map((g) => g.fmG_Id),
            FMT_Ids: feeTerms.filter((t) => t.fmT_Id_chk).map((t) => t.fmT_Id),
            From_Date: format(date, 'yyyy-MM-dd'),
            duedate: due,
            term_group: configGroupOrTerm as 'T' | 'G',
            Select_Button: 'Student'
        };
        onSearch(params);
    };

    return (
        <Card className='border-primary/10 shadow-md'>
            <CardHeader className='px-6 pb-3'>
                <CardTitle className='flex items-center gap-2 font-semibold text-lg text-primary'>
                    <FileText className='h-5 w-5' />
                    Fee Defaulter Report Filter
                </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6 px-6 pt-2 pb-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <div className='space-y-2'>
                        <Label>Academic Year</Label>
                        <Select value={selectedYear} onValueChange={handleYearChange}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Year' />
                            </SelectTrigger>
                            <SelectContent>
                                {initialData?.adcyear?.map((yr) => (
                                    <SelectItem key={yr.asmaY_Id} value={yr.asmaY_Id.toString()}>
                                        {yr.asmaY_Year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='flex items-end pb-1'>
                        <RadioGroup
                            value={result}
                            onValueChange={setResult as any}
                            className='flex w-full flex-wrap items-center justify-between gap-4 rounded-lg border bg-muted/40 p-2 px-4'>
                            {[
                                { id: 'FGW', label: 'Group Wise' },
                                { id: 'FHW', label: 'Head Wise' },
                                { id: 'FCW', label: 'Class Wise' },
                                { id: 'FSW', label: 'Student Wise' }
                            ].map((opt) => (
                                <div key={opt.id} className='flex items-center space-x-2'>
                                    <RadioGroupItem value={opt.id} id={opt.id} />
                                    <Label htmlFor={opt.id} className='cursor-pointer font-medium text-xs'>
                                        {opt.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                </div>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                    <div className='space-y-3'>
                        <Label className='flex items-center gap-2 font-bold text-sm'>
                            Custom Group <span className='text-destructive'>*</span>
                        </Label>
                        <div className='h-40 space-y-1 overflow-y-auto rounded-md border bg-card p-2'>
                            {customGroups.map((cg) => (
                                <div
                                    key={cg.fmgG_Id}
                                    className='flex items-center space-x-2 rounded p-1 transition-colors hover:bg-muted/50'>
                                    <Checkbox
                                        id={`cg-${cg.fmgG_Id}`}
                                        checked={configGroupOrTerm === 'T' ? cg.fmgG_Id_chk : cg.fmgG_Id_chk1}
                                        onCheckedChange={(val) => handleCustomGroupToggle(cg.fmgG_Id, !!val)}
                                    />
                                    <Label htmlFor={`cg-${cg.fmgG_Id}`} className='cursor-pointer truncate text-xs'>
                                        {cg.fmg_groupname}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='space-y-3'>
                        <div className='flex items-center justify-between'>
                            <Label className='flex items-center gap-2 font-bold text-sm'>
                                Fee Group <span className='text-destructive'>*</span>
                            </Label>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='all-groups'
                                    checked={allGroupsChecked}
                                    onCheckedChange={(val) => handleAllGroupsToggle(!!val)}
                                />
                                <Label htmlFor='all-groups' className='font-bold text-[10px] text-muted-foreground uppercase'>
                                    All
                                </Label>
                            </div>
                        </div>
                        <div className='h-40 space-y-1 overflow-y-auto rounded-md border bg-card p-2'>
                            {feeGroups.map((fg) => (
                                <div
                                    key={fg.fmG_Id}
                                    className='flex items-center space-x-2 rounded p-1 transition-colors hover:bg-muted/50'>
                                    <Checkbox
                                        id={`fg-${fg.fmG_Id}`}
                                        checked={configGroupOrTerm === 'T' ? fg.fmG_Id_chk : fg.fmG_Id_chk1}
                                        onCheckedChange={(val) => handleFeeGroupToggle(fg.fmG_Id, !!val)}
                                    />
                                    <Label htmlFor={`fg-${fg.fmG_Id}`} className='cursor-pointer truncate text-xs'>
                                        {fg.fmG_GroupName}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {configGroupOrTerm === 'T' && (
                        <div className='space-y-3'>
                            <div className='flex items-center justify-between'>
                                <Label className='flex items-center gap-2 font-bold text-sm'>
                                    Term Name <span className='text-destructive'>*</span>
                                </Label>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='all-terms'
                                        checked={allTermsChecked}
                                        onCheckedChange={(val) => handleAllTermsToggle(!!val)}
                                    />
                                    <Label htmlFor='all-terms' className='font-bold text-[10px] text-muted-foreground uppercase'>
                                        All
                                    </Label>
                                </div>
                            </div>
                            <div className='h-40 space-y-1 overflow-y-auto rounded-md border bg-card p-2'>
                                {feeTerms.map((ft) => (
                                    <div
                                        key={ft.fmT_Id}
                                        className='flex items-center space-x-2 rounded p-1 transition-colors hover:bg-muted/50'>
                                        <Checkbox
                                            id={`ft-${ft.fmT_Id}`}
                                            checked={ft.fmT_Id_chk}
                                            onCheckedChange={(val) => handleTermToggle(ft.fmT_Id, !!val)}
                                        />
                                        <Label htmlFor={`ft-${ft.fmT_Id}`} className='cursor-pointer truncate text-xs'>
                                            {ft.fmT_Name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    <div className='space-y-2'>
                        <Label>
                            Class <span className='text-destructive'>*</span>
                        </Label>
                        <Select value={selectedClass} onValueChange={handleClassChange} disabled={!selectedYear}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Class' />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map((c) => (
                                    <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
                                        {c.asmcL_ClassName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Section <span className='text-destructive'>*</span>
                        </Label>
                        <Select value={selectedSection} onValueChange={setSelectedSection} disabled={!selectedClass}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Section' />
                            </SelectTrigger>
                            <SelectContent>
                                {sections.map((s) => (
                                    <SelectItem key={s.amsC_Id} value={s.amsC_Id.toString()}>
                                        {s.asmc_sectionname}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='space-y-2'>
                        <Label>Report Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant='outline'
                                    className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}>
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0'>
                                <Calendar mode='single' selected={date} onSelect={(val) => val && setDate(val)} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className='grid grid-cols-1 items-center gap-6 lg:grid-cols-2'>
                    <div className='flex flex-wrap gap-6 rounded-lg border border-primary/5 bg-muted/20 p-4'>
                        <div className='flex items-center space-x-2'>
                            <Checkbox id='active' checked={active} onCheckedChange={(v) => setActive(!!v)} />
                            <Label htmlFor='active' className='cursor-pointer text-sm'>
                                Active
                            </Label>
                        </div>
                        <div className='flex items-center space-x-2'>
                            <Checkbox id='deactive' checked={deactive} onCheckedChange={(v) => setDeactive(!!v)} />
                            <Label htmlFor='deactive' className='cursor-pointer text-sm'>
                                Deactive
                            </Label>
                        </div>
                        <div className='flex items-center space-x-2'>
                            <Checkbox id='left' checked={left} onCheckedChange={(v) => setLeft(!!v)} />
                            <Label htmlFor='left' className='cursor-pointer text-sm'>
                                Left
                            </Label>
                        </div>
                        {result === 'FSW' && (
                            <div className='flex items-center space-x-2 border-primary/10 border-l pl-6'>
                                <Checkbox id='remarks' checked={remarks} onCheckedChange={(v) => setRemarks(!!v)} />
                                <Label htmlFor='remarks' className='cursor-pointer font-semibold text-primary/80 text-sm'>
                                    Show Remarks
                                </Label>
                            </div>
                        )}
                    </div>

                    <div className='flex justify-center'>
                        <RadioGroup
                            value={due}
                            onValueChange={setDue as any}
                            className='flex items-center gap-8 rounded-full border border-primary/10 bg-primary/5 p-4 px-10'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='duedate' id='due-date' />
                                <Label htmlFor='due-date' className='cursor-pointer font-medium'>
                                    Due Date
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='tillduedate' id='till-due-date' />
                                <Label htmlFor='till-due-date' className='cursor-pointer font-medium'>
                                    Till Due Date
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                <div className='mt-8 flex justify-center gap-4'>
                    <Button
                        variant='ghost'
                        onClick={onReset}
                        className='flex min-w-[120px] items-center gap-2 border border-destructive/20 text-destructive hover:bg-destructive/10'>
                        <X className='h-4 w-4' />
                        Clear
                    </Button>
                    <Button
                        onClick={handleSearch}
                        disabled={isLoading || !selectedYear || !selectedClass}
                        className='flex min-w-[200px] items-center gap-2 bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90'>
                        <Search className='h-4 w-4' />
                        {isLoading ? 'Generating...' : 'Show Report'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
