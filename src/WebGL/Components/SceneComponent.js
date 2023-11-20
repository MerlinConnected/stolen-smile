import Experience from 'webgl/Experience.js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default class SceneComponent {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.resources = this.experience.resources
		this.debug = this.experience.debug
		this.camera = this.experience.camera

		// Resource
		this.resource = this.resources.items.sceneModel

		this.options = {
			scene: 1,
			sceneParams: [
				{
					cameraZPosition: 4,
					paintZPosition: 0,
				},
				{
					cameraZPosition: -1,
					paintZPosition: -5,
				},
			],
		}

		this.setModel()
		this.setAnimation()
		if (this.debug.active) this.setDebug()
	}

	setModel() {
		this.model = this.resource.scene
		this.model.name = 'scene'
		this.scene.add(this.model)

		this.paint = this.model.getObjectByName('Paint')
	}

	setSection(sectionNumber) {
		gsap.to(this.paint.position, {
			z: this.options.sceneParams[sectionNumber].paintZPosition,
		})
		gsap.to(this.experience.camera.instance.position, {
			z: this.options.sceneParams[sectionNumber].cameraZPosition,
			delay: 0.25,
		})
		gsap.to(this.experience.camera.options, {
			keyframes: [
				{ ease: 'power1.in', duration: 0.75, fov: 70 },
				{ ease: 'power1.out', duration: 0.25, fov: 35 },
			],
			onUpdate: () => {
				this.experience.camera.instance.fov = this.experience.camera.options.fov
				this.experience.camera.instance.updateProjectionMatrix()
			},
		})
		this.options.scene = sectionNumber
	}

	setAnimation() {
		gsap.defaults({ ease: 'power3.inOut', duration: 1 })

		this.options.sceneParams.forEach((_, index) => {
			ScrollTrigger.create({
				trigger: `.section${index + 1}`,
				markers: true,
				start: 'top top',
				onToggle: (self) => {
					if (!self.isActive) return
					this.setSection(index)
				},
			})
		})
	}

	setDebug() {
		this.debug.ui
			.addBinding(this.options, 'scene', {
				label: 'scene',
				min: 1,
				max: this.options.sceneParams.length,
				step: 1,
			})
			.on('change', ({ value }) => {
				this.setSection(value - 1)
			})
	}
}
