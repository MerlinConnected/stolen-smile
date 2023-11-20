import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { PerspectiveCamera, AudioListener, Vector3 } from 'three'
import Experience from './Experience.js'
import * as THREE from 'three'

export default class Camera {
	constructor() {
		this.experience = new Experience()
		this.sizes = this.experience.sizes
		this.scene = this.experience.scene
		this.canvas = this.experience.canvas
		this.debug = this.experience.debug

		this.options = {
			fov: 35,
			near: 1,
			far: 10,
			position: new Vector3(0, 0, 4),
			target: new Vector3(0, 0, 0),
		}

		this.mouse = {
			x: 0,
			y: 0,
		}

		this.setInstance()
		this.setAudioListener()
		// this.applySavedSettings()
		if (this.debug.active) this.setDebug()
	}

	setInstance() {
		this.sceneCamera = new PerspectiveCamera(
			this.options.fov,
			this.sizes.width / this.sizes.height,
			this.options.near,
			this.options.far
		)
		this.sceneCamera.position.copy(this.options.position)
		this.sceneCamera.lookAt(this.options.target)
		this.sceneCamera.name = 'camera'
		this.instance = this.sceneCamera

		window.addEventListener('mousemove', (event) => {
			this.mouse.x = 1 - event.clientX / this.sizes.width - 0.5
			this.mouse.y = event.clientY / this.sizes.height - 0.5
		})
	}

	setAudioListener() {
		this.audioListener = new AudioListener()
		this.instance.add(this.audioListener)
	}

	applySavedSettings() {
		const cameraPosition = JSON.parse(sessionStorage.getItem('cameraPosition'))
		const cameraTarget = JSON.parse(sessionStorage.getItem('cameraTarget'))

		if (cameraPosition) {
			this.instance.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
		} else {
			this.instance.position.set(this.options.position.x, this.options.position.y, this.options.position.z)
		}

		if (cameraTarget) {
			this.controls.target.set(cameraTarget.x, cameraTarget.y, cameraTarget.z)
		} else {
			this.controls.target.set(this.options.target.x, this.options.target.y, this.options.target.z)
		}
	}

	setControlsCamera() {
		this.controlsCamera = new PerspectiveCamera(50, this.sizes.width / this.sizes.height)
		this.controlsCamera.position.set(0, 0, 5)
		this.controlsCamera.lookAt(0, 0, 0)
		this.controls = new OrbitControls(this.controlsCamera, this.canvas)
		this.controlsCamera.name = 'controlsCamera'
	}
	resetControls() {
		sessionStorage.removeItem('cameraPosition')
		sessionStorage.removeItem('cameraTarget')

		this.controls.reset()
		this.instance.position.copy(this.options.position)
		this.controls.target.copy(this.options.target)
	}

	resize() {
		this.instance.aspect = this.sizes.width / this.sizes.height
		this.instance.updateProjectionMatrix()
	}

	setDebug() {
		this.debugFolder = this.debug.ui.addFolder({
			title: 'Camera',
			expanded: false,
		})

		this.debugFolder
			.addBinding({ controlsCamera: false }, 'controlsCamera', {
				label: 'Controls camera',
			})
			.on('change', ({ value }) => {
				if (value) {
					if (!this.controlsCamera) this.setControlsCamera()
					this.controls.enabled = true
					this.instance = this.controlsCamera
				} else {
					this.controls.enabled = false
					this.instance = this.sceneCamera
				}
			})
	}

	update() {
		// this.controls.update()
		this.instance.position.y = THREE.MathUtils.lerp(this.instance.position.y, (this.mouse.y * Math.PI) / 20, 0.1)
		this.instance.position.x = THREE.MathUtils.lerp(this.instance.position.x, (this.mouse.x * Math.PI) / 20, 0.1)
	}
}
