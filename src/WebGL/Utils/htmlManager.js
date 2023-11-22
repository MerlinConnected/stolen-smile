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
		}

		this.setupEventListeners()
	}

	setupEventListeners() {
		this.elements.playButton.addEventListener('click', this.togglePlayPause.bind(this))
		this.elements.audioElement.addEventListener('timeupdate', this.updateProgressBar.bind(this))
		this.elements.trackElement.addEventListener('cuechange', this.displaySubtitles.bind(this))
		this.elements.player.addEventListener('click', this.getCursorPosition.bind(this))
		this.elements.player.addEventListener('mousemove', this.updateHoverPosition.bind(this))
	}

	togglePlayPause() {
		const { audioElement } = this.elements
		audioElement.paused ? audioElement.play() : audioElement.pause()
	}

	updateProgressBar() {
		const { audioElement, bar } = this.elements
		const percent = audioElement.currentTime / audioElement.duration
		bar.style.setProperty('--progress', percent)
	}

	displaySubtitles() {
		const activeCue = this.elements.trackElement.track.activeCues[0]
		if (activeCue) {
			console.log(activeCue.text)
		}
	}

	update() {
		const { currentTime, totalTime, audioElement } = this.elements
		if (audioElement.readyState >= 2) {
			currentTime.innerHTML = this.formatTime(audioElement.currentTime)
			totalTime.innerHTML = this.formatTime(audioElement.duration)
		}
	}

	getCursorPosition(e) {
		const percent = this.calculatePercent(e)
		this.updateBarScale(percent)
		this.elements.audioElement.currentTime = percent * this.elements.audioElement.duration
	}

	updateHoverPosition(e) {
		const percent = this.calculatePercent(e)
		this.updateHoverWidth(percent)
	}

	calculatePercent(e) {
		const { player } = this.elements
		const elementRect = player.getBoundingClientRect()
		const x = e.pageX - elementRect.left
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
}
