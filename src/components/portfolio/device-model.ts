import * as THREE from 'three'
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js'

/** Actual closed-hinge geometry, not a transformed screenshot or CSS device frame. */
export function buildDevices(logo:THREE.Texture){
 const root=new THREE.Group()
 const metal=new THREE.MeshStandardMaterial({color:'#b1b4ba',metalness:.88,roughness:.31})
 const edge=new THREE.MeshStandardMaterial({color:'#dedfe2',metalness:.92,roughness:.2})
 const dark=new THREE.MeshStandardMaterial({color:'#060609',roughness:.84,metalness:0,envMapIntensity:.1})
 const keyMaterial=new THREE.MeshStandardMaterial({color:'#020203',roughness:.72,metalness:0,envMapIntensity:.05})
 function box(parent:THREE.Object3D,w:number,h:number,d:number,r:number,material:THREE.Material,x=0,y=0,z=0){
  const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,r),material)
  mesh.position.set(x,y,z);parent.add(mesh);return mesh
 }
 // RoundedBox clamps every radius to half the thickness, making thin phones
 // almost square. Extrude a rounded outline instead, then bevel only its edge.
 function slab(parent:THREE.Object3D,w:number,h:number,d:number,r:number,material:THREE.Material,x=0,y=0,z=0){
  const s=new THREE.Shape(),l=-w/2,b=-h/2
  s.moveTo(l+r,b);s.lineTo(l+w-r,b);s.quadraticCurveTo(l+w,b,l+w,b+r)
  s.lineTo(l+w,b+h-r);s.quadraticCurveTo(l+w,b+h,l+w-r,b+h)
  s.lineTo(l+r,b+h);s.quadraticCurveTo(l,b+h,l,b+h-r)
  s.lineTo(l,b+r);s.quadraticCurveTo(l,b,l+r,b)
  const bevel=Math.min(.006,d/4)
  const geometry=new THREE.ExtrudeGeometry(s,{depth:d-2*bevel,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:16})
  geometry.translate(0,0,-d/2+bevel)
  const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);parent.add(mesh);return mesh
 }
 const laptop=new THREE.Group()
 root.add(laptop)
 slab(laptop,5.4,3.6,.14,.13,metal).rotation.x=Math.PI/2
 slab(laptop,5.34,3.53,.018,.12,edge,0,.073).rotation.x=Math.PI/2
 box(laptop,4.54,.014,1.64,.09,dark,0,.085,-.62)

 const keys=new THREE.InstancedMesh(new RoundedBoxGeometry(.292,.041,.225,2,.019),keyMaterial,78)
 const dummy=new THREE.Object3D()
 let index=0
 for(let row=0;row<6;row++){
  for(let column=0;column<13;column++){
   if(row===5&&column>=4&&column<=8)continue
   dummy.position.set((column-6)*.327,.119,-1.32+row*.258)
   dummy.updateMatrix();keys.setMatrixAt(index++,dummy.matrix)
  }
 }
 keys.count=index
 laptop.add(keys)
 box(laptop,1.54,.043,.216,.022,keyMaterial,0,.122,-.03)
 // Etched legends are a local texture laid over the physical keycaps.
 const legends=document.createElement('canvas');legends.width=2048;legends.height=760
 const ctx=legends.getContext('2d')
 if(ctx){
  const rows=['esc F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 F11 F12','` 1 2 3 4 5 6 7 8 9 0 – =','⇥ Q W E R T Y U I O P [ ]',"⌃ A S D F G H J K L ; ' ↵",'⇧ Z X C V B N M , . / ↑ ⇧','fn ⌃ ⌥ ⌘ · · · · · ⌘ ← ↓ →']
  ctx.fillStyle='#e2e4ea';ctx.font='27px Arial';ctx.textAlign='center';ctx.textBaseline='middle'
  rows.forEach((row,y)=>row.split(' ').forEach((letter,x)=>{if(letter!=='·')ctx.fillText(letter,83+x*157,58+y*126)}))
  const texture=new THREE.CanvasTexture(legends);texture.colorSpace=THREE.SRGBColorSpace
  const labels=new THREE.Mesh(new THREE.PlaneGeometry(4.24,1.55),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide}))
  labels.rotation.x=-Math.PI/2;labels.position.set(0,.145,-.67);laptop.add(labels)
 }
 box(laptop,2.07,.009,1.13,.055,dark,0,.085,.94)
 box(laptop,2.05,.012,1.11,.055,metal,0,.093,.94)
 // Speaker perforations, side ports, front cutout and a physical hinge.
 const speakerCanvas=document.createElement('canvas');speakerCanvas.width=64;speakerCanvas.height=256
 const speakerCtx=speakerCanvas.getContext('2d')
 if(speakerCtx){
  speakerCtx.fillStyle='#15161b'
  for(let y=4;y<252;y+=7)for(let x=4;x<62;x+=7){speakerCtx.beginPath();speakerCtx.arc(x,y,1.1,0,Math.PI*2);speakerCtx.fill()}
  const texture=new THREE.CanvasTexture(speakerCanvas)
  for(const x of [-2.49,2.49]){
   const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.24,1.59),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}))
   mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.09,-.65);laptop.add(mesh)
  }
 }
 for(const x of [-2.696,2.696])for(const z of [-1.2,-.77])box(laptop,.012,.035,.18,.008,dark,x,0,z)
 box(laptop,.72,.036,.025,.015,dark,0,.045,1.791)
 const hingeRod=new THREE.Mesh(new THREE.CylinderGeometry(.063,.063,4.85,24),dark)
 hingeRod.rotation.z=Math.PI/2;hingeRod.position.set(0,.11,-1.69);laptop.add(hingeRod)
 const lid=new THREE.Group();lid.position.set(0,.153,-1.73);laptop.add(lid)
 slab(lid,5.4,3.57,.105,.13,metal,0,.018,1.76).rotation.x=Math.PI/2
 slab(lid,5.31,3.47,.017,.11,edge,0,-.039,1.76).rotation.x=Math.PI/2
 slab(lid,5.36,3.52,.022,.115,dark,0,-.05,1.76).rotation.x=Math.PI/2
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(5.04,3.15),new THREE.MeshBasicMaterial({color:'#030406'}))
 screen.rotation.x=Math.PI/2;screen.position.set(0,-.066,1.78);lid.add(screen)
 const mark=new THREE.Mesh(new THREE.PlaneGeometry(.47,.55),new THREE.MeshBasicMaterial({map:logo,transparent:true,depthWrite:false}))
 mark.rotation.x=-Math.PI/2;mark.position.set(0,.075,1.78);lid.add(mark)
 const desktopAnchor=new THREE.Object3D()
 desktopAnchor.position.copy(screen.position);desktopAnchor.position.y-=.004;desktopAnchor.rotation.x=Math.PI/2
 lid.add(desktopAnchor)
 // The camera notch sits in the glass, not on a second floating screen frame.
 const notch=slab(lid,.52,.10,.012,.025,dark,0,-.083,3.31)
 notch.rotation.x=Math.PI/2

 const phone=new THREE.Group();root.add(phone)
 const phoneMetal=new THREE.MeshStandardMaterial({color:'#bbb7ac',metalness:.91,roughness:.34})
 const polished=new THREE.MeshStandardMaterial({color:'#e6e1d7',metalness:.94,roughness:.2})
 slab(phone,1.29,2.69,.16,.215,phoneMetal)
 slab(phone,1.274,2.674,.013,.21,polished,0,0,.078)
 slab(phone,1.24,2.636,.020,.195,dark,0,0,.092)
 // Fine antenna breaks separate the titanium band without outlining the display.
 for(const y of [-1.02,1.02])for(const x of [-.645,.645])box(phone,.006,.016,.132,.002,dark,x,y,0)
 box(phone,.025,.11,.049,.01,phoneMetal,-.65,.83,.005)
 box(phone,.025,.27,.049,.01,phoneMetal,-.65,.47,.005)
 box(phone,.025,.21,.049,.01,phoneMetal,-.65,.13,.005)
 box(phone,.025,.38,.049,.01,phoneMetal,.65,.26,.005)
 const mobileAnchor=new THREE.Object3D();mobileAnchor.position.set(0,0,.108);phone.add(mobileAnchor)
 phone.position.set(3.12,1.31,.95)
 phone.rotation.set(-.025,-.17,-.035)
 return {root,laptop,lid,phone,desktopAnchor,mobileAnchor}
}