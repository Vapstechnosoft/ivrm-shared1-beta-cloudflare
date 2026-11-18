'use server';
import { api } from '@/lib/apiService';

export interface ListData {
    columnID: string;
    columnName: string;
    fmG_Id: number;
}

export interface UserWiseDailyCollectionReport {
    regornamedetails: string;
    amaY_Id: number;
    fromdate: string;
    todate: string;
    all_ListData: ListData[];
}

export async function getUserWiseDailyCollectionReport(data: UserWiseDailyCollectionReport) {
    const url = '/FeeDailycollection/UserWisereportdetails';
    return await api.post<UserWiseDailyCollectionReport[]>('fees', url, data);
}
