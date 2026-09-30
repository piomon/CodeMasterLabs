import {previewURL} from './lib/preview-target'
import {sqliteAdapter} from '@payloadcms/db-sqlite'
import sharp from 'sharp'
import path from 'node:path'
import {buildConfig} from 'payload'
import {fileURLToPath} from 'node:url'
import {Users} from './collections/Users'
import {Media} from './collections/Media'
import {Services} from './collections/Services'
import {Projects} from './collections/Projects'
import {Testimonials} from './collections/Testimonials'
import {Leads} from './collections/Leads'
import {PrivateFiles} from './collections/PrivateFiles'
import {FormAttempts} from './collections/FormAttempts'
import {BlogPosts,FAQs,Technologies,Industries} from './collections/Content'
import {SiteSettings} from './globals/SiteSettings'
import {Homepage,Navigation,Footer,ContactSettings,SocialLinks,SEO,InstallationState} from './globals/ContentGlobals'
import {seedContent} from './lib/seed'
import {emailAdapter} from './lib/email-adapter'
const dirname=path.dirname(fileURLToPath(import.meta.url))
const production=process.env.NODE_ENV==='production'
const secret=process.env.PAYLOAD_SECRET
if(!secret||secret.length<32||secret.includes('replace-me'))throw new Error('Set a random PAYLOAD_SECRET of at least 32 characters. Run npm run setup locally.')
const serverURL=(process.env.SERVER_URL||process.env.NEXT_PUBLIC_SERVER_URL)||'http://localhost:3000'
if(production&&!/^https:\/\//.test(serverURL)&&process.env.ALLOW_HTTP_LOCAL!=='true')throw new Error('Production requires an HTTPS NEXT_PUBLIC_SERVER_URL.')
const database=process.env.DATABASE_URL||'file:./codemaster.db'
if(!database.startsWith('file:'))throw new Error('This release supports single-node SQLite only. PostgreSQL requires a separate reviewed migration/operations release.')
const migrationDir=path.resolve(dirname,'migrations','sqlite')
if(production&&process.env.ALLOW_SQLITE_PRODUCTION!=='single-node')throw new Error('Explicitly opt into the documented single-node SQLite deployment.')
export default buildConfig({
 serverURL,secret,sharp,email:emailAdapter,graphQL:{disable:true},
 db:sqliteAdapter({client:{url:database},migrationDir,wal:true,transactionOptions:{},push:!production}),
 cors:[serverURL],csrf:[serverURL],localization:{locales:[{label:'Polski',code:'pl'},{label:'English',code:'en'}],defaultLocale:'pl',fallback:true},
 admin:{user:'users',meta:{titleSuffix:' | CodeMaster CMS'},importMap:{baseDir:dirname},livePreview:{
  collections:['projects','blog-posts'],globals:['site-settings','homepage'],
  url:({data,collectionConfig,locale,req})=>req.user?previewURL(collectionConfig?.slug,data.id,locale?.code):null,
  breakpoints:[{label:'Mobile',name:'mobile',width:390,height:844},{label:'Tablet',name:'tablet',width:820,height:1180},{label:'Desktop',name:'desktop',width:1440,height:1000}]
 }},
 collections:[Users,Media,Services,Projects,Testimonials,Leads,PrivateFiles,FormAttempts,BlogPosts,FAQs,Technologies,Industries],
 globals:[SiteSettings,Homepage,Navigation,Footer,ContactSettings,SocialLinks,SEO,InstallationState],
 upload:{requestSizeLimit:6*1024*1024,limits:{fileSize:5*1024*1024},abortOnLimit:true},
 typescript:{outputFile:path.resolve(dirname,'payload-types.ts')},
 onInit:async payload=>{if(process.env.SEED_CONTENT==='true'&&process.env.PAYLOAD_MIGRATING!=='true')await seedContent(payload)}
})
