import SceneComponent from 'components/SceneComponent.js'
import Experience from '../Experience.js'
import Particles from 'components/Particles/index.js'

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
			this.particles = new Particles()
		})
	}

	update() {
		if (this.particles) this.particles.update()
	}
}
