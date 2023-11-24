import Experience from 'webgl/Experience.js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import addMeshDebug from 'utils/addMeshDebug.js'
import Joconde from 'components/Joconde.js'
import { MeshBasicMaterial } from 'three'

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
				{ cameraZPosition: -35, paintZPosition: -51.25 },
			],
		}

		this.paint = new Joconde()
		this.setLouvreModel()
		this.setRoomModel()
		this.setShopModel()
		this.setItalyModel()
		this.setAnimation()
		this.timelineInteractions()

		if (this.debug.active) this.setDebug()
	}

	timelineInteractions() {
		document.querySelectorAll('.timeline-item').forEach((item, index) => {
			item.addEventListener('click', () => {
				document.querySelectorAll('.timeline-item').forEach((element) => element.classList.remove('active'))
				item.classList.add('active')
				this.setSection(index)
			})
		})
	}

	setMaterialTransition(material, sceneName) {
		this[sceneName + 'FragmentsUniforms'] = []
		material.onBeforeCompile = (shader) => {
			shader.fragmentShader = `
						uniform float uProgress;
						varying vec2 vUv;

						float random (in vec2 st) {
								return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
						}

						float noise (in vec2 st) {
								vec2 i = floor(st);
								vec2 f = fract(st);

								// Four corners in 2D of a tile
								float a = random(i);
								float b = random(i + vec2(1.0, 0.0));
								float c = random(i + vec2(0.0, 1.0));
								float d = random(i + vec2(1.0, 1.0));

								// Smooth Interpolation

								// Cubic Hermine Curve.  Same as SmoothStep()
								vec2 u = f*f*(3.0-2.0*f);
								// u = smoothstep(0.,1.,f);

								// Mix 4 coorners percentages
								return mix(a, b, u.x) +
												(c - a)* u.y * (1.0 - u.x) +
												(d - b) * u.x * u.y;
						}
						${shader.fragmentShader}
					`
			shader.fragmentShader = shader.fragmentShader.replace(
				`#include <dithering_fragment>`,
				`#include <dithering_fragment>

						float distance = distance(vUv, vec2(0.4, 0.42));

						float alpha = smoothstep(uProgress, uProgress + noise(vUv *50.) * 0.1, distance );

						vec4 placeholderColor = vec4(0.95, 0.81, 0.62, 1.);
						vec4 color = mix(gl_FragColor, placeholderColor, alpha);
						gl_FragColor = vec4(color.rgb, 1.0);
					`,
			)
			shader.uniforms.uProgress = { value: 0 }
			this[sceneName + 'FragmentsUniforms'].push(shader.uniforms)

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

	setLouvreModel() {
		this.louvreModel = this.resources.items.louvreSceneModel.scene
		this.louvreModel.name = 'louvreScene'
		this.scene.add(this.louvreModel)
	}

	setRoomModel() {
		this.roomModel = this.resources.items.shopSceneModel.scene
		this.roomModel.position.z = -16
		this.roomModel.name = 'roomScene'
		this.scene.add(this.roomModel)

		this.roomModel.traverse((child) => {
			if (child.material) {
				this.setMaterialTransition(child.material, 'roomScene')
			}
		})
	}

	setShopModel() {
		this.shopModel = this.resources.items.shopSceneModel.scene.clone()
		this.shopModel.position.z = -32
		this.shopModel.name = 'shopScene'
		this.scene.add(this.shopModel)

		this.shopModel.traverse((child) => {
			if (child.material) {
				// this.setMaterialTransition(child.material, 'shopScene')
			}
		})
	}

	setItalyModel() {
		this.italyModel = this.resources.items.louvreSceneModel.scene.clone()
		this.italyModel.position.z = -48
		this.italyModel.name = 'italyScene'
		this.scene.add(this.italyModel)

		this.italyModel.traverse((child) => {
			if (child.material) {
				// this.setMaterialTransition(child.material, 'italyScene')
			}
		})
	}

	setSection(sectionNumber, force = false) {
		if (sectionNumber === this.options.scene && !force) return
		const isReverse = this.options.scene >= sectionNumber
		this.options.scene = sectionNumber

		document.querySelectorAll('.timeline-item').forEach((item, i) => {
			item.classList.toggle('active', i === sectionNumber)
		})

		const paintTween = gsap.to(this.paint.mesh.position, {
			z: this.options.sceneParams[sectionNumber].paintZPosition,
			ease: this.options.isChanging ? 'power4.out' : 'power4.inOut',
			overwrite: 'auto',
			onUpdate: () => {
				if (!this.options.isChanging) return
				const progress = paintTween.progress()
				if (progress > 0.6) {
					this.options.isChanging = false
					if (sectionNumber === 1) {
						this.roomSceneFragmentsUniforms.forEach((uniform) => {
							gsap.to(uniform.uProgress, {
								value: 0.8,
								duration: 30,
								ease: 'power4.out',
								overwrite: true,
							})
						})
					}
					if (sectionNumber === 2) {
						this.shopSceneFragmentsUniforms.forEach((uniform) => {
							gsap.to(uniform.uProgress, {
								value: 0.8,
								duration: 30,
								ease: 'power4.out',
								overwrite: true,
							})
						})
					}
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

		this.setChapterNumber()
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

	setChapterNumber() {
		document.querySelector('.chapter-num').innerHTML = this.options.scene + 1
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
		addMeshDebug(this.debugFolder, this.shopModel)
		addMeshDebug(this.debugFolder, this.louvreModel)
	}
}
