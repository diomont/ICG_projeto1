"use strict";

// To store the scene graph, and elements usefull to rendering the scene
const sceneElements = {
    sceneGraph: null,
    camera: null,
    control: null,
    renderer: null,
};


// Functions are called
//  1. Initialize the empty scene
//  2. Add elements within the scene
//  3. Animate
helper.initEmptyScene(sceneElements);
// adjust starting camera position
sceneElements.camera.position.set(100, 50, 100);
load3DObjects(sceneElements.sceneGraph);
requestAnimationFrame(computeFrame);

// HANDLING EVENTS

// Event Listeners

window.addEventListener('resize', resizeWindow);
// Update render image size and camera aspect when the window is resized
function resizeWindow(eventParam) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    sceneElements.camera.aspect = width / height;
    sceneElements.camera.updateProjectionMatrix();

    sceneElements.renderer.setSize(width, height);
}



//////////////////////////////////////////////////////////////////


// Create and insert in the scene graph the models of the 3D scene
function load3DObjects(sceneGraph) {

    const terrain1 = createTerrain();
    const terrain2 = createTerrain();
    const terrain3 = createTerrain();
    terrain1.name = "terrain1";
    terrain2.name = "terrain2";
    terrain3.name = "terrain3";
    sceneGraph.add(terrain1);
    sceneGraph.add(terrain2);
    sceneGraph.add(terrain3);

    terrain1.translateX(-600);
    terrain3.translateX(600);
    


    const turtle = createTurtle();
    turtle.name = "turtle";
    sceneGraph.add(turtle);

    console.log(turtle.rotation.y);

    const backPosition = turtle.getObjectByName("backHelper").position;


    const turtleBackGroup = new THREE.Group();
    turtleBackGroup.name = "turtleBackGroup";
    turtleBackGroup.position.copy(backPosition);
    sceneGraph.add(turtleBackGroup);


    const house1 = createHouse();
    //house1.position.copy(backPosition);
    house1.translateX(-6).translateZ(-8);
    turtleBackGroup.add(house1);


    const person1 = createPerson();
    //person1.position.copy(backPosition);
    person1.translateX(1).translateZ(2).translateY(2.2);
    person1.rotateY(-Math.PI/3);
    turtleBackGroup.add(person1);


}

// Displacement value

var delta = 0.1;

// animation flags and variables
let turtleAnimStage = 0;
let waitTime = 0;
let terrainShiftFlag = true;

let rumble = 0;
let treesToDestroy = [];


function computeFrame(time) {
    // Can extract an object from the scene Graph from its name
    //const light = sceneElements.sceneGraph.getObjectByName("light");

    // Apply a small displacement
    // if (light.position.x >= 10) {
    // delta *= -1;
    // } else if (light.position.x <= -10) {
    //     delta *= -1;
    // }
    // light.translateX(delta);


    const turtle = sceneElements.sceneGraph.getObjectByName("turtle");
    const turtleBack = sceneElements.sceneGraph.getObjectByName("turtleBackGroup");
    animateTurtle(turtle, turtleBack, delta);
    animateTerrain(sceneElements.sceneGraph);

    let treeArray = sceneElements.sceneGraph.getObjectByName("terrain1").getObjectByName("trees").children;
    treeArray = treeArray.concat(sceneElements.sceneGraph.getObjectByName("terrain2").getObjectByName("trees").children);
    treeArray = treeArray.concat(sceneElements.sceneGraph.getObjectByName("terrain3").getObjectByName("trees").children);
    collideWithTrees(treeArray);
    destroyTrees(delta);
    shakeTrees(treeArray, time);

    rumble -= 2;
    if (rumble < 0) rumble = 0;

    // Rendering
    helper.render(sceneElements);

    // Update control of the camera
    sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
}


function createTurtle() {

    const turtle = new THREE.Group();

    // -------------------- //
    // the turtle's body    //
    // -------------------- //
    const bodyGeometry = new THREE.BoxGeometry(70, 20, 50);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x738264 });
    const bodyObject = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bodyObject.name = "body";
    bodyObject.castShadow = true;
    bodyObject.receiveShadow = true;
    turtle.add(bodyObject);
    bodyObject.position.y = 20;


    // -------------------- //
    // the turtle's legs    //
    // -------------------- //

    // base leg components
    const lowerLegGeometry = new THREE.CylinderGeometry(7, 8, 8, 5);
    const upperLegGeometry = new THREE.CylinderGeometry(5, 7, 12, 5);
    const legJointGeometry = new THREE.SphereGeometry(7, 7, 7);
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0x738264 });
    const lowerLegObject = new THREE.Mesh(lowerLegGeometry, legMaterial);
    lowerLegObject.name = "lowerLeg";
    const upperLegObject = new THREE.Mesh(upperLegGeometry, legMaterial);
    upperLegObject.name = "upperLeg";
    const legJointObject = new THREE.Mesh(legJointGeometry, legMaterial);
    legJointObject.name = "joint"
    lowerLegObject.castShadow = true;
    upperLegObject.castShadow = true;
    legJointObject.castShadow = true;
    lowerLegObject.receiveShadow = true;
    upperLegObject.receiveShadow = true;
    legJointObject.receiveShadow = true;

    // first leg
    const rightBackLeg = new THREE.Group();
    rightBackLeg.add(lowerLegObject);
    rightBackLeg.add(upperLegObject);
    rightBackLeg.add(legJointObject);

    upperLegObject.position.y = -2 -2;
    legJointObject.position.y = -8 -2;
    lowerLegObject.position.y = -12 -6;

    upperLegObject.rotation.x = -Math.PI/3.5;
    legJointObject.position.z = 7;
    lowerLegObject.position.z = 7;


    rightBackLeg.name = "rightBackLeg";
    turtle.add(rightBackLeg);
    rightBackLeg.position.y = 22;
    rightBackLeg.position.z = 25; //+5;
    rightBackLeg.position.x = -26;

    // other legs, obtained by cloning first leg
    const leftBackLeg = rightBackLeg.clone();
    leftBackLeg.name = "leftBackLeg";
    leftBackLeg.rotation.y = Math.PI;
    leftBackLeg.position.z = -25;
    turtle.add(leftBackLeg);

    const rightFrontLeg = rightBackLeg.clone();
    rightFrontLeg.name = "rightFrontLeg";
    rightFrontLeg.position.x = 26;
    turtle.add(rightFrontLeg);

    const leftFrontLeg = rightFrontLeg.clone();
    leftFrontLeg.name = "leftFrontLeg";
    leftFrontLeg.rotation.y = Math.PI;
    leftFrontLeg.position.z = -25;
    turtle.add(leftFrontLeg);


    // -------------------- //
    // the turtle's head    //
    // -------------------- //
    const headGeometry = new THREE.BoxGeometry(20, 16, 20);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0x738264 });
    const headObject = new THREE.Mesh(headGeometry, headMaterial);
    headObject.name = "head";
    headObject.castShadow = true;
    headObject.receiveShadow = true;
    turtle.add(headObject);
    headObject.position.set(35+10, 20+8, 0);

    // eyes
    const eyeGeometry = new THREE.SphereGeometry(2, 8, 8);
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x171717 });
    const eyeObject = new THREE.Mesh(eyeGeometry, eyeMaterial);

    headObject.add(eyeObject);
    eyeObject.position.z = 9;
    eyeObject.position.x = 5;

    const leftEye = eyeObject.clone();
    headObject.add(leftEye);
    leftEye.position.z = -9;


    // -------------------------------------------------------- //
    // point of reference for placing objects on turtle's back  //
    // -------------------------------------------------------- //
    const backHelper = new THREE.Object3D();
    backHelper.name = "backHelper"
    backHelper.position.y = 30;
    turtle.add(backHelper);

    return turtle;
}

function createHouse() {
    const house = new THREE.Group();

    const baseGeometry = new THREE.BoxGeometry(16, 8, 12);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x573c28 });
    const baseObject = new THREE.Mesh(baseGeometry, baseMaterial);
    baseObject.castShadow = true;
    baseObject.receiveShadow = true;
    house.add(baseObject);
    baseObject.position.y = 4;

    const roofGeometry = new THREE.CylinderGeometry(9, 9, 16, 3);
    const roofMaterial = new THREE.MeshPhongMaterial({ color: 0xed3737 });
    const roofObject = new THREE.Mesh(roofGeometry, roofMaterial);
    roofObject.castShadow = true;
    roofObject.receiveShadow = true;
    house.add(roofObject);
    roofObject.rotation.x = -Math.PI/2;
    roofObject.rotation.z = -Math.PI/2;
    roofObject.position.y = 8+ 1.1;
    roofObject.scale.z = 0.25;

    return house;
}

function createPerson() {
    const person = new THREE.Group();

    ///////
    //const midHelper = new THREE.AxesHelper(1);
    ///////


    // -------- //
    // Torso    //
    // -------- //
    const torsoGeometry = new THREE.CapsuleGeometry(0.6, 1, 4, 8);
    const torsoMaterial = new THREE.MeshPhongMaterial({ color: 0x657bb5 });
    const torsoObject = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torsoObject.castShadow = true;
    torsoObject.receiveShadow = true;
    torsoObject.name = "torso";
    //upperHalf.add(torsoObject);
    person.add(torsoObject);

    torsoObject.scale.x = 0.5;
    torsoObject.position.y = 0.8;


    // ------------- //
    // Torso Joints  //
    // ------------- //
    const headGroup = new THREE.Group();
    headGroup.name = "head";
    headGroup.scale.x = 2;
    torsoObject.add(headGroup);

    const leftArmGroup = new THREE.Group();
    leftArmGroup.name = "leftArm";
    leftArmGroup.scale.x = 2;
    torsoObject.add(leftArmGroup);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.name = "rightArm";
    rightArmGroup.scale.x = 2;
    torsoObject.add(rightArmGroup);

    headGroup.position.y = 1.05;
    leftArmGroup.position.y = 0.7;
    leftArmGroup.position.z = 0.6;
    //leftArmGroup.add(midHelper.clone());
    rightArmGroup.position.y = 0.7;
    rightArmGroup.position.z = -0.6;

    // ----- //
    // Head  //
    // ----- //
    const headGeometry = new THREE.SphereGeometry(0.4, 8, 8);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0x657bb5 });
    const headObject = new THREE.Mesh(headGeometry, headMaterial);
    headObject.castShadow = true;
    headObject.receiveShadow = true;
    headGroup.add(headObject);
    headObject.position.y = 0.4;

    // --------- //
    // Left Arm  //
    // --------- //
    const upperArmGeometry = new THREE.CapsuleGeometry(0.25, 0.6, 4, 8);
    const upperArmMaterial = new THREE.MeshPhongMaterial({ color: 0x657bb5 });
    const upperArmObject = new THREE.Mesh(upperArmGeometry, upperArmMaterial);
    upperArmObject.castShadow = true;
    upperArmObject.receiveShadow = true;
    upperArmObject.name = "upperArm";
    leftArmGroup.add(upperArmObject);

    upperArmObject.position.y = -0.4;
    upperArmObject.position.z = 0.20;

    const lowerArmGroup = new THREE.Group();
    upperArmObject.add(lowerArmGroup);
    lowerArmGroup.position.y = -0.5;
    //lowerArmGroup.add(midHelper.clone());

    const lowerArmGeometry = new THREE.CapsuleGeometry(0.25, 0.6, 4, 8);
    const lowerArmMaterial = new THREE.MeshPhongMaterial({ color: 0x657bb5 });
    const lowerArmObject = new THREE.Mesh(lowerArmGeometry, lowerArmMaterial);
    lowerArmObject.castShadow = true;
    lowerArmObject.receiveShadow = true;
    lowerArmObject.name = "lowerArm";

    lowerArmGroup.add(lowerArmObject);
    lowerArmObject.position.y = -0.4;

    // ---------- //
    // Right Arm  //
    // ---------- //
    const upperRightArm = upperArmObject.clone();
    rightArmGroup.add(upperRightArm);
    upperRightArm.position.z = -0.20;

    // --------- //
    // Left Leg  //
    // --------- //
    const leftLegGroup = new THREE.Group();
    leftLegGroup.name = "leftLeg";
    //leftLegGroup.add(midHelper.clone());
    person.add(leftLegGroup);
    leftLegGroup.position.z = 0.28;
    leftLegGroup.position.y = -0.2;

    const upperLegGeometry = new THREE.CapsuleGeometry(0.25, 0.7, 4, 8);
    const upperLegMaterial = new THREE.MeshPhongMaterial({ color: 0x657bb5 });
    const upperLegObject = new THREE.Mesh(upperLegGeometry, upperLegMaterial);
    upperLegObject.castShadow = true;
    upperLegObject.receiveShadow = true;
    upperLegObject.name = "upperLeg";
    leftLegGroup.add(upperLegObject);

    upperLegObject.position.y = -0.45;

    const lowerLegGroup = new THREE.Group();
    upperLegObject.add(lowerLegGroup);
    lowerLegGroup.position.y = -0.55;
    //lowerLegGroup.add(midHelper.clone());

    const lowerLegGeometry = new THREE.CapsuleGeometry(0.25, 0.7, 4, 8);
    const lowerLegMaterial = new THREE.MeshPhongMaterial({ color: 0x657bb5 });
    const lowerLegObject = new THREE.Mesh(lowerLegGeometry, lowerLegMaterial);
    lowerLegObject.castShadow = true;
    lowerLegObject.receiveShadow = true;
    lowerLegObject.name = "lowerLeg";

    lowerLegGroup.add(lowerLegObject);
    lowerLegObject.position.y = -0.45;

    // ---------- //
    // Right Leg  //
    // ---------- //
    const rightLegGroup = new THREE.Group();
    rightLegGroup.name = "rightLeg";
    //rightLegGroup.add(midHelper.clone());
    person.add(rightLegGroup);
    rightLegGroup.position.z = -0.28;
    rightLegGroup.position.y = -0.2;

    rightLegGroup.add(upperLegObject.clone());


    return person;
}

function createRandomTree() {
    const tree = new THREE.Group();

    const trunkHeight = Math.random() * 6 + 3;
    const trunkRadius = Math.random() * 3 + 1;
    const foliageHeight = Math.random() * 4 + 4;
    const foliageRadius = Math.random() * 3 + 5;

    const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius, trunkHeight , 12);
    const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x422711 });
    const trunkObject = new THREE.Mesh(trunkGeometry, trunkMaterial);
    tree.add(trunkObject);
    trunkObject.position.y = trunkHeight/2;

    const foliageGeometry = new THREE.ConeGeometry(foliageRadius, foliageHeight, 12);
    const foliageMaterial = new THREE.MeshPhongMaterial({ color: 0x6fbf47});
    const foliageObject = new THREE.Mesh(foliageGeometry, foliageMaterial);
    trunkObject.add(foliageObject);
    foliageObject.position.y = trunkHeight/2 + foliageHeight/2;

    return tree;
}

function createTerrain() {
    
    const terrain = new THREE.Group();

    const planeGeometry = new THREE.PlaneGeometry(600, 600);
    const planeMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(160, 230, 60)', side: THREE.DoubleSide });
    const planeObject = new THREE.Mesh(planeGeometry, planeMaterial);
    planeObject.receiveShadow = true;
    planeObject.rotateX(Math.PI / 2);
    terrain.add(planeObject);


    // Some mountains
    const coneGeometry1 = new THREE.ConeGeometry(80, 140, 32);
    const coneGeometry2 = new THREE.ConeGeometry(100, 200, 32);
    const coneGeometry3 = new THREE.ConeGeometry(60, 110, 32);
    const mountainMaterial = new THREE.MeshPhongMaterial({ color: 0x61594e });

    const mountain1 = new THREE.Mesh(coneGeometry1, mountainMaterial);
    const mountain2 = new THREE.Mesh(coneGeometry2, mountainMaterial);
    const mountain3 = new THREE.Mesh(coneGeometry3, mountainMaterial);

    mountain1.castShadow = true;
    mountain2.castShadow = true;
    mountain3.castShadow = true;
    mountain1.receiveShadow = true;
    mountain2.receiveShadow = true;
    mountain3.receiveShadow = true;

    terrain.add(mountain1);
    terrain.add(mountain2);
    terrain.add(mountain3);

    mountain1.translateY(70).translateX(120).translateZ(150);
    mountain2.translateY(100).translateX(-200).translateZ(-180);
    mountain3.translateY(55).translateX(-100).translateZ(-200);


    // add some trees somewhat randomly, but in a distributed way
    const trees = new THREE.Group();
    trees.name = "trees";
    terrain.add(trees);

    let treesLeft = 90;  // upper limit for many trees can be instanced
    let terrainDivision = 50;  // how to subdivide terrain for tree intancing
    let treeChance = 0.3;  // how likely to instance a tree in each terrain subdivision

    for (let x = -300; x < 300; x += terrainDivision) {
        if (treesLeft == 0) break;
        for (let z = -300; z < 300; z += terrainDivision) {
            if (treesLeft == 0) break;

            let rnd = Math.random()
            if (rnd > treeChance) {
                continue;
            }

            treesLeft--;

            let rndXOffset = Math.random() * terrainDivision;
            let rndZOffset = Math.random() * terrainDivision;
            const tree = createRandomTree();
            tree.scale.set(1.5, 1.5, 1.5)

            trees.add(tree);
            tree.translateX(x + rndXOffset).translateZ(z + rndZOffset);
        }
    }

    return terrain;
}





function animateTurtle(turtle, turtleBack, step) {

    const body = turtle.getObjectByName("body");
    const rightFrontLeg = turtle.getObjectByName("rightFrontLeg");
    const rightBackLeg = turtle.getObjectByName("rightBackLeg");
    const leftFrontLeg = turtle.getObjectByName("leftFrontLeg");
    const leftBackLeg = turtle.getObjectByName("leftBackLeg");

    // left side legs starting rotation is PI


    if (waitTime > 0) {
        terrainShiftFlag = false;
        waitTime -= step;
        return
    }
    else
        terrainShiftFlag = true;


    if (turtleAnimStage == 0) {
        rightFrontLeg.rotateY(step/15);
        leftBackLeg.rotateY(step/15);
        turtle.rotateY(step/120);
        turtleBack.rotateY(step/120);

        turtle.translateZ(-0.02);
        turtleBack.translateZ(-0.02);

        turtle.rotateX(-0.0002);
        turtleBack.rotateX(-0.0002);
        turtle.rotateZ(0.0002);
        turtleBack.rotateZ(0.0002);

        if (turtle.rotation.y >= Math.PI/26) {
            turtle.rotation.y = Math.PI/26;
            turtleAnimStage = 1;
            waitTime = step*20;  // wait 20 frames before next stage
        }
    }
    if (turtleAnimStage == 1) {
        rightFrontLeg.rotateY(-step/15);
        leftBackLeg.rotateY(-step/15);
        turtle.rotateY(-step/120);
        turtleBack.rotateY(-step/120);

        turtle.translateZ(0.02);
        turtleBack.translateZ(0.02);

        turtle.rotateX(0.0002);
        turtleBack.rotateX(0.0002);
        turtle.rotateZ(-0.0002);
        turtleBack.rotateZ(-0.0002);

        if (turtle.rotation.y <= 0) {
            turtle.rotation.y = 0;
            turtleAnimStage = 2;
            rumble = 50;
            waitTime = step*40;  // wait 40 frames before next stage
        }
    }

    if (turtleAnimStage == 2) {
        leftFrontLeg.rotateY(-step/15);
        rightBackLeg.rotateY(-step/15);
        turtle.rotateY(-step/120);
        turtleBack.rotateY(-step/120);

        turtle.translateZ(0.02);
        turtleBack.translateZ(0.02);

        turtle.rotateX(0.0002);
        turtleBack.rotateX(0.0002);
        turtle.rotateZ(0.0002);
        turtleBack.rotateZ(0.0002);

        if (turtle.rotation.y <= -Math.PI/26) {
            turtle.rotation.y = -Math.PI/26;
            turtleAnimStage = 3;
            waitTime = step*20;  // wait 20 frames before next stage
        }
    }
    if (turtleAnimStage == 3) {
        leftFrontLeg.rotateY(step/15);
        rightBackLeg.rotateY(step/15);
        turtle.rotateY(step/120);
        turtleBack.rotateY(step/120);

        turtle.translateZ(-0.02);
        turtleBack.translateZ(-0.02);

        turtle.rotateX(-0.0002);
        turtleBack.rotateX(-0.0002);
        turtle.rotateZ(-0.0002);
        turtleBack.rotateZ(-0.0002);

        if (turtle.rotation.y >= 0) {
            turtle.rotation.y = 0;
            turtleAnimStage = 0;
            rumble = 50;
            waitTime = step*40;  // wait 40 frames before next stage
        }
    }
    
}

function animateTerrain(sceneGraph) {
    if (!terrainShiftFlag)
        return;
    
    const terrain1 = sceneGraph.getObjectByName("terrain1");
    const terrain2 = sceneGraph.getObjectByName("terrain2");
    const terrain3 = sceneGraph.getObjectByName("terrain3");

    const terrainElements = [terrain1, terrain2, terrain3];

    // shift terrain to the back
    for (let terrain of terrainElements) {
        terrain.translateX(-0.2);
        // if terrain is far back, bring it to the front to loop
        if (terrain.position.x <= -900)
            terrain.position.x = 900;
    }
}

function destroyTrees(step) {
    let toRemove = [];
    for (let idx in treesToDestroy) {
        let tree = treesToDestroy[idx];
        tree.rotateZ(-step/2);

        if (tree.rotation.z >= Math.PI/4) {
            toRemove.push(idx);
            tree.removeFromParent();
        }
    }
    treesToDestroy.filter((_, i) => toRemove.includes(i));
}

function shakeTrees(treeArray, step) {

    for (let tree of treeArray) {
        let worldPos = new THREE.Vector3;
        tree.getWorldPosition(worldPos);
        let distance = Math.abs(worldPos.x) + Math.abs(worldPos.z);

        let shakeIntensity = 1 - distance/300;
        if (shakeIntensity < 0) shakeIntensity = 0;

        tree.rotation.x = Math.sin(step / 1000 * rumble*rumble) * shakeIntensity / 3
    }

}

function collideWithTrees(treeArray) {
    // a rather simple and naive way to """detect""" when the turtle collides with trees
    // all that's being done is checking if the tree's position is within a certain space that is always occupied by the turtle
    // (a box around the origin of the scene)
    let lowerXLim = -40;
    let upperXLim = 40;
    let lowerZLim = -50;
    let upperZLim = 50;
    
    for (let tree of treeArray) {

        if (treesToDestroy.includes(tree)) continue;

        let worldPos = new THREE.Vector3()
        tree.getWorldPosition(worldPos);
        if (
            worldPos.x > lowerXLim &&
            worldPos.x < upperXLim &&
            worldPos.z > lowerZLim &&
            worldPos.z < upperZLim
        ) {
            treesToDestroy.push(tree);
        }
    }

}