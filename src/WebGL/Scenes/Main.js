import SceneComponent from 'components/SceneComponent.js'
import Environment from 'components/Environment.js'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Experience from '../Experience.js'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(ScrollTrigger, CustomEase)

export default class Main {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.resources = this.experience.resources
		this.camera = this.experience.camera

		// Wait for resources
		this.resources.on('ready', () => {
			// Setup
			this.sceneComponent = new SceneComponent()
			this.environment = new Environment()

			const bounceBack = CustomEase.create('custom', 'M0,0 C0.2,0 0.691,1.169 0.8,1 0.913,0.822 0.8,0 1,0 ')

			// Section 1 Animation
			ScrollTrigger.create({
				trigger: '.section1',
				markers: true,
				start: 'top top',
				onToggle: (self) => {
					if (!self.isActive) return

					const tl1 = gsap.timeline()

					tl1.to(this.experience.camera.instance.position, {
						duration: 1,
						z: 4,
						ease: 'power3.inOut',
					})
					tl1.to(
						this.sceneComponent.paint.position,
						{
							duration: 1,
							z: 0,
							ease: 'power3.inOut',
						},
						'<'
					)
					tl1.to(
						this.experience.camera.options,
						{
							duration: 1,
							fov: 35,
							ease: bounceBack,
							onUpdate: () => {
								this.experience.camera.instance.fov = this.experience.camera.options.fov
								this.experience.camera.instance.updateProjectionMatrix()
							},
						},
						'<'
					)
				},
			})

			// Section 2 Animation
			ScrollTrigger.create({
				trigger: '.section2',
				markers: true,
				start: 'top top',
				onToggle: (self) => {
					if (!self.isActive) return

					const tl2 = gsap.timeline()

					tl2.to(this.experience.camera.instance.position, {
						duration: 1,
						z: -1,
						ease: 'power3.inOut',
					})
					tl2.to(
						this.sceneComponent.paint.position,
						{
							duration: 1,
							z: -5,
							ease: 'power3.inOut',
						},
						'<'
					)
					tl2.to(
						this.experience.camera.options,
						{
							duration: 1,
							fov: 12,
							ease: bounceBack,
							onUpdate: () => {
								this.experience.camera.instance.fov = this.experience.camera.options.fov
								this.experience.camera.instance.updateProjectionMatrix()
							},
						},
						'<'
					)
				},
			})
		})
	}

	update() {
		if (this.fox) this.fox.update()
	}
}
