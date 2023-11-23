import EventEmitter from './EventEmitter.js'
import { AudioLoader, CubeTextureLoader, TextureLoader } from 'three'
import Experience from 'webgl/Experience.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { Texture, CubeTexture, Object3D, MathUtils } from 'three'

export default class Resources extends EventEmitter {
	constructor(sources) {
		super()

		this.experience = new Experience()
		this.debug = this.experience.debug

		this.sources = sources

		/**
		 * @type {{[name: string]: Texture | CubeTexture | Object3D | AudioBuffer}}
		 */
		this.items = {}
		this.toLoad = this.sources.length
		this.loaded = 0

		if (!this.debug.active || this.debug.debugParams.LoadingScreen) {
			this.setLoadingScreen()
		}
		this.setLoaders()
		this.startLoading()
	}

	setLoadingScreen() {
		this.loadingScreenElement = document.querySelector('.loading')
		this.loadingFirstCharactersElement = document.querySelector('.loading__first-character')
		this.loadingSecondCharacterElement = document.querySelector('.loading__second-character')
	}

	setLoaders() {
		this.loaders = {}
		this.loaders.gltfLoader = new GLTFLoader()
		const dracoLoader = new DRACOLoader()
		dracoLoader.setDecoderPath('/draco/')
		this.loaders.gltfLoader.setDRACOLoader(dracoLoader)
		this.loaders.textureLoader = new TextureLoader()
		this.loaders.cubeTextureLoader = new CubeTextureLoader()
		this.loaders.audioLoader = new AudioLoader()
	}

	startLoading() {
		if (this.debug.active && this.debug.debugParams.ResourceLog) {
			console.debug('⏳ Loading resources...')
			this.totalStartTime = performance.now()
		}
		// Load each source
		for (const source of this.sources) {
			source.startTime = performance.now()

			switch (source.type) {
				case 'gltf':
					this.loaders.gltfLoader.load(source.path, (file) => {
						this.sourceLoaded(source, file)
					})
					break
				case 'texture':
					this.loaders.textureLoader.load(source.path, (file) => {
						this.sourceLoaded(source, file)
					})
					break
				case 'cubeTexture':
					this.loaders.cubeTextureLoader.load(source.path, (file) => {
						this.sourceLoaded(source, file)
					})
					break
				case 'audio':
					this.loaders.audioLoader.load(source.path, (file) => {
						this.sourceLoaded(source, file)
					})
					break
				default:
					console.error(source.type + ' is not a valid source type')
					break
			}
		}
	}

	sourceLoaded(source, file) {
		const { name, path, type, startTime, ...rest } = source
		Object.assign(file, rest)
		this.items[source.name] = file
		this.loaded++
		source.endTime = performance.now()
		source.loadTime = source.endTime - source.startTime

		if (this.debug.active && this.debug.debugParams.ResourceLog)
			console.debug(`🖼️ ${source.name} loaded in ${source.loadTime}ms. (${this.loaded}/${this.toLoad})`)

		if (this.loadingScreenElement) {
			//lerp value
			const progressNumber = (this.loaded / this.toLoad) * 100
			const progress = '0' + progressNumber

			this.loadingFirstCharactersElement.innerHTML = progress.slice(0, 2)
			this.loadingSecondCharacterElement.innerHTML = progress.slice(2, 3)
			this.loadingScreenElement.dataset.progress = progressNumber.toString()
		}

		if (this.loaded === this.toLoad) {
			if (this.debug.active && this.debug.debugParams.ResourceLog) {
				const totalEndTime = performance.now()
				const totalLoadTime = totalEndTime - this.totalStartTime
				console.debug(`✅ Resources loaded in ${totalLoadTime}ms!`)
			}
			if (this.loadingScreenElement) this.loadingScreenElement.remove()
			this.trigger('ready')
		}
	}
}
