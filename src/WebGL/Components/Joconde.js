import Experience from '../Experience.js'
import { Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'

export default class Joconde {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.resources = this.experience.resources
		this.debug = this.experience.debug

		this.setGeometry()
		this.setMaterial()
		this.setMesh()
	}

	setGeometry() {
		this.geometry = new PlaneGeometry(0.983, 1.43)
	}

	setMaterial() {
		this.material = new MeshBasicMaterial({
			map: this.resources.items.jocondeColorTexture,
		})
	}

	setMesh() {
		this.mesh = new Mesh(this.geometry, this.material)
		this.mesh.position.set(0, 2, -3.2)
		this.mesh.name = 'joconde'
		this.scene.add(this.mesh)
	}
}
