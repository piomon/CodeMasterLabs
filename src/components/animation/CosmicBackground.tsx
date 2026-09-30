'use client'

import {
  useEffect,
  useRef,
} from 'react'

import {
  useMotion,
} from './MotionProvider'

import {
  useReducedMotion,
} from '@/hooks/useReducedMotion'

import '../cosmic-hero.css'

type Star={
  x:number
  y:number
  radius:number
  phase:number
  speed:number
  opacity:number
  driftX:number
  driftY:number
  bright:boolean
}

const TAU=
  Math.PI*2

function fract(
  value:number,
){
  return (
    value-
    Math.floor(value)
  )
}

function wrap(
  value:number,
  maximum:number,
){
  if(
    maximum<=0
  ){
    return 0
  }

  return (
    (
      value%
      maximum
    )+
    maximum
  )%
  maximum
}

export function CosmicBackground(){

  const canvas=
    useRef<HTMLCanvasElement>(
      null,
    )

  const {
    paused,
  }=
    useMotion()

  const reduced=
    useReducedMotion()

  const animated=
    !reduced &&
    !paused

  useEffect(()=>{

    const canvasElement=
      canvas.current

    if(
      !canvasElement
    ){
      return
    }

    const renderingContext=
      canvasElement.getContext(
        '2d',
        {
          alpha:true,
        },
      )

    if(
      !renderingContext
    ){
      return
    }

    /*
     * Explicit non-null aliases.
     * Nested callbacks now receive concrete DOM types,
     * so strict TypeScript cannot widen them back to null.
     */
    const element:
      HTMLCanvasElement=
        canvasElement

    const ctx:
      CanvasRenderingContext2D=
        renderingContext

    let width=1
    let height=1

    let mobile=false
    let disposed=false

    let raf=0
    let lastFrame=0
    let frameCounter=0

    let resizeTimer:
      number|undefined

    let sceneStart=
      performance.now()

    let stars:
      Star[]=[]

    let atmosphere:
      CanvasGradient|null=
        null

    const constellations=[
      [
        [.67,.12],
        [.71,.17],
        [.76,.19],
        [.80,.24],
        [.87,.22],
        [.89,.30],
        [.82,.33],
      ],
      [
        [.13,.18],
        [.16,.225],
        [.18,.26],
        [.20,.30],
        [.25,.34],
        [.24,.41],
        [.19,.40],
      ],
    ] as const

    function createStars(){

      const area=
        width*
        height

      const target=
        mobile
          ? Math.round(
              area/
              4300,
            )
          : Math.round(
              area/
              6000,
            )

      const count=
        Math.max(
          mobile
            ? 62
            : 110,

          Math.min(
            mobile
              ? 110
              : 210,

            target,
          ),
        )

      stars=
        Array.from(
          {
            length:count,
          },
          (
            _,
            index,
          )=>{

            const n=
              index+1

            const seedX=
              fract(
                n*
                .61803398875,
              )

            const seedY=
              fract(
                n*
                .75487766625,
              )

            const radiusSeed=
              fract(
                n*
                .2718281828,
              )

            const phase=
              fract(
                n*
                .4142135623,
              )*
              TAU

            const speed=
              .38+
              fract(
                n*
                .303577,
              )*
              1.15

            const bright=
              index%41===0 ||
              index%67===0

            return {
              x:
                seedX*
                width,

              y:
                seedY*
                height,

              radius:
                bright
                  ? 1.45+
                    radiusSeed*
                    .75
                  : .42+
                    radiusSeed*
                    .5,

              phase,

              speed,

              opacity:
                bright
                  ? .66+
                    radiusSeed*
                    .18
                  : .14+
                    radiusSeed*
                    .34,

              driftX:
                (
                  .12+
                  fract(
                    n*
                    .193,
                  )*
                  .34
                )*
                (
                  index%2===0
                    ? 1
                    : -1
                ),

              driftY:
                .05+
                fract(
                  n*
                  .237,
                )*
                .18,

              bright,
            }
          },
        )

      element.dataset.starCount=
        String(
          count,
        )
    }

    function createAtmosphere(){

      atmosphere=
        ctx.createRadialGradient(
          width*.70,
          height*.26,
          0,

          width*.70,
          height*.26,

          Math.max(
            width,
            height,
          )*
          .78,
        )

      atmosphere.addColorStop(
        0,
        'rgba(71,91,131,.115)',
      )

      atmosphere.addColorStop(
        .42,
        'rgba(42,55,82,.05)',
      )

      atmosphere.addColorStop(
        1,
        'rgba(7,9,13,0)',
      )
    }

    function resize(){

      if(
        disposed
      ){
        return
      }

      width=
        Math.max(
          1,
          window.innerWidth,
        )

      height=
        Math.max(
          1,
          window.innerHeight,
        )

      mobile=
        width<=700 ||
        window.matchMedia(
          '(pointer:coarse)',
        ).matches

      const dpr=
        Math.min(
          window.devicePixelRatio||
          1,

          mobile
            ? 1.25
            : 1.5,
        )

      element.width=
        Math.round(
          width*dpr,
        )

      element.height=
        Math.round(
          height*dpr,
        )

      element.style.width=
        `${width}px`

      element.style.height=
        `${height}px`

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0,
      )

      createStars()
      createAtmosphere()

      sceneStart=
        performance.now()

      draw(
        sceneStart,
      )
    }

    function drawStar(
      star:Star,
      elapsed:number,
      time:number,
    ){

      const x=
        wrap(
          star.x+
          elapsed*
          star.driftX,

          width,
        )

      const y=
        wrap(
          star.y+
          elapsed*
          star.driftY,

          height,
        )

      const primaryWave=
        .5+
        .5*
        Math.sin(
          time*
          .001*
          star.speed+
          star.phase,
        )

      const secondaryWave=
        .5+
        .5*
        Math.sin(
          time*
          .00037*
          (
            star.speed+
            .31
          )+
          star.phase*
          1.73,
        )

      /*
       * Two frequencies make the stars pulse less uniformly.
       * The result looks like individual points in a real sky
       * rather than a synchronized CSS animation.
       */
      const twinkle=
        animated
          ? (
              .40+
              primaryWave*
              .43+
              secondaryWave*
              .17
            )
          : .78

      const alpha=
        Math.max(
          .04,
          Math.min(
            .98,
            star.opacity*
            twinkle,
          ),
        )

      if(
        star.bright
      ){

        const glowRadius=
          star.radius*
          (
            4.3+
            primaryWave*
            2.4
          )

        const glow=
          ctx.createRadialGradient(
            x,
            y,
            0,
            x,
            y,
            glowRadius,
          )

        glow.addColorStop(
          0,
          `rgba(230,239,255,${
            .10+
            primaryWave*
            .15
          })`,
        )

        glow.addColorStop(
          .28,
          `rgba(203,221,250,${
            .055+
            primaryWave*
            .075
          })`,
        )

        glow.addColorStop(
          1,
          'rgba(183,207,246,0)',
        )

        ctx.fillStyle=
          glow

        ctx.beginPath()

        ctx.arc(
          x,
          y,
          glowRadius,
          0,
          TAU,
        )

        ctx.fill()
      }

      ctx.fillStyle=
        `rgba(224,233,248,${alpha})`

      ctx.beginPath()

      ctx.arc(
        x,
        y,
        star.radius,
        0,
        TAU,
      )

      ctx.fill()

      if(
        star.bright
      ){

        const flareAlpha=
          Math.min(
            .48,
            .12+
            primaryWave*
            .31,
          )

        const flareSize=
          3.2+
          primaryWave*
          2.1

        ctx.strokeStyle=
          `rgba(233,241,255,${flareAlpha})`

        ctx.lineWidth=
          .55

        ctx.beginPath()

        ctx.moveTo(
          x-flareSize,
          y,
        )

        ctx.lineTo(
          x+flareSize,
          y,
        )

        ctx.moveTo(
          x,
          y-flareSize,
        )

        ctx.lineTo(
          x,
          y+flareSize,
        )

        ctx.stroke()
      }
    }

    function drawConstellations(
      time:number,
    ){

      for(
        const points
        of constellations
      ){

        ctx.beginPath()

        points.forEach(
          (
            point,
            index,
          )=>{

            const x=
              point[0]*
              width

            const y=
              point[1]*
              height

            if(
              index===0
            ){
              ctx.moveTo(
                x,
                y,
              )
            }else{
              ctx.lineTo(
                x,
                y,
              )
            }
          },
        )

        ctx.strokeStyle=
          'rgba(161,190,229,.055)'

        ctx.lineWidth=
          .55

        ctx.stroke()

        points.forEach(
          (
            point,
            index,
          )=>{

            const pulse=
              animated
                ? (
                    .45+
                    .35*
                    Math.sin(
                      time*
                      .0007+
                      index*
                      1.37,
                    )
                  )
                : .52

            ctx.fillStyle=
              `rgba(208,226,250,${
                Math.max(
                  .10,
                  pulse,
                )
              })`

            ctx.beginPath()

            ctx.arc(
              point[0]*
              width,

              point[1]*
              height,

              index===0
                ? 1.45
                : .9,

              0,
              TAU,
            )

            ctx.fill()
          },
        )
      }
    }

    function draw(
      time:number,
    ){

      ctx.clearRect(
        0,
        0,
        width,
        height,
      )

      if(
        atmosphere
      ){

        ctx.fillStyle=
          atmosphere

        ctx.fillRect(
          0,
          0,
          width,
          height,
        )
      }

      const elapsed=
        Math.max(
          0,
          (
            time-
            sceneStart
          )/
          1000,
        )

      for(
        const star
        of stars
      ){
        drawStar(
          star,
          elapsed,
          time,
        )
      }

      drawConstellations(
        time,
      )

      frameCounter++

      element.dataset.frames=
        String(
          frameCounter,
        )

      element.dataset.animated=
        animated
          ? 'true'
          : 'false'
    }

    function loop(
      time:number,
    ){

      raf=0

      if(
        disposed ||
        document.hidden ||
        !animated
      ){
        return
      }

      /*
       * Sky motion is intentionally slow.
       * 24fps on mobile is plenty for stars and saves battery.
       */
      const interval=
        mobile
          ? 42
          : 30

      if(
        time-
        lastFrame>=
        interval
      ){

        lastFrame=
          time

        draw(
          time,
        )
      }

      raf=
        requestAnimationFrame(
          loop,
        )
    }

    function start(){

      if(
        disposed ||
        !animated ||
        document.hidden ||
        raf
      ){
        return
      }

      raf=
        requestAnimationFrame(
          loop,
        )
    }

    function stop(){

      if(
        raf
      ){
        cancelAnimationFrame(
          raf,
        )
      }

      raf=0
    }

    function onVisibility(){

      if(
        document.hidden
      ){
        stop()
      }else{
        start()
      }
    }

    function onResize(){

      if(
        resizeTimer
      ){
        window.clearTimeout(
          resizeTimer,
        )
      }

      resizeTimer=
        window.setTimeout(
          resize,
          100,
        )
    }

    window.addEventListener(
      'resize',
      onResize,
      {
        passive:true,
      },
    )

    document.addEventListener(
      'visibilitychange',
      onVisibility,
    )

    resize()

    start()

    return()=>{

      disposed=true

      stop()

      if(
        resizeTimer
      ){
        window.clearTimeout(
          resizeTimer,
        )
      }

      window.removeEventListener(
        'resize',
        onResize,
      )

      document.removeEventListener(
        'visibilitychange',
        onVisibility,
      )
    }

  },[
    animated,
  ])

  return (
    <canvas
      ref={canvas}
      className="cosmic-background"
      aria-hidden="true"
      data-visual="living-starfield"
    />
  )
}
