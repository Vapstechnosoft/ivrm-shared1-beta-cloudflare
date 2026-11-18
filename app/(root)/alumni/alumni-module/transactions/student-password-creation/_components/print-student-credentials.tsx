const esc = (v: unknown) =>
    String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

function buildHtml(students: any[]) {
    const rows = students
        .map(
            (s, i) => `<tr>
<td class="c">${i + 1}</td>
<td>${esc(s.studentname)}</td>
<td>${esc(s.amsT_AdmNo)}</td>
<td>${esc(s.username)}</td>
<td>${esc(s.password)}</td>
<td>${esc(s.asmcL_ClassName)}</td>
<td>${esc(s.asmC_SectionName)}</td>
<td>${esc(s.amsT_MobileNo)}</td>
</tr>`
        )
        .join('');

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Student Credentials Report</title>
<style>
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; margin: 0; color: #000; }
    h1 { text-align: center; font-size: 18px; text-transform: uppercase; margin: 0 0 4px; }
    .sub { text-align: center; font-size: 10px; color: #555; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { border: 1px solid #000; padding: 3px 4px; text-align: left; }
    th { background: #f3f4f6; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .c { text-align: center; }
    thead { display: table-header-group; }   /* repeat header on every page */
    tr { page-break-inside: avoid; break-inside: avoid; }
    .foot { display: flex; justify-content: space-between; font-size: 10px; margin-top: 16px; }
</style>
</head>
<body>
    <h1>Student Credentials Report</h1>
    <div class="sub">Generated on ${new Date().toLocaleDateString()}</div>
    <table>
        <thead>
            <tr>
                <th class="c" style="width:5%">Sl. No</th>
                <th style="width:20%">Student Name</th>
                <th style="width:12%">Adm No</th>
                <th style="width:12%">User Name</th>
                <th style="width:13%">Password</th>
                <th style="width:13%">Class</th>
                <th style="width:10%">Section</th>
                <th style="width:15%">Mobile</th>
            </tr>
        </thead>
        <tbody>${rows}</tbody>
    </table>
    <div class="foot"><span>Total Records: ${students.length}</span><span>Authorized Signature</span></div>
</body>
</html>`;
}

/** Prints the report from a hidden iframe, independent of the app's layout and CSS. */
export function printStudentCredentials(students: any[]) {
    if (typeof window === 'undefined' || students.length === 0) return;

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
    document.body.appendChild(iframe);

    const win = iframe.contentWindow;
    if (!win) {
        iframe.remove();
        return;
    }

    const doc = win.document;
    doc.open();
    doc.write(buildHtml(students));
    doc.close();

    const cleanup = () => setTimeout(() => iframe.remove(), 500);
    win.onafterprint = cleanup;

    // give the browser a moment to lay out a large table before opening the dialog
    setTimeout(() => {
        win.focus();
        win.print();
    }, 300);
}
