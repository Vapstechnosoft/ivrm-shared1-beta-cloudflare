'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { ApiSearchparams } from '@/types';
import type { IMasterSubjectList, IParentSubjectDropdownList } from '@/types/library/masters/masters';

export async function getMasterSubjectList(searchParams?: ApiSearchparams) {
    try {
        const session = await auth();
        const urlParams = getSearchParamsUrl({ ...searchParams, mI_Id: session?.mi_id }, 'lmS_SubjectName');
        const url = `/MasterSubject/master-subject-list?${urlParams}`;
        return await api.get<IMasterSubjectList[]>('library', url);
    } catch (error) {
        console.error('getMasterSubjectList error:', error);
        return [] as IMasterSubjectList[];
    }
}

export async function addOrUpdateMasterSubject(data: any) {
    try {
        const session = await auth();

        const subjectId = Number(data.lmS_Id ?? data.LMS_Id ?? 0) || 0;
        const parentId = Number(data.lmS_ParentId ?? data.LMS_ParentId ?? 0) || 0;
        const subjectName = String(data.lmS_SubjectName ?? data.LMS_SubjectName ?? data.ismS_SubjectName ?? '').trim();
        const subjectNo = String(data.lmS_SubjectNo ?? data.LMS_SubjectNo ?? '').trim();
        const level =
            data.lmS_Level !== undefined && data.lmS_Level !== null && data.lmS_Level !== ''
                ? Number(data.lmS_Level)
                : data.LMS_Level !== undefined && data.LMS_Level !== null && data.LMS_Level !== ''
                  ? Number(data.LMS_Level)
                  : 0;
        const classNo = String(data.lmS_ClassNo ?? data.LMS_ClassNo ?? '').trim();
        const miId = session?.mi_id ? Number(session.mi_id) : Number(data.mI_Id ?? data.MI_Id ?? 0);

        const payload = {
            lmS_Id: subjectId,
            lmS_SubjectNo: subjectNo,
            lmS_SubjectName: subjectName,
            lmS_ParentId: parentId,
            lmS_Level: isNaN(level) ? 0 : level,
            lmS_ClassNo: classNo,
            mI_Id: miId,
            MI_Id: miId,
            // Fallbacks for PascalCase binding
            LMS_Id: subjectId,
            LMS_SubjectNo: subjectNo,
            LMS_SubjectName: subjectName,
            LMS_ParentId: parentId,
            LMS_Level: isNaN(level) ? 0 : level,
            LMS_ClassNo: classNo
        };

        const url = '/MasterSubject/add-or-update';
        const res = await api.post<any>('library', url, payload);

        const isDuplicate =
            res &&
            (res.returnval === 'duplicate' ||
                res.returnval === 'Duplicate' ||
                res.returnduplicatestatus === 'Duplicate' ||
                res.returnduplicatestatus === true ||
                res.duplicate === true ||
                (typeof res.message === 'string' && res.message.toLowerCase().includes('duplicate')) ||
                (typeof res.msg === 'string' && res.msg.toLowerCase().includes('duplicate')));

        const isFailure =
            !res ||
            res.success === false ||
            res.returnval === false ||
            res.returnval === 'Failed' ||
            res.returnval === 'fail' ||
            res.returnval === 'false' ||
            (typeof res.message === 'string' && (res.message.toLowerCase().includes('fail') || res.message.toLowerCase().includes('error'))) ||
            (typeof res.msg === 'string' && (res.msg.toLowerCase().includes('fail') || res.msg.toLowerCase().includes('error')));

        if (isDuplicate) {
            return {
                success: false,
                message: res?.message || res?.msg || 'Record already exists / Duplicate Subject',
                data: res
            };
        }

        if (isFailure) {
            return {
                success: false,
                message: res?.message || res?.msg || (subjectId > 0 ? 'Failed to update Master Subject' : 'Failed to save Master Subject'),
                data: res
            };
        }

        const defaultSuccessMessage = subjectId > 0 ? 'Master Subject updated successfully' : 'Master Subject saved successfully';
        return {
            success: true,
            message: res?.message || res?.msg || defaultSuccessMessage,
            data: res
        };
    } catch (error: any) {
        console.error('addOrUpdateMasterSubject error:', error);
        return { success: false, message: error?.message || 'Failed to save record' };
    }
}

export async function toggleMasterSubject(id: number) {
    try {
        const url = `/MasterSubject/toggle/${id}`;
        const res = await api.put<any>('library', url, {});
        return {
            success: true,
            message: res?.message || 'Status updated successfully',
            data: res
        };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to toggle record' };
    }
}

export async function deleteMasterSubject(id: number) {
    try {
        const url = `/MasterSubject/Delete?id=${id}`;
        const res = await api.delete<any>('library', url);
        return {
            success: true,
            message: res?.message || 'Record deleted successfully',
            data: res
        };
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to delete record' };
    }
}

export async function getparentsubjectdropdown() {
    try {
        const url = '/MasterSubject/parent-subject-dropdown';
        return await api.get<IParentSubjectDropdownList[]>('library', url);
    } catch (error) {
        console.error('getparentsubjectdropdown error:', error);
        return { data: [] } as any;
    }
}
