import { Uniform, Vector3 } from 'three'
import { BlendFunction, Effect } from 'postprocessing'
import fragmentShader from './shader.frag'
import Experience from 'webgl/Experience.js'

export class Vignette extends Effect {
	constructor() {
		super('Vignette', fragmentShader, {
			blendFunction: BlendFunction.Normal,
			uniforms: new Map([
				['frontTexture', new Uniform(null)],
				['maskTexture', new Uniform(null)],
				['opacity', new Uniform(0)],
			]),
		})

		this.experience = new Experience()
		this.experience.resources.on('ready', () => {
			this.uniforms.get('frontTexture').value = this.experience.resources.items.paperTexture
			this.uniforms.get('maskTexture').value = this.experience.resources.items.vignetteMaskTexture
		})
	}
}
