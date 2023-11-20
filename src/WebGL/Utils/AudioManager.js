import Experience from 'webgl/Experience.js'
import { AudioListener, Mesh, PositionalAudio, Vector3 } from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

export default class AudioManager {
	constructor() {
		this.experience = new Experience()
		this.resources = this.experience.resources
		this.camera = this.experience.camera
		this.scene = this.experience.scene
		this.debug = this.experience.debug

		this.setCameraListener()
		this.resources.on('ready', () => {
			this.sounds = [
				{
					name: 'earthquake',
					buffer: this.resources.items.earthquakeAudio,
					position: new Vector3(1, 0, 0),
					loop: false,
					refDistance: 20,
					volume: 1,
					autoplay: false,
				},
			]
			this.setSounds()
			if (this.debug.active) this.setDebug()
		})
	}

	setCameraListener() {
		this.audioListener = new AudioListener()
		this.camera.instance.add(this.audioListener)
	}

	setSounds() {
		this.sounds.forEach((sound) => {
			sound.instance = new PositionalAudio(this.audioListener)
			sound.instance.setBuffer(sound.buffer)
			sound.instance.setRefDistance(sound.refDistance || 20)
			sound.instance.setLoop(sound.loop || false)
			sound.instance.setVolume(sound.volume || 1)
			if (sound.autoplay) sound.instance.play()
			sound.mesh = new Mesh()
			sound.mesh.add(sound.instance)
			sound.mesh.position.copy(sound.position)
			sound.mesh.name = sound.name
			this.scene.add(sound.mesh)
		})
	}

	setDebug() {
		this.debugFolder = this.debug.ui.addFolder({ title: 'Audio Manager', expanded: false })
		this.debugFolder
			.addBlade({
				view: 'buttongrid',
				size: [2, 1],
				cells: (x, y) => ({
					title: [['Play all', 'Stop all']][y][x],
				}),
			})
			.on('click', (event) => {
				this.sounds.forEach((sound) => {
					if (event.index[0] === 0) {
						sound.instance.play()
					} else {
						sound.instance.stop()
					}
				})
			})

		this.debugFolder
			.addBinding({ control: false }, 'control', {
				label: 'transform control',
			})
			.on('change', ({ value }) => {
				this.sounds.forEach((sound) => {
					if (value) {
						sound.transform = new TransformControls(this.camera.instance, this.experience.canvas)
						sound.transform.addEventListener('change', () => {
							sound.position.copy(sound.mesh.position)
							this.debug.ui.refresh()
						})
						sound.transform.attach(sound.mesh)
						this.scene.add(sound.transform)
					} else {
						sound.transform.dispose()
						this.scene.remove(sound.transform)
						delete sound.transform
					}
				})
			})

		this.sounds.forEach((sound, index) => {
			const soundFolder = this.debugFolder.addFolder({ title: sound.name, expanded: false })
			soundFolder
				.addBlade({
					view: 'buttongrid',
					size: [2, 1],
					cells: (x, y) => ({
						title: [['Play', 'Stop']][y][x],
					}),
				})
				.on('click', (event) => {
					if (event.index[0] === 0) {
						sound.instance.play()
					} else {
						sound.instance.stop()
					}
				})
			soundFolder.addBinding(sound, 'volume', { label: 'Volume', min: 0, max: 1, step: 0.01 }).on('change', () => {
				sound.instance.setVolume(sound.volume)
			})
			soundFolder
				.addBinding(sound, 'refDistance', { label: 'Ref Distance', min: 0, max: 100, step: 1 })
				.on('change', () => {
					sound.instance.setRefDistance(sound.refDistance)
				})
			soundFolder.addBinding(sound, 'loop', { label: 'Loop' }).on('change', () => {
				sound.instance.setLoop(sound.loop)
			})
			soundFolder.addBinding(sound, 'position', { label: 'Position' }).on('change', () => {
				sound.mesh.position.copy(sound.position)
			})
		})
	}
}
