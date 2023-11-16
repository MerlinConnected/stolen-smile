import Experience from '../Experience.js'
import Environment from 'components/Environment.js'
import Floor from 'components/Floor.js'
import Fox from 'components/Fox/Fox.js'
import Cube from 'components/Cube/Cube.js'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default class Main {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.resources = this.experience.resources

		ScrollTrigger.create({
			trigger: '.section1',
			markers: true,
			start: 'top top',
			onEnter: () => {
				console.log('enter')
			},
		})

		// Wait for resources
		this.resources.on('ready', () => {
			// Setup
			this.floor = new Floor()
			this.fox = new Fox()
			this.cube = new Cube()
			this.environment = new Environment()
		})
	}

	update() {
		if (this.fox) this.fox.update()
	}
}
