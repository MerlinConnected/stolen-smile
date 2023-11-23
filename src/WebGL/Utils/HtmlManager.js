import Experience from '../Experience'

export default class HtmlManager {
	constructor() {
		this.experience = new Experience()

		this.elements = {
			player: document.querySelector('.player'),
			bar: document.querySelector('.player-bar'),
			hover: document.querySelector('.hover-bar'),
			currentTime: document.querySelector('.current-time'),
			totalTime: document.querySelector('.total-time'),
			audioElement: document.querySelector('audio'),
			trackElement: document.querySelector('track'),
			playButton: document.querySelector('#start'),
			subtitlesElement: document.querySelector('.subtitles'),
			audioButton: document.querySelector('#audio'),
		}

		this.setupEventListeners()
	}

	setupEventListeners() {
		this.elements.playButton.addEventListener('click', this.togglePlayPause.bind(this))
		this.elements.audioElement.addEventListener('timeupdate', this.updateProgressBar.bind(this))
		this.elements.trackElement.addEventListener('cuechange', this.displaySubtitles.bind(this))
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

	updateProgressBar() {
		const { audioElement, bar } = this.elements
		const percent = audioElement.currentTime / audioElement.duration
		bar.style.setProperty('--progress', percent.toString())
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
		const { audioButton } = this.elements
		if (audioButton.classList.contains('active')) {
			this.removeClass('active', audioButton)
		} else {
			this.addClass('active', audioButton)
		}
	}

	update() {
		const { currentTime, totalTime, audioElement } = this.elements
		if (audioElement.readyState >= 2) {
			currentTime.innerHTML = this.formatTime(audioElement.currentTime)
			totalTime.innerHTML = this.formatTime(audioElement.duration)
		}
	}
}
