_DATA={
	"solar": {
		name: "Solor",
		type: "planet",
		geo: undefined, mat: undefined,
		position: new THREE.Vector3(1,1,1),
		radius: 200,
		tilt: new THREE.Vector3(0, 0, 0), // in radians
		scale: 1,
		revolutionSpeed: 0,
		rotationSpeed: new THREE.Vector3(0, 0.08, 0),
		mass: 0, // static
		texture: {
			shader: "phong",
			color: 0xff7777,
			emissive: 0xaa6666,
			ambient: 0xff7777,
			shininess: 50,
			diffuse: "res/texture/solar_atmos_1024.jpg" 
		},
		spontlight: {
			distance: 5000,
			color: 0xffffff,
			position: new THREE.Vector3(0,0,0),
			intensity: 3
		},
		clouds: { /* TODO: some bugs here */
			disable: false,
			geo: undefined, mat: undefined,
			texture: {
				shader: "lava",
				uniforms: {
					time: {type: "f", value: 1.0},
					uvScale: {type: "v2", value: new THREE.Vector2(1.0, 1.0)},
					texture1: {type: "t", value: 1, texture: "res/texture/lavatile_512.jpg"}
				}
			},
			radius: 200,
			tilt: new THREE.Vector3(0,0,0),
			scale: 1.05,
			rotationSpeed: new THREE.Vector3(0, 10, 0),
			update: function(_delta, _theMesh) {
				this.texture.uniforms.time.value+=_delta;
			}
		},
		update: "update"
	},
	
	"jupiter": {
		name: "Jupiter",
		type: "planet",
		geo: undefined, mat: undefined,
		position: new THREE.Vector3(1500,400,60),
		radius: 100,
		tilt: new THREE.Vector3(0, 0, 0), // in radians
		scale: 1,
		revolutionSpeed: 0.01,
		rotationSpeed: new THREE.Vector3(0, 0.05, 0),
		mass: 0, // static
		texture: {
			shader: "phong",
			color: 0x606060,
			ambient: 0x606060,
			diffuse: "res/texture/jupiter_1000.jpg"
		},
		update: "update"
	},
	
	"mars": {
		name: "Mars",
		type: "planet",
		geo: undefined, mat: undefined,
		position: new THREE.Vector3(-360,30,1200),
		radius: 60,
		tilt: new THREE.Vector3(0, 0, 0), // in radians
		scale: 1,
		revolutionSpeed: -0.008,
		rotationSpeed: new THREE.Vector3(0, 0.05, 0),
		mass: 0, // static
		texture: {
			shader: "phong",
			color: 0x606060,
			ambient: 0x606060,
			diffuse: "res/texture/mars_1000.jpg"
		},
		update: "update"
	},
	
	"mercury": {
		name: "Mercury",
		type: "planet",
		geo: undefined, mat: undefined,
		position: new THREE.Vector3(260,-30,400),
		radius: 20,
		tilt: new THREE.Vector3(0, 0, 0), // in radians
		scale: 1,
		revolutionSpeed: -0.042,
		rotationSpeed: new THREE.Vector3(0.01, 0.05, 0),
		mass: 0, // static
		texture: {
			shader: "phong",
			color: 0x606060,
			ambient: 0x606060,
			diffuse: "res/texture/mercury_1024.jpg"
		},
		update: "update"
	},
	
	"saturn": {
		name: "Saturn",
		type: "planet",
		geo: undefined, mat: undefined,
		position: new THREE.Vector3(-1900,150,700),
		radius: 100,
		tilt: new THREE.Vector3(0, 0, -0.2), // in radians
		scale: 1,
		revolutionSpeed: -0.01,
		rotationSpeed: new THREE.Vector3(0, 0.05, 0),
		mass: 0, // static
		texture: {
			shader: "phong",
			color: 0x606060,
			ambient: 0x606060,
			diffuse: "res/texture/saturn_1800.jpg"
		},
		update: "update",
		satillites: [
			{
				name: "Saturn Ring",
				geo: undefined, mat: undefined,
				texture: {
					shader: "ring",
					uniforms: {
						uvScale: {type: "v2", value: new THREE.Vector2(1.0, 1.0)},
						texture1: {type: "t", value: 0, texture: "res/texture/saturn_ring_transparent_915.gif"},
						texture2: {type: "t", value: 1, texture: "res/texture/saturn_ring_915.jpg"}
					}
				},
				update: "update",
				position: new THREE.Vector3(0, 0, 0),
				shape: "ring",
				tube: 20,
				radius: 200,
				tilt: new THREE.Vector3(Math.PI/2,0,0),//Math.PI/2
				scale: 1,
				revolutionSpeed: 0,
				rotationSpeed: new THREE.Vector3(0, 0, 0),// 0,0,1
				mass: 0
			}
		]
	},
	
	"uranus": {
		name: "Uranus",
		type: "planet",
		geo: undefined, mat: undefined,
		position: new THREE.Vector3(-2400,-50,-700),
		radius: 40,
		tilt: new THREE.Vector3(0, 0, -0.2), // in radians
		scale: 1,
		revolutionSpeed: 0.007,
		rotationSpeed: new THREE.Vector3(0, 0.006, 0),
		mass: 0, // static
		texture: {
			shader: "phong",
			color: 0x606060,
			ambient: 0x606060,
			diffuse: "res/texture/uranus_1024.jpg"
		},
		update: "update",
		satillites: [
			{
				name: "Uranus Ring",
				geo: undefined, mat: undefined,
				texture: {
					shader: "ring",
					uniforms: {
						uvScale: {type: "v2", value: new THREE.Vector2(1.0, 1.0)},
						texture1: {type: "t", value: 0, texture: "res/texture/uranus_ring_transparent_1024.gif"},
						texture2: {type: "t", value: 1, texture: "res/texture/uranus_ring_1024.jpg"}
					}
				},
				update: "update",
				position: new THREE.Vector3(0, 0, 0),
				shape: "ring",
				tube: 20,
				radius: 120,
				tilt: new THREE.Vector3(Math.PI/2,0,0),//Math.PI/2
				scale: 1,
				revolutionSpeed: 0,
				rotationSpeed: new THREE.Vector3(0, 0, 0),// 0,0,1
				mass: 0
			}
		]
	},
	
	"terra": {
		name: "Terra",
		type: "planet",
		geo: undefined, mat: undefined, uniforms: undefined,
		position: new THREE.Vector3(900,0,0),
		radius: 80, 
		tilt: new THREE.Vector3(0, 0, 0), // in radians
		scale: 1,
		revolutionSpeed: 0.02,
		rotationSpeed: new THREE.Vector3(0, 0.1, 0),
		mass: 0, // static
		texture: {
			shader: "normal",
			diffuse: "res/texture/earth_atmos_2048.jpg",
			normal: "res/texture/earth_normal_2048.jpg",
			specular: "res/texture/earth_specular_2048.jpg",
			opacity: 1,
			normalScale: 0.85,
			diffuseColor: 0xffffff,
			normalColor: 0x666666,
			specularColor: 0x000000,
			shininess: 20,
			enableAO: false,
			enableDiffuse: true,
			enableSpecular: true
		},
		update: "update",
		clouds: {
			geo: undefined, mat: undefined,
			texture: {
				shader: "lambert",
				color: 0xffffff,
				emissive: 0x000000,
				ambient: 0xffffff,
				opacity: 1,
				diffuse: "res/texture/earth_clouds_1024.png"
			},
			radius: 80,
			tilt: new THREE.Vector3(0,0,0),
			scale: 1.05,
			rotationSpeed: new THREE.Vector3(0, 0.1, 0),
			mass: 0,
			update: "update"
		},
		satillites: [
			{
				name: "Moon",
				geo: undefined, mat: undefined,
				texture: {
					shader: "phong",
					color: 0xffffff,
					emissive: 0x000000,
					ambient: 0xffffff,
					opacity: 1,
					diffuse: "res/texture/moon_1024.jpg"
				},
				position: new THREE.Vector3(150, 10, 0),
				radius: 12,
				tilt: new THREE.Vector3(0,0,.2),
				scale: 1,
				revolutionSpeed: -0.02,
				rotationSpeed: new THREE.Vector3(0, -0.3, 0),
				mass: 0,
				update: "update"
			}
		]
	}
}