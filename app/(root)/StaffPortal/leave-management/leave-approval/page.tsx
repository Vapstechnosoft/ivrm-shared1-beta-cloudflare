'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { AdaptiveDialog } from '@/components/ui/extension/adaptive-dialog';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    useApproveOrRejectLeaveStatus,
    useApprovedLeave,
    useLeaveAppliedOrApprovalGrid,
    useViewLeaveBalanceHistory
} from '@/hooks/hrms/leave-management/useLeaveApproval';
import { cn } from '@/lib/utils';
import { Check, Loader2, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { use, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { type LeaveApprovalRow, getLeaveApprovalColumns } from './_components/columns';
import { LeaveApprovalForm, type LeaveApprovalFormData } from './_components/leave-approval-form';
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
export default function LeaveApprovalPage(props: { searchParams: SearchParams }) {
    const _searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useLeaveAppliedOrApprovalGrid();

    // Map LeaveApprovalGridItem to LeaveApprovalRow shape with robust casing support
    const mappedData: LeaveApprovalRow[] = (response?.data || []).map((item: any) => {
        const id = item.hrelaP_Id || item.HRELAP_Id || item.id;
        const empId = item.hrmE_Id || item.HRME_Id;

        return {
            id: id,
            hrmE_Id: empId,
            hrelaP_Id: id,
            employeeCode: item.hrmE_EmployeeCode || item.HRME_EmployeeCode || '',
            employeeName: item.hrmE_FullName || item.HRME_FullName || item.hrmE_EmployeeFullName || '',
            leaveName: item.hrmL_LeaveName || item.HRML_LeaveName || '',
            fromDate: item.hrelaP_FromDate || item.HRELAP_FromDate || item.hreltD_FromDate || '',
            toDate: item.hrelaP_ToDate || item.HRELAP_ToDate || item.hreltD_ToDate || '',
            totalDays: item.hrelapD_TotalDays || item.HRELAPD_TotalDays || item.hreltD_TotDays || 0,
            leaveStatus: item.hrelT_Status || item.HRELT_Status || 'Applied',
            remark: item.hrelapA_Remarks || item.HRELAPA_Remarks || ''
        };
    });

    // Create response for useDataTableProps
    const mockResponse = {
        data: mappedData,
        total: response?.total || mappedData.length,
        page: 1,
        pageSize: 10
    };
    return (
        <FormProvider<LeaveApprovalRow>>
            <LeaveApprovalPageContent response={mockResponse} isLoading={isLoading} error={error} mockResponse={mockResponse} />
        </FormProvider>
    );
}
interface LeaveApprovalPageContentProps {
    response: any;
    isLoading: boolean;
    error: any;
    mockResponse: {
        data: LeaveApprovalRow[];
        total: number;
        page: number;
        pageSize: number;
    };
}

function LeaveApprovalPageContent({ response, isLoading, error, mockResponse }: LeaveApprovalPageContentProps) {
    const { openEditForm } = useFormContext<LeaveApprovalRow>();
    const tableProps = useDataTableProps(mockResponse);
    const { data: session } = useSession();
    const userId = Number(session?.user?.id || 0);
    const { refetchAll } = useLeaveAppliedOrApprovalGrid();
    const { data: approvedResponse, refetch: refetchApproved } = useApprovedLeave({ LoginId: userId });
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
    const [isBalanceHistoryOpen, setIsBalanceHistoryOpen] = useState(false);
    const [stagedLeaves, setStagedLeaves] = useState<LeaveApprovalRow[]>([]);
    const { mutateAsync: approveOrReject } = useApproveOrRejectLeaveStatus();
    const [isProcessing, setIsProcessing] = useState(false);

    // Track final state of processed items to show correct remarks/status
    const [finalProcessedData, setFinalProcessedData] = useState<Record<number, { status: string; remark: string }>>({});
    // Track recently processed IDs locally to ensure they show up even if API refetch is slow
    const [recentlyProcessedIds, setRecentlyProcessedIds] = useState<Set<number>>(new Set());

    const handleApprove = (row: LeaveApprovalRow) => {
        // Move to staged leaves with 'Approved' status
        if (!stagedLeaves.find((item) => item.hrelaP_Id === row.hrelaP_Id)) {
            setStagedLeaves((prev) => [...prev, { ...row, leaveStatus: 'Approved', remark: '' }]);
        }
    };

    const handleReject = (row: LeaveApprovalRow) => {
        // Move to staged leaves with 'Rejected' status
        if (!stagedLeaves.find((item) => item.hrelaP_Id === row.hrelaP_Id)) {
            setStagedLeaves((prev) => [...prev, { ...row, leaveStatus: 'Rejected', remark: '' }]);
        }
    };

    const handleViewBalance = (row: LeaveApprovalRow) => {
        setSelectedEmployeeId(row.hrmE_Id);
        setIsBalanceHistoryOpen(true);
    };

    const removeFromStaged = (hrelaP_Id: number) => {
        setStagedLeaves((prev) => prev.filter((item) => item.hrelaP_Id !== hrelaP_Id));
    };

    const updateStagedStatus = (hrelaP_Id: number, status: string) => {
        setStagedLeaves((prev) => prev.map((item) => (item.hrelaP_Id === hrelaP_Id ? { ...item, leaveStatus: status } : item)));
    };

    const updateStagedRemark = (hrelaP_Id: number, remark: string) => {
        setStagedLeaves((prev) => prev.map((item) => (item.hrelaP_Id === hrelaP_Id ? { ...item, remark } : item)));
    };

    const handleSaveStaged = async () => {
        if (stagedLeaves.length === 0) return;

        setIsProcessing(true);
        try {
            // Group by employee if needed, but the current payload seems to be per employee.
            // If the API signature matches what's in the server-action, we might need to call it multiple times
            // or modify how we call it. Grouping by employee is safest.
            const groupedByEmployee = stagedLeaves.reduce(
                (acc, current) => {
                    const empId = current.hrmE_Id;
                    if (!acc[empId]) {
                        acc[empId] = [];
                    }
                    acc[empId].push(current);
                    return acc;
                },
                {} as Record<number, LeaveApprovalRow[]>
            );

            for (const empId in groupedByEmployee) {
                const empLeaves = groupedByEmployee[empId];
                const firstLeave = empLeaves[0];

                const hasRejection = empLeaves.some((l) => l.leaveStatus === 'Rejected');
                const hasApproval = empLeaves.some((l) => l.leaveStatus === 'Approved');
                const actionType = hasRejection && !hasApproval ? 'Reject' : 'Approve';

                const payload = {
                    approveRejectType: actionType,
                    hrmE_Id: Number(empId),
                    hreltD_FromDate: firstLeave.fromDate,
                    hreltD_ToDate: firstLeave.toDate,
                    get_leave_status: empLeaves.map((item) => ({
                        hrelaP_Id: item.hrelaP_Id,
                        hrelT_Status: item.leaveStatus,
                        hrelapA_Remarks: item.remark || (item.leaveStatus === 'Approved' ? 'Approved' : 'Rejected'),
                        hrmE_Id: item.hrmE_Id,
                        // Add alternative casings for maximum compatibility
                        HRELAP_Id: item.hrelaP_Id,
                        HRELT_Status: item.leaveStatus,
                        HRELAPA_Remarks: item.remark || (item.leaveStatus === 'Approved' ? 'Approved' : 'Rejected'),
                        HRME_Id: item.hrmE_Id
                    }))
                };

                await approveOrReject(payload);
            }

            // Track final state and IDs as processed
            const processedIds = stagedLeaves.map((l) => l.hrelaP_Id);
            const finalStateUpdates: Record<number, { status: string; remark: string }> = {};
            stagedLeaves.forEach((l) => {
                finalStateUpdates[l.hrelaP_Id] = {
                    status: l.leaveStatus,
                    remark: l.remark || (l.leaveStatus === 'Approved' ? 'Approved' : 'Rejected')
                };
            });

            setFinalProcessedData((prev) => ({ ...prev, ...finalStateUpdates }));
            setRecentlyProcessedIds((prev) => {
                const updated = new Set(prev);
                processedIds.forEach((id) => updated.add(id));
                return updated;
            });

            toast.success('Successfully processed all selected leaves');
            setStagedLeaves([]);
            refetchAll();
            refetchApproved();
        } catch (error: any) {
            toast.error(error.message || 'Failed to process leave approvals');
        } finally {
            setIsProcessing(false);
        }
    };

    const columns = useMemo(
        () =>
            getLeaveApprovalColumns({
                onApprove: handleApprove,
                onReject: handleReject,
                onViewBalance: handleViewBalance
            }),
        [stagedLeaves]
    );

    // Filter leaves into processed and pending
    const processedLeaves = useMemo(() => {
        // Option 1: Combine mockResponse data that is processed
        const currentDataProcessed = (mockResponse.data || []).filter(
            (item: LeaveApprovalRow) =>
                (item.leaveStatus !== 'Applied' && item.leaveStatus !== 'Pending') || recentlyProcessedIds.has(item.hrelaP_Id)
        );

        // Option 2: Add data from approvedResponse if available
        const approvedFromApi: LeaveApprovalRow[] = (approvedResponse?.data || []).map((item: any) => ({
            id: item.hrelaP_Id || item.HRELAP_Id,
            hrmE_Id: item.hrmE_Id || item.HRME_Id,
            hrelaP_Id: item.hrelaP_Id || item.HRELAP_Id,
            employeeCode: item.hrmE_EmployeeCode || item.HRME_EmployeeCode || '',
            employeeName: item.hrmE_FullName || item.HRME_FullName || '',
            leaveName: item.hrmL_LeaveName || item.HRML_LeaveName || '',
            fromDate: item.hrelaP_FromDate || item.HRELAP_FromDate || '',
            toDate: item.hrelaP_ToDate || item.HRELAP_ToDate || '',
            totalDays: item.hrelapD_TotalDays || item.HRELAPD_TotalDays || 0,
            leaveStatus: item.hrelT_Status || item.HRELT_Status || 'Approved',
            remark: item.hrelapA_Remarks || item.HRELAPA_Remarks || ''
        }));

        // Merge and deduplicate
        const combined = [...currentDataProcessed].map((item) => {
            if (finalProcessedData[item.hrelaP_Id]) {
                return {
                    ...item,
                    leaveStatus: finalProcessedData[item.hrelaP_Id].status,
                    remark: finalProcessedData[item.hrelaP_Id].remark
                };
            }
            return item;
        });

        approvedFromApi.forEach((item) => {
            if (!combined.find((p) => p.hrelaP_Id === item.hrelaP_Id)) {
                // If we have local final data, use it for API items too (until API refresh is confirmed)
                const localFinal = finalProcessedData[item.hrelaP_Id];
                combined.push(localFinal ? { ...item, leaveStatus: localFinal.status, remark: localFinal.remark } : item);
            }
        });

        return combined;
    }, [mockResponse.data, approvedResponse, recentlyProcessedIds, finalProcessedData]);

    const pendingLeaves = useMemo(() => {
        return (mockResponse.data || []).filter(
            (item: LeaveApprovalRow) =>
                (item.leaveStatus === 'Applied' || item.leaveStatus === 'Pending') && !recentlyProcessedIds.has(item.hrelaP_Id)
        );
    }, [mockResponse.data, recentlyProcessedIds]);

    // Filter out staged leaves from the pending list for the bottom grid
    const filteredPendingData = useMemo(() => {
        const stagedIds = new Set(stagedLeaves.map((l) => l.hrelaP_Id));
        return pendingLeaves.filter((item) => !stagedIds.has(item.hrelaP_Id));
    }, [pendingLeaves, stagedLeaves]);

    const activeTableProps = {
        ...tableProps,
        data: filteredPendingData,
        total: filteredPendingData.length
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* LEAVE APPROVAL STATUS Section */}
                <CollapsibleSection
                    title='LEAVE APPROVAL STATUS'
                    description='Status of processed and selected leave requests'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    {stagedLeaves.length === 0 && processedLeaves.length === 0 ? (
                        <div className='py-6 text-center text-gray-400'>
                            <p className='font-medium text-lg italic'>
                                Please click on Tick (Approve) or Cross (Reject) in the grid below to choose leaves for approval status.
                            </p>
                        </div>
                    ) : (
                        <div className='space-y-4 p-4'>
                            <div className='overflow-x-auto rounded-md border text-center'>
                                <Table>
                                    <TableHeader className='bg-muted/50'>
                                        <TableRow>
                                            <TableHead className='w-[80px] text-center'>Sl.No</TableHead>
                                            <TableHead className='text-center'>Employee Name</TableHead>
                                            <TableHead className='text-center'>Leave Details</TableHead>
                                            <TableHead className='text-center'>Status</TableHead>
                                            <TableHead className='text-center'>Remarks</TableHead>
                                            <TableHead className='text-center'>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {/* Show Staged Leaves First */}
                                        {stagedLeaves.map((item: LeaveApprovalRow, index) => (
                                            <TableRow key={`staged-${item.hrelaP_Id}`} className='bg-yellow-50/30 hover:bg-yellow-100/30'>
                                                <TableCell className='text-center font-medium'>{index + 1}</TableCell>
                                                <TableCell className='text-left'>
                                                    <div className='font-semibold'>{item.employeeName}</div>
                                                    <div className='text-muted-foreground text-xs'>{item.employeeCode}</div>
                                                </TableCell>
                                                <TableCell className='text-left'>
                                                    <div className='font-medium'>{item.leaveName}</div>
                                                    <div className='text-muted-foreground text-xs'>
                                                        {new Date(item.fromDate).toLocaleDateString('en-GB')} -{' '}
                                                        {new Date(item.toDate).toLocaleDateString('en-GB')} ({item.totalDays} days)
                                                    </div>
                                                </TableCell>
                                                <TableCell className='text-center'>
                                                    <select
                                                        className={cn(
                                                            'rounded border bg-background px-2 py-1 font-medium text-sm',
                                                            item.leaveStatus === 'Approved'
                                                                ? 'border-green-200 text-green-600'
                                                                : 'border-red-200 text-red-600'
                                                        )}
                                                        value={item.leaveStatus}
                                                        onChange={(e) => updateStagedStatus(item.hrelaP_Id, e.target.value)}>
                                                        <option value='Approved'>Approve</option>
                                                        <option value='Rejected'>Reject</option>
                                                    </select>
                                                </TableCell>
                                                <TableCell className='min-w-[200px]'>
                                                    <input
                                                        type='text'
                                                        placeholder='Enter remarks...'
                                                        className='w-full rounded border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                                                        value={item.remark}
                                                        onChange={(e) => updateStagedRemark(item.hrelaP_Id, e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell className='text-center'>
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() => removeFromStaged(item.hrelaP_Id)}
                                                        className='h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600'>
                                                        <X className='h-4 w-4' />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                        {/* Show Processed (Approved/Rejected) Leaves */}
                                        {processedLeaves.map((item: LeaveApprovalRow, index) => (
                                            <TableRow key={`processed-${item.hrelaP_Id}`} className='hover:bg-muted/30'>
                                                <TableCell className='text-center'>{stagedLeaves.length + index + 1}</TableCell>
                                                <TableCell className='text-left'>
                                                    <div className='font-semibold'>{item.employeeName}</div>
                                                    <div className='text-muted-foreground text-xs'>{item.employeeCode}</div>
                                                </TableCell>
                                                <TableCell className='text-left'>
                                                    <div className='font-medium'>{item.leaveName}</div>
                                                    <div className='text-muted-foreground text-xs'>
                                                        {new Date(item.fromDate).toLocaleDateString('en-GB')} -{' '}
                                                        {new Date(item.toDate).toLocaleDateString('en-GB')} ({item.totalDays} days)
                                                    </div>
                                                </TableCell>
                                                <TableCell className='text-center'>
                                                    <span
                                                        className={cn(
                                                            'inline-flex rounded-full px-2 py-1 font-semibold text-xs',
                                                            item.leaveStatus === 'Approved'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-700'
                                                        )}>
                                                        {item.leaveStatus}
                                                    </span>
                                                </TableCell>
                                                <TableCell className='text-center text-muted-foreground text-sm'>
                                                    {item.remark || '-'}
                                                </TableCell>
                                                <TableCell className='text-center'>
                                                    <span className='text-muted-foreground text-xs'>Processed</span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {stagedLeaves.length > 0 && (
                                <div className='flex justify-end pt-2'>
                                    <Button
                                        onClick={handleSaveStaged}
                                        isLoading={isProcessing}
                                        disabled={stagedLeaves.length === 0}
                                        className='bg-green-600 font-bold shadow-md hover:bg-green-700'>
                                        <Check className='mr-2 h-4 w-4' />
                                        Submit Final Selected Leaves
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CollapsibleSection>
                {/* LEAVE APPROVAL DETAILS Section */}
                <CollapsibleSection
                    title='LEAVE APPROVAL DETAILS'
                    description='View and manage leave approval requests'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<LeaveApprovalRow>
                        {...activeTableProps}
                        columns={columns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading leave approvals...'
                        noDataTitle='No Pending Leave Approvals'
                        noDataDescription='All leave requests have been processed.'
                        errorTitle='Error Loading Leave Approvals'
                    />
                </CollapsibleSection>
                {/* Forms */}
                <FormSections refetch={refetchAll} />

                {/* Balance History Dialog */}
                <AdaptiveDialog
                    title='Leave Balance History'
                    isOpen={isBalanceHistoryOpen}
                    onClose={() => setIsBalanceHistoryOpen(false)}
                    size='xl'>
                    <BalanceHistoryContent hrmeId={selectedEmployeeId} />
                </AdaptiveDialog>
            </div>
        </div>
    );
}

function BalanceHistoryContent({ hrmeId }: { hrmeId: number | null }) {
    const { data: response, isLoading, error } = useViewLeaveBalanceHistory(hrmeId);

    if (isLoading) {
        return (
            <div className='flex items-center justify-center p-8'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        );
    }

    if (error) {
        return <div className='p-8 text-center font-medium text-red-500'>Error loading balance history</div>;
    }

    const historyData = response?.data || [];

    return (
        <div className='p-4'>
            {historyData.length === 0 ? (
                <div className='p-8 text-center text-muted-foreground'>No balance history found for this employee.</div>
            ) : (
                <div className='overflow-hidden rounded-md border'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Leave Type</TableHead>
                                <TableHead className='text-center'>Entitled</TableHead>
                                <TableHead className='text-center'>Used</TableHead>
                                <TableHead className='text-center'>Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {historyData.map((item: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell className='font-medium'>{item.empLeaveType}</TableCell>
                                    <TableCell className='text-center'>{item.empCreatedLeaves}</TableCell>
                                    <TableCell className='text-center'>{item.empUsedLeaves}</TableCell>
                                    <TableCell className='text-center font-semibold text-primary'>{item.empBalanceLeaves}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
function FormSections({ refetch }: { refetch: () => void | Promise<any> }) {
    const { isEditFormOpen, selectedRow, closeEditForm } = useFormContext<LeaveApprovalRow>();
    const { mutateAsync: approveOrReject } = useApproveOrRejectLeaveStatus();

    const handleFormSubmit = async (formData: LeaveApprovalFormData) => {
        if (!selectedRow) return;

        const payload = {
            approveRejectType: formData.action === 'approve' ? 'Approve' : 'Reject',
            hrmE_Id: selectedRow.hrmE_Id,
            hreltD_FromDate: selectedRow.fromDate,
            hreltD_ToDate: selectedRow.toDate,
            get_leave_status: [
                {
                    hrelaP_Id: selectedRow.hrelaP_Id,
                    hrelT_Status: formData.action === 'approve' ? 'Approved' : 'Rejected',
                    hrelapA_Remarks: formData.remark || (formData.action === 'approve' ? 'Approved' : 'Rejected')
                }
            ]
        };

        try {
            await approveOrReject(payload);
            refetch();
            closeEditForm();
        } catch (error) {
            // Error is already toasted by hook
        }
    };
    return (
        <>
            {/* Approval/Rejection Dialog */}
            {isEditFormOpen && selectedRow && (
                <AdaptiveDialog
                    title={`Leave Approval - ${selectedRow.employeeName}`}
                    isOpen={isEditFormOpen}
                    onClose={closeEditForm}
                    size='lg'>
                    <LeaveApprovalForm leaveRequest={selectedRow} onSubmit={handleFormSubmit} onCancel={closeEditForm} />
                </AdaptiveDialog>
            )}
        </>
    );
}
