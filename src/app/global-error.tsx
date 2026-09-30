'use client'
export default function GlobalError({reset}:{error:Error&{digest?:string};reset:()=>void}){return <html lang="pl"><body style={{margin:0,padding:'15vh 8vw',background:'#070a09',color:'#edf2e9',fontFamily:'Arial,sans-serif'}}><h1>CodeMaster</h1><p>Witryna jest chwilowo niedostepna. Sprobuj ponownie.</p><button onClick={reset}>Sprobuj ponownie</button></body></html>}
