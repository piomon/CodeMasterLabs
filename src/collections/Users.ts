import type {CollectionConfig} from 'payload'
import {privateAccess} from '@/lib/access'
import {passwordProblem} from '@/lib/submission-policy'
export const Users:CollectionConfig={slug:'users',labels:{singular:'Administrator',plural:'Administratorzy'},admin:{useAsTitle:'email',group:'SETTINGS'},auth:{tokenExpiration:7200,maxLoginAttempts:5,lockTime:15*60*1000,cookies:{secure:((process.env.SERVER_URL||process.env.NEXT_PUBLIC_SERVER_URL)||'').startsWith('https://'),sameSite:'Lax'}},access:privateAccess,fields:[{name:'name',label:'Imie i nazwisko',type:'text',required:true}],hooks:{beforeChange:[({data,operation,req})=>{
 if(operation==='create'&&!req.user&&req.context?.allowBootstrap!==true)throw new Error('Public account registration is disabled. Use npm run create-admin.');if(data.password!==undefined){const problem=passwordProblem(data.password);if(problem)throw new Error(problem)};return data
}]}}
