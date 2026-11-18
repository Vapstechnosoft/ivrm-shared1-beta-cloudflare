'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEventsStudentSRKVS } from '@/hooks/sports/useEventsStudentSRKVS';
import { type EventsStudentSRKVSFormSchema, type IStudentSRKVSValues, eventsStudentSRKVSSchema } from '@/types/sports/events-student-srkvs';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from 'sonner';

interface EventsStudentSRKVSFormProps {
    onSuccess: () => void;
}

export default function EventsStudentSRKVSForm({ onSuccess }: EventsStudentSRKVSFormProps) {
    const { dropdowns, fetchClassHouse, fetchSectionList, fetchSportsName, fetchSubSubEvents, fetchStudents, saveData } =
        useEventsStudentSRKVS();
    const dropdownData = dropdowns.data;

    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);

    const [sportsList, setSportsList] = useState<any[]>([]); // Derived from Main Event
    const [subSubEventList, setSubSubEventList] = useState<any[]>([]); // Derived from Sub Event

    const [fetchedStudents, setFetchedStudents] = useState<IStudentSRKVSValues[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [studentSearch, setStudentSearch] = useState('');

    const form = useForm<EventsStudentSRKVSFormSchema>({
        resolver: zodResolver(eventsStudentSRKVSSchema),
        defaultValues: {
            spccmsccG_SCCFlag: 'Sports',
            selectedClasses: [],
            selectedSections: []
        }
    });

    const { watch } = form;

    // Watchers for dependency chains
    const asmaY_Id = watch('asmaY_Id');
    const spccmsccG_Id = watch('spccmsccG_Id'); // Main Event
    const spccmscC_Id = watch('spccmscC_Id'); // Sub Event
    const selectedClasses = watch('selectedClasses');

    // 1. Academic Year Change -> Fetch Class, Section (House is independent now)
    useEffect(() => {
        if (asmaY_Id) {
            fetchClassHouse.mutate(Number(asmaY_Id), {
                onSuccess: (data: any) => {
                    if (data && data.listof_class) setClassList(data.listof_class);
                    if (data && data.sectionList) setSectionList(data.sectionList);
                    // if (data && data.houseList) setHouseList(data.houseList); // Removed to use independent HouseList API
                }
            });
        }
    }, [asmaY_Id]);

    // Fetch Sections on Class Change
    useEffect(() => {
        if (selectedClasses && selectedClasses.length > 0 && asmaY_Id) {
            fetchSectionList.mutate(
                { ASMAY_Id: Number(asmaY_Id), classListArray: selectedClasses.map(Number) },
                {
                    onSuccess: (data: any) => setSectionList(data)
                }
            );
        } else {
            setSectionList([]);
        }
    }, [selectedClasses, asmaY_Id]);

    // 2. Main Event Change -> Fetch Sub Event (Sports Name)
    useEffect(() => {
        if (spccmsccG_Id) {
            fetchSportsName.mutate(Number(spccmsccG_Id), {
                onSuccess: (data: any[]) => {
                    setSportsList(data);
                }
            });
        }
    }, [spccmsccG_Id]);

    // 3. Sub Event Change -> Fetch Sub Sub Event & UOM
    useEffect(() => {
        if (spccmscC_Id && spccmsccG_Id) {
            fetchSubSubEvents.mutate(
                { subEventId: Number(spccmscC_Id), groupId: Number(spccmsccG_Id) },
                {
                    onSuccess: (data: any[]) => {
                        setSubSubEventList(data);
                    }
                }
            );
        }
    }, [spccmscC_Id, spccmsccG_Id]);

    // Manual Fetch Handler
    const handleFetchStudents = () => {
        const formData = form.getValues();
        const hasClasses = formData.selectedClasses && formData.selectedClasses.length > 0;
        const hasSections = formData.selectedSections && formData.selectedSections.length > 0;

        if (!formData.asmaY_Id) {
            toast.warning('Please select Academic Year.');
            return;
        }

        if (!hasClasses) {
            toast.warning('Please select at least one Class.');
            return;
        }

        if (!hasSections) {
            toast.warning('Please select at least one Section.');
            return;
        }

        const payload = {
            ASMAY_Id: Number(formData.asmaY_Id),
            classListArray: formData.selectedClasses?.map(Number) || [],
            sectionListArray: formData.selectedSections?.map(Number) || [],
            sportsName: 'SRKVS'
        };

        fetchStudents.mutate(payload, {
            onSuccess: (res: any) => {
                if (res.success && res.data) {
                    setFetchedStudents(res.data);
                    setSelectedStudentIds([]); // Reset selection
                } else {
                    toast.info('No students found');
                    setFetchedStudents([]);
                }
            }
        });
    };

    // Filtered student list for display
    const filteredFetchedStudents = useMemo(() => {
        if (!studentSearch) return fetchedStudents;
        return fetchedStudents.filter(
            (s) =>
                s.studentName.toLowerCase().includes(studentSearch.toLowerCase()) ||
                s.amsT_AdmNo.toLowerCase().includes(studentSearch.toLowerCase())
        );
    }, [fetchedStudents, studentSearch]);

    const onSubmit = (data: EventsStudentSRKVSFormSchema) => {
        console.log('onSubmit triggered', data);

        if (selectedStudentIds.length === 0) {
            toast.warning('Please select at least one student to save.');
            return;
        }

        const selectedStudents = fetchedStudents.filter((s) => selectedStudentIds.includes(s.amsT_Id));

        const payload = {
            SPCCEST_Id: 0, // 0 for new record
            ASMAY_Id: Number(data.asmaY_Id),
            SPCCME_Id: Number(data.spccmE_Id),
            SPCCMCL_Id: Number(data.spccmcL_Id),
            SPCCMCC_Id: Number(data.spccmcC_Id) || 0, // Handle optional category?
            SPCCMSCC_Id: Number(data.spccmscC_Id), // Sub Event
            SPCCMSCCG_Id: Number(data.spccmsccG_Id), // Main Event
            SPCCMUOM_Id: Number(data.spccmuoM_Id),
            SPCCMEV_Id: Number(data.spccmeV_Id),
            SPCCEST_House_Class_Flag: 'Class',
            StartDate: data.spccE_StartDate, // Make sure this is YYYY-MM-DD
            EndDate: data.spccE_EndDate,
            SPCCEST_Remarks: data.spccesT_Remarks || '',
            SPCCEST_OldRecord: '', // Required by backend
            StudentListArray: selectedStudents.map((s) => s.amsT_Id),
            sendmail: false,
            sendsms: false
        };

        saveData.mutate(payload, {
            onSuccess: () => onSuccess()
        });
    };

    if (dropdowns.isLoading) return <div>Loading...</div>;

    return (
        <FormProvider {...form}>
            <form className='space-y-6 rounded-lg border bg-card p-4 text-card-foreground shadow-sm'>
                {/* 1. Filters Section */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    <FormField
                        control={form.control}
                        name='asmaY_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Academic Year <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Year' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {dropdownData?.academicYear.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='spccmE_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Event Name <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Event' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {dropdownData?.eventsList.map((item: any) => (
                                            <SelectItem key={item.spccmE_Id} value={String(item.spccmE_Id)}>
                                                {item.spccmE_EventName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='spccmeV_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Venue <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Venue' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {dropdownData?.venueList.map((item: any) => (
                                            <SelectItem key={item.spccmeV_Id} value={String(item.spccmeV_Id)}>
                                                {item.spccmeV_EventVenue}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='spccmsccG_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Main Event <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Main Event' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {dropdownData?.groupList.map((item: any) => (
                                            <SelectItem key={item.spccmsccG_Id} value={String(item.spccmsccG_Id)}>
                                                {item.spccmsccG_SportsCCGroupName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='spccmscC_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Sub Event <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Sub Event' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {sportsList.map((item: any) => (
                                            <SelectItem key={item.spccmscC_Id} value={String(item.spccmscC_Id)}>
                                                {item.spccmE_EventName || item.spccmscC_SportsCCName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='spccmsccG_Idsub'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Sub sub Event <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Sub sub Event' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {subSubEventList.map((item: any) => (
                                            <SelectItem key={item.spccmsccG_Id} value={String(item.spccmsccG_Id)}>
                                                {item.spccmsccG_SportsCCGroupName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='spccmcC_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Competition Category <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Category' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {dropdownData?.categoryList?.map((item: any) => (
                                            <SelectItem key={item.spccmcC_Id} value={String(item.spccmcC_Id)}>
                                                {item.spccmcC_CompitionCategory}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='spccmcL_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Competition Level <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Level' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {dropdownData?.competitionLevelList.map((item: any) => (
                                            <SelectItem key={item.spccmcL_Id} value={String(item.spccmcL_Id)}>
                                                {item.spccmcL_CompitionLevel}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='selectedClasses'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Class Name</FormLabel>
                                <FormControl>
                                    <MultiSelect
                                        options={classList.map((c) => ({ label: c.asmcL_ClassName, value: String(c.asmcL_Id) }))}
                                        defaultValue={field.value?.map(String) || []}
                                        onValueChange={(vals) => field.onChange(vals.map(Number))}
                                        placeholder='Select Classes'
                                        variant='secondary'
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='selectedSections'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Section Name</FormLabel>
                                <FormControl>
                                    <MultiSelect
                                        options={sectionList.map((s) => ({ label: s.asmC_SectionName, value: String(s.asmS_Id) }))}
                                        defaultValue={field.value?.map(String) || []}
                                        onValueChange={(vals) => field.onChange(vals.map(Number))}
                                        placeholder='Select Sections'
                                        variant='secondary'
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='spccE_StartDate'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Start Date <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input type='date' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='spccE_EndDate'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    End Date <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input type='date' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='spccmuoM_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    UOM <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select UOM' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {dropdownData?.uomList.map((item: any) => (
                                            <SelectItem key={item.spccmuoM_Id} value={String(item.spccmuoM_Id)}>
                                                {item.spccmuoM_UOMName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex justify-end'>
                    <Button type='button' onClick={handleFetchStudents} disabled={fetchStudents.isPending}>
                        {fetchStudents.isPending ? 'Fetching...' : 'Get Student List'}
                    </Button>
                </div>

                {/* 2. Student Selection Area */}
                <div className='grid grid-cols-1 gap-4 rounded-md border p-4'>
                    <div className='mb-2 flex items-center justify-between'>
                        <Label className='font-semibold text-lg'>Select Students</Label>
                        <div className='relative w-64'>
                            <Search className='absolute top-2.5 left-2 h-4 w-4 text-muted-foreground' />
                            <Input
                                placeholder='Search...'
                                className='pl-8'
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <ScrollArea className='h-[200px] rounded-md border p-2'>
                        {fetchedStudents.length === 0 ? (
                            <div className='flex h-full items-center justify-center text-muted-foreground'>
                                No students found. Use filters to fetch.
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3'>
                                <div className='col-span-full mb-2 flex items-center space-x-2 border-b pb-2'>
                                    <Checkbox
                                        id='select-all-source'
                                        checked={fetchedStudents.length > 0 && selectedStudentIds.length === fetchedStudents.length}
                                        onCheckedChange={(checked) => {
                                            if (checked) setSelectedStudentIds(fetchedStudents.map((s) => s.amsT_Id));
                                            else setSelectedStudentIds([]);
                                        }}
                                    />
                                    <Label htmlFor='select-all-source'>Select All</Label>
                                </div>
                                {filteredFetchedStudents.map((student) => (
                                    <div key={student.amsT_Id} className='flex items-center space-x-2'>
                                        <Checkbox
                                            id={`student-${student.amsT_Id}`}
                                            checked={selectedStudentIds.includes(student.amsT_Id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) setSelectedStudentIds((prev) => [...prev, student.amsT_Id]);
                                                else setSelectedStudentIds((prev) => prev.filter((id) => id !== student.amsT_Id));
                                            }}
                                        />
                                        <Label htmlFor={`student-${student.amsT_Id}`} className='cursor-pointer font-normal text-sm'>
                                            {student.studentName} ({student.amsT_AdmNo})
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* 4. Filter Remarks (Form Level - if applicable) */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <FormField
                        control={form.control}
                        name='spccesT_Remarks'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Event Remarks (Optional)</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder='Enter Remarks...' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='mt-8 flex justify-center space-x-4'>
                    <Button
                        type='button'
                        disabled={saveData.isPending}
                        onClick={form.handleSubmit(onSubmit, (errors) => console.log('Form Errors:', errors))}>
                        {saveData.isPending ? 'Saving...' : 'Save'}
                    </Button>
                    <Button type='button' variant='destructive' onClick={() => onSuccess()}>
                        Cancel
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}
