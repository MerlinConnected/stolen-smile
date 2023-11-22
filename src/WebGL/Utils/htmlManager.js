import Experience from '../Experience'

export default class HtmlManager {
	constructor() {
		this.experience = new Experience()

		this.player = document.querySelector('.player')
		this.bar = document.querySelector('.player-bar')
		this.hover = document.querySelector('.hover-bar')

		this.handleMouseClick = this.getCursorPosition.bind(this)
		this.handleMouseHover = this.updateHoverPosition.bind(this)

		this.player.addEventListener('click', this.handleMouseClick)
		this.player.addEventListener('mousemove', this.handleMouseHover)
	}

	update() {}

	getCursorPosition(e) {
		const percent = this.calculatePercent(e)
		// console.log('Click - Percent:', percent)
		this.updateBarWidth(percent * this.player.offsetWidth)
	}

	updateHoverPosition(e) {
		const percent = this.calculatePercent(e)
		// console.log('Hover - Percent:', percent)
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
