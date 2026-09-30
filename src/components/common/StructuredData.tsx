import {headers} from 'next/headers'
import {safeJSON,serverURL} from '@/lib/metadata'
export async function StructuredData({title,path,type,date,author}:{title:string;path:string;type:'article'|'project';date?:string;author?:string}){
 const h=await headers(),parent=path.split('/').slice(0,-1).join('/')
 const data={'@context':'https://schema.org','@graph':[{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'CodeMaster',item:serverURL},{'@type':'ListItem',position:2,name:type==='article'?'Blog':'Portfolio',item:new URL(parent,serverURL).toString()},{'@type':'ListItem',position:3,name:title,item:new URL(path,serverURL).toString()}]},...(type==='article'?[{'@type':'Article',headline:title,datePublished:date,author:{'@type':'Organization',name:author||'CodeMaster'},mainEntityOfPage:new URL(path,serverURL).toString()}]:[])]}
 return <script nonce={h.get('x-nonce')||undefined} type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJSON(data)}}/>
}
