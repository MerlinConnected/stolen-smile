import Experience from '../Experience'

export default class HtmlManager {
	constructor() {
		this.experience = new Experience()

		this.player = document.querySelector('.player')
		this.bar = document.querySelector('.player-bar')
		this.hover = document.querySelector('.hover-bar')

		this.currentTime = document.querySelector('.current-time')
		this.totalTime = document.querySelector('.total-time')

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
			this.updateBarScale(percent)
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

	update() {
		if (this.audioElement.readyState >= 2) {
			this.currentTime.innerHTML = this.formatTime(this.audioElement.currentTime)
			this.totalTime.innerHTML = this.formatTime(this.audioElement.duration)
		}
	}

	getCursorPosition(e) {
		const percent = this.calculatePercent(e)
		this.updateBarScale(percent)
		this.audioElement.currentTime = percent * this.audioElement.duration
	}

	updateHoverPosition(e) {
		const percent = this.calculatePercent(e)
		this.updateHoverWidth(percent)
	}

	calculatePercent(e) {
		const elementRect = this.player.getBoundingClientRect()
		const x = e.pageX - elementRect.left
		const width = this.player.offsetWidth
		return x / width
	}

	updateBarScale(newWidth) {
		this.bar.style.setProperty('--progress', newWidth)
	}

	updateHoverWidth(newWidth) {
		this.hover.style.transform = `scaleX(${newWidth})`
	}

	formatTime(seconds) {
		const minutes = Math.floor(seconds / 60)
		const remainingSeconds = Math.floor(seconds % 60)

		const formattedMinutes = minutes.toString().padStart(2, '0')
		const formattedSeconds = remainingSeconds.toString().padStart(2, '0')

		return `${formattedMinutes}:${formattedSeconds}`
	}
}
