import Experience from 'webgl/Experience.js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import addMeshDebug from 'utils/addMeshDebug.js'
import Joconde from 'components/Joconde.js'

gsap.registerPlugin(ScrollTrigger)

export default class SceneComponent {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.resources = this.experience.resources
		this.debug = this.experience.debug
		this.camera = this.experience.camera

		this.options = {
			scene: 0,
			sceneParams: [
				{
					cameraZPosition: 13,
					paintZPosition: -3.2,
				},
				{ cameraZPosition: -3, paintZPosition: -19.2 },
			],
		}

		this.paint = new Joconde()
		this.setLouvreModel()
		this.setRoomModel()
		this.setAnimation()
		if (this.debug.active) this.setDebug()
	}

	setLouvreModel() {
		this.louvreModel = this.resources.items.louvreSceneModel.scene
		this.louvreModel.name = 'louvreScene'
		this.scene.add(this.louvreModel)
	}

	setRoomModel() {
		this.roomModel = this.resources.items.louvreSceneModel.scene.clone()
		this.roomModel.position.z = -16
		this.roomModel.name = 'roomScene'
		this.scene.add(this.roomModel)
	}

	setSection(sectionNumber, force = false) {
		if (sectionNumber === this.options.scene && !force) return
		const isReverse = this.options.scene >= sectionNumber
		this.options.scene = sectionNumber

		gsap.to(this.paint.mesh.position, {
			z: this.options.sceneParams[sectionNumber].paintZPosition,
		})
		gsap.to(this.camera.sceneCamera.position, {
			z: this.options.sceneParams[sectionNumber].cameraZPosition,
			delay: isReverse ? 0 : 0.25,
		})

		if (!isReverse) {
			gsap.to(this.camera.sceneCamera, {
				keyframes: [
					{ ease: 'power1.in', duration: 0.75, fov: 30 },
					{ ease: 'power1.out', duration: 0.25, fov: this.camera.options.fov },
				],
				onUpdate: () => {
					this.camera.sceneCamera.updateProjectionMatrix()
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
					if (this.debugFolder) {
						this.debugFolder.refreshing = true
						this.debugFolder.refresh()
						this.debugFolder.refreshing = false
					}
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
				if (this.debugFolder.refreshing) return
				this.setSection(event.value, true)
			})

		addMeshDebug(this.debugFolder, this.louvreModel)
		addMeshDebug(this.debugFolder, this.roomModel)
	}
}
