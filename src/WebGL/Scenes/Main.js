import Experience from '../Experience.js'
import Environment from 'components/Environment.js'
import Floor from 'components/Floor.js'
import Fox from 'components/Fox/Fox.js'
import Cube from 'components/Cube/Cube.js'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SceneComponent from 'components/SceneComponent.js'

gsap.registerPlugin(ScrollTrigger)

export default class Main {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.resources = this.experience.resources

		// Wait for resources
		this.resources.on('ready', () => {
			// Setup
			this.sceneComponent = new SceneComponent()
			this.environment = new Environment()

			ScrollTrigger.create({
				trigger: '.section1',
				markers: true,
				start: 'top top',
				onToggle: (self) => {
					if (!self.isActive) return
					console.log('section1')
					gsap.to(this.experience.camera.instance.position, {
						duration: 1,
						z: 4,
						ease: 'power3.inOut',
					})

					gsap.to(this.sceneComponent.paint.position, {
						duration: 1,
						z: 0,
						ease: 'power3.inOut',
					})
				},
			})

			ScrollTrigger.create({
				trigger: '.section2',
				markers: true,
				start: 'top top',
				onToggle: (self) => {
					if (!self.isActive) return
					console.log('section2')
					gsap.to(this.experience.camera.instance.position, {
						duration: 1,
						z: 0,
						ease: 'power3.inOut',
					})

					gsap.to(this.sceneComponent.paint.position, {
						duration: 1,
						z: -4,
						ease: 'power3.inOut',
					})
				},
			})
		})
	}

	update() {
		if (this.fox) this.fox.update()
	}
}
