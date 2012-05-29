// JavaScript Document
// Author: Bill, 2012
// <!--#config timefmt="%A %B %d, %Y %H:%M:%S" -->
// This file last modified <!--#echo var="LAST_MODIFIED" -->

var camera, cameraTarget, scene, renderer;
var controls;
var keyboard={}, mouse={};

var ray, mouse2D, projector;
var voxelPosition=new THREE.Vector3();
var plane;
var rollOverGeo, rollOverMesh, rollOverMaterial;
var cubeGeo, cubeMaterial;
	
var sceneWidth, sceneHeight;

var container, stats;

var BigBox={};
BigBox.callback={
	planet: {
		update: undefined
	}
};
BigBox.config={
	stars: {
		enable: true,
		number: 400,
		color: 0x888888
	},
	plane: {
		enable: true
	},
	coordinate: {
		enable: true
	},
	pause: false,
	cameraRadius: 250,
	gridLength: 200,
	boundary: {
		width: 4000,	// x
		height: 4000,	// y
		depth: 4000		// z
	},
	background: "#000",
	initCameraPosition: {
		x: 800,
		y: 800*Math.sqrt(2),
		z: 800
	}
};

$(function(){
	init();
	animate();
});

function init() {
	// include physijs lib
	//Physijs.scripts.worker="js/physijs_worker.js";
	//Physijs.scripts.ammo="ammo.js"; // should no js/ prefix, bug?
	
	container=$("#container");
	sceneWidth=window.innerWidth;
	sceneHeight=window.innerHeight-60;

	scene = new THREE.Scene();
	//scene=new Physijs.Scene(); // replace the THREE Scene with Physijs Scene to take physics engine effect
	//scene.setGravity(new THREE.Vector3(0,0,0));

	renderer = new THREE.WebGLRenderer({antialias:true, maxLights:8, preserveDrawingBuffer:true});
	renderer.setSize(sceneWidth, sceneHeight);
	renderer.sortObjects=false;  // don't sort it due to a render bug will occurs while some object is on the same position (shaking render)

	//document.getElementById("container").appendChild(renderer.domElement);
	var canvasNode=$(renderer.domElement).appendTo(container);
	$(canvasNode).css("padding", "0");
	$(canvasNode).css("margin", "0");
	$(canvasNode).css("background", BigBox.config.background);

	initClock();

	initPlanet();

	//initEnemy();
	
	createEventListener();
	
	createCamera();

	createCoordinate();
	
	createParticleSystem();
	
	createPlane();
	
	createRollOverHelper();
	
	createCube();

	createProjector();
	
	createLight();

	createStats();
	
	createPlanet();
}

function initClock() {
	BigBox["clock"]=new THREE.Clock(true);
}

function initPlanet() {
	BigBox["planet"]=[];
	BigBox.callback.planet.update=function(delta, planet) {
		// rotate it
		if(planet.userdata.rotationSpeed) {
			planet.rotation.x+=planet.userdata.rotationSpeed.x*delta;
			planet.rotation.y+=planet.userdata.rotationSpeed.y*delta;
			planet.rotation.z+=planet.userdata.rotationSpeed.z*delta;
		}
		
		// translate it
		if(planet.userdata.revolutionSpeed) {
			var angleSpeed=delta*planet.userdata.revolutionSpeed;
			
			planet.orbit=planet.orbit?planet.orbit:{};
			planet.orbit.limit=undefined==planet.orbit.limit?Math.abs(planet.userdata.position.y):planet.orbit.limit;
			planet.orbit.trend=undefined==planet.orbit.trend?1:planet.orbit.trend;
			
			var x=Math.cos(angleSpeed)*planet.position.x-Math.sin(angleSpeed)*planet.position.z,
				z=Math.sin(angleSpeed)*planet.position.x+Math.cos(angleSpeed)*planet.position.z,
				y=planet.position.y;
				
			if(y>planet.orbit.limit) {
				planet.orbit.trend=-1;
			}else if(y<-planet.orbit.limit){
				planet.orbit.trend=1;
			}
			
			var omega=Math.abs((angleSpeed/(2*Math.PI))%(2*Math.PI)); // don't make it larger than 2*PI
			y+=omega*planet.orbit.limit*planet.orbit.trend;
			
			planet.position=new THREE.Vector3(x,y,z);
		}
		
		// recursive to children
		var elements=planet.children;
		for(var i=0; i<elements.length; i++) {
			if(elements[i].userdata && elements[i].userdata.update) {
				if(typeof(elements[i].userdata.update)==="function") {
					elements[i].userdata.update(delta, elements[i]);
				}else if(typeof(elements[i].userdata.update==="string")) {
					BigBox.callback.planet[elements[i].userdata.update](delta, elements[i]);
				}
			}
		}
	}
	
	{	/* Planet Data */
		BigBox["planet"]=_DATA;
	}
	
	
	{
		for(var key in BigBox["planet"]) {
			var planet=BigBox["planet"][key];
			
			// setup planet main body
			if(planet && !planet.disable) {
				loadGeo(planet);
				loadMat(planet);
			
				// setup clouds
				if(planet.clouds) {
					loadGeo(planet.clouds);
					loadMat(planet.clouds);
				}
				
				// setup satillites
				var satls=planet.satillites;
				for(var j=0; satls && j<satls.length; j++) {
					loadGeo(satls[j]);
					loadMat(satls[j]);
				}
			}
		}
	}
	
}

function loadGeo(object) {
	if(object.shape=="ring") {
		geo=new THREE.RingGeometry(object.radius, object.tube, 30, 300, undefined, 8); // ( radius, tube, segmentsR, segmentsT, arc, extrude )
		object.geo=geo;
	}else{
		geo=new THREE.SphereGeometry(object.radius, 100, 50); // ( radius, segmentsWidth, segmentsHeight )
		geo.computeTangents();
		object.geo=geo;
	}
}
function loadMat(object) {
	var mat, geo;
	
	if(object.texture.shader=="normal") {
		var shader=THREE.ShaderUtils.lib["normal"];
		
		// setup materials
		var uniforms=THREE.UniformsUtils.clone(shader.uniforms);
		uniforms["tNormal"].texture=THREE.ImageUtils.loadTexture(object.texture.normal);
		uniforms["uNormalScale"].value=object.texture.normalScale;
		
		uniforms["tDiffuse"].texture=THREE.ImageUtils.loadTexture(object.texture.diffuse);
		uniforms["tSpecular"].texture=THREE.ImageUtils.loadTexture(object.texture.specular);
		
		uniforms["enableAO"].value=object.texture.enableAO;
		uniforms["enableDiffuse"].value=object.texture.enableDiffuse;
		uniforms["enableSpecular"].value=object.texture.enableSpecular;
		
		uniforms["uDiffuseColor"].value.setHex(object.texture.diffuseColor);
		uniforms["uSpecularColor"].value.setHex(object.texture.specularColor);
		uniforms["uAmbientColor"].value.setHex(object.texture.ambientColor);
		
		uniforms["uShininess"].value=object.texture.shininess;
		uniforms["uOpacity"].value=object.texture.opacity;
		
		uniforms["uDiffuseColor"].value.convertGammaToLinear();
		uniforms["uSpecularColor"].value.convertGammaToLinear();
		uniforms["uAmbientColor"].value.convertGammaToLinear();
		
		mat=new THREE.ShaderMaterial({
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: uniforms,
			lights: true,
			transparent: true
		});
		object.mat=mat;
		
	}else if(object.texture.shader=="lambert") {
		mat=new THREE.MeshLambertMaterial({
			color: object.texture.color,
			emissive: object.texture.emissive,
			ambient: object.texture.ambient,
			opacity: object.texture.opacity,
			map: THREE.ImageUtils.loadTexture(object.texture.diffuse),
			transparent: true
		});
		object.mat=mat;
		
	}else if(object.texture.shader=="phong") {
		mat=new THREE.MeshPhongMaterial({
			color: object.texture.color, 
			emissive: object.texture.emissive,
			ambient: object.texture.ambient,
			opacity: object.texture.opacity,
			shininess: object.texture.shininess,
			map: THREE.ImageUtils.loadTexture(object.texture.diffuse),
			transparent: true
		});
		object.mat=mat;
		
	}else if(object.texture.shader=="ring") {
		// setup materials
		var fragmentShader=[
			"uniform sampler2D texture1;",
			"uniform sampler2D texture2;",
			
			"varying vec2 vUv;",
			
			"void main(void) {",
			"	vec2 position;",
			
			"	if(vUv.y<0.5) position=vec2(2.0*vUv.y, vUv.x);",
			"	else position=vec2(2.0-2.0*vUv.y, vUv.x);",
			
			"	vec2 p;",
			"	p=vec2(position.x, position.y);",
			
			"	float a=texture2D(texture1, p).r;",
			"	a=a*a;", // let a more effective
			"	vec3 color=texture2D(texture2, p).rgb;",
			
			"	gl_FragColor=vec4(color, a);",
			//"	gl_FragColor=vec4(mix(gl_FragColor.rgb, color, a), a);",  // x*(1-a) + y*a
			"}"
		];
		
		var vertexShader=[
			"uniform vec2 uvScale;",
			"varying vec2 vUv;",
			
			"void main() {",
			"	vUv = uvScale * uv;",
			"	vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);",
			"	gl_Position = projectionMatrix * mvPosition;",
			"}"
		];
		
		object.texture.uniforms.texture1.texture=THREE.ImageUtils.loadTexture(object.texture.uniforms.texture1.texture);
		object.texture.uniforms.texture2.texture=THREE.ImageUtils.loadTexture(object.texture.uniforms.texture2.texture);
		
		object.texture.uniforms.texture1.texture.wrapS=object.texture.uniforms.texture1.texture.wrapT=THREE.Repeat;
		object.texture.uniforms.texture2.texture.wrapS=object.texture.uniforms.texture2.texture.wrapT=THREE.Repeat;
		
		mat=new THREE.ShaderMaterial({
			fragmentShader: fragmentShader.join("\n"),
			vertexShader: vertexShader.join("\n"),
			uniforms: object.texture.uniforms,
			transparent: true
		});
		
		object.mat=mat;
		
	}else if(object.texture.shader=="lava") {
		// setup materials
		var fragmentShader=[
			"uniform float time;",
			"uniform sampler2D texture1;",
			
			"varying vec2 vUv;",
			
			"void main(void) {",
			"	vec2 p=vUv + vec2(-0.5, 2.0) * time * 0.004;",
			"	float alpha=1.0-texture2D(texture1, p).r;",
			"	alpha=mix(alpha, 1.0, 0.7);", // x*(1-a) + y*a
			
			"	gl_FragColor=vec4(texture2D(texture1, p).rgb, alpha);",
			"}"
		];
		
		var vertexShader=[
			"uniform vec2 uvScale;",
			"varying vec2 vUv;",
			
			"void main() {",
			"	vUv = uvScale * uv;",
			"	vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);",
			"	gl_Position = projectionMatrix * mvPosition;",
			"}"
		];
		
		object.texture.uniforms.texture1.texture=THREE.ImageUtils.loadTexture(object.texture.uniforms.texture1.texture);
		
		object.texture.uniforms.texture1.texture.wrapS=object.texture.uniforms.texture1.texture.wrapT=THREE.Repeat;
		
		mat=new THREE.ShaderMaterial({
			fragmentShader: fragmentShader.join("\n"),
			vertexShader: vertexShader.join("\n"),
			uniforms: object.texture.uniforms,
			transparent: true
		});
		
		object.mat=mat;
		
	}
	
}

function loadMesh(object, parent) {
	if(object.disable) return;
	
	var mesh=new THREE.Mesh(
		object.geo,
		object.mat
	);
	mesh.scale.set(
		object.scale,
		object.scale,
		object.scale
	);
	mesh.castShadow=true;
	mesh.receiveShadow=true;
	mesh.rotation=object.tilt?object.tilt.clone():new THREE.Vector3(0,0,0);
	mesh.position=object.position?object.position.clone():new THREE.Vector3(0,0,0);
	mesh["userdata"]=object;
	
	// clouds
	if(object.clouds) {
		loadMesh(object.clouds, mesh);
	}
	
	// satillites
	var satls=object.satillites;
	for(var j=0; satls && j<satls.length; j++) {
		loadMesh(satls[j], mesh);
	}
	
	// lens light
	if(object.spontlight){
		var light=new THREE.PointLight(
			object.spontlight.color, 
			object.spontlight.intensity, 
			object.spontlight.distance
		);
		
		light.position=object.spontlight.position.clone();
		//light.castShadow=true;
		//light.shadowDarkness=.5;
		
		mesh.add(light);
	}
	
	if(parent) {
		parent.add(mesh);
	}else {
		scene.add(mesh);
	}
	
}

function createPlanet() {
	
	for(var key in BigBox["planet"]) {
		
		loadMesh(BigBox["planet"][key], scene);
		
	}
	
}

function initEnemy() {
	BigBox["enemy"]=[];
	
	for(var i=0; i<10; i++) {
		var color=parseInt((0xffffff/12)*(i+1));
		
		var radius=THREE.Math.randInt(i, 4*i);
		var geo=new THREE.SphereGeometry(radius);
		var mat=Physijs.createMaterial(new THREE.MeshBasicMaterial({color:color, wireframe:true}), .2, 1);
		
		BigBox["enemy"].push({geo: geo, mat: mat});
	}
}

function createEnemy() {
	var which=THREE.Math.randInt(0, BigBox.enemy.length-1);
	
	var object=new Physijs.SphereMesh(
		BigBox["enemy"][which].geo,
		BigBox["enemy"][which].mat
	);
	
	var vec=new THREE.Vector3(THREE.Math.randFloatSpread(1000), 200, THREE.Math.randFloatSpread(1000));
	object.position=vec;
	
	scene.add(object);
	
	vec=vec.clone().negate().setY(0).normalize().multiplyScalar(5);
	object.setLinearVelocity(vec);
}

function createCamera() {/*
	camera = new THREE.PerspectiveCamera( //(http://mrdoob.github.com/three.js/docs/49/#PerspectiveCamera)
		75, // fov
		sceneWidth / sceneHeight, // aspect 
		1, // near
		10000 //far
	);
	camera.position.z = 400;
	camera.position.y = 400;
	camera.position.x = 400;*/
	
	camera=new THREE.CombinedCamera(sceneWidth, sceneHeight, 45, 1 , 20000, -2000, 20000);
	camera.position.z = BigBox.config.initCameraPosition.z;
	camera.position.y = BigBox.config.initCameraPosition.y; // take it 45 degree overlook
	camera.position.x = BigBox.config.initCameraPosition.x;
	
	scene.add( camera );
	
	cameraTarget=new THREE.Vector3(0,0,0);
	
	controls=new THREE.TrackballControlsEx(camera, renderer.domElement);
	controls.rotateSpeed=1.0;
	controls.zoomSpeed=1.2;
	controls.panSpeed=0.2;
	controls.noZoom=false;
	controls.noPan=false;
	controls.staticMoving=false;
	controls.dynamicDampingFactor=.3;
	controls.minDistance=BigBox.config.cameraRadius*1;
	controls.maxDistance=BigBox.config.cameraRadius*40;
	controls.keys=[65,83,68];// rotate, zoom, pan
	controls.target=cameraTarget;
}

function createLight() {
	var ambientLight=new THREE.AmbientLight(0xa0a0a0);
	scene.add(ambientLight);
	
	//var directionalLight=new THREE.DirectionalLight(0xffffff);
	//directionalLight.position.set(1, .75, .5).normalize();
	//scene.add(directionalLight);
	
}

function createCube() {
	cubeGeo=new THREE.CubeGeometry(BigBox.config.gridLength,BigBox.config.gridLength,BigBox.config.gridLength);
	cubeMaterial=new THREE.MeshLambertMaterial({
		color: 0x00ff80,
		ambient: 0x00ff80,
		shading: THREE.FlatShading,
		map: THREE.ImageUtils.loadTexture("res/texture/square-outline-textured.png")
	});
	cubeMaterial.color.setHSV(.1, .7, 1.0);
	cubeMaterial.ambient=cubeMaterial.color;
}

function createStats() {
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.right = '0px';
	container[0].appendChild(stats.domElement);
}

function createProjector() {
	projector=new THREE.Projector();
}

function createParticleSystem() {
	if(!BigBox.config.stars.enable) return;
	
	var geometry=new THREE.Geometry();
	
	for(var i=0; i<BigBox.config.stars.number; i++) {
		var vertex=new THREE.Vector3();
		vertex.x=THREE.Math.randFloatSpread(BigBox.config.boundary.width);
		vertex.y=THREE.Math.randFloatSpread(BigBox.config.boundary.height);
		vertex.z=THREE.Math.randFloatSpread(BigBox.config.boundary.depth);
		
		geometry.vertices.push(vertex);
	}
	
	var particles=new THREE.ParticleSystem(geometry, new THREE.ParticleBasicMaterial({color:BigBox.config.stars.color}));
	scene.add(particles);
}

function createEventListener() {
	// (http://www.quirksmode.org/js/events_advanced.html)
	document.addEventListener("mouseout", onDocumentMouseOut, false);
	document.addEventListener("mouseup", onDocumentMouseUp, false);
	document.addEventListener("mousedown", onDocumentMouseDown, false);
	document.addEventListener("mousemove", onDocumentMouseMove, false); // whether the event handler should be executed in the capturing or in the bubbling phase
	document.addEventListener("keydown", onDocumentKeyDown, false);
	document.addEventListener("keyup", onDocumentKeyUp, false);
	
	window.addEventListener("resize", onWindowResize, false);
}

function createRollOverHelper() {
	rollOverGeo=new THREE.CubeGeometry(BigBox.config.gridLength, 1, BigBox.config.gridLength);
	rollOverMaterial=new THREE.MeshBasicMaterial({color: 0xff0000, opacity: .4, transparent: true});
	rollOverMesh=new THREE.Mesh(rollOverGeo, rollOverMaterial);
	
	scene.add(rollOverMesh);
}

function createPlane() {
	if(!BigBox.config.plane.enable) return;
	
	plane=new THREE.Mesh(
		new THREE.PlaneGeometry(
			BigBox.config.boundary.width, 
			BigBox.config.boundary.depth, 
			BigBox.config.boundary.width/BigBox.config.gridLength, 
			BigBox.config.boundary.depth/BigBox.config.gridLength
		), // (width, depth, segmentsWidth, segmentsDepth) - 50*50 per grid
		new THREE.MeshBasicMaterial({color: 0x555555, wireframe: true})
	);
	//plane.translateY(-10);
	/*
	plane=new Physijs.BoxMesh(
		new THREE.CubeGeometry(boundaryWidth, 0.1, boundaryDepth, boundaryWidth/gridLength, undefined, boundaryDepth/gridLength), // (width, height, depth, segmentsWidth, segmentsHeight, segmentsDepth, materials, sides)
		Physijs.createMaterial(new THREE.MeshBasicMaterial({color: 0x555555, wireframe: true}), .1, 1),
		0
	);
	*/
	scene.add(plane);
	
	mouse2D=new THREE.Vector3(0, 10000, 0.5);
}

function createCoordinate() {
	if(!BigBox.config.coordinate.enable) return;
	
	var geometry=new THREE.Geometry();
	
	geometry.vertices.push(new THREE.Vector3(0,-BigBox.config.boundary.height,0));
	geometry.vertices.push(new THREE.Vector3(0,BigBox.config.boundary.height,0));
	geometry.vertices.push(new THREE.Vector3(-BigBox.config.boundary.width,0,0));
	geometry.vertices.push(new THREE.Vector3(BigBox.config.boundary.width,0,0));
	geometry.vertices.push(new THREE.Vector3(0,0,-BigBox.config.boundary.depth));
	geometry.vertices.push(new THREE.Vector3(0,0,BigBox.config.boundary.depth));
	
	var line=new THREE.Line(
		geometry,
		new THREE.LineBasicMaterial({color: 0x00ff00, opacity: .5}),
		THREE.LinePieces
	);
	line.matrixAutoUpdate=false;
	
	scene.add(line);
}

function onWindowResize(event) {
	screenWidth=window.innerWidth;
	screenHeight=window.innerHeight-60;
	
	renderer.setSize(screenWidth, screenHeight);
	
	camera.aspect=screenWidth/screenHeight;
	camera.updateProjectionMatrix();
	
	controls.screen.width=screenWidth;
	controls.screen.height=screenHeight;
	
}

function onDocumentMouseDown(event) {
	event.preventDefault();
	
	switch(event.button) {
		case 1:	mouse["left"]=true;break;
		case 2: mouse["right"]=true;break;
		case 4: mouse["middle"]=true;break;
	}
	
	var intersects=ray.intersectObjects(scene.children);
	
	if(intersects.length>0 && event.button===0) {
		var intersector=getRealIntersector(intersects);
		
		if(keyboard["ctrl"] && intersector.object!=plane) {
			scene.remove(intersector.object);
		}else if(false){
			setVoxelPosition(intersector);
			
			var voxel=new Physijs.BoxMesh(cubeGeo, Physijs.createMaterial(cubeMaterial, 0, 1), 0);
			voxel.position.copy(voxelPosition);
			voxel.matrixAutoUpdate=false;
			voxel.updateMatrix();
			scene.add(voxel);
		}else {
			controls.target=voxelPosition.clone();
		}
	}
}

function onDocumentMouseUp(event) {
	switch(event.button) {
		case 1:	mouse["left"]=false;break;
		case 2: mouse["right"]=false;break;
		case 4: mouse["middle"]=false;break;
	}
}

function onDocumentMouseOut(event) {
	mouse["left"]=false;
	mouse["right"]=false;
	mouse["middle"]=false;
}

function onDocumentMouseMove(event) {
	event.preventDefault();
	
	// in quadrant (-1, 1) * (-1, 1)
	var x=(event.clientX / sceneWidth) * 2 - 1;
	var y=-(event.clientY / sceneHeight) * 2 + 1;
	
	mouse2D.lastX=mouse2D.x?mouse2D.x:x;
	mouse2D.lastY=mouse2D.y?mouse2D.y:y;
	
	mouse2D.x=x;
	mouse2D.y=y;
	
}

function onDocumentKeyDown(event) {
	switch(event.keyCode) {
		case 16: keyboard["shift"]=true; break;
		case 17: keyboard["ctrl"]=true; break;
	}
}

function onDocumentKeyUp(event) {
	switch(event.keyCode) {
		case 16: keyboard["shift"]=false; break;
		case 17: keyboard["ctrl"]=false; break;
	}
}

function screenShot() {
	window.open(renderer.domElement.toDataURL("image/png"), "BigBoxScreenShot");
}


function getRealIntersector(intersects) {
	for(var i=0; i<intersects.length; i++) {
		var intersector=intersects[i];
		
		if(intersector.object!=rollOverMesh /*&& intersector.object.userdata*/) {
			return intersector;
		}
	}
	return null;
}

function setVoxelPosition(intersector) {
	var tmpVec=new THREE.Vector3();
	tmpVec.copy(intersector.face.normal);
	
	voxelPosition.add(intersector.point, intersector.object.matrixRotationWorld.multiplyVector3(tmpVec));
	
	voxelPosition.x=Math.floor(voxelPosition.x / BigBox.config.gridLength) * BigBox.config.gridLength + (BigBox.config.gridLength/2);
	voxelPosition.y=1; /*Math.floor(voxelPosition.y / BigBox.config.gridLength) * BigBox.config.gridLength + (BigBox.config.gridLength/2)*/
	voxelPosition.z=Math.floor(voxelPosition.z / BigBox.config.gridLength) * BigBox.config.gridLength + (BigBox.config.gridLength/2);
}

function animate() {
	// note: three.js includes requestAnimationFrame shim
	requestAnimationFrame( animate );
	
	render();

	stats.update();
}

function render() {
	var delta=BigBox.clock.getDelta();
	
	//updateEnemy();
	
	updatePlanet(delta);
	
	updatePicking();
	
	updateCamera();
	
	//scene.simulate(undefined, 2);

	renderer.render( scene, camera );

}

function updatePlanet(delta) {
	if(BigBox.config.pause) return;
	
	var objects=scene.children;
	for(var i=0; i<objects.length; i++) {
		var target=objects[i];
		
		if(!target.userdata) continue; // if no userdata, next
		
		if(typeof(target.userdata.update)==="function") {
			// it's a custom function
			target.userdata.update(delta, objects[i]);
		}else if(typeof(target.userdata.update)==="string"){
			BigBox.callback.planet[target.userdata.update](delta, objects[i]);
		}else{
			// undefined, do nothing
		}
	}
}

function updatePicking() {
	ray=projector.pickingRay(mouse2D.clone(), camera);
	var intersects=ray.intersectObjects(scene.children);
	if(intersects.length>0) {
		// https://github.com/mrdoob/three.js/blob/master/src/core/Ray.js
		// intersect={distance, point, face, object)
		var intersector=getRealIntersector(intersects);
		
		if(intersector) {
			setVoxelPosition(intersector);
			rollOverMesh.position=voxelPosition;
		}
		
	}
}

function updateCamera() {
	controls.update();
}

function updateEnemy() {
	var second=parseInt(BigBox["clock"].getElapsedTime());
	var seed=THREE.Math.randInt(5, 20);
	BigBox["lastEnemyCreatedTime"]=BigBox["lastEnemyCreatedTime"]?parseInt(BigBox["lastEnemyCreatedTime"]):0;
	
	if(second!=0 && BigBox["lastEnemyCreatedTime"]!=second && second-BigBox["lastEnemyCreatedTime"]>seed) {
		createEnemy();
		BigBox["lastEnemyCreatedTime"]=second;
	}
}



