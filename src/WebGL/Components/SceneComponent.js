import Experience from 'webgl/Experience.js'
import { AnimationMixer, Mesh, MeshBasicMaterial } from 'three'
import InputManager from 'utils/InputManager.js'
import addMeshDebug from 'utils/addMeshDebug.js'

export default class SceneComponent {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.resources = this.experience.resources
		this.debug = this.experience.debug

		// Resource
		this.resource = this.resources.items.sceneModel

		this.setModel()
	}

	setModel() {
		this.model = this.resource.scene
		this.model.name = 'scene'
		this.scene.add(this.model)

		this.paint = this.model.getObjectByName('Paint')
		console.log(this.paint)
	}
}
