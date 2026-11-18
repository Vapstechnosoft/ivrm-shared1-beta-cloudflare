'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { institutionSubscriptionSchema } from '@/schemas/super-admin/super-admin-module/institution/institution-subscription';
import type { ApiSearchparams } from '@/types';
import type { IInstitutionSubscription } from '@/types/super-admin/super-admin-module/institution/institution-subscription';
import type { z } from 'zod';

export async function addOrUpdateInstitutionSubscription(data: z.infer<typeof institutionSubscriptionSchema.addOrUpdate>) {
    const url = 'InstitutionFacade';

    // Map existing types to match API payload if necessary, or ensure schema matches.
    // Based on request, payload matches schema mostly.

    const payload = {
        ...data,
        misV_Id: data.misV_Id || 0,
        misV_SubscriptionNo: data.misV_SubscriptionNo || 'string', // Default as per request example
        returnval: 'string', // Default as per request example
        mI_Name: 'string', // Default as per request example
        misV_RenewedFlg: false, // Default
        misV_ApprovalFlag: 'string', // Default
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString()
    };

    return await api.post<IInstitutionSubscription>('sadmin', url, payload);
}

export async function getInstitutionSubscriptionData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/Institution/get_onload_grid_master_subscription?${urlParams}`;
    try {
        const response = await api.get<any>('sadmin', url);
        return response;
    } catch (error: any) {
        return {
            success: false,
            data: [],
            message: error?.message || 'Failed to fetch subscription data'
        };
    }
}

export async function activateDeactivateInstitutionSubscription(id: number) {
    const url = `/Institution/deletedetails_subscription/${id}`;
    try {
        const response = await api.delete<any>('sadmin', url);
        return response;
    } catch (error: any) {
        try {
            const fallbackResponse = await api.post<any>('sadmin', `/Institution/deletedetails/${id}`, { misV_Id: id });
            return fallbackResponse;
        } catch {
            return {
                success: false,
                message: error?.message || (typeof error === 'string' ? error : 'Failed to update subscription status')
            };
        }
    }
}

