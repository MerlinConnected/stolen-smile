import Experience from '../Experience'
import gsap from 'gsap'
import EventEmitter from './EventEmitter'
import { PositionalAudio } from 'three'

export default class HtmlManager extends EventEmitter {
	constructor() {
		super()

		this.experience = new Experience()

		this.elements = {
			subtitlesElement: document.querySelector('.subtitles'),
			currentTime: document.querySelector('.current-time'),
			totalTime: document.querySelector('.total-time'),
			audioElement: document.querySelector('#audioSection0'),
			audioElements: [
				document.querySelector('#audioSection0'),
				document.querySelector('#audioSection1'),
				document.querySelector('#audioSection2'),
				document.querySelector('#audioSection3'),
			],
			trackElement: document.querySelector('track'),
			audioButton: document.querySelector('#audio'),
			playButton: document.querySelector('#start'),
			hover: document.querySelector('.hover-bar'),
			bar: document.querySelector('.player-bar'),
			player: document.querySelector('.player'),
			title: document.querySelector('h1'),
			playPause: document.querySelector('#play-pause'),
		}

		this.setupEventListeners()
		this.updateProgressBar(this.elements.audioElement)
	}

	setupEventListeners() {
		this.elements.playButton.addEventListener('click', this.beginExperience.bind(this))
		this.elements.player.addEventListener('click', this.getCursorPosition.bind(this))
		// handle mouse drag
		let isMouseDown = false
		this.elements.player.addEventListener('mousedown', () => (isMouseDown = true))
		document.addEventListener('mouseup', () => (isMouseDown = false))
		document.addEventListener('mousemove', (event) => {
			if (isMouseDown) {
				this.getCursorPosition(event)
			}
		})
		this.elements.player.addEventListener('mousemove', this.updateHoverPosition.bind(this))

		this.elements.audioButton.addEventListener('click', this.toggleAudioClass.bind(this))
		window.addEventListener('scroll', this.scrollPageAmmount.bind(this))
		this.elements.playPause.addEventListener('click', this.togglePlayPause.bind(this))
	}

	scrollPageAmmount() {
		const scrollPercent = window.scrollY / (document.body.offsetHeight - window.innerHeight)
		document.body.style.setProperty('--scroll', scrollPercent.toString())
	}

	togglePlayPause() {
		const { audioElement } = this.elements
		this.elements.playPause.innerHTML = audioElement.paused ? 'pause.' : 'lecture.'
		audioElement.paused ? audioElement.play() : audioElement.pause()
	}

	playAudio(audio) {
		this.elements.audioElement.pause()
		this.elements.audioElement.currentTime = 0
		this.elements.audioElement.volume = 1
		this.elements.audioElement.active = false
		this.elements.audioElement = audio
		this.elements.audioElement.play()
		this.elements.audioElement.active = true
		// this.displaySubtitles(this.elements.audioElement.querySelector('track'))
	}

	beginExperience() {
		gsap.to(this.experience.renderer.vignetteEffect.uniforms.get('opacity'), {
			duration: 2,
			delay: 0.5,
			value: 0,
			onComplete: () => {
				this.playAudio(this.elements.audioElement)
			},
		})
		document.body.style.overflow = 'visible'

		this.experience.audioManager.setCameraListener()

		this.elements.audioElements.forEach((audioElement) => {
			const trackElement = audioElement.querySelector('track')
			audioElement.addEventListener('playing', () => {
				if (audioElement.positionalAudio) return
				audioElement.positionalAudio = new PositionalAudio(this.experience.audioManager.audioListener)
				audioElement.positionalAudio.setMediaElementSource(audioElement)
				audioElement.positionalAudio.position.set(
					audioElement.dataset.x,
					audioElement.dataset.y,
					audioElement.dataset.z,
				)
				audioElement.positionalAudio.setRefDistance(20)
				this.experience.scene.add(audioElement.positionalAudio)
			})

			audioElement.addEventListener('timeupdate', () => {
				if (audioElement.paused) return
				this.updateProgressBar(audioElement)
			})

			trackElement.addEventListener('cuechange', () => {
				if (audioElement.paused) return
				this.displaySubtitles(trackElement)
			})
		})

		gsap.to('.content-container', {
			duration: 1,
			opacity: 0,
			userSelect: 'none',
			pointerEvents: 'none',
		})

		gsap.to('.header-container', {
			duration: 1,
			opacity: 1,
		})

		gsap.to('.timeline-container', {
			x: 0,
			duration: 1,
			opacity: 1,
			stagger: 0.1,
			delay: 1,
		})

		gsap.to('.footer-container', {
			duration: 1,
			opacity: 1,
			delay: 1.2,
		})

		gsap.to('.current-time', {
			duration: 1,
			opacity: 1,
			delay: 1.4,
		})

		gsap.to('.player', {
			scaleX: 1,
			duration: 1,
			opacity: 1,
			delay: 2.2,
		})

		gsap.to('.total-time', {
			duration: 1,
			opacity: 1,
			delay: 1.8,
		})
		this.trigger('beginExperience')
	}

	updateProgressBar(audioElement) {
		const { bar, currentTime, totalTime } = this.elements
		const percent = audioElement.currentTime / audioElement.duration
		bar.style.setProperty('--progress', percent.toString())

		currentTime.innerHTML = this.formatTime(audioElement.currentTime)
		totalTime.innerHTML = this.formatTime(audioElement.duration)
	}

	displaySubtitles(trackElement) {
		const activeCue = trackElement.track.activeCues[trackElement.track.activeCues.length - 1]
		if (activeCue) {
			gsap.to('.subtitles-word', {
				duration: 0.5,
				opacity: 0,
				onComplete: () => {
					this.elements.subtitlesElement.innerHTML = ''
					const words = activeCue.text.split(' ')
					words.forEach((word) => {
						const wordElement = document.createElement('span')
						wordElement.innerHTML = word + '&nbsp;'
						wordElement.classList.add('subtitles-word')
						this.elements.subtitlesElement.appendChild(wordElement)
					})
					gsap.from('.subtitles-word', {
						duration: 1.5,
						opacity: 0,
						stagger: 0.1,
					})
				},
			})
		}
	}

	getCursorPosition(event) {
		const percent = this.calculatePercent(event)
		this.updateBarScale(percent)
		this.elements.audioElement.currentTime = percent * this.elements.audioElement.duration
	}

	updateHoverPosition(event) {
		const percent = this.calculatePercent(event)
		this.updateHoverWidth(percent)
	}

	calculatePercent(event) {
		const { player } = this.elements
		const elementRect = player.getBoundingClientRect()
		const x = event.pageX - elementRect.left
		if (x < 0) return 0
		if (x > player.offsetWidth) return 1
		return x / player.offsetWidth
	}

	updateBarScale(percent) {
		this.elements.bar.style.setProperty('--progress', percent)
	}

	updateHoverWidth(percent) {
		this.elements.hover.style.transform = `scaleX(${percent})`
	}

	formatTime(seconds) {
		const minutes = Math.floor(seconds / 60)
		const remainingSeconds = Math.floor(seconds % 60)
		return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
	}

	addClass(className, element) {
		element.classList.add(className)
	}

	removeClass(className, element) {
		element.classList.remove(className)
	}

	toggleAudioClass() {
		const { audioButton } = this.elements
		if (audioButton.classList.contains('active')) {
			this.removeClass('active', audioButton)
			this.elements.audioElements.forEach((audioElement) => {
				audioElement.muted = false
			})
		} else {
			this.addClass('active', audioButton)
			this.elements.audioElements.forEach((audioElement) => {
				audioElement.muted = true
			})
		}
	}
}
