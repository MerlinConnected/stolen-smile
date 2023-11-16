import Experience from '../Experience.js'
import Environment from 'components/Environment.js'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SceneComponent from 'components/SceneComponent.js'
import Lenis from '@studio-freight/lenis'

gsap.registerPlugin(ScrollTrigger)

export default class Main {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.resources = this.experience.resources

		const lenis = new Lenis()

		lenis.on('scroll', ScrollTrigger.update)

		gsap.ticker.add((time) => {
			lenis.raf(time * 1000)
		})

		gsap.ticker.lagSmoothing(0)

		function raf(time) {
			lenis.raf(time)
			requestAnimationFrame(raf)
		}

		requestAnimationFrame(raf)

		ScrollTrigger.create({
			trigger: '.section1',
			markers: true,
			start: 'top top',
			onToggle: (self) => {
				if (!self.isActive) return
				console.log('enter')
			},
		})

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
