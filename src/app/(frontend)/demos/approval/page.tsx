import {DemoWorkbench} from '@/components/DemoWorkbench'
import {pageMetadata} from '@/lib/metadata'
export const metadata={...pageMetadata('Approval Console | CodeMaster','Interaktywny prototyp produktu na danych demonstracyjnych.','/demos/approval'),robots:{index:false,follow:true}}
export default function Page(){return <DemoWorkbench key="approval" kind="approval"/>}
