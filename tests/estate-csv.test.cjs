const test=require('node:test'),assert=require('node:assert/strict')
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module')
const ts=require(process.env.TYPESCRIPT_PATH||'typescript')
const file=path.resolve(__dirname,'../src/components/estate/estate-csv.ts')
const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
const compiled=new Module(file,module)
compiled.filename=file
compiled._compile(js,file)
const {csvCell,estateCsv}=compiled.exports

test('CSV escapes quotes/newlines while making formula-leading notes inert',()=>{
 assert.equal(csvCell('Plain, "quoted"\nline'),'"Plain, ""quoted""\nline"')
 for(const note of ['=SUM(A1:A2)','+cmd','-1+2','@HYPERLINK("x")','\t=1+1','\r\n=1+1','  =1+1','\u200B=1+1']){
  assert.equal(csvCell(note),`"'${note.replaceAll('"','""')}"`)
 }
 assert.equal(estateCsv([['ID','Note'],['A-03','=SUM(1,2)']]),'"ID","Note"\r\n"A-03","\'=SUM(1,2)"')
})