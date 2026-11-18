'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';

import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { Plus, X, Save } from 'lucide-react';
import { feeStreamGroupMappingColumns } from './_components/columns';
import type { IFeeStreamGroupMappingGrid } from '@/types/fees/transactions/feeStreamGroupMapping';
import {
    getFeeStreamGroupMappingData,
    getFeeStreamGroupMappingAcademicYear,
    getFeeStreamGroupMappingClasses,
    getFeeStreamGroupMappingGroups,
    getFeeStreamGroupMappingStreams,
    saveFeeStreamGroupMapping,
    editFeeStreamGroupMapping,
    deactivateFeeStreamGroupMapping
} from '@/server/fees/trasactions/fee-stream-group-mapping';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function FeeStreamGroupMappingPage(props: { searchParams: SearchParams }) {
    return (
        <FormProvider<any>>
            <FeeStreamGroupMappingContent />
        </FormProvider>
    );
}

function FeeStreamGroupMappingContent() {
    const [acdYear, setAcdYear] = useState<any[]>([]);
    const [classDrpDwn, setClassDrpDwn] = useState<any[]>([]);
    const [groupDrpDwn, setGroupDrpDwn] = useState<any[]>([]);
    const [streamDrpDwn, setStreamDrpDwn] = useState<any[]>([]);
    const [loaddetails, setLoaddetails] = useState<IFeeStreamGroupMappingGrid[]>([]);

    const [asmaY_Id1, setAsmaY_Id1] = useState('');
    const [asmcL_Id, setAsmcL_Id] = useState('');
    const [fmsgM_ID, setFmsgM_ID] = useState(0);
    const [editFlag, setEditFlag] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadDrpDwn();
    }, []);

    const loadDrpDwn = async () => {
        setIsLoading(true);
        try {
            const [yearsRes, classesRes, groupsRes, streamsRes] = await Promise.allSettled([
                getFeeStreamGroupMappingAcademicYear(),
                getFeeStreamGroupMappingClasses(),
                getFeeStreamGroupMappingGroups(),
                getFeeStreamGroupMappingStreams()
            ]);

            // Academic Year
            if (yearsRes.status === 'fulfilled') {
                const yrList = yearsRes.value?.data ?? yearsRes.value ?? [];
                setAcdYear(Array.isArray(yrList) ? yrList : []);
            }

            // Class
            if (classesRes.status === 'fulfilled') {
                const clsList = classesRes.value?.data ?? classesRes.value ?? [];
                setClassDrpDwn(Array.isArray(clsList) ? clsList : []);
            }

            // Group
            if (groupsRes.status === 'fulfilled') {
                const grpList = groupsRes.value?.data ?? groupsRes.value ?? [];
                if (Array.isArray(grpList)) {
                    setGroupDrpDwn(
                        grpList.map((g: any) => ({
                            ...g,
                            fmG_Id: g.fmG_Id ?? g.FMG_Id,
                            fmG_GroupName: g.fmG_GroupName ?? g.FMG_GroupName,
                            Selected: false
                        }))
                    );
                }
            }

            // Stream
            let initialStreams: any[] = [];
            if (streamsRes.status === 'fulfilled' && Array.isArray(streamsRes.value)) {
                initialStreams = streamsRes.value.map((s: any) => ({
                    ...s,
                    pasL_ID: s.pasL_ID ?? s.PASL_ID,
                    pasL_Name: s.pasL_Name ?? s.PASL_Name,
                    Selected: false
                }));
            }
            setStreamDrpDwn(initialStreams);

            // Grid Mappings
            await loadGridData(initialStreams);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const loadGridData = async (currentStreams?: any[]) => {
        try {
            const gridRes: any = await getFeeStreamGroupMappingData();
            const rawRecords: any[] = gridRes?.data ?? (Array.isArray(gridRes) ? gridRes : []);
            const records: IFeeStreamGroupMappingGrid[] = rawRecords.map((r: any) => ({
                ...r,
                asmaY_Year: r.asmaY_Year ?? r.ASMAY_Year ?? '',
                asmcL_ClassName: r.asmcL_ClassName ?? r.ASMCL_ClassName ?? '',
                fmG_GroupName: r.fmG_GroupName ?? r.FMG_GroupName ?? '',
                pasL_Name: r.pasL_Name ?? r.PASL_Name ?? '',
                fmsgM_Active: r.fmsgM_Active ?? r.FMSGM_Active ?? 0,
                fmsgM_Id: r.fmsgM_Id ?? r.FMSGM_Id ?? 0,
                fmG_Id: r.fmG_Id ?? r.FMG_Id ?? 0,
                pasL_ID: r.pasL_ID ?? r.PASL_ID ?? 0,
                asmcL_Id: r.asmcL_Id ?? r.ASMCL_Id ?? 0,
                asmaY_Id: r.asmaY_Id ?? r.ASMAY_Id ?? 0
            }));
            setLoaddetails(records);

            if (records.length === 0 && !currentStreams) {
                Swal.fire('No Records Found');
            }

            // Merge unique streams from grid data so checkboxes always contain existing streams
            const streamsMap = new Map<number, any>();
            const streamsToMerge = currentStreams ?? streamDrpDwn;
            streamsToMerge.forEach((s) => {
                const id = s.pasL_ID ?? s.PASL_ID;
                if (id) streamsMap.set(id, s);
            });

            records.forEach((r) => {
                const id = r.pasL_ID ?? r.PASL_ID;
                const name = r.pasL_Name ?? r.PASL_Name;
                if (id && name && !streamsMap.has(id)) {
                    streamsMap.set(id, {
                        pasL_ID: id,
                        pasL_Name: name,
                        Selected: false
                    });
                }
            });

            setStreamDrpDwn(Array.from(streamsMap.values()));
        } catch (err) {
            console.error(err);
        }
    };

    const handleClassChange = async (selectedClassId: string) => {
        setAsmcL_Id(selectedClassId);
        if (selectedClassId) {
            try {
                const classStreams = await getFeeStreamGroupMappingStreams(Number(selectedClassId));
                if (Array.isArray(classStreams) && classStreams.length > 0) {
                    setStreamDrpDwn((prev) => {
                        const streamsMap = new Map<number, any>();
                        prev.forEach((s) => {
                            const id = s.pasL_ID ?? s.PASL_ID;
                            if (id) streamsMap.set(id, s);
                        });
                        classStreams.forEach((s) => {
                            const id = s.pasL_ID;
                            if (id && !streamsMap.has(id)) {
                                streamsMap.set(id, { ...s, Selected: false });
                            }
                        });
                        return Array.from(streamsMap.values());
                    });
                }
            } catch (err) {
                console.warn(err);
            }
        }
    };

    const handleGroupToggle = (id: number) => {
        setGroupDrpDwn((prev) =>
            prev.map((item) => ((item.fmG_Id ?? item.FMG_Id) === id ? { ...item, Selected: !item.Selected } : item))
        );
    };

    const handleStreamToggle = (id: number) => {
        setStreamDrpDwn((prev) =>
            prev.map((item) => ((item.pasL_ID ?? item.PASL_ID) === id ? { ...item, Selected: !item.Selected } : item))
        );
    };

    const clearForm = () => {
        setAsmaY_Id1('');
        setAsmcL_Id('');
        setFmsgM_ID(0);
        setEditFlag(false);
        setSubmitted(false);
        setGroupDrpDwn((prev) => prev.map((g) => ({ ...g, Selected: false })));
        setStreamDrpDwn((prev) => prev.map((s) => ({ ...s, Selected: false })));
    };

    const handleToggleForm = () => {
        if (isFormOpen) {
            clearForm();
            setIsFormOpen(false);
        } else {
            clearForm();
            setIsFormOpen(true);
            setTimeout(() => {
                formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    };

    const isGroupSelected = groupDrpDwn.some((cls) => cls.Selected);
    const isStreamSelected = streamDrpDwn.some((sec) => sec.Selected);
    const isFormValid = asmaY_Id1 && asmcL_Id && isGroupSelected && isStreamSelected;

    const save = async () => {
        setSubmitted(true);
        if (isFormValid) {
            const selectedGroups = groupDrpDwn.filter((g) => g.Selected);
            const selectedStreams = streamDrpDwn.filter((s) => s.Selected);

            const data: any = {
                FMSGM_Id: fmsgM_ID,
                ASMCL_Id: Number(asmcL_Id),
                ASMCL_ID: Number(asmcL_Id),
                ASMAY_Id: Number(asmaY_Id1),
                FMG_Id: selectedGroups[0]?.fmG_Id ?? selectedGroups[0]?.FMG_Id ?? 0,
                PASL_ID: selectedStreams[0]?.pasL_ID ?? selectedStreams[0]?.PASL_ID ?? 0,
                groupList: selectedGroups.map((g) => ({ FMG_Id: Number(g.fmG_Id ?? g.FMG_Id) })),
                streamList: selectedStreams.map((s) => ({ PASL_ID: Number(s.pasL_ID ?? s.PASL_ID) })),
                TempararyArrayList: selectedGroups,
                TempararyArrayList1: selectedStreams
            };

            try {
                const promise: any = await saveFeeStreamGroupMapping(data);
                const isSuccess =
                    promise?.success === true ||
                    promise?.returnVal === true ||
                    (typeof promise?.message === 'string' && promise.message.toLowerCase().includes('success'));

                if (isSuccess) {
                    Swal.fire(`Record ${promise?.messagesaveupdate || (fmsgM_ID > 0 ? 'Update' : 'Save')}d Successfully`);
                    await loadGridData();
                    clearForm();
                    setIsFormOpen(false);
                } else {
                    Swal.fire(`Record Failed To ${promise?.messagesaveupdate || (fmsgM_ID > 0 ? 'Update' : 'Save')}`);
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    const getOrgValue = async (employee: any) => {
        try {
            setEditFlag(true);
            setIsFormOpen(true);
            setTimeout(() => {
                formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

            const editId = employee.fmsgM_Id ?? employee.FMSGM_Id;
            const promise: any = await editFeeStreamGroupMapping(editId);

            const rawData = promise?.data ?? promise?.groupData ?? promise;
            const groupData = Array.isArray(rawData) ? rawData[0] : (rawData || employee);

            if (!groupData) return;

            setFmsgM_ID(editId);
            setAsmcL_Id(String(groupData.asmcL_ID ?? groupData.asmcL_Id ?? groupData.ASMCL_Id ?? employee.asmcL_Id ?? ''));
            setAsmaY_Id1(String(groupData.asmaY_Id ?? groupData.ASMAY_Id ?? employee.asmaY_Id ?? ''));

            const targetFmgId = Number(groupData.fmG_Id ?? groupData.FMG_Id ?? employee.fmG_Id);
            const targetPaslId = Number(groupData.pasL_ID ?? groupData.PASL_ID ?? groupData.pasL_Id ?? employee.pasL_ID);

            setGroupDrpDwn((prev) =>
                prev.map((cls) => ({
                    ...cls,
                    Selected: Number(cls.fmG_Id ?? cls.FMG_Id) === targetFmgId
                }))
            );

            setStreamDrpDwn((prev) => {
                const exists = prev.some((sec) => Number(sec.pasL_ID ?? sec.PASL_ID) === targetPaslId);
                const updated = prev.map((sec) => ({
                    ...sec,
                    Selected: Number(sec.pasL_ID ?? sec.PASL_ID) === targetPaslId
                }));
                if (!exists && targetPaslId) {
                    return [
                        ...updated,
                        {
                            pasL_ID: targetPaslId,
                            pasL_Name: groupData.pasL_Name ?? groupData.PASL_Name ?? employee.pasL_Name ?? `Stream ${targetPaslId}`,
                            Selected: true
                        }
                    ];
                }
                return updated;
            });
        } catch (err) {
            console.error(err);
        }
    };

    const deactivate = async (clscatgry: any) => {
        const isActive =
            clscatgry.fmsgM_Active === 1 ||
            clscatgry.fmsgM_Active === true ||
            clscatgry.FMSGM_Active === 1 ||
            clscatgry.FMSGM_Active === true;
        const action = isActive ? 'Deactivate' : 'Activate';

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do You Want To ${action} Stream?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: `Yes, ${action} it!`,
            cancelButtonText: 'Cancel..!'
        });

        if (result.isConfirmed) {
            try {
                const promise: any = await deactivateFeeStreamGroupMapping(clscatgry);
                const isSuccess =
                    promise?.success === true ||
                    promise?.returnVal === true ||
                    (typeof promise?.message === 'string' && promise.message.toLowerCase().includes('success'));

                if (promise?.msgdeactive === 'Deactive') {
                    Swal.fire('You Can Not Activate/Deactivate This Record. It Is Already Mapped With Student');
                } else if (isSuccess) {
                    Swal.fire(`Stream ${action}d Successfully`);
                    await loadGridData();
                } else {
                    Swal.fire(`Failed to ${action} Stream`);
                }
            } catch (err) {
                console.error(err);
            }
        } else {
            Swal.fire('Cancelled');
        }
    };

    const tableProps = useDataTableProps(loaddetails);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                
                {/* Header */}
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={handleToggleForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        {isFormOpen ? <X className='mr-2 h-4 w-4' /> : <Plus className='mr-2 h-4 w-4' />}
                        {isFormOpen ? 'Close Form' : 'Add Fee Stream Group Mapping'}
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IFeeStreamGroupMappingGrid>
                        {...tableProps}
                        columns={feeStreamGroupMappingColumns(getOrgValue, deactivate)}
                        isLoading={isLoading}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading Fee Stream Group Mappings...'
                        noDataTitle='No Fee Stream Group Mappings Found'
                        noDataDescription='Get started by creating your first fee stream group mapping'
                        errorTitle='Error Loading Fee Stream Group Mappings'
                    />
                </CollapsibleSection>

                {/* Add / Edit Form Section */}
                {isFormOpen && (
                    <div ref={formRef}>
                        <CollapsibleSection
                            title={editFlag ? 'Edit Fee Stream Group Mapping' : 'Add Fee Stream Group Mapping'}
                            description={editFlag ? 'Update the mapping details below.' : 'Fill in the details below to map groups and streams to classes.'}
                            defaultOpen={true}
                            variant='outline'
                            size='md'
                            className='slide-in-from-top-4 animate-in shadow-lg duration-300 relative'>
                            <div className='relative'>
                                <Button
                                    type='button'
                                    onClick={() => {
                                        clearForm();
                                        setIsFormOpen(false);
                                    }}
                                    variant='ghost'
                                    size='sm'
                                    className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                    <X className='mr-1 h-4 w-4 text-destructive' /> Close
                                </Button>

                                <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        
                                        {/* Academic Year */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none">
                                                Academic Year: <span className="text-red-500">*</span>
                                            </label>
                                            <select 
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                                                value={asmaY_Id1} 
                                                onChange={e => setAsmaY_Id1(e.target.value)} 
                                                required>
                                                <option value="">--Select--</option>
                                                {acdYear.map(y => {
                                                    const yId = y.asmaY_Id ?? y.ASMAY_Id;
                                                    const yName = y.asmaY_Year ?? y.ASMAY_Year;
                                                    return (
                                                        <option key={yId} value={yId}>
                                                            {yName}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                            {submitted && !asmaY_Id1 && <p className="text-sm font-medium text-destructive">Please Select Academic Year</p>}
                                        </div>

                                        {/* Class */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none">
                                                Class: <span className="text-red-500">*</span>
                                            </label>
                                            <select 
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                                                value={asmcL_Id} 
                                                onChange={e => handleClassChange(e.target.value)} 
                                                required>
                                                <option value="">--Select--</option>
                                                {classDrpDwn.map(c => {
                                                    const cId = c.asmcL_Id ?? c.ASMCL_Id;
                                                    const cName = c.asmcL_ClassName ?? c.ASMCL_ClassName;
                                                    return (
                                                        <option key={cId} value={cId}>
                                                            {cName}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                            {submitted && !asmcL_Id && <p className="text-sm font-medium text-destructive">Please Select Class</p>}
                                        </div>

                                        {/* Group */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none">
                                                Group: <span className="text-red-500">*</span>
                                            </label>
                                            <div className="max-h-[150px] overflow-y-scroll rounded-md border border-input p-3 space-y-2 bg-background">
                                                {groupDrpDwn.map(cls => {
                                                    const gId = cls.fmG_Id ?? cls.FMG_Id;
                                                    const gName = cls.fmG_GroupName ?? cls.FMG_GroupName;
                                                    return (
                                                        <label key={gId} className="flex items-center space-x-2 text-sm cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={cls.Selected || false} 
                                                                disabled={editFlag} 
                                                                onChange={() => handleGroupToggle(gId)} 
                                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                            />
                                                            <span>{gName}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                            {submitted && !isGroupSelected && <p className="text-sm font-medium text-destructive">Select Group</p>}
                                        </div>

                                        {/* Stream */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none">
                                                Stream: <span className="text-red-500">*</span>
                                            </label>
                                            <div className="max-h-[150px] overflow-y-scroll rounded-md border border-input p-3 space-y-2 bg-background">
                                                {streamDrpDwn.map(sec => {
                                                    const sId = sec.pasL_ID ?? sec.PASL_ID;
                                                    const sName = sec.pasL_Name ?? sec.PASL_Name;
                                                    return (
                                                        <label key={sId} className="flex items-center space-x-2 text-sm cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={sec.Selected || false} 
                                                                disabled={editFlag} 
                                                                onChange={() => handleStreamToggle(sId)} 
                                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                            />
                                                            <span>{sName}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                            {submitted && !isStreamSelected && <p className="text-sm font-medium text-destructive">Select Stream</p>}
                                        </div>

                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button type='button' variant='outline' onClick={clearForm}>
                                            Reset
                                        </Button>
                                        <Button type='submit'>
                                            <Save className='mr-2 h-4 w-4' /> Save
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </CollapsibleSection>
                    </div>
                )}

            </div>
        </div>
    );
}