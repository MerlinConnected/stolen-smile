import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { PerspectiveCamera, AudioListener, Vector3, CameraHelper, Vector2 } from 'three'
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
			fov: 14,
			near: 0.1,
			far: 35,
			position: new Vector3(0, 1.5, 13),
			target: new Vector3(0, 1.5, 0),
		}

		this.mouse = new Vector2(0, 0)

		this.setInstance()
		this.setAudioListener()
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

	setControlsCamera() {
		this.controlsCamera = new PerspectiveCamera(50, this.sizes.width / this.sizes.height)
		this.controlsCamera.position.set(0, 0, 5)
		this.controlsCamera.lookAt(0, 0, 0)
		this.controls = new OrbitControls(this.controlsCamera, this.canvas)
		this.controlsCamera.name = 'controlsCamera'
		this.cameraHelper = new CameraHelper(this.sceneCamera)
		this.scene.add(this.cameraHelper)
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

		let postprocessingState
		this.debugFolder
			.addBinding({ controlsCamera: false }, 'controlsCamera', {
				label: 'Controls camera',
			})
			.on('change', ({ value }) => {
				if (value) {
					if (!this.controlsCamera) this.setControlsCamera()
					this.controls.enabled = true
					this.instance = this.controlsCamera
					postprocessingState = this.experience.renderer.options.postprocessing
					this.experience.renderer.options.postprocessing = false
					this.cameraHelper.visible = true
				} else {
					this.controls.enabled = false
					this.instance = this.sceneCamera
					this.experience.renderer.options.postprocessing = postprocessingState
					this.cameraHelper.visible = false
				}
			})
	}

	update() {
		this.sceneCamera.position.x = THREE.MathUtils.lerp(
			this.sceneCamera.position.x,
			this.mouse.x * 0.2 + this.options.position.x,
			0.1
		)
		this.sceneCamera.position.y = THREE.MathUtils.lerp(
			this.sceneCamera.position.y,
			this.mouse.y * 0.2 + this.options.position.y,
			0.1
		)
	}
}
