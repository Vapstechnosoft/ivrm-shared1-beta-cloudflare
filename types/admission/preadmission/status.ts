export interface IStatusInitialData {
    academicList: { asmaY_Id: number; asmaY_Year: string }[];
    classlist: { asmcL_Id: number; asmcL_ClassName: string }[];
    statuslist: { pamsT_Id: number; pamsT_Status: string }[];
}

export interface IStatusStudent {
    pasR_Id: number;
    name: string;
    pasR_RegistrationNo: string;
    statusName: string;
    pamsT_Id: number;
    remarks: string;
    remark: string;
    className: string;
    repeat_Class_Id: number;
    pasR_Sex: string;
    pasR_MobileNo: string;
    pasR_emailId: string;
    pasR_FatherName: string;
    pasR_FirstName: string;
    pasR_MiddleName: string;
    pasR_LastName: string;
    pasR_ConStreet: string;
    pasR_ConArea: string;
    pasR_ConCity: string;
    pasR_ConPincode: string;
    selected?: boolean;
}

// IStatusSearchResponse is no longer needed as the API returns IStatusStudent[] directly in the data field.
