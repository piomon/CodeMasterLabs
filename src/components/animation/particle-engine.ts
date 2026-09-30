/** Rasterize the rendered HTML heading into thousands of independent luminous points.
 * The HTML remains in place for accessibility and is only hidden after the first successful frame.
 */
export function createParticleTypography(canvas: HTMLCanvasElement, heading: HTMLElement) {
 const ctx=canvas.getContext('2d',{alpha:true})
 const sample=document.createElement('canvas')
 const ink=sample.getContext('2d',{willReadFrequently:true})
 const stage=heading.parentElement!
 if(!ctx||!ink||!stage)return()=>{}

 type Particle={x:number;y:number;tx:number;ty:number;vx:number;vy:number;light:number;size:number;phase:number}
 let points:Particle[]=[]
 let width=0,height=0,dpr=1,frame=0,raf=0,last=0,start=0
 let visible=true,disposed=false,first=true,mobile=false,resizeTimer=0
 let pointerX=-10000,pointerY=-10000,pointerActive=false
 const cores=navigator.hardwareConcurrency||4

 function layout(){
  if(disposed||document.fonts?.status==='loading')return
  const bounds=stage.getBoundingClientRect()
  const w=Math.round(bounds.width),h=Math.round(bounds.height)
  if(w<1||h<1)return
  // ResizeObserver delivers an initial notification even when nothing changed.
  // Do not let that notification replace the assembling particles with settled ones.
  if(w===width&&h===height&&points.length)return
  // If sampling fails, leave the real text visible instead of displaying an empty canvas.
  stage.removeAttribute('data-particles')
  width=w;height=h
  mobile=w<600||window.matchMedia('(pointer:coarse)').matches
  dpr=Math.min(window.devicePixelRatio||1,mobile?1.25:1.75)
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)
  ctx!.setTransform(dpr,0,0,dpr,0,0)
  sample.width=w;sample.height=h
  ink!.clearRect(0,0,w,h)
  ink!.fillStyle='#fff'

  // Range rectangles give us the *actual* browser line breaks, including CMS titles
  // that wrap differently on narrow screens. Canvas paints each visual line at its
  // measured DOM coordinates instead of guessing where CSS placed the glyphs.
  for(const line of heading.querySelectorAll<HTMLElement>('[data-particle-line]')){
   const css=getComputedStyle(line)
   ink!.font=`${css.fontStyle} ${css.fontWeight} ${css.fontSize} ${css.fontFamily}`
   ink!.textBaseline='alphabetic'
   if('letterSpacing' in ink!)ink!.letterSpacing=css.letterSpacing
   const node=line.firstChild
   if(!node||node.nodeType!==Node.TEXT_NODE)continue
   const text=node.textContent||''
   let rowStart=0,rowTop=NaN
   const drawRow=(from:number,to:number,top:number)=>{
    if(from===to)return
    const range=document.createRange()
    range.setStart(node,from);range.setEnd(node,to)
    const r=range.getBoundingClientRect()
    if(r.width===0)return
    const size=parseFloat(css.fontSize)
    // DOM text boxes encompass leading; this baseline matches the box's ink center.
    const metrics=ink!.measureText(text.slice(from,to))
    const ascent=metrics.actualBoundingBoxAscent||size*.77
    const descent=metrics.actualBoundingBoxDescent||size*.2
    ink!.fillText(text.slice(from,to),r.left-bounds.left,top-bounds.top+(r.height-ascent-descent)/2+ascent)
   }
   for(let i=0;i<text.length;i++){
    const range=document.createRange()
    range.setStart(node,i);range.setEnd(node,i+1)
    const r=range.getBoundingClientRect()
    if(!Number.isFinite(rowTop))rowTop=r.top
    else if(Math.abs(r.top-rowTop)>3){drawRow(rowStart,i,rowTop);rowStart=i;rowTop=r.top}
   }
   if(text.length)drawRow(rowStart,text.length,rowTop)
  }

  const pixels=ink!.getImageData(0,0,w,h).data
  const spacing=mobile?1.45:cores<=4?1.8:1.65
  const limit=mobile?6000:cores<=4?11500:17000
  const candidates:{x:number;y:number;a:number}[]=[]
  for(let y=0;y<h;y+=spacing)for(let x=0;x<w;x+=spacing){
   const ix=(Math.floor(y)*w+Math.floor(x))*4
   const alpha=pixels[ix+3]/255
   if(alpha>.24)candidates.push({x,y,a:alpha})
  }
  const stride=Math.max(1,Math.ceil(candidates.length/limit))
  points=[]
  for(let i=0;i<candidates.length;i+=stride){
   const dot=candidates[i]
   const seed=(i*17%97)/97
   const angle=i*2.399963
   const radius=first?34+(i*71%115):1.5
   points.push({
    x:dot.x+Math.cos(angle)*radius,y:dot.y+Math.sin(angle)*radius,
    tx:dot.x,ty:dot.y,vx:0,vy:0,
    light:Math.min(1,dot.a*(.8+seed*.2)),size:mobile?1+seed*.45:1.1+seed*.55,
    phase:seed*6.283
   })
  }
  if(points.length<30){points=[];canvas.dataset.count='0';return}
  canvas.dataset.count=String(points.length)
  first=false
  start=performance.now()
  stop()
  schedule()
 }

 function render(now:number){
  raf=0
  if(disposed||!visible||document.hidden)return
  if(last&&now-last<(mobile?32:cores<=4?24:16)){schedule();return}
  const dt=Math.min(last?(now-last)/16.67:1,2)
  last=now
  ctx!.clearRect(0,0,width,height)
  const assembling=now-start<1900
  const time=now*.001
  // Render the actual letters, not a text overlay. A small number of brighter
  // pinpricks produce the soft, granular photographic quality of the reference.
  for(let i=0;i<points.length;i++){
   const p=points[i]
   const dx=p.x-pointerX,dy=p.y-pointerY
   const distance=dx*dx+dy*dy
   const interactionRadius=mobile?82:130
   if(pointerActive&&distance<interactionRadius*interactionRadius&&distance>1){
    const force=(1-Math.sqrt(distance)/interactionRadius)*(mobile?.42:.7)
    p.vx+=dx/Math.sqrt(distance)*force*dt
    p.vy+=dy/Math.sqrt(distance)*force*dt
   }
   // Permanently settled lettering, with only subpixel breathing at rest.
   const sway=assembling?0:.32
   const targetX=p.tx+Math.sin(time*.8+p.phase)*sway
   const targetY=p.ty+Math.cos(time*.65+p.phase)*sway
   p.vx+=(targetX-p.x)*.065*dt
   p.vy+=(targetY-p.y)*.065*dt
   const drag=Math.pow(.79,dt)
   p.vx*=drag;p.vy*=drag
   p.x+=p.vx*dt;p.y+=p.vy*dt
   const twinkle=.94+.06*Math.sin(time*1.4+p.phase)
   const alpha=p.light*twinkle*(assembling?.85:1)
   if(i%3===0){
    ctx!.fillStyle=`rgba(221,229,255,${alpha*.18})`
    ctx!.beginPath();ctx!.arc(p.x,p.y,p.size*2.8,0,Math.PI*2);ctx!.fill()
   }
   ctx!.fillStyle=`rgba(243,246,255,${alpha})`
   ctx!.fillRect(p.x,p.y,p.size,p.size)
  }
  frame++
  canvas.dataset.frames=String(frame)
  stage!.dataset.particles='ready';schedule()
 }
 function schedule(){if(!raf&&!disposed&&visible&&!document.hidden&&points.length)raf=requestAnimationFrame(render)}
 function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0}
 const move=(e:PointerEvent)=>{
  const r=stage!.getBoundingClientRect()
  pointerX=e.clientX-r.left;pointerY=e.clientY-r.top;pointerActive=true
 }
 const leave=()=>{pointerX=-10000;pointerY=-10000;pointerActive=false}
 const visibility=()=>{if(document.hidden)stop();else schedule()}
 const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible)stop();else schedule()})
 const ro=new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=window.setTimeout(layout,120)})
 io.observe(stage);ro.observe(stage)
 stage.addEventListener('pointerdown',move,{passive:true})
 stage.addEventListener('pointermove',move,{passive:true})
 stage.addEventListener('pointerup',leave)
 stage.addEventListener('pointercancel',leave)
 stage.addEventListener('pointerleave',leave)
 document.addEventListener('visibilitychange',visibility)
 if(document.fonts?.status==='loading')document.fonts.ready.then(()=>{if(!disposed)layout()})
 layout()
 return()=>{
  disposed=true;stop();clearTimeout(resizeTimer);io.disconnect();ro.disconnect()
  stage.removeEventListener('pointerdown',move);stage.removeEventListener('pointermove',move)
  stage.removeEventListener('pointerup',leave);stage.removeEventListener('pointercancel',leave);stage.removeEventListener('pointerleave',leave)
  document.removeEventListener('visibilitychange',visibility)
  stage.removeAttribute('data-particles')
  ctx.clearRect(0,0,width,height)
 }
}