/**
 * @author oosmoxiecode
 * @author mr.doob / http://mrdoob.com/
 * based on http://code.google.com/p/away3d/source/browse/trunk/fp10/Away3DLite/src/away3dlite/primitives/Torus.as?r=2888
 * 
 * @author Bill, modified torus to ring geometry
 */

THREE.RingGeometry = function ( radius, tube, segmentsR, segmentsT, arc, extrude ) {

	THREE.Geometry.call( this );

	var scope = this;

	this.radius = radius || 100;
	this.tube = tube || 40;
	this.segmentsR = segmentsR || 8;
	this.segmentsT = segmentsT || 6;
	this.arc = arc || Math.PI * 2;

	var center = new THREE.Vector3(), uvs = [], normals = [];

	for ( var j = 0; j <= this.segmentsR; j ++ ) {

		for ( var i = 0; i <= this.segmentsT; i ++ ) {

			var u = i / this.segmentsT * this.arc;
			var v = j / this.segmentsR * Math.PI * 2;

			center.x = this.radius * Math.cos( u );
			center.y = this.radius * Math.sin( u );

			var vertex = new THREE.Vector3();
			vertex.x = ( this.radius + this.tube * Math.cos( v ) ) * Math.cos( u );
			vertex.y = ( this.radius + this.tube * Math.cos( v ) ) * Math.sin( u );
			vertex.z = this.tube * Math.sin( v ) / (extrude || 1);

			this.vertices.push( vertex );

			uvs.push( new THREE.UV( i / this.segmentsT, 1 - j / this.segmentsR ) );
			normals.push( vertex.clone().subSelf( center ).normalize() );

		}
	}


	for ( var j = 1; j <= this.segmentsR; j ++ ) {

		for ( var i = 1; i <= this.segmentsT; i ++ ) {

			var a = ( this.segmentsT + 1 ) * j + i - 1;
			var b = ( this.segmentsT + 1 ) * ( j - 1 ) + i - 1;
			var c = ( this.segmentsT + 1 ) * ( j - 1 ) + i;
			var d = ( this.segmentsT + 1 ) * j + i;

			var face = new THREE.Face4( a, b, c, d, [ normals[ a ], normals[ b ], normals[ c ], normals[ d ] ] );
			face.normal.addSelf( normals[ a ] );
			face.normal.addSelf( normals[ b ] );
			face.normal.addSelf( normals[ c ] );
			face.normal.addSelf( normals[ d ] );
			face.normal.normalize();

			this.faces.push( face );

			this.faceVertexUvs[ 0 ].push( [ uvs[ a ].clone(), uvs[ b ].clone(), uvs[ c ].clone(), uvs[ d ].clone() ] );
		}

	}

	this.computeCentroids();

};

THREE.RingGeometry.prototype = new THREE.Geometry();
THREE.RingGeometry.prototype.constructor = THREE.RingGeometry;