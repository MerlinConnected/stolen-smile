import Experience from 'webgl/Experience.js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import addMeshDebug from 'utils/addMeshDebug.js'
import Joconde from 'components/Joconde.js'

gsap.registerPlugin(ScrollTrigger)

export default class SceneComponent {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.resources = this.experience.resources
		this.debug = this.experience.debug
		this.camera = this.experience.camera

		this.options = {
			scene: 0,
			isChanging: false,
			sceneParams: [
				{
					cameraZPosition: 13,
					paintZPosition: -3.25,
				},
				{ cameraZPosition: -3, paintZPosition: -19.25 },
				{ cameraZPosition: -19, paintZPosition: -35.25 },
			],
		}

		this.paint = new Joconde()
		this.setLouvreModel()
		this.setRoomModel()
		this.setShopModel()
		this.setAnimation()
		if (this.debug.active) this.setDebug()
	}

	setLouvreModel() {
		this.louvreModel = this.resources.items.louvreSceneModel.scene
		this.louvreModel.name = 'louvreScene'
		this.scene.add(this.louvreModel)
	}

	setRoomModel() {
		this.roomModel = this.resources.items.louvreSceneModel.scene.clone()
		this.roomModel.position.z = -16
		this.roomModel.name = 'roomScene'
		this.scene.add(this.roomModel)

		this.roomModel.traverse((child) => {
			if (child.material?.name.includes('Paper')) {
				//shader reveal effect from center (use fragment shader)
				child.material.onBeforeCompile = (shader) => {
					shader.fragmentShader = `
						uniform float uProgress;
						varying vec2 vUv;
						${shader.fragmentShader}
					`
					console.log(shader.fragmentShader)
					shader.fragmentShader = shader.fragmentShader.replace(
						`#include <dithering_fragment>`,
						`#include <dithering_fragment>
						float distance = distance(vUv, vec2(0.4, 0.42));

						float alpha = smoothstep(uProgress, uProgress + 0.1, distance);
						vec4 placeholderColor = vec4(vec3(0.95, 0.81, 0.62), 1.0);
						vec4 color = mix(gl_FragColor, placeholderColor, alpha);
						gl_FragColor = vec4(color.rgb, 1.0);
					`,
					)
					this.fragmentUniforms = shader.uniforms
					this.fragmentUniforms.uProgress = { value: 1 }

					const vertexShader = shader.vertexShader
					shader.vertexShader = `
						varying vec2 vUv;
						${vertexShader}
					`
					shader.vertexShader = shader.vertexShader.replace(
						`#include <begin_vertex>`,
						`
						#include <begin_vertex>
						vUv = uv;
					`,
					)
				}
			}
		})
	}

	setShopModel() {
		this.shopModel = this.resources.items.louvreSceneModel.scene.clone()
		this.shopModel.position.z = -32
		this.shopModel.name = 'shopScene'
		this.scene.add(this.shopModel)
	}

	setSection(sectionNumber, force = false) {
		if (sectionNumber === this.options.scene && !force) return
		const isReverse = this.options.scene >= sectionNumber
		this.options.scene = sectionNumber

		const paintTween = gsap.to(this.paint.mesh.position, {
			z: this.options.sceneParams[sectionNumber].paintZPosition,
			ease: this.options.isChanging ? 'power4.out' : 'power4.inOut',
			overwrite: 'auto',
			onUpdate: () => {
				if (!this.options.isChanging) return
				const progress = paintTween.progress()
				if (progress > 0.6) {
					this.options.isChanging = false
				}
			},
			onStart: () => {
				this.options.isChanging = true
			},
		})
		gsap.to(this.camera.sceneCamera.position, {
			z: this.options.sceneParams[sectionNumber].cameraZPosition,
			ease: this.options.isChanging ? 'power2.out' : 'power2.inOut',
			overwrite: 'auto',
		})

		if (sectionNumber === 1) {
			this.fragmentUniforms.uProgress.value = 0
			gsap.to(this.fragmentUniforms.uProgress, {
				value: 0.6,
				duration: 10,
				ease: 'power4.out',
				overwrite: true,
				onUpdate: () => {
					console.log(this.fragmentUniforms.uProgress.value)
				},
			})
		}

		// if (!isReverse) {
		// 	gsap.to(this.camera.sceneCamera, {
		// 		keyframes: [
		// 			{ ease: 'power1.in', duration: 0.9, fov: 12 },
		// 			{ ease: 'power1.out', duration: 1, fov: this.camera.options.fov },
		// 		],
		// 		delay: 2,
		// 		onUpdate: () => {
		// 			this.camera.sceneCamera.updateProjectionMatrix()
		// 		},
		// 	})
		// }
	}

	setAnimation() {
		gsap.defaults({ ease: 'power3.inOut', duration: 2 })

		this.options.sceneParams.forEach((_, index) => {
			ScrollTrigger.create({
				trigger: `.section-${index}`,
				start: 'top top',
				onToggle: (self) => {
					if (!self.isActive) return
					this.setSection(index)
					if (this.debugFolder) {
						this.debugFolder.refreshing = true
						this.debugFolder.refresh()
						this.debugFolder.refreshing = false
					}
				},
			})
		})
	}

	setDebug() {
		this.debugFolder = this.debug.ui.addFolder({ title: 'scene', expanded: true })

		this.debugFolder
			.addBinding(this.options, 'scene', {
				min: 0,
				max: this.options.sceneParams.length - 1,
				step: 1,
			})
			.on('change', (event) => {
				if (this.debugFolder.refreshing) return
				this.setSection(event.value, true)
			})

		addMeshDebug(this.debugFolder, this.louvreModel)
		addMeshDebug(this.debugFolder, this.roomModel)
	}
}
