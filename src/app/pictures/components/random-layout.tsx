'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { DialogModal } from '@/components/dialog-modal'
import { cn } from '@/lib/utils'
import { Picture } from '../page'

interface RandomLayoutProps {
	pictures: Picture[]
	isEditMode?: boolean
	onDeleteSingle?: (pictureId: string, imageIndex: number | 'single') => void
	onDeleteGroup?: (picture: Picture) => void
}

type UrlItem = {
	url: string
	groupIndex: number
	description?: string
	uploadedAt?: string
	pictureId: string
	imageIndex: number | 'single'
}

interface PictureCardProps {
	item: UrlItem
	index: number
	isEditMode?: boolean
	onDeleteSingle?: (pictureId: string, imageIndex: number | 'single') => void
}

const INITIAL_RENDER_COUNT = 18
const RENDER_STEP = 12
const GRID_ASPECT_RATIO_CLASS = 'aspect-[3/2]'

const buildUrlList = (pictures: Picture[]): UrlItem[] => {
	const result: UrlItem[] = []

	for (const [index, picture] of pictures.entries()) {
		if (picture.image) {
			result.push({
				url: picture.image,
				groupIndex: index,
				description: picture.description,
				uploadedAt: picture.uploadedAt,
				pictureId: picture.id,
				imageIndex: 'single'
			})
		}

		if (picture.images && picture.images.length > 0) {
			result.push(
				...picture.images.map((url, imageIndex) => ({
					url,
					groupIndex: index,
					description: picture.description,
					uploadedAt: picture.uploadedAt,
					pictureId: picture.id,
					imageIndex
				}))
			)
		}
	}

	return result
}

const formatUploadedAt = (uploadedAt?: string) => {
	if (!uploadedAt) return ''
	const date = new Date(uploadedAt)
	if (Number.isNaN(date.getTime())) return uploadedAt

	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hours = String(date.getHours()).padStart(2, '0')
	const minutes = String(date.getMinutes()).padStart(2, '0')

	return `${year}-${month}-${day} ${hours}:${minutes}`
}

const PictureCard = ({ item, index, isEditMode = false, onDeleteSingle }: PictureCardProps) => {
	const [isZoomed, setIsZoomed] = useState(false)

	return (
		<>
			<motion.article
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.25, delay: Math.min(index, 8) * 0.03 }}
				className={cn('bg-card group relative overflow-hidden rounded-[24px] border shadow-sm', GRID_ASPECT_RATIO_CLASS)}>
				<button type='button' onClick={() => setIsZoomed(true)} className='h-full w-full cursor-zoom-in'>
					<img
						src={item.url}
						alt={item.description || 'picture'}
						loading='lazy'
						decoding='async'
						className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]'
					/>
				</button>

				{isEditMode && (
					<motion.button
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						onClick={event => {
							event.stopPropagation()
							onDeleteSingle?.(item.pictureId, item.imageIndex)
						}}
						className='absolute top-3 right-3 rounded-full bg-red-500 p-2 text-white shadow-lg transition-transform hover:scale-105 hover:bg-red-600'>
						<svg xmlns='http://www.w3.org/2000/svg' className='h-3.5 w-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
						</svg>
					</motion.button>
				)}
			</motion.article>

			<DialogModal open={isZoomed} onClose={() => setIsZoomed(false)} className='w-full max-w-6xl'>
				<div className={cn('flex max-h-[calc(100vh-3rem)] flex-col gap-4', item.description && 'lg:flex-row lg:items-center')}>
					<div className='flex min-h-0 flex-1 items-center justify-center'>
						<img
							src={item.url}
							alt={item.description || 'picture'}
							decoding='async'
							className='max-h-[calc(100vh-3rem)] max-w-full rounded-[28px] object-contain shadow-xl'
						/>
					</div>

					{item.description && (
						<aside className='bg-card shrink-0 rounded-[24px] border p-5 shadow lg:w-72'>
							<div className='text-secondary mb-2 text-xs'>{formatUploadedAt(item.uploadedAt)}</div>
							<div className='text-sm leading-6 whitespace-pre-wrap'>{item.description}</div>
						</aside>
					)}
				</div>
			</DialogModal>
		</>
	)
}

export const RandomLayout = ({ pictures, isEditMode = false, onDeleteSingle, onDeleteGroup }: RandomLayoutProps) => {
	void onDeleteGroup

	const urls = useMemo(() => buildUrlList(pictures), [pictures])
	const [renderCount, setRenderCount] = useState(() => Math.min(INITIAL_RENDER_COUNT, urls.length))
	const loadMoreRef = useRef<HTMLDivElement>(null)
	const previousLengthRef = useRef(urls.length)

	useEffect(() => {
		setRenderCount(previous => {
			if (urls.length === 0) return 0
			if (previousLengthRef.current === 0) return Math.min(INITIAL_RENDER_COUNT, urls.length)
			if (previous >= previousLengthRef.current) return urls.length
			return Math.min(previous, urls.length)
		})

		previousLengthRef.current = urls.length
	}, [urls.length])

	useEffect(() => {
		const node = loadMoreRef.current
		if (!node || renderCount >= urls.length) return

		const observer = new IntersectionObserver(
			entries => {
				const entry = entries[0]
				if (!entry?.isIntersecting) return
				setRenderCount(previous => Math.min(previous + RENDER_STEP, urls.length))
			},
			{
				rootMargin: '800px 0px'
			}
		)

		observer.observe(node)

		return () => {
			observer.disconnect()
		}
	}, [renderCount, urls.length])

	if (!urls.length) {
		return null
	}

	return (
		<div className='mx-auto w-full max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8'>
			<div className='grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5'>
				{urls.slice(0, renderCount).map((item, index) => (
					<PictureCard
						key={`${item.pictureId}-${item.imageIndex}-${item.url}`}
						item={item}
						index={index}
						isEditMode={isEditMode}
						onDeleteSingle={onDeleteSingle}
					/>
				))}
			</div>

			{renderCount < urls.length && (
				<div ref={loadMoreRef} className='flex h-24 items-center justify-center'>
					<div className='text-secondary text-xs'>继续下滑加载更多图片</div>
				</div>
			)}
		</div>
	)
}
