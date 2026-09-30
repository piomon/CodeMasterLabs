import {
  validateReview,
  publicRating,
  type RatingDistribution,
} from '@/lib/review-validation'

import {
  verifyChallenge,
} from '@/lib/turnstile'

import {
  getCMS,
} from '@/lib/site-data'

import {
  actorKey,
  originAllowed,
  verifyToken,
  isUniqueConflict,
} from '@/lib/form-security'

import {
  claimRateSlot,
} from '@/lib/rate-limit'

import {
  readBody,
  BodyError,
} from '@/lib/http-body'

import {
  PRIVACY_VERSION,
  TOKEN_NEW_MAX_AGE,
  TOKEN_RECOVERY_MAX_AGE,
  sameReview,
} from '@/lib/submission-policy'

export const dynamic=
  'force-dynamic'

export const runtime=
  'nodejs'

function reply(
  data:object,
  status=200,
){

  return Response.json(
    data,
    {
      status,
      headers:{
        'Cache-Control':
          'no-store',

        'X-Content-Type-Options':
          'nosniff',

        ...(
          status===429
            ? {
                'Retry-After':
                  '900',
              }
            : {}
        ),
      },
    },
  )
}

async function statistics(
  cms:Awaited<
    ReturnType<
      typeof getCMS
    >
  >,
  locale:'pl'|'en',
){

  const distribution:
    RatingDistribution={
      1:0,
      2:0,
      3:0,
      4:0,
      5:0,
    }

  let ratingCount=0
  let ratingSum=0
  let page=1
  let pages=1

  do{

    const result=
      await cms.find({
        collection:
          'testimonials',

        overrideAccess:false,
        locale,
        limit:100,
        page,
        sort:'id',
        depth:0,
      })

    pages=
      Math.max(
        1,
        result.totalPages,
      )

    for(
      const item of
        result.docs
    ){

      const rating=
        publicRating(
          item.rating,
        )

      if(
        rating!==null
      ){
        ratingCount++
        ratingSum+=rating
        distribution[
          rating
        ]++
      }
    }

    page++

  }while(
    page<=pages
  )

  return {
    ratingCount,

    averageRating:
      ratingCount
        ? Number(
            (
              ratingSum /
              ratingCount
            ).toFixed(2),
          )
        : null,

    distribution,
  }
}

export async function GET(
  req:Request,
){

  try{

    const url=
      new URL(
        req.url,
      )

    const locale:
      'pl'|'en'=
        url.searchParams.get(
          'locale',
        )==='en'
          ? 'en'
          : 'pl'

    const scope=
      url.searchParams.get(
        'scope',
      )==='all'
        ? 'all'
        : 'carousel'

    const limit=
      scope==='all'
        ? 100
        : 12

    const raw=
      Number(
        url.searchParams.get(
          'page',
        )||1,
      )

    const page=
      Number.isSafeInteger(
        raw,
      ) &&
      raw>0
        ? Math.min(
            raw,
            10000,
          )
        : 1

    const cms=
      await getCMS()

    let result=
      await cms.find({
        collection:
          'testimonials',

        overrideAccess:false,
        locale,
        limit,
        page,
        sort:'-createdAt',
        depth:0,
      })

    const pages=
      Math.max(
        1,
        result.totalPages,
      )

    const actualPage=
      Math.min(
        page,
        pages,
      )

    if(
      actualPage!==page
    ){
      result=
        await cms.find({
          collection:
            'testimonials',

          overrideAccess:false,
          locale,
          limit,
          page:
            actualPage,
          sort:'-createdAt',
          depth:0,
        })
    }

    const stats=
      await statistics(
        cms,
        locale,
      )

    return reply({
      reviews:
        result.docs.map(
          review=>({
            id:
              review.id,

            name:
              review.name,

            quote:
              review.quote,

            rating:
              publicRating(
                review.rating,
              ),

            company:
              review.company,
          }),
        ),

      total:
        result.totalDocs,

      pages,

      page:
        actualPage,

      ...stats,
    })

  }catch{

    return reply(
      {
        error:
          'Opinie sa chwilowo niedostepne.',
      },
      503,
    )
  }
}

export async function POST(
  req:Request,
){

  const secret=
    process.env.PAYLOAD_SECRET

  const token=
    req.headers.get(
      'x-form-token',
    )||''

  if(
    !secret
  ){
    return reply(
      {
        ok:false,
        code:'UNAVAILABLE',
      },
      503,
    )
  }

  if(
    !originAllowed(
      req.headers,
      process.env.SERVER_URL ||
      process.env.NEXT_PUBLIC_SERVER_URL ||
      'http://localhost:3000',
    )
  ){
    return reply(
      {
        ok:false,
        code:'ORIGIN',
      },
      403,
    )
  }

  const checked=
    verifyToken(
      token,
      secret,
      Date.now(),
      TOKEN_RECOVERY_MAX_AGE,
    )

  if(
    !checked.ok
  ){
    return reply(
      {
        ok:false,
        code:
          'TOKEN_INVALID',
      },
      403,
    )
  }

  if(
    !/^application\/json(?:;|$)/i.test(
      req.headers.get(
        'content-type',
      )||'',
    )
  ){
    return reply(
      {
        ok:false,
        code:'FORMAT',
      },
      415,
    )
  }

  try{

    let data:
      Record<
        string,
        unknown
      >

    try{

      data=
        JSON.parse(
          (
            await readBody(
              req,
              12000,
            )
          ).toString(
            'utf8',
          ),
        )

    }catch(error){

      if(
        error instanceof
          BodyError
      ){
        throw error
      }

      return reply(
        {
          ok:false,
          code:'FORMAT',
        },
        400,
      )
    }

    if(
      !data ||
      typeof data!=='object' ||
      Array.isArray(data)
    ){
      return reply(
        {
          ok:false,
          code:
            'VALIDATION',
        },
        422,
      )
    }

    const allowed=
      new Set([
        'name',
        'quote',
        'rating',
        'consent',
        'website',
        'locale',
        'challengeToken',
      ])

    if(
      Object.keys(
        data,
      ).some(
        key=>
          !allowed.has(
            key,
          ),
      )
    ){
      return reply(
        {
          ok:false,
          code:
            'VALIDATION',
        },
        422,
      )
    }

    const {
      website,
    }=data

    if(
      website
    ){
      return reply({
        ok:true,
      })
    }

    const validated=
      validateReview(
        data,
      )

    if(
      !validated.ok
    ){
      return reply(
        {
          ok:false,
          code:
            'VALIDATION',

          fields:
            validated.fields,
        },
        422,
      )
    }

    const {
      name,
      quote,
      rating,
      locale:lang,
    }=
      validated.data

    const cms=
      await getCMS()

    const normalized={
      name,
      quote,
      rating,
    }

    if(
      !await claimRateSlot(
        cms,
        actorKey(
          req.headers,
          secret,
        ),
        'review-attempt',
        30,
      )
    ){
      return reply(
        {
          ok:false,
          code:
            'RATE_LIMIT',
        },
        429,
      )
    }

    const find=
      async()=>(
        await cms.find({
          collection:
            'testimonials',

          overrideAccess:true,
          draft:true,
          locale:lang,
          limit:1,

          where:{
            submissionKey:{
              equals:
                checked.key,
            },
          },
        })
      ).docs[0]

    const existing=
      await find()

    if(
      existing
    ){

      return sameReview(
        existing as unknown as
          Record<
            string,
            unknown
          >,
        normalized,
      )
        ? reply({
            ok:true,
          })
        : reply(
            {
              ok:false,
              code:
                'IDEMPOTENCY_CONFLICT',
            },
            409,
          )
    }

    if(
      Date.now()-
      Number(
        token.split(
          '.',
        )[0],
      )>
      TOKEN_NEW_MAX_AGE
    ){
      return reply(
        {
          ok:false,
          code:
            'TOKEN_EXPIRED',
        },
        403,
      )
    }

    if(
      !await claimRateSlot(
        cms,
        actorKey(
          req.headers,
          secret,
        ),
        'review',
        3,
      )
    ){
      return reply(
        {
          ok:false,
          code:
            'RATE_LIMIT',
        },
        429,
      )
    }

    if(
      !await verifyChallenge(
        data.challengeToken,
        'review',
      )
    ){
      return reply(
        {
          ok:false,
          code:
            'CHALLENGE',
        },
        403,
      )
    }

    try{

      await cms.create({
        collection:
          'testimonials',

        overrideAccess:true,
        draft:true,
        locale:lang,

        data:{
          ...normalized,

          submissionKey:
            checked.key,

          consentAcceptedAt:
            new Date()
              .toISOString(),

          consentVersion:
            PRIVACY_VERSION,

          featured:false,
          _status:'draft',
        },
      })

    }catch(error){

      if(
        !isUniqueConflict(
          error,
        )
      ){
        throw error
      }

      const raced=
        await find()

      if(
        !raced
      ){
        throw error
      }

      if(
        !sameReview(
          raced as unknown as
            Record<
              string,
              unknown
            >,
          normalized,
        )
      ){
        return reply(
          {
            ok:false,
            code:
              'IDEMPOTENCY_CONFLICT',
          },
          409,
        )
      }
    }

    return reply(
      {
        ok:true,
      },
      201,
    )

  }catch(error){

    if(
      error instanceof
        BodyError
    ){
      return reply(
        {
          ok:false,
          code:
            error.code,
        },
        error.status,
      )
    }

    return reply(
      {
        ok:false,
        code:
          'UNAVAILABLE',
      },
      503,
    )
  }
}
