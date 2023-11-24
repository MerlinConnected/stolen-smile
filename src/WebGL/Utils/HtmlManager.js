import Experience from '../Experience'
import gsap from 'gsap'

export default class HtmlManager {
	constructor() {
		this.experience = new Experience()

		this.elements = {
			subtitlesElement: document.querySelector('.subtitles'),
			currentTime: document.querySelector('.current-time'),
			totalTime: document.querySelector('.total-time'),
			audioElement: document.querySelector('audio'),
			trackElement: document.querySelector('track'),
			audioButton: document.querySelector('#audio'),
			playButton: document.querySelector('#start'),
			hover: document.querySelector('.hover-bar'),
			bar: document.querySelector('.player-bar'),
			player: document.querySelector('.player'),
			title: document.querySelector('h1'),
		}

		this.setupEventListeners()
		this.updateProgressBar()
	}

	setupEventListeners() {
		this.elements.audioElement.addEventListener('timeupdate', this.updateProgressBar.bind(this))
		this.elements.trackElement.addEventListener('cuechange', this.displaySubtitles.bind(this))
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
	}

	togglePlayPause() {
		const { audioElement } = this.elements
		audioElement.paused ? audioElement.play() : audioElement.pause()
	}

	splitIntoWords(text) {
		return text.split(' ')
	}

	createWordSpan(word, index) {
		const wordElement = document.createElement('span')
		wordElement.innerHTML = word
		wordElement.classList.add('word')
		wordElement.style.setProperty('--index', index)
		return wordElement
	}

	animateWord(word, index) {
		gsap.to(word, {
			y: 0,
			opacity: 1,
			delay: index * 0.1,
		})
	}

	beginExperience() {
		gsap.to(this.experience.renderer.vignetteEffect.uniforms.get('opacity'), {
			duration: 1,
			delay: 0.5,
			value: 0,
		})

		this.togglePlayPause()

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

		gsap.to('.timeline-item', {
			x: 0,
			duration: 1,
			opacity: 1,
			stagger: 0.1,
			delay: 1,
		})

		gsap.to('.chapters', {
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

		gsap.to('.archives', {
			duration: 1,
			opacity: 1,
			delay: 2,
		})

		// const words = this.splitIntoWords(this.elements.title.innerHTML)
		// this.elements.title.innerHTML = ''
		// words.forEach((word, index) => {
		// 	const wordElement = this.createWordSpan(word, index)
		// 	this.elements.title.appendChild(wordElement)
		// })

		// const spanWords = this.elements.title.querySelectorAll('.word')
		// spanWords.forEach(this.animateWord)
	}

	updateProgressBar() {
		const { audioElement, bar, currentTime, totalTime } = this.elements
		const percent = audioElement.currentTime / audioElement.duration
		bar.style.setProperty('--progress', percent.toString())

		currentTime.innerHTML = this.formatTime(audioElement.currentTime)
		totalTime.innerHTML = this.formatTime(audioElement.duration)
	}

	displaySubtitles() {
		const activeCue = this.elements.trackElement.track.activeCues[0]
		if (activeCue) {
			this.elements.subtitlesElement.innerHTML = activeCue.text
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
		const { audioButton, audioElement } = this.elements
		if (audioButton.classList.contains('active')) {
			this.removeClass('active', audioButton)
			audioElement.muted = false
		} else {
			this.addClass('active', audioButton)
			audioElement.muted = true
		}
	}
}
