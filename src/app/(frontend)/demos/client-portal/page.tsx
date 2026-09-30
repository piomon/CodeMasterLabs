import {DemoWorkbench} from '@/components/DemoWorkbench'
import {pageMetadata} from '@/lib/metadata'
export const metadata={...pageMetadata('Client Portal | CodeMaster','Interaktywny prototyp produktu na danych demonstracyjnych.','/demos/client-portal'),robots:{index:false,follow:true}}
export default function Page(){return <DemoWorkbench key="client-portal" kind="client-portal"/>}
