'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    ICollegeBranch,
    ICollegeCourse,
    ICollegeFeeGroup,
    ICollegeFeeHeadItem,
    ICollegeFeeWaivedOffAllDetailsResponse,
    ICollegeFeeWaivedOffEditDetails,
    ICollegeFeeWaivedOffSavePayload,
    ICollegeSemester,
    ICollegeStudent
} from '@/types/fees/college/transaction/clgfeewaivedoff';

export async function getCollegeFeeWaivedOffAllDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'amcsT_FirstName,fmH_FeeName,ftI_Name,fcswO_WaivedOffAmount,fcswO_Date');
    const url = `/CLGFeeWaivedOffFacade/getalldetails?${urlParams}`;
    return await api.get<ICollegeFeeWaivedOffAllDetailsResponse>('fees', url);
}

export async function getCollegeCourses(asmaY_Id: number) {
    const url = `/CommonCollegeFee/getcourses/${asmaY_Id}`;
    return await api.get<{ courselist?: ICollegeCourse[]; courses?: ICollegeCourse[] } | ICollegeCourse[]>('fees', url);
}

export async function getCollegeBranches(asmaY_Id: number, amcO_Id: number) {
    const url = '/CommonCollegeFee/getbranches';
    return await api.post<{ branchlist?: ICollegeBranch[] } | ICollegeBranch[]>('fees', url, {
        asmayId: asmaY_Id,
        amcoIds: [amcO_Id]
    });
}

export async function getCollegeSemesters(asmaY_Id: number, amcO_Id: number, amB_Id: number) {
    const url = '/CommonCollegeFee/getsemesters';
    return await api.post<{ semisterlist?: ICollegeSemester[] } | ICollegeSemester[]>('fees', url, {
        asmaY_Id: asmaY_Id,
        amcO_Ids: [amcO_Id],
        amB_Ids: [amB_Id]
    });
}

export async function getCollegeStudents(asmaY_Id: number, amcO_Id: number, amB_Id: number, amsE_Id: number) {
    const url = '/CollegemasterstudentconcessionFacade/get_student';
    return await api.post<{ studentlist?: ICollegeStudent[] } | ICollegeStudent[]>('fees', url, {
        asmaY_Id: asmaY_Id,
        amcO_Id: amcO_Id,
        amB_Id: amB_Id,
        amS_Id: [amsE_Id]
    });
}

export async function getCollegeGroups(payload: { asmaY_Id: number; amcsT_Id: number; filterrefund: string }) {
    const url = '/CLGFeeWaivedOffFacade/get_groups';
    return await api.post<{ grouplist?: ICollegeFeeGroup[] } | ICollegeFeeGroup[]>('fees', url, {
        asmaY_Id: payload.asmaY_Id,
        ASMAY_Id: payload.asmaY_Id,
        amcsT_Id: payload.amcsT_Id,
        AMCST_Id: payload.amcsT_Id,
        filterrefund: payload.filterrefund
    });
}

export async function getCollegeHeads(payload: {
    ASMAY_Id: number;
    AMCST_Id: number;
    filterrefund: string;
    multiplegroup: string;
}) {
    const url = '/CommonCollegeFee/getfeeheads';
    return await api.get<{ headlist?: ICollegeFeeHeadItem[] } | ICollegeFeeHeadItem[]>('fees', url, {
        params: {
            ASMAY_Id: payload.ASMAY_Id,
            asmaY_Id: payload.ASMAY_Id,
            AMCST_Id: payload.AMCST_Id,
            amcsT_Id: payload.AMCST_Id,
            filterrefund: payload.filterrefund,
            multiplegroup: payload.multiplegroup
        }
    });
}

export async function saveCollegeFeeWaivedOff(data: ICollegeFeeWaivedOffSavePayload) {
    const url = '/CLGFeeWaivedOffFacade/savedata';
    return await api.post<any>('fees', url, data);
}

export async function getCollegeFeeWaivedOffEditDetails(fcswO_Id: number) {
    const url = `/CLGFeeWaivedOffFacade/EditDetails/${fcswO_Id}`;
    return await api.get<ICollegeFeeWaivedOffEditDetails>('fees', url);
}

export async function deleteCollegeFeeWaivedOff(fcswO_Id: number) {
    const url = `/CLGFeeWaivedOffFacade/DeletRecord/${fcswO_Id}`;
    return await api.delete<any>('fees', url);
}
