export interface MasterLocationData {
    vmmL_Id: number;
    vmmL_Location: string;
    vmmL_LocationDescription: string;
    vmmL_LocationFacilities: string;
    vmmL_ActiveFlg: boolean;
}

export interface MasterLocationInitialData {
    getdata: MasterLocationData[];
}
