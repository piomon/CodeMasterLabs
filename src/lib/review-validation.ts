import type {
  Locale,
} from '@/types/site'

export type ReviewRating=
  1|2|3|4|5

export type ReviewInput={
  name:string
  quote:string
  rating:number
  consent:true
  locale:Locale
}

export type PublicReview={
  id:number|string
  name:string
  quote:string
  rating:number|null
  company?:string|null
}

export type RatingDistribution={
  1:number
  2:number
  3:number
  4:number
  5:number
}

export type PublicReviewPage={
  reviews:PublicReview[]
  total:number
  pages:number
  page:number
  averageRating:number|null
  ratingCount:number
  distribution:RatingDistribution
}

export function validateReview(
  input:unknown,
):
  | {
      ok:true
      data:ReviewInput
    }
  | {
      ok:false
      fields:Record<string,string>
    }
{

  if(
    !input ||
    typeof input!=='object' ||
    Array.isArray(input)
  ){
    return {
      ok:false,
      fields:{
        form:'Invalid request.',
      },
    }
  }

  const value=
    input as Record<
      string,
      unknown
    >

  const en=
    value.locale==='en'

  const fields:
    Record<string,string>={}

  const name=
    typeof value.name==='string'
      ? value.name.trim()
      : ''

  const quote=
    typeof value.quote==='string'
      ? value.quote.trim()
      : ''

  if(
    name.length<2 ||
    name.length>100 ||
    /[\x00-\x1f\x7f]/.test(name)
  ){
    fields.name=
      en
        ? 'Use a name of 2 to 100 characters.'
        : 'Nazwa musi mieć od 2 do 100 znaków.'
  }

  if(
    quote.length<20 ||
    quote.length>2000 ||
    /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(
      quote,
    )
  ){
    fields.quote=
      en
        ? 'Use 20 to 2000 characters.'
        : 'Opinia musi mieć od 20 do 2000 znaków.'
  }

  if(
    typeof value.rating!=='number' ||
    !Number.isInteger(
      value.rating,
    ) ||
    value.rating<1 ||
    value.rating>5
  ){
    fields.rating=
      en
        ? 'Choose a rating from 1 to 5.'
        : 'Wybierz ocenę od 1 do 5.'
  }

  if(
    value.consent!==true
  ){
    fields.consent=
      en
        ? 'Publication requires your consent.'
        : 'Publikacja wymaga Twojej zgody.'
  }

  if(
    value.locale!==undefined &&
    value.locale!=='pl' &&
    value.locale!=='en'
  ){
    fields.locale=
      'Invalid locale.'
  }

  if(
    Object.keys(
      fields,
    ).length
  ){
    return {
      ok:false,
      fields,
    }
  }

  return {
    ok:true,
    data:{
      name,
      quote,
      rating:
        value.rating as number,
      consent:true,
      locale:
        en
          ? 'en'
          : 'pl',
    },
  }
}

export function publicRating(
  value:unknown,
):ReviewRating|null{

  return (
    typeof value==='number' &&
    Number.isInteger(value) &&
    value>=1 &&
    value<=5
  )
    ? value as ReviewRating
    : null
}

function emptyDistribution():
  RatingDistribution
{
  return {
    1:0,
    2:0,
    3:0,
    4:0,
    5:0,
  }
}

export function reviewPage(
  value:unknown,
  maxReviews=12,
):PublicReviewPage|null{

  if(
    !value ||
    typeof value!=='object' ||
    Array.isArray(value)
  ){
    return null
  }

  const input=
    value as Record<
      string,
      unknown
    >

  if(
    !Array.isArray(
      input.reviews,
    ) ||
    input.reviews.length>
      maxReviews ||
    !Number.isSafeInteger(
      input.total,
    ) ||
    Number(
      input.total,
    )<0 ||
    !Number.isSafeInteger(
      input.pages,
    ) ||
    Number(
      input.pages,
    )<1
  ){
    return null
  }

  const reviews:
    PublicReview[]=[]

  for(
    const item of
      input.reviews
  ){

    if(
      !item ||
      typeof item!=='object'
    ){
      return null
    }

    const review=
      item as Record<
        string,
        unknown
      >

    if(
      ![
        'string',
        'number',
      ].includes(
        typeof review.id,
      ) ||
      typeof review.name!=='string' ||
      typeof review.quote!=='string'
    ){
      return null
    }

    reviews.push({
      id:
        review.id as
          number|string,

      name:
        review.name,

      quote:
        review.quote,

      rating:
        publicRating(
          review.rating,
        ),

      company:
        typeof review.company==='string'
          ? review.company
          : null,
    })
  }

  const page=
    Number.isSafeInteger(
      input.page,
    ) &&
    Number(
      input.page,
    )>0
      ? Number(
          input.page,
        )
      : 1

  if(
    input.ratingCount===undefined &&
    input.averageRating===undefined &&
    input.distribution===undefined
  ){
    return {
      reviews,
      total:
        Number(
          input.total,
        ),
      pages:
        Number(
          input.pages,
        ),
      page,
      averageRating:null,
      ratingCount:0,
      distribution:
        emptyDistribution(),
    }
  }

  if(
    !Number.isSafeInteger(
      input.ratingCount,
    ) ||
    Number(
      input.ratingCount,
    )<0 ||
    Number(
      input.ratingCount,
    )>
      Number(
        input.total,
      )
  ){
    return null
  }

  const rawDistribution=
    input.distribution

  if(
    !rawDistribution ||
    typeof rawDistribution!=='object' ||
    Array.isArray(
      rawDistribution,
    )
  ){
    return null
  }

  const distribution=
    emptyDistribution()

  for(
    const rating of
      [1,2,3,4,5] as const
  ){

    const amount=
      (
        rawDistribution as
          Record<
            string,
            unknown
          >
      )[String(rating)]

    if(
      !Number.isSafeInteger(
        amount,
      ) ||
      Number(amount)<0
    ){
      return null
    }

    distribution[rating]=
      Number(amount)
  }

  const ratingCount=
    Number(
      input.ratingCount,
    )

  const sum=
    distribution[1]+
    distribution[2]+
    distribution[3]+
    distribution[4]+
    distribution[5]

  if(
    sum!==ratingCount
  ){
    return null
  }

  let averageRating:
    number|null=null

  if(
    ratingCount===0
  ){

    if(
      input.averageRating!==null
    ){
      return null
    }

  }else{

    if(
      typeof input.averageRating!=='number' ||
      !Number.isFinite(
        input.averageRating,
      ) ||
      input.averageRating<1 ||
      input.averageRating>5
    ){
      return null
    }

    averageRating=
      input.averageRating
  }

  return {
    reviews,
    total:
      Number(
        input.total,
      ),
    pages:
      Number(
        input.pages,
      ),
    page,
    averageRating,
    ratingCount,
    distribution,
  }
}
