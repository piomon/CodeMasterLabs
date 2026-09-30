import type {CollectionConfig} from 'payload'
import {privateAccess} from '@/lib/access'
/** A unique bucket slot makes limits durable across app workers sharing one database. */
export const FormAttempts:CollectionConfig={slug:'form-attempts',admin:{hidden:true},access:privateAccess,fields:[{name:'key',type:'text',unique:true,required:true,index:true},{name:'expiresAt',type:'date',required:true,index:true}]}
