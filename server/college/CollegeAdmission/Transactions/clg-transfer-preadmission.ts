'use server';

import { api } from '@/lib/apiService';

const CTRL = 'TransfrPreToAdmClg';

export async function getTransferLoadData() {
    try {
        return await api.get<any>('college', `/${CTRL}/getloaddata`);
    } catch (error) {
        return { success: false, message: 'Failed to load data' } as any;
    }
}

export async function getTransferBranches(data: { courselistarray: { AMCO_Id: number }[] }) {
    try {
        return await api.post<any>('college', `/${CTRL}/get_branchs`, data);
    } catch (error) {
        return { success: false, message: 'Failed to fetch branches' } as any;
    }
}

export async function getTransferSemesters(data: {
    courselistarray: { AMCO_Id: number }[];
    branchlistarray: { AMB_Id: number }[];
}) {
    try {
        return await api.post<any>('college', `/${CTRL}/get_semester`, data);
    } catch (error) {
        return { success: false, message: 'Failed to fetch semesters' } as any;
    }
}

export async function searchTransferStudents(data: {
    ASMAY_Id: number;
    courselistarray: { AMCO_Id: number }[];
    branchlistarray: { AMB_Id: number }[];
    semesterlistarray: { AMSE_Id: number }[];
}) {
    try {
        return await api.post<any>('college', `/${CTRL}/searchdata`, data);
    } catch (error) {
        return { success: false, message: 'Failed to search students' } as any;
    }
}

export async function exportToAdmission(data: {
    ASMAY_Id: number;
    courselistarray: { AMCO_Id: number }[];
    branchlistarray: { AMB_Id: number }[];
    semesterlistarray: { AMSE_Id: number }[];
    studentdetails: any[];
    configurationsettings: any;
}) {
    try {
        return await api.post<any>('college', `/${CTRL}/exporttoadmission`, data);
    } catch (error) {
        return { success: false, message: 'Failed to export to admission' } as any;
    }
}
