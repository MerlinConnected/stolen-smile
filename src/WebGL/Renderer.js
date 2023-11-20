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

		this.setInstance()
		this.setPostProcessing()
	}

	setInstance() {
		this.instance = new WebGLRenderer({
			canvas: this.canvas,
			powerPreference: 'high-performance',
			antialias: false,
			stencil: false,
			depth: false,
		})
		// this.instance.outputColorSpace = SRGBColorSpace
		// this.instance.toneMapping = CineonToneMapping
		// this.instance.toneMappingExposure = 1.75
		// this.instance.setClearColor('#211d20')
		this.instance.setSize(this.sizes.width, this.sizes.height)
		this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
	}

	setPostProcessing() {
		this.composer = new EffectComposer(this.instance)
		const renderPass = new RenderPass(this.scene, this.camera.instance)
		this.composer.addPass(renderPass)

		const motionBlurEffect = new DepthOfFieldEffect(this.camera.instance, {
			focusDistance: 0,
			focalLength: 0.1,
			bokehScale: 2,
			height: 480,
		})

		const effectPass = new EffectPass(this.camera.instance, motionBlurEffect)
		this.composer.addPass(effectPass)
	}

	resize() {
		this.instance.setSize(this.sizes.width, this.sizes.height)
		this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
	}

	update() {
		this.composer.render()
	}
}
