'use server';

import { api } from '@/lib/apiService';
import type { MasterSmsEmailParameter } from '@/types/sms-email-configuration/master-sms-email-parameter';

export async function getMasterSmsEmailParameters() {
    try {
        const response = await api.get<any>('preadmission', '/MasterSmsEmailParameter/Get_details');
        return response;
    } catch (error) {
        console.error('Error fetching master SMS/Email parameters:', error);
        throw new Error('Failed to fetch master SMS/Email parameters');
    }
}

export async function saveMasterSmsEmailParameter(data: Partial<MasterSmsEmailParameter>) {
    try {
        const response = await api.post<any>('preadmission', '/MasterSmsEmailParameter/Savedata', data);
        return response;
    } catch (error) {
        console.error('Error saving master SMS/Email parameter:', error);
        throw new Error('Failed to save master SMS/Email parameter');
    }
}

export async function editMasterSmsEmailParameter(data: MasterSmsEmailParameter) {
    try {
        const response = await api.post<any>('preadmission', `/MasterSmsEmailParameter/edit?ISMP_ID=${data.ismP_ID}`, data);
        return response;
    } catch (error) {
        console.error('Error fetching edit details:', error);
        throw new Error('Failed to fetch edit details');
    }
}

export async function deleteMasterSmsEmailParameter(id: number) {
    try {
        const response = await api.delete<any>('preadmission', `/MasterSmsEmailParameter/deletedata?ISMP_ID=${id}`);
        return response;
    } catch (error) {
        console.error('Error deleting master SMS/Email parameter:', error);
        throw new Error('Failed to delete master SMS/Email parameter');
    }
}
