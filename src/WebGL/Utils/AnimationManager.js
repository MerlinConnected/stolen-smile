import { gasp } from 'gsap'

export default class AnimationManager {
	constructor() {
		this.elements = {
			player: document.querySelector('.player'),
			currentTime: document.querySelector('.current-time'),
			totalTime: document.querySelector('.total-time'),
			subtitlesElement: document.querySelector('.subtitles'),
			audioButton: document.querySelector('#audio'),
		}
	}
}
