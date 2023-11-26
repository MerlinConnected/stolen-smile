import Experience from './Experience.js'
import { WebGLRenderer } from 'three'
import { EffectComposer, RenderPass, EffectPass, DepthOfFieldEffect } from 'postprocessing'
import { Vignette } from 'webgl/PostProcessing/vignette/index.js'
import gsap from 'gsap'

export default class Renderer {
	constructor() {
		this.experience = new Experience()
		this.canvas = this.experience.canvas
		this.sizes = this.experience.sizes
		this.scene = this.experience.scene
		this.camera = this.experience.camera
		this.debug = this.experience.debug

		this.options = {
			postprocessing: true,
		}

		this.setInstance()
		this.setPostProcessing()
		if (this.debug.active) this.setDebug()
	}

	setInstance() {
		this.instance = new WebGLRenderer({
			canvas: this.canvas,
			powerPreference: 'high-performance',
			antialias: true,
		})
		this.instance.setClearColor(0xefcb99)
		this.instance.setSize(this.sizes.width, this.sizes.height)
		this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
	}

	setPostProcessing() {
		this.composer = new EffectComposer(this.instance)
		const renderPass = new RenderPass(this.scene, this.camera.instance)
		this.composer.addPass(renderPass)

		this.depthOfFieldEffect = new DepthOfFieldEffect(this.camera.instance, {
			bokehScale: 5,
			resolutionScale: 0.5,
		})

		this.vignetteEffect = new Vignette()

		const effectPass = new EffectPass(this.camera.instance, this.depthOfFieldEffect, this.vignetteEffect)
		this.composer.addPass(effectPass)
	}

	setDebug() {
		this.debugFolder = this.debug.ui.addFolder({ title: 'Postprocessing' })
		this.debugFolder.addBinding(this.options, 'postprocessing', { label: 'active' })
		this.debugFolder.addBinding(this.depthOfFieldEffect, 'bokehScale', {
			label: 'bokehScale',
			min: 0,
			max: 10,
			step: 0.1,
		})
		this.debugFolder.addBinding(this.depthOfFieldEffect.cocMaterial.uniforms.focusRange, 'value', {
			label: 'focusRange',
			min: 0,
			max: 1,
			step: 0.001,
		})
		this.debugFolder.addBinding(this.vignetteEffect.uniforms.get('opacity'), 'value', {
			label: 'vignetteOpacity',
			min: 0,
			max: 1,
			step: 0.001,
		})
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
