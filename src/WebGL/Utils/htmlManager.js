export default class HtmlManager {
	constructor() {
		this.player = document.querySelector('.player')

		this.bar = document.querySelector('.player-bar')

		this.player.addEventListener('click', this.getClickPosition.bind(this))
	}

	getClickPosition(e) {
		const elementRect = this.player.getBoundingClientRect()
		var x = e.pageX - elementRect.left,
			width = this.player.offsetWidth,
			percent = x / width

		console.log('X', x, 'Width', width, 'Percent', percent)

		this.bar.style.width = percent * width + 'px'
	}
}
