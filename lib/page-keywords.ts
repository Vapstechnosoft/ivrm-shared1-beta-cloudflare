/**
 * Mapping of page titles or URLs to related keywords for enhanced search.
 * Add keywords here to make pages discoverable by terms not in their title.
 */
export const PAGE_KEYWORDS: Record<string, string[]> = {
    'Attendance Entry': ['present', 'absent', 'roll call', 'mark attendance'],
    'Marks Entry': ['results', 'grading', 'scores', 'exam marks'],
    'Fee Online Payment': ['pay', 'bill', 'invoice', 'transaction', 'fees'],
    'Student Dashboard': ['profile', 'home', 'overview', 'summary'],
    'AI Question Paper Generator': ['exam', 'test', 'quiz', 'creator', 'automation'],

    // Admission Module - Section Allotment
    'Delete Student Section': ['remove section', 'unassign section', 'delete section allotment'],
    'Promotion Section': ['promote students', 'next class section', 'year promotion', 'bulk promote'],
    'Year Loss Section': ['detained students', 'year back', 'failed students', 'hold back', 'year loss'],
    'Update Roll Number': ['roll no update', 'change roll number', 'edit roll number', 'assign roll'],
    'Change Class': ['move class', 'transfer class', 'change grade', 'shift class'],

    // Admission Module - Reports
    'student Count Report': ['student strength', 'how many students', 'total students', 'count report', 'enrollment count'],
    'Registration Report': ['application report', 'preadmission report', 'enquiry report', 'registration list'],
    'EMAIL SMS Report': ['email report', 'sms sent report', 'communication log', 'message report'],
    'PreAdmission Month End Report': ['monthly admission report', 'month end summary', 'preadmission summary'],
    'Class Teacher Report': ['teacher report', 'class incharge report', 'homeroom report'],
    'Student Yearly Attendance Report': ['yearly attendance', 'annual attendance', 'full year attendance', 'attendance summary year'],
    'Student TC Report': ['TC list', 'transfer certificate report', 'left students report', 'TC issued'],
    'class-wise student details': ['classwise students', 'students by class', 'section wise students', 'class list report'],
    'Total Strength Report': ['total students report', 'strength report', 'student count class wise', 'enrollment report'],
    'Admission Register Report': ['admission register', 'student register', 'enrolled students list', 'admission book'],
    'Attendance Absentees Report': ['absent students', 'absentee list', 'who was absent', 'absent report'],

    // Admission Module - Attendance Entry
    'Entry Type': ['attendance type', 'attendance method', 'entry mode', 'biometric entry'],
    'Login Privileges': ['attendance login access', 'user privilege', 'access control', 'login rights'],
    'Student Attendance': ['mark attendance', 'daily attendance', 'take attendance', 'present absent', 'attendance entry'],

    // Admission Module - Student TC
    'Apply TC': ['transfer certificate', 'leaving certificate', 'TC application', 'student leaving', 'apply TC'],
    'Cancel TC': ['cancel transfer certificate', 'revoke TC', 'withdraw TC'],

    // Admission Module - Form
    'Admission Form': ['new admission', 'enroll student', 'student registration', 'add student', 'student form']
};

export function getKeywordsForPage(pageName: string): string {
    const keywords = PAGE_KEYWORDS[pageName] || [];
    return keywords.join(' ');
}
