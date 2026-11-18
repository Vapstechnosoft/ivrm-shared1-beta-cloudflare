'use server';

import { api } from '@/lib/apiService';

export const getStudentYearLossReportInitialDetails = async () => {
    return await api.get<any>('admission', '/StudentYearLossReport/getlist');
};

export const getStudentYearLossReportData = async (data: any) => {
    return await api.post<any>('admission', '/StudentYearLoss/Getreportdetails', data);
};
