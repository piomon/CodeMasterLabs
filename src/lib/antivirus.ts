import {createConnection} from 'node:net'
export type ScanResult='CLEAN'|'INFECTED'|'ERROR'
/** ClamAV INSTREAM protocol. Only an explicit OK response counts as clean. */
export function scanBytes(bytes:Buffer,host=process.env.CLAMAV_HOST||'',port=Number(process.env.CLAMAV_PORT||3310),timeout=15000):Promise<ScanResult>{
 if(!host||!Number.isInteger(port)||port<1||port>65535||bytes.length>5*1024*1024)return Promise.resolve('ERROR')
 return new Promise(resolve=>{
  let done=false,response=Buffer.alloc(0)
  const socket=createConnection({host,port})
  const timer=setTimeout(()=>finish('ERROR'),timeout)
  function finish(result:ScanResult){if(done)return;done=true;clearTimeout(timer);socket.destroy();resolve(result)}
  socket.on('connect',()=>{
   socket.write(Buffer.from('zINSTREAM\0'))
   for(let i=0;i<bytes.length;i+=65536){const chunk=bytes.subarray(i,i+65536),length=Buffer.alloc(4);length.writeUInt32BE(chunk.length);socket.write(length);socket.write(chunk)}
   socket.write(Buffer.alloc(4))
  })
  socket.on('data',data=>{
   response=Buffer.concat([response,data]);if(response.length>4096){finish('ERROR');return}
   const end=response.indexOf(0);if(end<0)return
   const message=response.subarray(0,end).toString('utf8').trim()
   finish(message==='stream: OK'?'CLEAN':/^stream: .+ FOUND$/.test(message)?'INFECTED':'ERROR')
  })
  socket.on('error',()=>finish('ERROR'));socket.on('close',()=>finish('ERROR'))
 })
}
