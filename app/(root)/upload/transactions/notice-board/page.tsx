'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNoticeBoard } from '@/hooks/upload/transactions/use-notice-board';
import type { INoticeBoard } from '@/schemas/upload/transactions/notice-board.schema';
import { toggleNoticeBoardStatus } from '@/server/upload/transactions/notice-board/server-action';
import { Loader2, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import AddNoticeBoardForm from './_components/add-form';
import AttachmentPreview from './_components/attachment-preview';
import { getNoticeBoardColumns } from './_components/columns';
import UpdateNoticeBoardForm from './_components/update-form';
import ViewRecordsModal from './_components/view-records-modal';

export default function NoticeBoardPage() {
    const { data: response, isLoading, refetch } = useNoticeBoard();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isViewRecordsOpen, setIsViewRecordsOpen] = useState(false);
    const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [viewDefaultTab, setViewDefaultTab] = useState('students');
    const [selectedAttachment, setSelectedAttachment] = useState<{ url: string; name: string } | null>(null);

    const handleEdit = useCallback((row: INoticeBoard) => {
        setSelectedRow(row);
        setIsUpdateModalOpen(true);
    }, []);

    const handleToggle = useCallback(
        async (row: INoticeBoard) => {
            if (!row.intB_Id) {
                toast.error('Invalid Notice ID');
                return;
            }
            try {
                const result = await toggleNoticeBoardStatus({ intB_Id: row.intB_Id });
                if (result?.success) {
                    toast.success(result.message || 'Notice board status updated successfully.');
                    refetch();
                } else {
                    toast.error(result?.message || 'Failed to update notice board status.');
                }
            } catch (error: any) {
                toast.error(error?.message || 'Error updating notice board status');
            }
        },
        [refetch]
    );

    const handleViewRecords = useCallback((row: INoticeBoard) => {
        setSelectedRow(row);
        setViewDefaultTab('students');
        setIsViewRecordsOpen(true);
    }, []);

    const handleViewAttachment = useCallback((row: INoticeBoard) => {
        setSelectedRow(row);
        setViewDefaultTab('attachments');
        setIsViewRecordsOpen(true);
    }, []);

    const columns = useMemo(
        () => getNoticeBoardColumns(handleEdit, handleToggle, handleViewRecords, handleViewAttachment),
        [handleEdit, handleToggle, handleViewRecords, handleViewAttachment]
    );

    const yearList = useMemo(() => (response as any)?.data?.yearlist || (response as any)?.yearlist || [], [response]);
    const classList = useMemo(
        () =>
            (response as any)?.data?.studentList1 ||
            (response as any)?.studentList1 ||
            (response as any)?.data?.studentlist1 ||
            (response as any)?.studentlist1 ||
            [],
        [response]
    );
    const deptList = useMemo(
        () =>
            (response as any)?.data?.studentList2 ||
            (response as any)?.studentList2 ||
            (response as any)?.data?.studentlist2 ||
            (response as any)?.studentlist2 ||
            [],
        [response]
    );
    const desgList = useMemo(
        () =>
            (response as any)?.data?.studentList3 ||
            (response as any)?.studentList3 ||
            (response as any)?.data?.studentlist3 ||
            (response as any)?.studentlist3 ||
            [],
        [response]
    );
    const routeList = useMemo(() => (response as any)?.data?.route_list || (response as any)?.route_list || [], [response]);
    const feeGroupList = useMemo(() => (response as any)?.data?.fee_group || (response as any)?.fee_group || [], [response]);
    const feeTermList = useMemo(
        () =>
            (response as any)?.data?.fee_terms ||
            (response as any)?.fee_terms ||
            (response as any)?.data?.fee_term ||
            (response as any)?.fee_term ||
            [],
        [response]
    );

    const activeYear = useMemo(
        () => (response as any)?.data?.academicyear?.[0]?.asmaY_Year || (response as any)?.academicyear?.[0]?.asmaY_Year || '',
        [response]
    );
    const activeYearId = useMemo(
        () => (response as any)?.data?.academicyear?.[0]?.asmaY_Id || (response as any)?.academicyear?.[0]?.asmaY_Id || 0,
        [response]
    );

    const noticeList = useMemo(() => {
        const list =
            (response as any)?.data?.studentList ||
            (response as any)?.studentList ||
            (response as any)?.data?.studentlist ||
            (response as any)?.studentlist ||
            [];
        const allAttachments =
            (response as any)?.data?.attachementlist ||
            (response as any)?.attachementlist ||
            (response as any)?.data?.attachmentlist ||
            (response as any)?.attachmentlist ||
            [];

        return list.map((notice: any) => {
            const noticeId = notice.intB_Id || notice.INTB_Id;
            const noticeYearId = notice.asmaY_Id || notice.ASMAY_Id || notice.asmay_id || notice.asmay_Id;
            const year = yearList.find((y: any) => (y.asmaY_Id || y.asmay_Id || y.ASMAY_Id) === noticeYearId);

            // Helper to normalize backend string-booleans
            const toBool = (val: any) => (typeof val === 'string' ? val.toLowerCase() === 'true' : !!val);

            // Map attachments for this specific row using intB_Id
            const rowAttachments = allAttachments
                .filter((att: any) => (att.intB_Id || att.INTB_Id) === noticeId)
                .map((att: any) => ({
                    intbfL_Id: att.intbfL_Id || att.INTBFL_Id,
                    intbfL_FilePath: att.intbfL_FilePath || att.INTBFL_FilePath,
                    fileName: att.intbfL_FileName || att.INTBFL_FileName || 'Attachment'
                }));

            return {
                ...notice,
                asmaY_Year: year ? year.asmaY_Year : activeYear,
                intB_ActiveFlag: toBool(notice.intB_ActiveFlag ?? notice.INTB_ActiveFlag),
                intB_ToStaffFlg: toBool(notice.intB_ToStaffFlg ?? notice.INTB_ToStaffFlg),
                intB_ToStudentFlg: toBool(notice.intB_ToStudentFlg ?? notice.INTB_ToStudentFlg),
                // Populate FilePath_Array so columns.tsx can see the files
                intB_FilePath_Array: rowAttachments,
                // Harmonize FilesCount
                FilesCount: rowAttachments.length > 0 ? rowAttachments.length : notice.FilesCount || notice.filescount || 0
            };
        });
    }, [response, yearList, activeYear]);

    return (
        <div className='flex flex-col gap-6 p-6'>
            <div className='flex items-center justify-between'>
                <h1 className='font-bold text-3xl tracking-tight'>Notice Board</h1>
                <Button onClick={() => setIsAddModalOpen(true)} className='shadow-md' style={{ width: '196px' }}>
                    <Plus className='mr-2 h-4 w-4' /> Add Notice
                </Button>
            </div>

            <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='font-medium text-sm'>Notice Board Records</CardTitle>
                    {/* <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
                            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} /> Refresh
                        </Button>
                        <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-2" /> Filter
                        </Button>
                    </div> */}
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className='flex h-64 items-center justify-center'>
                            <Loader2 className='h-8 w-8 animate-spin text-primary' />
                        </div>
                    ) : (
                        <DataTable columns={columns} data={noticeList} totalItems={noticeList.length} />
                    )}
                </CardContent>
            </Card>

            {/* Add Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className='max-h-[90vh] max-w-[85vw] overflow-y-auto' onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Add Notice Board</DialogTitle>
                    </DialogHeader>
                    <AddNoticeBoardForm
                        onSuccess={() => {
                            setIsAddModalOpen(false);
                            refetch();
                        }}
                        defaultYearId={activeYearId}
                        yearList={yearList}
                        classList={classList}
                        deptList={deptList}
                        desgList={desgList}
                        routeList={routeList}
                        feeGroupList={feeGroupList}
                        feeTermList={feeTermList}
                    />
                </DialogContent>
            </Dialog>

            {/* Update Modal */}
            <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
                <DialogContent className='max-h-[90vh] max-w-[85vw] overflow-y-auto' onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Update Notice Board</DialogTitle>
                    </DialogHeader>
                    {selectedRow && (
                        <UpdateNoticeBoardForm
                            selectedRow={selectedRow}
                            onSuccess={() => {
                                setIsUpdateModalOpen(false);
                                refetch();
                            }}
                            yearList={yearList}
                            classList={classList}
                            deptList={deptList}
                            desgList={desgList}
                            routeList={routeList}
                            feeGroupList={feeGroupList}
                            feeTermList={feeTermList}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <ViewRecordsModal
                isOpen={isViewRecordsOpen}
                onClose={() => setIsViewRecordsOpen(false)}
                selectedRow={selectedRow}
                defaultTab={viewDefaultTab}
            />

            {/* Attachment Preview Modal */}
            {selectedAttachment && (
                <AttachmentPreview
                    isOpen={isAttachmentOpen}
                    onClose={() => setIsAttachmentOpen(false)}
                    url={selectedAttachment.url}
                    fileName={selectedAttachment.name}
                />
            )}
        </div>
    );
}
