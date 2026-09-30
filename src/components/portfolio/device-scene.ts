import * as THREE from 'three'
import {CSS3DObject,CSS3DRenderer} from 'three/addons/renderers/CSS3DRenderer.js'
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js'
import {buildDevices} from './device-model'

export type DeviceScene = {open:()=>void;setReducedMotion:(reduced:boolean)=>void;dispose:()=>void}
type SceneOptions = {
 reduced:boolean
 onSurfaces:(desktop:HTMLDivElement,mobile:HTMLDivElement)=>void
 onOpen:()=>void
 onError:()=>void
}

export async function createDeviceScene(host:HTMLDivElement,options:SceneOptions):Promise<DeviceScene>{
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'})
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5))
 renderer.setClearColor(0x000000,0)
 renderer.outputColorSpace=THREE.SRGBColorSpace
 renderer.toneMapping=THREE.ACESFilmicToneMapping
 renderer.toneMappingExposure=.95
 renderer.domElement.className='device-webgl'
 renderer.domElement.setAttribute('aria-hidden','true')
 const scene=new THREE.Scene()
 const camera=new THREE.PerspectiveCamera(33,1,.1,100)
 const room=new RoomEnvironment()
 const pmrem=new THREE.PMREMGenerator(renderer)
 const environment=pmrem.fromScene(room,.08)
 scene.environment=environment.texture
 room.dispose();pmrem.dispose()
 scene.add(new THREE.HemisphereLight('#e5eaff','#333c55',1))
 const key=new THREE.DirectionalLight('#ffffff',3.5);key.position.set(-3,7,4);scene.add(key)
 const rim=new THREE.DirectionalLight('#aec7ff',2.5);rim.position.set(5,3,-4);scene.add(rim)
 const logo=await new THREE.TextureLoader().loadAsync('/images/showcase/device-mark.svg').catch(error=>{
  environment.dispose();renderer.dispose();throw error
 })
 logo.colorSpace=THREE.SRGBColorSpace
 const devices=buildDevices(logo);scene.add(devices.root)
 const css=new CSS3DRenderer();css.domElement.className='device-surfaces'
 const desktop=document.createElement('div');desktop.className='device-html device-html-desktop'
 const mobile=document.createElement('div');mobile.className='device-html device-html-mobile'
 const desktopObject=new CSS3DObject(desktop);desktopObject.scale.setScalar(5.04/1440)
 const mobileObject=new CSS3DObject(mobile);mobileObject.scale.setScalar(1.16/390)
 devices.desktopAnchor.add(desktopObject);devices.mobileAnchor.add(mobileObject)
 host.append(renderer.domElement,css.domElement)
 options.onSurfaces(desktop,mobile)
 let disposed=false,reduced=options.reduced,progress=reduced?1:0,target=progress,frame=0,opened=false,visible=true
 let previousTime=0
 function contextLost(event:Event){event.preventDefault();options.onError()}
 renderer.domElement.addEventListener('webglcontextlost',contextLost)
 function pose(){
  const eased=progress*progress*(3-2*progress)
  devices.lid.rotation.x=-1.97*eased
  devices.laptop.rotation.y=-.22*(1-eased)
  devices.laptop.rotation.z=-.025*(1-eased)
  devices.phone.position.y=1.16+.16*eased
  devices.phone.scale.setScalar(.93+.07*eased)
  desktop.style.opacity=String(Math.max(0,Math.min(1,(progress-.35)/.2)))
  mobile.style.opacity=String(Math.max(0,Math.min(1,(progress-.75)*4)))
  desktop.style.pointerEvents=opened?'auto':'none'
  mobile.style.pointerEvents=opened?'auto':'none'
  host.style.setProperty('--boot',String(Math.max(0,Math.min(1,(progress-.5)*2))))
  host.dataset.openProgress=progress.toFixed(3)
 }
 function render(){
  if(disposed)return
  pose();renderer.render(scene,camera);css.render(scene,camera)
  host.dataset.renderer='webgl'
  if(progress>.997&&!opened){opened=true;progress=1;host.dataset.opened='true';options.onOpen();pose()}
 }
 function tick(time:number){
  frame=0
  if(disposed)return
  const delta=Math.min(64,previousTime?time-previousTime:16.7);previousTime=time
  if(reduced)progress=1
  else progress+=(target-progress)*(1-Math.exp(-delta/110))
  if(Math.abs(target-progress)<.0005)progress=target
  render()
  if(visible&&Math.abs(target-progress)>.0001)frame=requestAnimationFrame(tick)
 }
 function schedule(){if(!frame&&!disposed){previousTime=0;frame=requestAnimationFrame(tick)}}
 function onScroll(){
  if(opened||reduced||disposed)return
  const top=host.getBoundingClientRect().top
  const next=Math.max(0,Math.min(1,(window.innerHeight*.84-top)/(window.innerHeight*.62)))
  target=Math.max(target,next);if(visible)schedule()
 }
 function resize(){
  if(disposed)return
  const {width,height}=host.getBoundingClientRect()
  if(!width||!height)return
  camera.aspect=width/height
  // Keep both physical devices in view rather than clipping the phone on narrow screens.
  const distance=Math.max(8.25,7.95/(2*Math.tan(THREE.MathUtils.degToRad(33/2))*camera.aspect))
  camera.position.set(.35,3.55,distance)
  camera.lookAt(.37,1.2,-.23)
  camera.updateProjectionMatrix()
  renderer.setSize(width,height,false);css.setSize(width,height);render();onScroll()
 }
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host)
 const intersection=new IntersectionObserver(entries=>{
  visible=entries[0]?.isIntersecting??true
  if(visible){onScroll();schedule()}else if(frame){cancelAnimationFrame(frame);frame=0}
 },{rootMargin:'150px'})
 intersection.observe(host)
 window.addEventListener('scroll',onScroll,{passive:true})
 resize();onScroll()
 return {
  open(){target=1;schedule()},
  setReducedMotion(value){reduced=value;if(value){progress=1;target=1}schedule()},
  dispose(){
   disposed=true;cancelAnimationFrame(frame);resizeObserver.disconnect();intersection.disconnect()
   window.removeEventListener('scroll',onScroll);renderer.domElement.removeEventListener('webglcontextlost',contextLost)
   const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),textures=new Set<THREE.Texture>()
   scene.traverse(object=>{if(object instanceof THREE.Mesh){
    geometries.add(object.geometry)
    for(const material of Array.isArray(object.material)?object.material:[object.material])materials.add(material)
   }})
   materials.forEach(material=>{
    Object.values(material).forEach(value=>{if(value instanceof THREE.Texture)textures.add(value)})
    material.dispose()
   })
   textures.forEach(texture=>texture.dispose());geometries.forEach(geometry=>geometry.dispose())
   environment.dispose();renderer.dispose()
   renderer.domElement.remove();css.domElement.remove()
  },
 }
}