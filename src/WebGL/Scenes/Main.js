import SceneComponent from 'components/SceneComponent.js'
import Experience from '../Experience.js'

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
		})
	}

	update() {}
}
