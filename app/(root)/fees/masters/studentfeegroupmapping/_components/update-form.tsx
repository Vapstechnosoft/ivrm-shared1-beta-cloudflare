'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { useStudentFeeGroupMapping } from '@/hooks/fees/useMasters';
import { getStudentFeeGroupMappingEditData, updtaeStudentFeeGroupMapping } from '@/server/fees/masters/student_fee_group_mapping';
import { Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function UpdateMasterStudentFeeGroupMappingsForm({
    onSuccess,
    selectedRow,
    className = ''
}: { onSuccess?: () => void; selectedRow: any; className?: string }) {
    const { refetchAll } = useStudentFeeGroupMapping();
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Store the structure of groups/heads/installments
    const [feeGroups, setFeeGroups] = useState<any[]>([]);
    const [collapsedGroups, setCollapsedGroups] = useState<Record<number, boolean>>({});
    const [collapsedHeads, setCollapsedHeads] = useState<Record<string, boolean>>({});
    const originalFeeGroupsRef = useRef<any[]>([]);

    useEffect(() => {
        if (!selectedRow?.fmgM_Id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch the data from the API as per user instruction
                const response = await getStudentFeeGroupMappingEditData(selectedRow.fmgM_Id);

                // Usually the API returns { data: { ... } } or { feeGroups: [...] } or { editdata: [...] }
                let groups: any[] = [];
                if (response?.feeGroups) {
                    groups = response.feeGroups as any[];
                } else if (response?.data?.feeGroups) {
                    groups = response.data.feeGroups as any[];
                } else if (response?.editdata) {
                    groups = response.editdata as any[];
                } else if (response?.data?.editdata) {
                    groups = response.data.editdata as any[];
                } else if (Array.isArray(response)) {
                    groups = response as any[];
                } else if (Array.isArray(response?.data)) {
                    groups = response.data as any[];
                }

                setFeeGroups(groups);
                originalFeeGroupsRef.current = JSON.parse(JSON.stringify(groups));
            } catch (err) {
                console.error(err);
                toast.error('Failed to fetch edit data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedRow]);

    const submit = async () => {
        setIsSubmitting(true);
        const buildPayload = () => {
            const mappings: any[] = [];
            const originalGroups = originalFeeGroupsRef.current;

            feeGroups.forEach((group) => {
                if (!group.checked && group.heads?.length === 0) return;

                const originalGroup = originalGroups.find((g: any) => g.fmG_Id === group.fmG_Id);

                group.heads?.forEach((head: any) => {
                    const originalHead = originalGroup?.heads?.find((h: any) => h.fmH_Id === head.fmH_Id);

                    head.installments?.forEach((inst: any) => {
                        const originalInst = originalHead?.installments?.find((i: any) => i.ftI_Id === inst.ftI_Id);

                        // Check if value changed, or if we should just send all checked
                        if (!originalInst || inst.checked !== originalInst.checked) {
                            mappings.push({
                                fmG_Id: group.fmG_Id,
                                fmH_Id: head.fmH_Id,
                                ftI_Id: inst.ftI_Id || inst.fti_id,
                                isSelected: inst.checked === true
                            });
                        }
                    });
                });
            });

            return {
                asmaY_Id: selectedRow?.asmaY_Id || selectedRow?.academicYearId,
                amsT_Id: selectedRow?.amsT_Id || selectedRow?.studentId,
                fmgM_Id: selectedRow?.fmgM_Id,
                mappings
            };
        };

        const payload = buildPayload();
        console.log('Update payload:', JSON.stringify(payload));

        try {
            const response = await updtaeStudentFeeGroupMapping(payload);
            if (response?.success) {
                toast.success(response.message || 'Updated successfully');
                await refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to update');
            }
        } catch (err: any) {
            console.error('API Error:', err);
            toast.error(err?.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleGroup = (id: number) => setCollapsedGroups((prev) => ({ ...prev, [id]: !prev[id] }));

    const toggleHead = (groupId: number, headId: number) => {
        const key = `${groupId}-${headId}`;
        setCollapsedHeads((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const isHeadCollapsed = (groupId: number, headId: number): boolean => {
        const key = `${groupId}-${headId}`;
        return !!collapsedHeads[key];
    };

    const handleGroupCheck = (group: any) => {
        if (group.disabled) return;
        const shouldCheck = !group.checked;

        setFeeGroups((prev) =>
            prev.map((g) =>
                g.fmG_Id === group.fmG_Id
                    ? {
                          ...g,
                          checked: shouldCheck,
                          heads: g.heads?.map((head: any) => ({
                              ...head,
                              checked: head.disabled ? head.checked : shouldCheck,
                              installments: head.installments?.map((inst: any) => ({
                                  ...inst,
                                  checked: inst.disabled ? inst.checked : shouldCheck
                              }))
                          }))
                      }
                    : g
            )
        );
    };

    const handleHeadCheck = (groupId: number, headId: number) => {
        setFeeGroups((prev) =>
            prev.map((g) => {
                if (g.fmG_Id !== groupId) return g;

                const newHeads = g.heads?.map((h: any) => {
                    if (h.fmH_Id !== headId) return h;

                    const newHeadChecked = h.disabled ? h.checked : !h.checked;

                    return {
                        ...h,
                        checked: newHeadChecked,
                        installments: h.installments?.map((inst: any) => ({
                            ...inst,
                            checked: inst.disabled ? inst.checked : newHeadChecked
                        }))
                    };
                });

                const hasAnyCheckedHead = newHeads?.some((h: any) => h.checked && !h.disabled);

                return {
                    ...g,
                    heads: newHeads,
                    checked: g.disabled ? g.checked : hasAnyCheckedHead
                };
            })
        );
    };

    const handleInstallmentCheck = (groupId: number, headId: number, instId: number) => {
        setFeeGroups((prev) =>
            prev.map((g) => {
                if (g.fmG_Id !== groupId) return g;

                const newHeads = g.heads?.map((h: any) => {
                    if (h.fmH_Id !== headId) return h;

                    const newInstallments = h.installments?.map((i: any) =>
                        (i.ftI_Id === instId || i.fti_id === instId) && !i.disabled ? { ...i, checked: !i.checked } : i
                    );

                    const hasAnyCheckedInstallment = newInstallments?.some((inst: any) => inst.checked && !inst.disabled);

                    return {
                        ...h,
                        installments: newInstallments,
                        checked: h.disabled ? h.checked : hasAnyCheckedInstallment
                    };
                });

                const hasAnyCheckedHead = newHeads?.some((h: any) => h.checked && !h.disabled);

                return {
                    ...g,
                    heads: newHeads,
                    checked: g.disabled ? g.checked : hasAnyCheckedHead
                };
            })
        );
    };

    return (
        <div className={`space-y-6 ${className}`}>
            <div className='grid grid-cols-1 gap-4 rounded-md bg-muted/20 p-4 md:grid-cols-2'>
                <div>
                    <Label className='text-muted-foreground'>Student Name</Label>
                    <div className='mt-1 font-medium'>
                        {`${selectedRow?.amsT_FirstName || ''} ${selectedRow?.amsT_MiddleName || ''} ${selectedRow?.amsT_LastName || ''}`.trim() ||
                            'N/A'}
                    </div>
                </div>
                <div>
                    <Label className='text-muted-foreground'>Class & Section</Label>
                    <div className='mt-1 font-medium'>
                        {selectedRow?.asmcL_ClassName || 'N/A'} - {selectedRow?.asmC_SectionName || 'N/A'}
                    </div>
                </div>
                <div>
                    <Label className='text-muted-foreground'>Phone Number</Label>
                    <div className='mt-1 font-medium'>{selectedRow?.amsT_Mobile || 'N/A'}</div>
                </div>
                <div>
                    <Label className='text-muted-foreground'>Group Name</Label>
                    <div className='mt-1 font-medium'>{selectedRow?.fmG_GroupName || 'N/A'}</div>
                </div>
            </div>

            <div className='max-h-[400px] min-h-[200px] overflow-y-auto rounded-md border p-4'>
                {loading ? (
                    <div className='flex h-full items-center justify-center'>
                        <span className='text-muted-foreground'>Loading mapping data...</span>
                    </div>
                ) : feeGroups.length === 0 ? (
                    <div className='flex h-full items-center justify-center'>
                        <span className='text-muted-foreground'>
                            No mapping data available or standard update form should be bound here.
                        </span>
                    </div>
                ) : (
                    <div>
                        {feeGroups.map((group) => (
                            <div key={group.fmG_Id} className='mb-2'>
                                <div className='flex items-center gap-2'>
                                    <button
                                        type='button'
                                        onClick={() => toggleGroup(group.fmG_Id)}
                                        className='mr-2 w-6 cursor-pointer rounded text-center text-xl hover:bg-muted'>
                                        {collapsedGroups[group.fmG_Id] ? '−' : '+'}
                                    </button>
                                    <Checkbox
                                        checked={group.checked}
                                        disabled={group.disabled}
                                        onCheckedChange={() => handleGroupCheck(group)}
                                    />
                                    <span className={group.disabled ? 'text-muted-foreground' : 'font-medium'}>
                                        {group.groupName || group.fmG_GroupName}
                                    </span>
                                </div>

                                {collapsedGroups[group.fmG_Id] && group.heads && group.heads.length > 0 && (
                                    <div className='mt-2 pl-8'>
                                        {group.heads.map((head: any) => (
                                            <div key={head.fmH_Id} className='mb-2'>
                                                <div className='flex items-center gap-3'>
                                                    <button
                                                        type='button'
                                                        onClick={() => toggleHead(group.fmG_Id, head.fmH_Id)}
                                                        className='w-6 rounded text-center text-xl hover:bg-muted'>
                                                        {isHeadCollapsed(group.fmG_Id, head.fmH_Id) ? '−' : '+'}
                                                    </button>
                                                    <Checkbox
                                                        checked={head.checked}
                                                        disabled={head.disabled}
                                                        onCheckedChange={() => handleHeadCheck(group.fmG_Id, head.fmH_Id)}
                                                    />
                                                    <span className={head.disabled ? 'text-muted-foreground' : ''}>
                                                        {head.headName || head.fmH_FeeName}
                                                    </span>
                                                </div>

                                                {isHeadCollapsed(group.fmG_Id, head.fmH_Id) &&
                                                    head.installments &&
                                                    head.installments.length > 0 && (
                                                        <div className='mt-2 ml-10 space-y-2 border-l-2 py-1 pl-4'>
                                                            {head.installments.map((inst: any) => (
                                                                <div key={inst.ftI_Id || inst.fti_id} className='flex items-center gap-2'>
                                                                    <Checkbox
                                                                        checked={inst.checked}
                                                                        disabled={inst.disabled}
                                                                        onCheckedChange={() =>
                                                                            handleInstallmentCheck(
                                                                                group.fmG_Id,
                                                                                head.fmH_Id,
                                                                                inst.ftI_Id || inst.fti_id
                                                                            )
                                                                        }
                                                                    />
                                                                    <span
                                                                        className={`text-sm ${
                                                                            inst.disabled ? 'text-muted-foreground' : ''
                                                                        }`}>
                                                                        {inst.installmentName || inst.ftI_Name || inst.fti_name}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className='flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end'>
                <Button type='button' variant='outline' onClick={onSuccess} disabled={isSubmitting} className='w-fit'>
                    Cancel
                </Button>
                <Button type='button' onClick={submit} disabled={isSubmitting || feeGroups.length === 0} className='w-fit'>
                    <Save className='mr-2 h-4 w-4' />
                    {isSubmitting ? 'Updating...' : 'Update Mapping'}
                </Button>
            </div>
        </div>
    );
}
