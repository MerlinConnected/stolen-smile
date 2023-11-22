import Experience from '../Experience'

export default class HtmlManager {
	constructor() {
		this.experience = new Experience()

		this.player = document.querySelector('.player')
		this.bar = document.querySelector('.player-bar')
		this.hover = document.querySelector('.hover-bar')

		this.audioElement = document.querySelector('audio')
		this.trackElement = document.querySelector('track')
		this.playButton = document.querySelector('#start')

		// Play/Pause
		this.playButton.addEventListener('click', () => {
			if (this.audioElement.paused) {
				this.audioElement.play()
			} else {
				this.audioElement.pause()
			}
		})

		// Update progress bar
		this.audioElement.addEventListener('timeupdate', () => {
			const percent = this.audioElement.currentTime / this.audioElement.duration
			this.updateBarWidth(percent * this.player.offsetWidth)
		})

		// Display subtitles
		this.trackElement.addEventListener('cuechange', () => {
			if (this.trackElement.track.activeCues[0]) {
				console.log(this.trackElement.track.activeCues[0].text)
			}
		})

		this.handleMouseClick = this.getCursorPosition.bind(this)
		this.handleMouseHover = this.updateHoverPosition.bind(this)

		this.player.addEventListener('click', this.handleMouseClick)
		this.player.addEventListener('mousemove', this.handleMouseHover)
	}

	getCursorPosition(e) {
		const percent = this.calculatePercent(e)
		this.updateBarWidth(percent * this.player.offsetWidth)
		this.audioElement.currentTime = percent * this.audioElement.duration
	}

	updateHoverPosition(e) {
		const percent = this.calculatePercent(e)
		this.updateHoverWidth(percent * this.player.offsetWidth)
	}

	calculatePercent(e) {
		const elementRect = this.player.getBoundingClientRect()
		const x = e.pageX - elementRect.left
		const width = this.player.offsetWidth
		return x / width
	}

	updateBarWidth(newWidth) {
		this.bar.style.width = `${newWidth}px`
	}

	updateHoverWidth(newWidth) {
		this.hover.style.width = `${newWidth}px`
	}
}
