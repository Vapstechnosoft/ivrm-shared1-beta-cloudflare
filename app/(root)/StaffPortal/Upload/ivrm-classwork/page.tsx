'use client';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { cn } from '@/lib/utils';
import { fetchInitialData, viewClassWorkAttachments } from '@/server/upload/transactions/ivrm-classwork/server-action';
import type { IClassWorkDetails } from '@/types/upload/reports/classwork-upload-report';
import { List, Loader2, Plus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import AttachmentViewModal from './_components/AttachmentViewModal';
import AddClassWorkForm from './_components/add-form';
import { classWorkColumns } from './_components/columns';
import ToggleClassWorkForm from './_components/toggle-form';
import UpdateClassWorkForm from './_components/update-form';

export default function ClassWorkPage() {
    const [classWorkList, setClassWorkList] = useState<IClassWorkDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRow, setSelectedRow] = useState<IClassWorkDetails | null>(null);
    const [isAddMode, setIsAddMode] = useState(false);
    const [isUpdateMode, setIsUpdateMode] = useState(false);
    const [isToggleMode, setIsToggleMode] = useState(false);
    const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [isFetchingAttachments, setIsFetchingAttachments] = useState(false);

    const [initialData, setInitialData] = useState<any>(null);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const response: any = await fetchInitialData();
            if (response && response.success) {
                setInitialData(response.data);

                let processedList: IClassWorkDetails[] = [];
                const gridData = response.data?.homeworkgridlist;

                if (gridData && gridData.length > 0 && gridData[0].IVRM_ClassHomeworkGrid_List) {
                    try {
                        processedList = JSON.parse(gridData[0].IVRM_ClassHomeworkGrid_List);
                    } catch (e) {
                        console.error('Failed to parse grid data', e);
                    }
                }

                // If the grid list is empty in homeworkgridlist, check if there's a direct classwork list
                if (processedList.length === 0 && response.data?.classwork) {
                    processedList = response.data.classwork;
                }

                setClassWorkList(processedList);
            }
        } catch (error) {
            toast.error('Failed to load classwork records');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const processedGrid = useMemo(() => {
        return classWorkList.map((item: any) => ({
            ...item,
            // Ensure fields are available in camelCase if the grid uses PascalCase
            icW_Id: item.ICW_Id || item.icW_Id,
            icW_Topic: item.ICW_Topic || item.icW_Topic,
            icW_SubTopic: item.ICW_SubTopic || item.icW_SubTopic,
            icW_Content: item.ICW_Content || item.icW_Content,
            icW_FromDate: item.ICW_FromDate || item.icW_FromDate,
            icW_ToDate: item.ICW_ToDate || item.icW_ToDate,
            icW_ActiveFlag: item.ICW_ActiveFlag !== undefined ? item.ICW_ActiveFlag : item.icW_ActiveFlag,
            asmcL_ClassName: item.ASMCL_ClassName || item.asmcL_ClassName,
            asmC_SectionName: item.ASMC_SectionName || item.asmC_SectionName,
            isms_SubjectName: item.ISMS_SubjectName || item.isms_SubjectName,
            // ID mappings for form initialization
            asmaY_Id: item.ASMAY_Id || item.asmaY_Id,
            asmcL_Id: item.ASMCL_Id || item.asmcL_Id,
            asmS_Id: item.ASMS_Id || item.asmS_Id,
            ismS_Id: item.ISMS_Id || item.ismS_Id,
            filesCount: item.FilesCount || item.filesCount || 0
        }));
    }, [classWorkList]);

    const handleAction = async (action: string, row: IClassWorkDetails) => {
        setSelectedRow(row);
        if (action === 'edit') {
            setIsUpdateMode(true);
            setIsAddMode(false);
            setIsToggleMode(false);
        } else if (action === 'toggle') {
            setIsToggleMode(true);
            setIsUpdateMode(false);
            setIsAddMode(false);
        } else if (action === 'view') {
            setIsFetchingAttachments(true);
            try {
                const response: any = await viewClassWorkAttachments(row.icW_Id!);
                const list = response.data || response.attachementlist || (Array.isArray(response) ? response : []);

                if (list && list.length > 0) {
                    setAttachments(list);
                    setIsAttachmentOpen(true);
                } else {
                    toast.info('No attachments found for this record');
                }
            } catch {
                toast.error('Failed to fetch attachments');
            } finally {
                setIsFetchingAttachments(false);
            }
        }
    };

    const columns = classWorkColumns({
        onEdit: (row: IClassWorkDetails) => handleAction('edit', row),
        onToggle: (row: IClassWorkDetails) => handleAction('toggle', row),
        onView: (row: IClassWorkDetails) => handleAction('view', row)
    });

    return (
        <div className='flex min-h-screen flex-col gap-8 bg-slate-50 p-6'>
            <div className='mb-4 flex items-center justify-end'>
                <Button
                    onClick={() => {
                        setIsAddMode(!isAddMode);
                        setIsUpdateMode(false);
                        setIsToggleMode(false);
                        setSelectedRow(null);
                    }}
                    className={cn(
                        'flex h-11 items-center gap-2 rounded-xl px-6 font-bold shadow-lg transition-all duration-300 hover:shadow-blue-200',
                        isAddMode
                            ? 'bg-slate-800 text-white hover:bg-slate-900'
                            : 'bg-blue-600 font-black text-white uppercase tracking-wide hover:bg-blue-700'
                    )}>
                    {isAddMode ? (
                        <>
                            <X className='h-5 w-5' /> Close Form
                        </>
                    ) : (
                        <>
                            <Plus className='h-5 w-5' /> Add ClassWork
                        </>
                    )}
                </Button>
            </div>

            {isAddMode && (
                <div className='fade-in slide-in-from-top-4 animate-in duration-500'>
                    <AddClassWorkForm
                        initialData={initialData}
                        onSuccess={() => {
                            setIsAddMode(false);
                            loadData();
                        }}
                    />
                </div>
            )}

            {isUpdateMode && selectedRow && (
                <div className='fade-in slide-in-from-top-4 animate-in duration-500'>
                    <UpdateClassWorkForm
                        selectedRow={selectedRow}
                        onCancel={() => {
                            setIsUpdateMode(false);
                            setSelectedRow(null);
                        }}
                        onSuccess={() => {
                            setIsUpdateMode(false);
                            loadData();
                        }}
                    />
                </div>
            )}

            {isToggleMode && selectedRow && (
                <ToggleClassWorkForm
                    rowData={selectedRow}
                    onClose={() => {
                        setIsToggleMode(false);
                        setSelectedRow(null);
                        loadData();
                    }}
                />
            )}

            <AttachmentViewModal isOpen={isAttachmentOpen} onClose={() => setIsAttachmentOpen(false)} attachments={attachments} />

            <div className='overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl'>
                {/* Legacy-style Header Bar */}
                <div className='flex items-center justify-between bg-[#3b82f6] px-8 py-5'>
                    <div className='flex items-center gap-6'>
                        <h2 className='font-black text-lg text-white uppercase tracking-wider'>Classwork Details</h2>
                        <div className='flex items-center rounded-full border border-white/30 bg-white/20 px-4 py-1.5 shadow-inner backdrop-blur-md'>
                            <span className='mr-2 font-bold text-[10px] text-white/80 uppercase tracking-widest'>Total Records</span>
                            <span className='font-black text-sm text-white'>{processedGrid.length}</span>
                        </div>
                    </div>
                    <div className='flex items-center gap-3'>
                        {/* Optional Search or Actions here */}
                        <div className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20'>
                            <List className='h-4 w-4 text-white' />
                        </div>
                    </div>
                </div>

                <div className='p-1'>
                    <DataTable<IClassWorkDetails, any>
                        columns={columns}
                        data={processedGrid}
                        totalItems={processedGrid.length}
                        isLoading={isLoading}
                    />
                </div>
            </div>

            {isFetchingAttachments && (
                <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm'>
                    <div className='flex items-center gap-4 rounded-2xl border border-blue-100 bg-white p-6 shadow-2xl'>
                        <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
                        <span className='font-bold text-lg text-slate-700 uppercase tracking-tight'>Fetching attachments...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
