import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { merge } from "./merge.js";
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import MultiTexturedMaterial from "./material.js";

/*
 * parameters = {
 *  size: Vector3,
 *  segments: Vector3,
 *  materialParameters: {
 *   color: Color,
 *   mapUrl: String,
 *   aoMapUrl: String,
 *   aoMapIntensity: Float,
 *   displacementMapUrl: String,
 *   displacementScale: Float,
 *   displacementBias: Float,
 *   normalMapUrl: String,
 *   normalMapType: Integer,
 *   normalScale: Vector2,
 *   bumpMapUrl: String,
 *   bumpScale: Float,
 *   roughnessMapUrl: String,
 *   roughness: Float,
 *   wrapS: Integer,
 *   wrapT: Integer,
 *   repeat: Vector2,
 *   magFilter: Integer,
 *   minFilter: Integer
 *  },
 *  secondaryColor: Color
 * }
 */

export default class GlassWall extends THREE.Group {

    constructor(parameters) {
        const hdrEquirect = new RGBELoader()
            .setPath('textures/equirectangular/');

        function generateTexture() {

            const canvas = document.createElement('canvas');
            canvas.width = 2;
            canvas.height = 2;

            const context = canvas.getContext('2d');
            context.fillStyle = 'white';
            context.fillRect(0, 1, 2, 1);

            return canvas;

        }

        super();
        merge(this, parameters);
        const halfGroundHeight = this.groundHeight / 2.0;

        this.geometries = [];
        this.materials = [];


        // textura
        const texture = new THREE.CanvasTexture(generateTexture());
        texture.magFilter = THREE.NearestFilter;
        texture.wrapT = THREE.RepeatWrapping;
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.set(10, 3.5);


        // parametros vidro
        const params = {
            color: 0xffffff,
            transmission: 0.9,
            opacity: 1,
            metalness: 0,
            roughness: 0,
            ior: 1.2,
            thickness: 0.01,
            specularIntensity: 1,
            specularColor: 0xffffff,
            envMapIntensity: 0,
            lightIntensity: 1,
            exposure: 1,
            fog: false
        };

        // Create the materials
        const primaryMaterial = new THREE.MeshPhysicalMaterial({
            color: params.color,
            metalness: params.metalness,
            roughness: params.roughness,
            ior: params.ior,
            alphaMap: texture,
            envMap: hdrEquirect,
            envMapIntensity: params.envMapIntensity,
            transmission: params.transmission, // use material.transmission for glass materials
            specularIntensity: params.specularIntensity,
            specularColor: params.specularColor,
            opacity: params.opacity,
            side: THREE.DoubleSide,
            transparent: true,
            fog: false
        });

        const secondaryMaterial = new THREE.MeshStandardMaterial({ color: this.secondaryColor });

        // Create a wall (seven faces) that casts and receives shadows

        // Create an array of geometries
        let geometries = [];

        // Create the front face (a rectangle)
        let geometry = new THREE.PlaneGeometry(1, 1 + this.groundHeight, this.segments.x, this.segments.y);
        let uv = geometry.getAttribute("uv");
        let uv1 = uv.clone();
        geometry.setAttribute("uv1", uv1); // The aoMap requires a second set of UVs: https://threejs.org/docs/index.html?q=meshstand#api/en/materials/MeshStandardMaterial.aoMap
        geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0.0, -halfGroundHeight, 0.025));
        geometries.push(geometry);

        // Create the rear face (a rectangle)
        geometry = new THREE.PlaneGeometry(1, 1 + this.groundHeight, this.segments.x, this.segments.y);
        uv = geometry.getAttribute("uv");
        uv1 = uv.clone();
        geometry.setAttribute("uv1", uv1); // The aoMap requires a second set of UVs: https://threejs.org/docs/index.html?q=meshstand#api/en/materials/MeshStandardMaterial.aoMap
        geometry.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI));
        geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0.0, -halfGroundHeight, -0.025));
        geometries.push(geometry);

        this.geometries.push(BufferGeometryUtils.mergeGeometries(geometries, false));
        this.materials.push(primaryMaterial);

        // Create an array of geometries
        geometries = [];

        // Create the two left faces (a four-triangle mesh)
        let points = new Float32Array([
            -0.475, -0.5, 0.025,
            -0.475, 0.5, 0.025,
            -0.5, 0.5, 0.0,
            -0.5, -0.5, 0.0,

            -0.5, 0.5, 0.0,
            -0.475, 0.5, -0.025,
            -0.475, -0.5, -0.025,
            -0.5, -0.5, 0.0
        ]);
        console.log("groundHeight: ", this.groundHeight);
        let normals = new Float32Array([
            -0.707, 0.0, 0.707,
            -0.707, 0.0, 0.707,
            -0.707, 0.0, 0.707,
            -0.707, 0.0, 0.707,

            -0.707, 0.0, -0.707,
            -0.707, 0.0, -0.707,
            -0.707, 0.0, -0.707,
            -0.707, 0.0, -0.707
        ]);
        let indices = [
            0, 1, 2,
            2, 3, 0,
            4, 5, 6,
            6, 7, 4
        ];
        geometry = new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(points, 3)); // itemSize = 3 because there are 3 values (X, Y and Z components) per vertex
        geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
        geometry.setIndex(indices);
        geometries.push(geometry);

        // Create the two right faces (a four-triangle mesh)
        geometry = geometry.clone();
        geometry.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI));
        geometries.push(geometry);

        // Create the top face (a four-triangle mesh)
        points = new Float32Array([
            -0.5, 0.5, 0.0,
            -0.475, 0.5, 0.025,
            -0.475, 0.5, -0.025,
            0.475, 0.5, 0.025,
            0.475, 0.5, -0.025,
            0.5, 0.5, 0.0
        ]);
        normals = new Float32Array([
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
        ]);
        indices = [
            0, 1, 2,
            2, 1, 3,
            3, 4, 2,
            4, 3, 5
        ];
        geometry = new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(points, 3)); // itemSize = 3 because there are 3 values (X, Y and Z components) per vertex
        geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
        geometry.setIndex(indices);
        geometries.push(geometry);

        this.geometries.push(BufferGeometryUtils.mergeGeometries(geometries, false));
        this.materials.push(secondaryMaterial);

    }


}