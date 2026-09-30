import {withPayload} from '@payloadcms/next/withPayload'
/** @type {import('next').NextConfig} */
const nextConfig={reactStrictMode:true,poweredByHeader:false,output:'standalone',allowedDevOrigins:['127.0.0.1',...(process.env.REPLIT_DEV_DOMAIN?[process.env.REPLIT_DEV_DOMAIN]:[])],agentRules:false,images:{formats:['image/webp']},experimental:{serverActions:{bodySizeLimit:'6mb'}}}
export default withPayload(nextConfig,{devBundleServerPackages:false})
