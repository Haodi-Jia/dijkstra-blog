'use client'

import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react'

type LazyImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string
}

export function LazyImage({ alt = '', src, ...props }: LazyImageProps) {
  const imageRef = useRef<HTMLImageElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const image = imageRef.current
    if (!image) return

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return

      setIsVisible(true)
      observer.disconnect()
    })

    observer.observe(image)

    return () => observer.disconnect()
  }, [])

  return (
    <img
      {...props}
      ref={imageRef}
      alt={alt}
      data-lazy-image=""
      decoding="async"
      loading="lazy"
      src={isVisible ? src : undefined}
    />
  )
}
