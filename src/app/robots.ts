import type {MetadataRoute} from 'next'
import {serverURL} from '@/lib/metadata'
export default function robots():MetadataRoute.Robots{return{rules:{userAgent:'*',allow:'/',disallow:['/admin','/api/','/preview']},sitemap:`${serverURL}/sitemap.xml`}}
