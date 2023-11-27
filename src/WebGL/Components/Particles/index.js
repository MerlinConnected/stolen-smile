import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, MathUtils, Points, ShaderMaterial } from 'three'
import Experience from 'webgl/Experience.js'
import addMeshDebug from 'utils/addMeshDebug.js'
import vertexShader from './shader.vert'
import fragmentShader from './shader.frag'

export default class Particles {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.debug = this.experience.debug
		this.time = this.experience.time

		this.options = {
			color: new Color(0xdfbb86),
			count: 1000,
			size: {
				min: 0.1,
				max: 1,
			},
			position: {
				x: { min: -6, max: 6 },
				y: { min: 0, max: 6 },
				z: { min: -36, max: 4 },
			},
		}

		this.setInstance()

		if (this.debug.active) this.setDebug()
	}

	setInstance() {
		const vertices = new Float32Array(this.options.count * 3)
		const scale = new Float32Array(this.options.count)

		for (let i = 0; i < this.options.count; i++) {
			vertices[i * 3] = MathUtils.randFloat(this.options.position.x.min, this.options.position.x.max)
			vertices[i * 3 + 1] = MathUtils.randFloat(this.options.position.y.min, this.options.position.y.max)
			vertices[i * 3 + 2] = MathUtils.randFloat(this.options.position.z.min, this.options.position.z.max)

			scale[i] = MathUtils.randFloat(this.options.size.min, this.options.size.max)
		}

		this.geometry = new BufferGeometry()
		this.geometry.setAttribute('position', new BufferAttribute(vertices, 3))
		this.geometry.setAttribute('aScale', new BufferAttribute(scale, 1))

		this.material = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			blending: AdditiveBlending,
			depthWrite: false,
			uniforms: {
				uTime: { value: 0 },
				uColor: { value: this.options.color },
			},
		})

		this.points = new Points(this.geometry, this.material)
		this.points.name = 'Particles'
		this.scene.add(this.points)
	}

	setDebug() {
		const positionAttribute = this.geometry.attributes.position
		const updatePositionAttribute = () => {
			for (let i = 0; i < positionAttribute.count; i++) {
				const x = MathUtils.randFloat(this.options.position.x.min, this.options.position.x.max)
				const y = MathUtils.randFloat(this.options.position.y.min, this.options.position.y.max)
				const z = MathUtils.randFloat(this.options.position.z.min, this.options.position.z.max)
				positionAttribute.setXYZ(i, x, y, z)
			}
			positionAttribute.needsUpdate = true
		}

		const debugFolder = addMeshDebug(this.debug.ui, this.points)

		debugFolder.addBinding(this.options, 'count', { min: 0, max: 1000, step: 1 }).on('change', () => {
			positionAttribute.count = this.options.count
			positionAttribute.needsUpdate = true
		})

		debugFolder.addBinding(this.options, 'color', { color: { type: 'float' } })

		debugFolder
			.addBinding(this.options.position, 'x', { min: -50, max: 50, step: 1 })
			.on('change', updatePositionAttribute)
		debugFolder
			.addBinding(this.options.position, 'y', { min: -50, max: 50, step: 1 })
			.on('change', updatePositionAttribute)
		debugFolder
			.addBinding(this.options.position, 'z', { min: -50, max: 50, step: 1 })
			.on('change', updatePositionAttribute)
	}

	update() {
		this.material.uniforms.uTime.value = this.time.elapsed
	}
}
