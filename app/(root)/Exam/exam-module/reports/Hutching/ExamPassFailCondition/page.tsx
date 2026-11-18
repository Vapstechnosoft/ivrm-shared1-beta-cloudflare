'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AddForm } from './_components/add-form';
import { GridList } from './_components/grid-list';
import {
    getPassFailConditionDetails,
    editPassFailConditionDetails
} from '@/server/exam/exam-module/reports/Hutching/exam-pass-fail-condition';
import { Loader2 } from 'lucide-react';

function parseArray<T = any>(val: any): T[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (Array.isArray(val.$values)) return val.$values;
    if (Array.isArray(val.data)) return val.data;
    if (Array.isArray(val.data?.$values)) return val.data.$values;
    return [];
}

export default function ExamPassFailConditionPage() {
    const [loadingDetails, setLoadingDetails] = useState(true);
    const [yearList, setYearList] = useState<any[]>([]);
    const [gridData, setGridData] = useState<any[]>([]);
    const [examConditionList, setExamConditionList] = useState<any[]>([]);
    const [editingRecord, setEditingRecord] = useState<any | null>(null);

    const loadInitialData = async () => {
        try {
            setLoadingDetails(true);
            const res = await getPassFailConditionDetails();
            console.log('[ExamPassFailConditionPage] Raw API response:', res);
            const raw = res?.data ?? res;
            
            if (raw) {
                const years = parseArray(
                    raw.year_list ||
                    raw.yearlist ||
                    raw.yearList ||
                    raw.year_List ||
                    raw.academicList ||
                    raw.academicYearList ||
                    raw.academic_year_list ||
                    raw.academicyearlist ||
                    raw.acdlist ||
                    raw.allAcademicYear ||
                    raw.getyear ||
                    raw.getyears ||
                    raw.years ||
                    raw.data?.year_list ||
                    raw.data?.yearlist ||
                    raw.data?.academicList ||
                    raw.data?.acdlist
                );
                console.log('[ExamPassFailConditionPage] Extracted years:', years);
                setYearList(years);

                const grid = parseArray(
                    raw.passfailrank_list ||
                    raw.passfailranklist ||
                    raw.passfailrankList ||
                    raw.passfail_list ||
                    raw.griddata ||
                    raw.gridData ||
                    raw.data?.passfailrank_list ||
                    raw.data?.griddata ||
                    (Array.isArray(raw) ? raw : [])
                );
                setGridData(grid);

                const conditions = parseArray(
                    raw.examconditionlist ||
                    raw.examcondition_list ||
                    raw.examconditionList ||
                    raw.conditionlist ||
                    raw.condition_list ||
                    raw.data?.examconditionlist
                );
                setExamConditionList(conditions);
            }
        } catch (error: any) {
            console.error('Error loading initial details:', error);
            toast.error(error?.message || 'Failed to load initial data');
        } finally {
            setLoadingDetails(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    const handleEditRecord = async (record: any) => {
        try {
            const recordId = record.epfrC_Id || record.EPFRC_Id;
            if (!recordId) return;

            const res = await editPassFailConditionDetails(Number(recordId));
            const raw = res?.data ?? res;
            const editlist = raw?.editlist || raw?.editList || (Array.isArray(raw) ? raw : [raw]);

            if (Array.isArray(editlist) && editlist.length > 0) {
                setEditingRecord(editlist);
            } else {
                setEditingRecord(record);
            }
        } catch (err) {
            console.error('Error in handleEditRecord:', err);
            setEditingRecord(record);
        }
    };

    const handleCancelEdit = () => {
        setEditingRecord(null);
    };

    const handleFormSubmitted = (savedData?: any, optimisticRecord?: any) => {
        setEditingRecord(null);

        if (savedData) {
            const raw = savedData?.data ?? savedData;
            const updatedGrid = parseArray(
                raw.passfailrank_list ||
                raw.passfailranklist ||
                raw.passfailrankList ||
                raw.passfail_list ||
                raw.griddata ||
                raw.gridData ||
                raw.data?.passfailrank_list ||
                raw.data?.griddata ||
                (Array.isArray(raw) ? raw : [])
            );

            if (updatedGrid.length > 0) {
                setGridData(updatedGrid);
                return;
            }
        }

        if (optimisticRecord) {
            setGridData((prev) => {
                const existingIndex = prev.findIndex(
                    (item) =>
                        (item.epfrC_Id && item.epfrC_Id === optimisticRecord.epfrC_Id) ||
                        (item.EPFRC_Id && item.EPFRC_Id === optimisticRecord.epfrC_Id)
                );
                if (existingIndex >= 0) {
                    const next = [...prev];
                    next[existingIndex] = { ...next[existingIndex], ...optimisticRecord };
                    return next;
                }
                return [optimisticRecord, ...prev];
            });
        }

        loadInitialData();
    };

    if (loadingDetails) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium">Loading Exam Pass/Fail Condition details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto space-y-6 py-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Exam Pass Fail Condition</h1>
                <p className="text-sm text-muted-foreground">
                    Manage and configure pass/fail criteria and rank applicability for individual and promotional exams.
                </p>
            </div>

            {/* Form Section */}
            <AddForm
                yearList={yearList}
                examConditionList={examConditionList}
                editingRecord={editingRecord}
                onFormSubmitted={handleFormSubmitted}
                onCancelEdit={handleCancelEdit}
            />

            {/* Grid List Section */}
            <GridList
                data={gridData}
                onEdit={handleEditRecord}
                onRefresh={loadInitialData}
            />
        </div>
    );
}
