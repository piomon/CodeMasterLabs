import {defineConfig,devices} from '@playwright/test'
import {existsSync} from 'node:fs'
if(existsSync('.env'))process.loadEnvFile('.env')
const baseURL=process.env.E2E_BASE_URL||'http://localhost:3000'
if(!['localhost','127.0.0.1','[::1]'].includes(new URL(baseURL).hostname)&&process.env.ALLOW_REMOTE_E2E!=='test-environment-only')throw new Error('Use a disposable localhost database, or explicitly authorize a disposable remote test environment.')
export default defineConfig({testDir:'./tests/e2e',fullyParallel:false,workers:1,retries:0,timeout:45000,reporter:[['list'],['html',{open:'never',outputFolder:'reports/playwright'}]],use:{baseURL,trace:'off',screenshot:'only-on-failure'},projects:[{name:'chromium',use:{...devices['Desktop Chrome']}}],webServer:process.env.E2E_BASE_URL?undefined:{command:'npm run dev',url:baseURL,reuseExistingServer:!process.env.CI,timeout:120000}})
