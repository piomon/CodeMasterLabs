import {getPayload} from 'payload'
import config from '../src/payload.config'
import {seedContent} from '../src/lib/seed'
const cms=await getPayload({config});try{await seedContent(cms)}finally{await cms.destroy()}
