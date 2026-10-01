// CODEMASTER_PREMIUM_MOTION_20261001
/** Rasterize the rendered HTML heading into a crisp field of luminous points.
 * The HTML remains accessible and becomes a faint alignment layer after
 * the particle canvas is ready.
 */
export function createParticleTypography(
 canvas:HTMLCanvasElement,
 heading:HTMLElement,
){
 const ctx=canvas.getContext(
  '2d',
  {alpha:true},
 )

 const sample=document.createElement(
  'canvas'
 )

 const ink=sample.getContext(
  '2d',
  {willReadFrequently:true},
 )

 const stage=heading.parentElement!

 if(!ctx||!ink||!stage){
  return()=>{}
 }

 const renderContext: CanvasRenderingContext2D = ctx
 const rasterContext: CanvasRenderingContext2D = ink

 type Particle={
  x:number
  y:number
  tx:number
  ty:number
  vx:number
  vy:number
  light:number
  size:number
  phase:number
 }

 let points:Particle[]=[]
 let width=0
 let height=0
 let dpr=1
 let frame=0
 let raf=0
 let last=0
 let start=0
 let visible=true
 let disposed=false
 let first=true
 let mobile=false
 let resizeTimer=0

 let pointerX=-10000
 let pointerY=-10000
 let pointerActive=true

 const cores=
  navigator.hardwareConcurrency||4

 function layout(){
  if(
   disposed
   ||
   document.fonts?.status==='loading'
  ){
   return
  }

  const bounds=
   stage.getBoundingClientRect()

  const w=Math.round(bounds.width)
  const h=Math.round(bounds.height)

  if(w<1||h<1)return

  if(
   w===width
   &&
   h===height
   &&
   points.length
  ){
   return
  }

  stage.removeAttribute(
   'data-particles'
  )

  width=w
  height=h

  mobile=
   w<600
   ||
   window
    .matchMedia(
     '(pointer:coarse)'
    )
    .matches

  dpr=Math.min(
   window.devicePixelRatio||1,
   mobile
    ?1.4
    :1.8
  )

  canvas.width=
   Math.round(w*dpr)

  canvas.height=
   Math.round(h*dpr)

  renderContext.setTransform(
   dpr,
   0,
   0,
   dpr,
   0,
   0,
  )

  sample.width=w
  sample.height=h

  rasterContext.clearRect(
   0,
   0,
   w,
   h,
  )

  rasterContext.fillStyle='#fff'

  for(
   const line
   of heading
    .querySelectorAll<HTMLElement>(
     '[data-particle-line]'
    )
  ){
   const css=
    getComputedStyle(line)

   rasterContext.font=
    `${css.fontStyle} `+
    `${css.fontWeight} `+
    `${css.fontSize} `+
    `${css.fontFamily}`

   rasterContext.textBaseline='alphabetic'

   if('letterSpacing' in rasterContext){
    rasterContext.letterSpacing=
     css.letterSpacing
   }

   const node=line.firstChild

   if(
    !node
    ||
    node.nodeType!==Node.TEXT_NODE
   ){
    continue
   }

   const text=node.textContent||''

   let rowStart=0
   let rowTop=NaN

   const drawRow=(
    from:number,
    to:number,
    top:number,
   )=>{
    if(from===to)return

    const range=
     document.createRange()

    range.setStart(
     node,
     from,
    )

    range.setEnd(
     node,
     to,
    )

    const r=
     range.getBoundingClientRect()

    if(r.width===0)return

    const size=
     parseFloat(css.fontSize)

    const metrics=
     rasterContext.measureText(
      text.slice(from,to)
     )

    const ascent=
     metrics.actualBoundingBoxAscent
     ||
     size*.77

    const descent=
     metrics.actualBoundingBoxDescent
     ||
     size*.2

    rasterContext.fillText(
     text.slice(from,to),
     r.left-bounds.left,
     top-bounds.top+
      (
       r.height-
       ascent-
       descent
      )/2+
      ascent,
    )
   }

   for(
    let i=0;
    i<text.length;
    i++
   ){
    const range=
     document.createRange()

    range.setStart(
     node,
     i,
    )

    range.setEnd(
     node,
     i+1,
    )

    const r=
     range.getBoundingClientRect()

    if(
     !Number.isFinite(rowTop)
    ){
     rowTop=r.top
    }
    else if(
     Math.abs(
      r.top-rowTop
     )>3
    ){
     drawRow(
      rowStart,
      i,
      rowTop,
     )

     rowStart=i
     rowTop=r.top
    }
   }

   if(text.length){
    drawRow(
     rowStart,
     text.length,
     rowTop,
    )
   }
  }

  const pixels=
   rasterContext.getImageData(
    0,
    0,
    w,
    h,
   ).data

  /*
   * Deliberately lower particle density:
   * fewer points + slightly larger dots +
   * higher canvas DPR = cleaner, sharper type.
   */
  const spacing=
   mobile
    ?2.05
    :cores<=4
     ?2.25
     :2.1

  const limit=
   mobile
    ?3600
    :cores<=4
     ?6800
     :9200

  const candidates:{
   x:number
   y:number
   a:number
  }[]=[]

  for(
   let y=0;
   y<h;
   y+=spacing
  ){
   for(
    let x=0;
    x<w;
    x+=spacing
   ){
    const ix=(
     Math.floor(y)*w+
     Math.floor(x)
    )*4

    const alpha=
     pixels[ix+3]/255

    if(alpha>.3){
     candidates.push({
      x,
      y,
      a:alpha,
     })
    }
   }
  }

  const stride=Math.max(
   1,
   Math.ceil(
    candidates.length/limit
   )
  )

  points=[]

  for(
   let i=0;
   i<candidates.length;
   i+=stride
  ){
   const dot=candidates[i]
   const seed=(i*17%97)/97
   const angle=i*2.399963

   const radius=
    first
     ?12+(i*37%34)
     :1.1

   points.push({
    x:
     dot.x+
     Math.cos(angle)*radius,
    y:
     dot.y+
     Math.sin(angle)*radius,
    tx:dot.x,
    ty:dot.y,
    vx:0,
    vy:0,
    light:Math.min(
     1,
     dot.a*(.9+seed*.1),
    ),
    size:
     mobile
      ?1.2+seed*.34
      :1.3+seed*.4,
    phase:seed*6.283,
   })
  }

  if(points.length<30){
   points=[]
   canvas.dataset.count='0'
   return
  }

  canvas.dataset.count=
   String(points.length)

  first=false
  start=performance.now()

  stop()
  schedule()
 }

 function render(now:number){
  raf=0

  if(
   disposed
   ||
   !visible
   ||
   document.hidden
  ){
   return
  }

  if(
   last
   &&
   now-last<
    (
     mobile
      ?30
      :cores<=4
       ?23
       :16
    )
  ){
   schedule()
   return
  }

  const dt=Math.min(
   last
    ?(now-last)/16.67
    :1,
   2,
  )

  last=now

  renderContext.clearRect(
   0,
   0,
   width,
   height,
  )

  const assembling=
   now-start<3600

  const time=
   now*.001

  const interactionRadius=
   mobile?82:130

  for(
   let i=0;
   i<points.length;
   i++
  ){
   const p=points[i]

   const dx=p.x-pointerX
   const dy=p.y-pointerY

   const distance=
    dx*dx+
    dy*dy

   if(
    pointerActive
    &&
    distance<
     interactionRadius*
     interactionRadius
    &&
    distance>1
   ){
    const root=
     Math.sqrt(distance)

    const force=
     (
      1-
      root/
      interactionRadius
     )*
     (
      mobile
       ?.5
       :.66
     )

    p.vx+=
     dx/root*
     force*
     dt

    p.vy+=
     dy/root*
     force*
     dt
   }

   const sway=
    assembling
     ?0
     :.14

   const targetX=
    p.tx+
    Math.sin(
     time*.72+
     p.phase
    )*
    sway

   const targetY=
    p.ty+
    Math.cos(
     time*.58+
     p.phase
    )*
    sway

   p.vx+=
    (
     targetX-
     p.x
    )*
    (assembling ? .004 : .072)*
    dt

   p.vy+=
    (
     targetY-
     p.y
    )*
    (assembling ? .004 : .072)*
    dt

   const drag=
    Math.pow(
     (assembling ? .94 : .78),
     dt,
    )

   p.vx*=drag
   p.vy*=drag

   p.x+=p.vx*dt
   p.y+=p.vy*dt

   const twinkle=
    .98+
    .02*
    Math.sin(
     time*1.15+
     p.phase
    )

   const alpha=
    p.light*
    twinkle*
    (
     assembling
      ?.9
      :1
    )

   if(i%5===0){
    renderContext.fillStyle=
     `rgba(221,229,255,${alpha*.12})`

    renderContext.beginPath()

    renderContext.arc(
     p.x,
     p.y,
     p.size*2.45,
     0,
     Math.PI*2,
    )

    renderContext.fill()
   }

   renderContext.fillStyle=
    `rgba(246,248,255,${alpha})`

   renderContext.fillRect(
    p.x,
    p.y,
    p.size,
    p.size,
   )
  }

  frame++

  canvas.dataset.frames=
   String(frame)

  stage!.dataset.particles='ready';schedule()
 }

 function schedule(){
  if(
   !raf
   &&
   !disposed
   &&
   visible
   &&
   !document.hidden
   &&
   points.length
  ){
   raf=requestAnimationFrame(
    render
   )
  }
 }

 function stop(){
  if(raf){
   cancelAnimationFrame(raf)
  }

  raf=0
  last=0
 }

 const move=(
  event:PointerEvent
 )=>{
  const bounds=
   stage.getBoundingClientRect()

  pointerX=
   event.clientX-
   bounds.left

  pointerY=
   event.clientY-
   bounds.top
 }

 const leave=()=>{
  pointerX=-10000
  pointerY=-10000
 }

 const visibility=()=>{
  if(document.hidden){
   stop()
  }
  else{
   schedule()
  }
 }

 const io=
  new IntersectionObserver(
   ([entry])=>{
    visible=
     entry.isIntersecting

    if(!visible){
     stop()
    }
    else{
     schedule()
    }
   }
  )

 const ro=
  new ResizeObserver(
   ()=>{
    clearTimeout(
     resizeTimer
    )

    resizeTimer=
     window.setTimeout(
      layout,
      120,
     )
   }
  )

 io.observe(stage)
 ro.observe(stage)

 stage.addEventListener(
  'pointerdown',
  move,
  {passive:true},
 )

 stage.addEventListener(
  'pointermove',
  move,
  {passive:true},
 )

 stage.addEventListener(
  'pointerup',
  leave,
 )

 stage.addEventListener(
  'pointercancel',
  leave,
 )

 stage.addEventListener(
  'pointerleave',
  leave,
 )

 document.addEventListener(
  'visibilitychange',
  visibility,
 )

 if(
  document.fonts?.status==='loading'
 ){
  document.fonts.ready.then(
   ()=>{
    if(!disposed){
     layout()
    }
   }
  )
 }

 layout()

 return()=>{
  disposed=true
  pointerActive=false

  stop()

  clearTimeout(
   resizeTimer
  )

  io.disconnect()
  ro.disconnect()

  stage.removeEventListener(
   'pointerdown',
   move,
  )

  stage.removeEventListener(
   'pointermove',
   move,
  )

  stage.removeEventListener(
   'pointerup',
   leave,
  )

  stage.removeEventListener(
   'pointercancel',
   leave,
  )

  stage.removeEventListener(
   'pointerleave',
   leave,
  )

  document.removeEventListener(
   'visibilitychange',
   visibility,
  )

  stage.removeAttribute(
   'data-particles'
  )

  renderContext.clearRect(
   0,
   0,
   width,
   height,
  )
 }
}
