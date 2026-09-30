import {DemoWorkbench} from '@/components/DemoWorkbench'
import {pageMetadata} from '@/lib/metadata'
export const metadata={...pageMetadata('Operations OS | CodeMaster','Interaktywny prototyp produktu na danych demonstracyjnych.','/demos/operations'),robots:{index:false,follow:true}}
export default function Page(){return <DemoWorkbench key="operations" kind="operations"/>}
