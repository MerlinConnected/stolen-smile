import Experience from '../Experience.js'
import { Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'
import addMeshDebug from 'utils/addMeshDebug.js'

export default class Joconde {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.resources = this.experience.resources
		this.debug = this.experience.debug

		this.setGeometry()
		this.setMaterial()
		this.setMesh()
		if (this.debug.active) this.setDebug()
	}

	setGeometry() {
		this.geometry = new PlaneGeometry(0.83, 1.24)
	}

	setMaterial() {
		this.material = new MeshBasicMaterial({
			map: this.resources.items.jocondeColorTexture,
		})
	}

	setMesh() {
		this.mesh = new Mesh(this.geometry, this.material)
		this.mesh.position.set(0, 2, -3.25)
		this.mesh.rotation.set(0.03, 0, 0)
		this.mesh.name = 'joconde'
		this.scene.add(this.mesh)
	}

	setDebug() {
		addMeshDebug(this.debug.ui, this.mesh)
	}
}
