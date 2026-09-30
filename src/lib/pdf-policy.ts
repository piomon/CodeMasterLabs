/** Conservative static-brief policy applied to canonical decoded qpdf objects.
 * This is not a PDF sanitizer or a replacement for malware scanning. */
const forbidden=new Set(['/JS','/JavaScript','/AA','/OpenAction','/Launch','/EmbeddedFiles','/EmbeddedFile','/Filespec','/RichMedia','/XFA','/AcroForm','/SubmitForm','/ImportData','/GoToR','/GoToE','/Rendition','/Sound','/Movie','/3D','/Encrypt'])
export function assertPassivePDF(value:unknown):void {
 if(!value||typeof value!=='object'||!Array.isArray((value as {qpdf?:unknown}).qpdf))throw new Error('ATTACHMENT_INVALID')
 const queue:unknown[]=[value];let visited=0
 while(queue.length){
  if(++visited>200000)throw new Error('ATTACHMENT_COMPLEX_PDF')
  const item=queue.pop()
  if(typeof item==='string'&&forbidden.has(item))throw new Error('ATTACHMENT_ACTIVE_PDF')
  if(item&&typeof item==='object')for(const [key,child] of Object.entries(item)){
   if(forbidden.has(key))throw new Error('ATTACHMENT_ACTIVE_PDF')
   queue.push(child)
  }
 }
}
