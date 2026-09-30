import {DemoWorkbench} from '@/components/DemoWorkbench'
import {pageMetadata} from '@/lib/metadata'
export const metadata={...pageMetadata('Commerce Operations | CodeMaster','Interaktywny prototyp produktu na danych demonstracyjnych.','/demos/commerce'),robots:{index:false,follow:true}}
export default function Page(){return <DemoWorkbench key="commerce" kind="commerce"/>}
