'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type FocusEvent,
} from 'react'

import {
  validateReview,
  reviewPage,
  type PublicReview,
  type RatingDistribution,
} from '@/lib/review-validation'

import {
  createReviewSubmission,
} from '@/lib/contact-client'

import {
  pagePath,
} from '@/lib/i18n'

import type {
  Locale,
} from '@/types/site'

import './reviews.css'

type RatingFilter=
  0|1|2|3|4|5

const ratings=
  [5,4,3,2,1] as const

const emptyDistribution:
  RatingDistribution={
    1:0,
    2:0,
    3:0,
    4:0,
    5:0,
  }

function initials(
  name:string,
){

  return name
    .trim()
    .split(
      /\s+/,
    )
    .slice(
      0,
      2,
    )
    .map(
      part=>
        part[0]||'',
    )
    .join('')
    .toUpperCase()
}

function ReviewCard({
  review,
  full=false,
}:{
  review:PublicReview
  full?:boolean
}){

  return (
    <article
      className={
        full
          ? 'review-card review-card-full'
          : 'review-card review-card-carousel'
      }
      data-review-slide={
        full
          ? undefined
          : 'true'
      }
    >

      <span
        className="review-quote-mark"
        aria-hidden="true"
      >
        “
      </span>

      {review.rating!==null && (
        <div
          className="review-stars"
          aria-label={
            `${review.rating}/5`
          }
        >
          {'★'.repeat(
            review.rating,
          )}

          <span aria-hidden="true">
            {'☆'.repeat(
              5-review.rating,
            )}
          </span>
        </div>
      )}

      <blockquote>
        {review.quote}
      </blockquote>

      <footer className="review-author">

        <span
          className="review-avatar"
          aria-hidden="true"
        >
          {initials(
            review.name,
          )}
        </span>

        <span className="review-author-copy">
          <strong>
            {review.name}
          </strong>

          {review.company && (
            <small>
              {review.company}
            </small>
          )}
        </span>

      </footer>

    </article>
  )
}

export function Reviews({
  locale,
}:{
  locale:Locale
}){

  const pl=
    locale==='pl'

  const session=
    useRef(
      createReviewSubmission(),
    )

  const carousel=
    useRef<HTMLDivElement>(
      null,
    )

  const [
    reviews,
    setReviews,
  ]=
    useState<
      PublicReview[]
    >([])

  const [
    total,
    setTotal,
  ]=
    useState(0)

  const [
    averageRating,
    setAverageRating,
  ]=
    useState<
      number|null
    >(null)

  const [
    ratingCount,
    setRatingCount,
  ]=
    useState(0)

  const [
    distribution,
    setDistribution,
  ]=
    useState<
      RatingDistribution
    >(
      emptyDistribution,
    )

  const [
    ready,
    setReady,
  ]=
    useState(false)

  const [
    error,
    setError,
  ]=
    useState(false)

  const [
    autoPlay,
    setAutoPlay,
  ]=
    useState(true)

  const [
    interactionPause,
    setInteractionPause,
  ]=
    useState(false)

  const [
    reducedMotion,
    setReducedMotion,
  ]=
    useState(false)

  const [
    expanded,
    setExpanded,
  ]=
    useState(false)

  const [
    allReviews,
    setAllReviews,
  ]=
    useState<
      PublicReview[]
    >([])

  const [
    allLoaded,
    setAllLoaded,
  ]=
    useState(false)

  const [
    allLoading,
    setAllLoading,
  ]=
    useState(false)

  const [
    allError,
    setAllError,
  ]=
    useState(false)

  const [
    filter,
    setFilter,
  ]=
    useState<
      RatingFilter
    >(0)

  const [
    formOpen,
    setFormOpen,
  ]=
    useState(false)

  const [
    sending,
    setSending,
  ]=
    useState(false)

  const [
    sent,
    setSent,
  ]=
    useState(false)

  const [
    failed,
    setFailed,
  ]=
    useState(false)

  const [
    pending,
    setPending,
  ]=
    useState(false)

  const [
    failureReason,
    setFailureReason,
  ]=
    useState('')

  useEffect(()=>{

    const media=
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      )

    const update=()=>{
      setReducedMotion(
        media.matches,
      )
    }

    update()

    media.addEventListener(
      'change',
      update,
    )

    return()=>{
      media.removeEventListener(
        'change',
        update,
      )
    }

  },[])

  useEffect(()=>{

    const controller=
      new AbortController()

    setReady(false)
    setError(false)

    setExpanded(false)
    setAllReviews([])
    setAllLoaded(false)
    setAllError(false)
    setFilter(0)

    fetch(
      `/api/reviews?locale=${locale}`,
      {
        signal:
          AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(
              15000,
            ),
          ]),
      },
    )
      .then(
        async response=>{

          if(
            !response.ok
          ){
            throw Error()
          }

          return response.json()
        },
      )
      .then(
        value=>{

          if(
            controller.signal.aborted
          ){
            return
          }

          const data=
            reviewPage(
              value,
              12,
            )

          if(
            !data
          ){
            throw Error(
              'INVALID_REVIEW_PAGE',
            )
          }

          setReviews(
            data.reviews,
          )

          setTotal(
            data.total,
          )

          setAverageRating(
            data.averageRating,
          )

          setRatingCount(
            data.ratingCount,
          )

          setDistribution(
            data.distribution,
          )

          setReady(true)
        },
      )
      .catch(()=>{

        if(
          !controller.signal.aborted
        ){
          setError(true)
        }
      })

    return()=>{
      controller.abort()
    }

  },[
    locale,
  ])

  const moveCarousel=
    useCallback(
      (
        direction:
          -1|1,
      )=>{

        const node=
          carousel.current

        if(
          !node
        ){
          return
        }

        const cards=
          Array.from(
            node.querySelectorAll<
              HTMLElement
            >(
              '[data-review-slide="true"]',
            ),
          )

        if(
          cards.length<2
        ){
          return
        }

        let nearest=0
        let distance=
          Number.POSITIVE_INFINITY

        cards.forEach(
          (
            card,
            index,
          )=>{

            const currentDistance=
              Math.abs(
                card.offsetLeft-
                node.scrollLeft,
              )

            if(
              currentDistance<
              distance
            ){
              distance=
                currentDistance

              nearest=
                index
            }
          },
        )

        let next=
          nearest+
          direction

        if(
          next>=cards.length
        ){
          next=0
        }

        if(
          next<0
        ){
          next=
            cards.length-1
        }

        node.scrollTo({
          left:
            cards[next]
              .offsetLeft,

          behavior:
            reducedMotion
              ? 'auto'
              : 'smooth',
        })
      },
      [
        reducedMotion,
      ],
    )

  useEffect(()=>{

    if(
      reducedMotion ||
      !autoPlay ||
      interactionPause ||
      reviews.length<2
    ){
      return
    }

    const timer=
      window.setInterval(
        ()=>{
          moveCarousel(1)
        },
        5000,
      )

    return()=>{
      window.clearInterval(
        timer,
      )
    }

  },[
    reducedMotion,
    autoPlay,
    interactionPause,
    reviews.length,
    moveCarousel,
  ])

  async function loadAllReviews(){

    if(
      allLoaded ||
      allLoading
    ){
      return
    }

    setAllLoading(true)
    setAllError(false)

    try{

      const collected:
        PublicReview[]=[]

      let page=1
      let pages=1

      do{

        const response=
          await fetch(
            `/api/reviews?locale=${locale}&scope=all&page=${page}`,
            {
              signal:
                AbortSignal.timeout(
                  15000,
                ),
            },
          )

        if(
          !response.ok
        ){
          throw Error(
            'REVIEWS_HTTP',
          )
        }

        const data=
          reviewPage(
            await response.json(),
            100,
          )

        if(
          !data
        ){
          throw Error(
            'REVIEWS_DATA',
          )
        }

        collected.push(
          ...data.reviews,
        )

        pages=
          data.pages

        page++

      }while(
        page<=pages
      )

      const unique=
        Array.from(
          new Map(
            collected.map(
              review=>[
                String(
                  review.id,
                ),
                review,
              ],
            ),
          ).values(),
        )

      setAllReviews(
        unique,
      )

      setAllLoaded(true)

    }catch{

      setAllError(true)

    }finally{

      setAllLoading(false)
    }
  }

  async function toggleExpanded(){

    const next=
      !expanded

    setExpanded(
      next,
    )

    if(
      next &&
      !allLoaded
    ){
      await loadAllReviews()
    }
  }

  async function submit(
    event:
      FormEvent<
        HTMLFormElement
      >,
  ){

    event.preventDefault()

    if(
      sending
    ){
      return
    }

    const form=
      new FormData(
        event.currentTarget,
      )

    const input={
      name:
        form.get(
          'name',
        ),

      quote:
        form.get(
          'quote',
        ),

      rating:
        Number(
          form.get(
            'rating',
          ),
        ),

      consent:
        form.get(
          'consent',
        )==='on',

      locale,
    }

    const validated=
      validateReview(
        input,
      )

    if(
      !session.current.pending &&
      !validated.ok
    ){
      setFailureReason(
        Object.values(
          validated.fields,
        )[0],
      )

      setFailed(true)
      return
    }

    setSending(true)
    setFailed(false)
    setFailureReason('')

    try{

      const value=
        validated.ok
          ? validated.data
          : {
              name:'',
              quote:'',
              rating:5,
              consent:
                true as const,
              locale,
            }

      const result=
        await session.current.submit({
          ...value,

          website:
            String(
              form.get(
                'website',
              )||'',
            ),
        })

      if(
        !result.ok
      ){

        setFailureReason(
          result.fields
            ? Object.values(
                result.fields,
              )[0]
            : result.code===
                'RATE_LIMIT'
              ? (
                  pl
                    ? 'Zbyt wiele prób. Spróbuj później.'
                    : 'Too many attempts. Please try later.'
                )
              : '',
        )

        throw Error(
          'NOT_SAVED',
        )
      }

      setSent(true)

    }catch{

      setFailed(true)

    }finally{

      setSending(false)

      setPending(
        session.current.pending,
      )
    }
  }

  function handleFocusLeave(
    event:
      FocusEvent<
        HTMLDivElement
      >,
  ){

    const next=
      event.relatedTarget

    if(
      next instanceof Node &&
      event.currentTarget.contains(
        next,
      )
    ){
      return
    }

    setInteractionPause(
      false,
    )
  }

  const formattedAverage=
    averageRating===null
      ? ''
      : new Intl.NumberFormat(
          pl
            ? 'pl-PL'
            : 'en-GB',
          {
            minimumFractionDigits:1,
            maximumFractionDigits:2,
          },
        ).format(
          averageRating,
        )

  const filtered=
    useMemo(
      ()=>(
        filter===0
          ? allReviews
          : allReviews.filter(
              review=>
                review.rating===
                filter,
            )
      ),
      [
        allReviews,
        filter,
      ],
    )

  const scorePercent=
    averageRating===null
      ? 0
      : Math.max(
          0,
          Math.min(
            100,
            averageRating/5*100,
          ),
        )

  return (
    <section
      className="section reviews-section"
      id="reviews"
    >

      <div className="container">

        <header className="reviews-heading">

          <div>
            <p className="eyebrow">
              {pl
                ? 'OPINIE KLIENTÓW'
                : 'CUSTOMER REVIEWS'}
            </p>

            <h2>
              {pl
                ? 'Doświadczenia klientów.'
                : 'Client experiences.'}
            </h2>
          </div>

          {ready &&
            ratingCount>0 &&
            averageRating!==null && (

              <div
                className="reviews-score-compact"
                aria-label={
                  pl
                    ? `Średnia ${formattedAverage} na 5 na podstawie ${ratingCount} ocen`
                    : `Average ${formattedAverage} out of 5 based on ${ratingCount} ratings`
                }
              >

                <span
                  aria-hidden="true"
                >
                  ★
                </span>

                <strong>
                  {formattedAverage}
                </strong>

                <small>
                  / 5
                  {' · '}
                  {ratingCount}
                  {' '}
                  {pl
                    ? (
                        ratingCount===1
                          ? 'ocena'
                          : 'ocen'
                      )
                    : (
                        ratingCount===1
                          ? 'rating'
                          : 'ratings'
                      )}
                </small>

              </div>
            )}

        </header>

        {error ? (

          <p role="alert">
            {pl
              ? 'Nie udało się pobrać opinii. Odśwież stronę.'
              : 'Could not load reviews. Please refresh.'}
          </p>

        ) : !ready ? (

          <p role="status">
            {pl
              ? 'Pobieranie opinii…'
              : 'Loading reviews…'}
          </p>

        ) : reviews.length>0 ? (

          <div
            className="review-carousel-shell"
            role="region"
            aria-roledescription={
              pl
                ? 'karuzela'
                : 'carousel'
            }
            aria-label={
              pl
                ? 'Najnowsze opinie klientów'
                : 'Latest customer reviews'
            }
            onMouseEnter={()=>
              setInteractionPause(
                true,
              )
            }
            onMouseLeave={()=>
              setInteractionPause(
                false,
              )
            }
            onFocusCapture={()=>
              setInteractionPause(
                true,
              )
            }
            onBlurCapture={
              handleFocusLeave
            }
          >

            <div
              className="reviews-carousel"
              ref={carousel}
            >
              {reviews.map(
                review=>(
                  <ReviewCard
                    key={
                      review.id
                    }
                    review={
                      review
                    }
                  />
                ),
              )}
            </div>

            {reviews.length>1 && (

              <div className="review-carousel-controls">

                <div>
                  <button
                    type="button"
                    className="review-control-button"
                    onClick={()=>
                      moveCarousel(
                        -1,
                      )
                    }
                    aria-label={
                      pl
                        ? 'Poprzednia opinia'
                        : 'Previous review'
                    }
                  >
                    ←
                  </button>

                  <button
                    type="button"
                    className="review-control-button"
                    onClick={()=>
                      moveCarousel(
                        1,
                      )
                    }
                    aria-label={
                      pl
                        ? 'Następna opinia'
                        : 'Next review'
                    }
                  >
                    →
                  </button>
                </div>

                {!reducedMotion && (
                  <button
                    type="button"
                    className="review-autoplay-button"
                    aria-pressed={
                      !autoPlay
                    }
                    onClick={()=>
                      setAutoPlay(
                        value=>
                          !value,
                      )
                    }
                  >
                    {autoPlay
                      ? (
                          pl
                            ? 'Wstrzymaj'
                            : 'Pause'
                        )
                      : (
                          pl
                            ? 'Wznów'
                            : 'Play'
                        )}
                  </button>
                )}

              </div>
            )}

          </div>

        ) : null}

        {ready && (
          <div className="reviews-actions">

            {total>0 && (
              <button
                type="button"
                className="reviews-primary-action"
                aria-expanded={
                  expanded
                }
                aria-controls="reviews-expanded"
                onClick={
                  toggleExpanded
                }
              >
                {expanded
                  ? (
                      pl
                        ? 'Zwiń opinie'
                        : 'Hide reviews'
                    )
                  : (
                      pl
                        ? 'Zobacz wszystkie opinie i statystyki'
                        : 'See all reviews and statistics'
                    )}
              </button>
            )}

            <button
              type="button"
              className="reviews-secondary-action"
              aria-expanded={
                formOpen
              }
              aria-controls="review-form-panel"
              onClick={()=>
                setFormOpen(
                  value=>
                    !value,
                )
              }
            >
              {formOpen
                ? (
                    pl
                      ? 'Zamknij formularz'
                      : 'Close form'
                  )
                : (
                    pl
                      ? 'Dodaj opinię'
                      : 'Write a review'
                  )}
            </button>

          </div>
        )}

        {expanded && (
          <section
            className="reviews-expanded"
            id="reviews-expanded"
          >

            <div className="reviews-expanded-heading">
              <div>
                <p className="eyebrow">
                  {pl
                    ? 'PEŁNY OBRAZ'
                    : 'FULL VIEW'}
                </p>

                <h3>
                  {pl
                    ? 'Wszystkie opinie i statystyki'
                    : 'All reviews and statistics'}
                </h3>
              </div>

              <span className="reviews-total">
                {total}
                {' '}
                {pl
                  ? (
                      total===1
                        ? 'opinia'
                        : 'opinii'
                    )
                  : (
                      total===1
                        ? 'review'
                        : 'reviews'
                    )}
              </span>
            </div>

            <div className="reviews-insights">

              <div className="review-stat-card review-stat-score">

                <div
                  className="review-score-ring"
                  style={{
                    background:
                      `conic-gradient(#f2ce78 0% ${scorePercent}%, #293241 ${scorePercent}% 100%)`,
                  }}
                >

                  <div>
                    <strong>
                      {averageRating===null
                        ? '—'
                        : formattedAverage}
                    </strong>

                    <span>
                      /5
                    </span>
                  </div>

                </div>

                <div>
                  <small>
                    {pl
                      ? 'ŚREDNIA OCENA'
                      : 'AVERAGE RATING'}
                  </small>

                  <strong>
                    {ratingCount}
                    {' '}
                    {pl
                      ? (
                          ratingCount===1
                            ? 'ocena'
                            : 'ocen'
                        )
                      : (
                          ratingCount===1
                            ? 'rating'
                            : 'ratings'
                        )}
                  </strong>
                </div>

              </div>

              <div className="review-stat-card review-stat-total">

                <small>
                  {pl
                    ? 'OPINIE W BAZIE PUBLICZNEJ'
                    : 'PUBLIC REVIEWS'}
                </small>

                <strong>
                  {total}
                </strong>

                <span>
                  {pl
                    ? 'pełnych opinii klientów'
                    : 'customer reviews'}
                </span>

              </div>

              <div className="review-stat-card review-rating-distribution">

                <small>
                  {pl
                    ? 'ROZKŁAD OCEN'
                    : 'RATING DISTRIBUTION'}
                </small>

                <div className="reviews-rating-bars">

                  {ratings.map(
                    rating=>{

                      const count=
                        distribution[
                          rating
                        ]

                      const percent=
                        ratingCount
                          ? Math.round(
                              count/
                              ratingCount*
                              100,
                            )
                          : 0

                      return (
                        <div
                          className="review-rating-row"
                          key={
                            rating
                          }
                        >

                          <span>
                            {rating}
                            {' '}
                            ★
                          </span>

                          <div className="review-rating-track">
                            <span
                              style={{
                                width:
                                  `${percent}%`,
                              }}
                            />
                          </div>

                          <strong>
                            {count}
                          </strong>

                        </div>
                      )
                    },
                  )}

                </div>

              </div>

            </div>

            <div className="reviews-list-toolbar">

              <strong>
                {pl
                  ? 'Przeglądaj opinie'
                  : 'Browse reviews'}
              </strong>

              <div
                className="review-filter"
                role="group"
                aria-label={
                  pl
                    ? 'Filtr ocen'
                    : 'Rating filter'
                }
              >

                <button
                  type="button"
                  className={
                    filter===0
                      ? 'active'
                      : ''
                  }
                  aria-pressed={
                    filter===0
                  }
                  onClick={()=>
                    setFilter(0)
                  }
                >
                  {pl
                    ? 'Wszystkie'
                    : 'All'}
                </button>

                {ratings.map(
                  rating=>(
                    <button
                      type="button"
                      key={
                        rating
                      }
                      className={
                        filter===rating
                          ? 'active'
                          : ''
                      }
                      aria-pressed={
                        filter===rating
                      }
                      onClick={()=>
                        setFilter(
                          rating,
                        )
                      }
                    >
                      {rating}
                      {' '}
                      ★
                    </button>
                  ),
                )}

              </div>

            </div>

            {allLoading && (
              <p role="status">
                {pl
                  ? 'Pobieranie wszystkich opinii…'
                  : 'Loading all reviews…'}
              </p>
            )}

            {allError && (
              <div className="review-load-error">
                <p role="alert">
                  {pl
                    ? 'Nie udało się pobrać pełnej listy.'
                    : 'Could not load the full list.'}
                </p>

                <button
                  type="button"
                  onClick={()=>{
                    setAllLoaded(
                      false,
                    )
                    setAllError(
                      false,
                    )
                    void loadAllReviews()
                  }}
                >
                  {pl
                    ? 'Spróbuj ponownie'
                    : 'Try again'}
                </button>
              </div>
            )}

            {allLoaded && (
              <div className="review-all-grid">

                {filtered.map(
                  review=>(
                    <ReviewCard
                      key={
                        review.id
                      }
                      review={
                        review
                      }
                      full
                    />
                  ),
                )}

              </div>
            )}

          </section>
        )}

        {formOpen && (
          <section
            className="review-submit"
            id="review-form-panel"
          >

            <div className="review-submit-heading">
              <div>
                <p className="eyebrow">
                  {pl
                    ? 'TWOJE DOŚWIADCZENIE'
                    : 'YOUR EXPERIENCE'}
                </p>

                <h3>
                  {pl
                    ? 'Dodaj swoją opinię'
                    : 'Write a review'}
                </h3>
              </div>
            </div>

            {sent ? (

              <div
                className="review-success"
                role="status"
              >
                <span
                  aria-hidden="true"
                >
                  ✓
                </span>

                <strong>
                  {pl
                    ? 'Dziękujemy!'
                    : 'Thank you!'}
                </strong>

                <p>
                  {pl
                    ? 'Opinia została wysłana.'
                    : 'Your review has been submitted.'}
                </p>
              </div>

            ) : (

              <form
                onSubmit={
                  submit
                }
              >

                <fieldset
                  className="submission-fields"
                  disabled={
                    sending ||
                    pending
                  }
                >

                  <label>
                    {pl
                      ? 'Imię lub nazwa publiczna'
                      : 'Public name'}

                    <input
                      name="name"
                      required
                      minLength={2}
                      maxLength={100}
                    />
                  </label>

                  <label>
                    {pl
                      ? 'Ocena'
                      : 'Rating'}

                    <select
                      name="rating"
                      defaultValue="5"
                    >
                      {ratings.map(
                        value=>(
                          <option
                            key={
                              value
                            }
                            value={
                              value
                            }
                          >
                            {'★'.repeat(
                              value,
                            )}
                            {' — '}
                            {value}/5
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label className="review-wide">
                    {pl
                      ? 'Twoja opinia'
                      : 'Your review'}

                    <textarea
                      name="quote"
                      required
                      minLength={20}
                      maxLength={2000}
                      rows={5}
                    />
                  </label>

                  <label
                    hidden
                    aria-hidden="true"
                  >
                    Website

                    <input
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </label>

                  <label className="review-consent review-wide">

                    <input
                      name="consent"
                      type="checkbox"
                      required
                    />

                    <span>
                      {pl
                        ? 'Zgadzam się na publikację opinii i podanej nazwy. Opisuję własne doświadczenie.'
                        : 'I consent to publication of my review and name. This describes my own experience.'}

                      {' '}

                      <a
                        href={
                          pagePath(
                            locale,
                            'privacy',
                          )
                        }
                      >
                        {pl
                          ? 'Prywatność'
                          : 'Privacy'}
                      </a>
                    </span>

                  </label>

                </fieldset>

                {pending && (
                  <p
                    role="status"
                    className="review-wide"
                  >
                    {pl
                      ? 'Sprawdzanie poprzedniego zapisu…'
                      : 'Checking the previous submission…'}
                  </p>
                )}

                <button
                  className="review-submit-button"
                  disabled={
                    sending
                  }
                  type="submit"
                >
                  {sending
                    ? (
                        pl
                          ? 'Wysyłanie…'
                          : 'Sending…'
                      )
                    : (
                        pl
                          ? 'Wyślij opinię'
                          : 'Submit review'
                      )}
                </button>

                {failed && (
                  <p role="alert">
                    {failureReason || (
                      pl
                        ? 'Nie udało się wysłać opinii. Sprawdź dane lub spróbuj ponownie później.'
                        : 'Could not submit. Check the fields or try again later.'
                    )}
                  </p>
                )}

              </form>
            )}

          </section>
        )}

      </div>

    </section>
  )
}
