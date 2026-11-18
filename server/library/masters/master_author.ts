'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { ApiSearchparams } from '@/types';
import type { IMasterAuthorList } from '@/types/library/masters/masters';

export async function getMasterAuthorList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'lmaU_AuthorFirstName');
    const url = `/MasterAuthor/master-author-list?${urlParams}`;
    return await api.get<IMasterAuthorList[]>('library', url);
}

export async function addOrUpdateMasterAuthor(data: any) {
    try {
        const session = await auth();
        const authorId =
            data.lmaU_Id !== undefined && data.lmaU_Id !== null
                ? Number(data.lmaU_Id)
                : data.LMAU_Id !== undefined && data.LMAU_Id !== null
                  ? Number(data.LMAU_Id)
                  : data.lmaU_ID !== undefined && data.lmaU_ID !== null
                    ? Number(data.lmaU_ID)
                    : 0;

        const payload = {
            LMAU_Id: isNaN(authorId) ? 0 : authorId,
            LMAU_AuthorFirstName: data.lmaU_AuthorFirstName ?? data.LMAU_AuthorFirstName ?? '',
            LMAU_AuthorMiddleName: data.lmaU_AuthorMiddleName ?? data.LMAU_AuthorMiddleName ?? '',
            LMAU_AuthorLastName: data.lmaU_AuthorLastName ?? data.LMAU_AuthorLastName ?? '',
            LMAU_MobileNo: data.lmaU_MobileNo ?? data.LMAU_MobileNo ?? '',
            LMAU_Address: data.lmaU_Address ?? data.LMAU_Address ?? '',
            LMAU_EmailId: data.lmaU_EmailId ?? data.LMAU_EmailId ?? data.lmaU_EmailID ?? data.LMAU_EmailID ?? '',
            LMAU_PhoneNo: data.lmaU_PhoneNo ?? data.LMAU_PhoneNo ?? '',
            MI_Id: session?.mi_id ? Number(session.mi_id) : data.mI_Id ? Number(data.mI_Id) : data.MI_Id ? Number(data.MI_Id) : 30
        };

        const url = '/MasterAuthor/add-or-update';
        const res = await api.post<any>('library', url, payload);

        const isSuccess =
            res &&
            (res === true ||
                res.success === true ||
                res.returnval === true ||
                res.returnval === 'save' ||
                res.returnval === 'update' ||
                res.returnval_add === true ||
                res.returnval_Update === true ||
                (typeof res.returnval === 'string' && res.returnval.toLowerCase().includes('save')) ||
                (typeof res.returnval === 'string' && res.returnval.toLowerCase().includes('update')) ||
                (typeof res.message === 'string' && res.message.toLowerCase().includes('save')) ||
                (typeof res.message === 'string' && res.message.toLowerCase().includes('update')) ||
                (typeof res.message === 'string' && res.message.toLowerCase().includes('success')) ||
                (res.returnval !== false &&
                    res.returnval !== 'duplicate' &&
                    res.returnval !== 'Failed' &&
                    !res.message?.toLowerCase().includes('duplicate') &&
                    !res.message?.toLowerCase().includes('fail')));

        return {
            success: !!isSuccess,
            message:
                res?.message ||
                (isSuccess
                    ? payload.LMAU_Id > 0
                        ? 'Master Author updated successfully'
                        : 'Master Author saved successfully'
                    : 'Failed to save Master Author'),
            data: res
        };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to save record' };
    }
}

export async function toggleMasterAuthor(id: number) {
    const url = `/MasterAuthor/toggle?LMAU_Id=${id}`;
    return await api.put('library', url);
}

export async function deleteMasterAuthor(id: number) {
    const url = `/MasterAuthor/delete/${id}`;
    return await api.delete('library', url);
}
