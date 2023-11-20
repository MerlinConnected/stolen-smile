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
			scene: 0,
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

	setSection(sectionNumber, force = false) {
		if (sectionNumber === this.options.scene && !force) return
		const isReverse = this.options.scene >= sectionNumber
		this.options.scene = sectionNumber

		gsap.to(this.paint.position, {
			z: this.options.sceneParams[sectionNumber].paintZPosition,
		})
		gsap.to(this.camera.instance.position, {
			z: this.options.sceneParams[sectionNumber].cameraZPosition,
			delay: isReverse ? 0 : 0.25,
		})

		if (!isReverse) {
			gsap.to(this.camera.options, {
				keyframes: [
					{ ease: 'power1.in', duration: 0.75, fov: 70 },
					{ ease: 'power1.out', duration: 0.25, fov: 35 },
				],
				onUpdate: () => {
					this.camera.instance.fov = this.camera.options.fov
					this.camera.instance.updateProjectionMatrix()
				},
			})
		}
	}

	setAnimation() {
		gsap.defaults({ ease: 'power3.inOut', duration: 1 })

		this.options.sceneParams.forEach((_, index) => {
			ScrollTrigger.create({
				trigger: `.section${index}`,
				markers: true,
				start: 'top top',
				onToggle: (self) => {
					if (!self.isActive) return
					this.setSection(index)
					if (this.debugFolder) this.debugFolder.refresh()
				},
			})
		})
	}

	setDebug() {
		this.debugFolder = this.debug.ui.addFolder({ title: 'scene', expanded: true })

		this.debugFolder
			.addBinding(this.options, 'scene', {
				min: 0,
				max: this.options.sceneParams.length - 1,
				step: 1,
			})
			.on('change', (event) => {
				if (event.last) this.setSection(event.value, true)
			})
	}
}
