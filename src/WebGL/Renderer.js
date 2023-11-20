import Experience from './Experience.js'
import { WebGLRenderer } from 'three'
import { EffectComposer, RenderPass, EffectPass, DepthOfFieldEffect } from 'postprocessing'

export default class Renderer {
	constructor() {
		this.experience = new Experience()
		this.canvas = this.experience.canvas
		this.sizes = this.experience.sizes
		this.scene = this.experience.scene
		this.camera = this.experience.camera

		this.options = {
			postprocessing: false,
		}

		this.setInstance()
		this.setPostProcessing()
	}

	setInstance() {
		this.instance = new WebGLRenderer({
			canvas: this.canvas,
			powerPreference: 'high-performance',
		})
		this.instance.setSize(this.sizes.width, this.sizes.height)
		this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
	}

	setPostProcessing() {
		this.composer = new EffectComposer(this.instance)
		const renderPass = new RenderPass(this.scene, this.camera.instance)
		this.composer.addPass(renderPass)

		const depthOfFieldEffect = new DepthOfFieldEffect(this.camera.instance, {
			focusDistance: 0.45,
			bokehScale: 10,
		})

		const effectPass = new EffectPass(this.camera.instance, depthOfFieldEffect)
		this.composer.addPass(effectPass)
	}

	resize() {
		this.instance.setSize(this.sizes.width, this.sizes.height)
		this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
	}

	update() {
		if (this.options.postprocessing) {
			this.composer.render()
		} else {
			this.instance.render(this.scene, this.camera.instance)
		}
	}
}
