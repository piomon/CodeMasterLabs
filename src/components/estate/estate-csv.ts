/** Spreadsheet programs may execute formulas even within quoted CSV fields. */
export function csvCell(value:string|number):string{
 const text=String(value)
 // Whitespace/control prefixes can hide a formula from a naive leading-character check.
 const safe=/^[\s\u0000-\u001f\u007f\uFEFF\u200B-\u200D\u2060]*[=+\-@]/u.test(text)?"'"+text:text
 return `"${safe.replaceAll('"','""')}"`
}

export function estateCsv(rows:(string|number)[][]):string{
 return rows.map(row=>row.map(csvCell).join(',')).join('\r\n')
}