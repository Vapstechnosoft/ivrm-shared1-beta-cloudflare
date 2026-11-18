export const dummyScholasticData = [
    {
        id: 1,
        groupName: 'English',
        subjects: [
            {
                name: 'English Literature',
                max: 100,
                min: 33,
                obtained: 66,
                highStd: 92,
                highDiv: 92,
                avgStd: 68,
                avgDiv: 71,
                posStd: 25,
                posDiv: 19,
                remarks: '38'
            },
            {
                name: 'English Language',
                max: 100,
                min: 33,
                obtained: 73,
                highStd: 94,
                highDiv: 87,
                avgStd: 77,
                avgDiv: 74,
                posStd: 22,
                posDiv: 14,
                remarks: '29'
            }
        ],
        average: { max: 100, min: 33, obtained: 70 }
    },
    {
        id: 2,
        groupName: 'Science',
        subjects: [
            {
                name: 'Physics',
                max: 100,
                min: 33,
                obtained: 40,
                highStd: 96,
                highDiv: 94,
                avgStd: 58,
                avgDiv: 61,
                posStd: 50,
                posDiv: 31,
                remarks: '14'
            },
            {
                name: 'Biology',
                max: 100,
                min: 33,
                obtained: 58,
                highStd: 100,
                highDiv: 99,
                avgStd: 74,
                avgDiv: 76,
                posStd: 40,
                posDiv: 27,
                remarks: '22'
            },
            {
                name: 'Chemistry',
                max: 100,
                min: 33,
                obtained: 46,
                highStd: 100,
                highDiv: 97,
                avgStd: 62,
                avgDiv: 67,
                posStd: 50,
                posDiv: 31,
                remarks: '19'
            }
        ],
        average: { max: 100, min: 33, obtained: 48 }
    },
    {
        id: 3,
        groupName: 'Social Science',
        subjects: [
            {
                name: 'History & Civics',
                max: 100,
                min: 33,
                obtained: 70,
                highStd: 100,
                highDiv: 99,
                avgStd: 69,
                avgDiv: 71,
                posStd: 30,
                posDiv: 19,
                remarks: '46'
            },
            {
                name: 'Geography',
                max: 100,
                min: 33,
                obtained: 72,
                highStd: 95,
                highDiv: 95,
                avgStd: 74,
                avgDiv: 76,
                posStd: 24,
                posDiv: 19,
                remarks: '34'
            }
        ],
        average: { max: 100, min: 33, obtained: 71 }
    },
    {
        id: 4,
        groupName: 'Kannada',
        subjects: [
            {
                name: 'Kannada',
                max: 100,
                min: 33,
                obtained: 40,
                highStd: 99,
                highDiv: 97,
                avgStd: 72,
                avgDiv: 74,
                posStd: 39,
                posDiv: 16,
                remarks: '5'
            }
        ]
    },
    {
        id: 5,
        groupName: 'Mathematics',
        subjects: [
            {
                name: 'Mathematics',
                max: 100,
                min: 33,
                obtained: 60,
                highStd: 98,
                highDiv: 98,
                avgStd: 62,
                avgDiv: 66,
                posStd: 37,
                posDiv: 24,
                remarks: '43'
            }
        ]
    },
    {
        id: null,
        groupName: 'Doctrine',
        subjects: [
            {
                name: 'Doctrine',
                max: 6,
                min: 0,
                obtained: null,
                highStd: 6,
                highDiv: 6,
                avgStd: 5,
                avgDiv: 5,
                posStd: 2,
                posDiv: 2,
                remarks: '32'
            }
        ]
    },
    {
        id: null,
        groupName: 'Games',
        subjects: [
            {
                name: 'Games',
                max: 6,
                min: 0,
                obtained: null,
                highStd: 6,
                highDiv: 6,
                avgStd: 5,
                avgDiv: 5,
                posStd: 2,
                posDiv: 2,
                remarks: '42'
            }
        ]
    },
    {
        id: 6,
        groupName: 'Commercial Applications',
        subjects: [
            {
                name: 'Commercial Applications',
                max: 100,
                min: 33,
                obtained: 55,
                highStd: 78,
                highDiv: 75,
                avgStd: 65,
                avgDiv: 65,
                posStd: 5,
                posDiv: 3,
                remarks: '25'
            }
        ]
    }
];

export const dummyPerformanceData = [
    {
        id: 1,
        exam: 'First Unit Test',
        scores: {
            ENGL: '17/25',
            ELIT: '15/25',
            PHY: '8/25 (F)',
            CHEM: '11/25',
            BIO: '14/25',
            'H & C': '16/25',
            GEO: '15/25',
            KAN: '12/25',
            MAT: '10/25',
            'Com Appl': '13/25'
        },
        isLast: false
    },
    {
        id: 2,
        exam: 'First Term Examination',
        scores: {
            ENGL: '73/100',
            ELIT: '66/100',
            PHY: '40/100',
            CHEM: '46/100',
            BIO: '58/100',
            'H & C': '70/100',
            GEO: '72/100',
            KAN: '40/100',
            MAT: '60/100',
            'Com Appl': '55/100'
        },
        isLast: false
    },
    {
        id: 3,
        exam: 'Second Unit Test',
        scores: {
            ENGL: '15/25',
            ELIT: '21/25',
            PHY: '15/25',
            CHEM: '9/25',
            BIO: '18/25',
            'H & C': '17/25',
            GEO: '14/25',
            KAN: '7/25 (F)',
            MAT: '6/25 (F)',
            'Com Appl': '18/25'
        },
        isLast: true
    }
];
