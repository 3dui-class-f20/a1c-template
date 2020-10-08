/// <reference path="../playcanvas/playcanvas.d.ts" />

import { SingleEntryPlugin } from "webpack";

declare function wasmSupported():boolean;
declare function loadWasmModuleAsync(name: string, path1: string, path2: string, cb: ()=>void):void;
if (wasmSupported()) {
    loadWasmModuleAsync('Ammo', '/assets/ammo/ammo.wasm.js', '../assets/ammo/ammo.wasm.wasm', play);
} else {
    loadWasmModuleAsync('Ammo', '/assets/ammo/ammo.js', '', play);
}

function play() {
    // we nest this inside a function (that we run immediately) so we can short circuit it 
    // by doing a "return" if there is an error

    // handy method to pop an error into the DOM
    var displayError = function (html: string) {
        var div = document.createElement('div');

        div.innerHTML  = [
            '<table style="background-color: #8CE; width: 100%; height: 100%;">',
            '  <tr>',
            '      <td align="center">',
            '          <div style="display: table-cell; vertical-align: middle;">',
            '              <div style="">' + html + '</div>',
            '          </div>',
            '      </td>',
            '  </tr>',
            '</table>'
        ].join('\n');

        document.body.appendChild(div);
    };

    ////////////////
    // Initialize the engine.  Some of this was taken from one of the samples,
    // and some from the Scene settings in the Playcanvas Editor.
    var canvas = document.getElementById('application-canvas') as HTMLCanvasElement;
    var app: pc.Application;
    try {
        app = new pc.Application(canvas, {
            elementInput: new pc.ElementInput(canvas, {
                useMouse: true,
                useTouch: true
            }),
            mouse: new pc.Mouse(canvas),
            touch: new pc.TouchDevice(canvas),
            gamepads: new pc.GamePads(), 
            keyboard: new pc.Keyboard(window),
            graphicsDeviceOptions: {
                'antialias': true,
                'alpha': false,
                'preserveDrawingBuffer': false,
                'preferWebGl2': true
            },
            assetPrefix: '../assets/'
        });
    } catch (e) {
        displayError('Could not initialize application. Error: ' + e);
        return;
    }

    // for full screen and high resolution
    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    app.graphicsDevice.maxPixelRatio = window.devicePixelRatio;

    // various settings to match the Editor project
    app.scene.toneMapping = pc.TONEMAP_ACES;
    app.scene.ambientLight = new pc.Color(51/255.0,51/255.0,51/255.0);
    app.scene.exposure = 1.5;
    app.scene.gammaCorrection = pc.GAMMA_SRGB;
    app.scene.fog = pc.FOG_NONE;

    // For baked lights
    app.scene.lightmapSizeMultiplier = 32;
    app.scene.lightmapMode = pc.BAKE_COLOR;
    app.scene.lightmapMaxResolution = 2048;

    window.addEventListener("resize", function () {
        app.resizeCanvas(canvas.width, canvas.height);
    });

    setupSplash(app);

    
    ///////////////////
    // ASSETS!
    // There is an asset loader in the AssetRegistry (app.assets) but it doesn't appear to 
    // handle models (with the hierarchy of materials and textures) well.  So, we'll just 
    // use "app.assets.loadFromUrl" for each of the assets we have.

    var assetList = [
        {
            type: 'model', 
            url: 'models/box-room/box-room.json'
        },
        { 
            type: 'material', 
            url: 'materials/Box.json'
        },
        {
            type: 'material', 
            url: 'materials/Controller.json'
        },
        {
            type: 'material', 
            url: 'materials/Light.json'
        },
        {
            type: 'script', 
            url: 'scripts/vr.js'
        },
        {
            type: 'script', 
            url: 'scripts/controllers.js'
        },
        {
            type: 'script', 
            url: 'scripts/controller.js'
        },   
        {
            type: 'script', 
            url: 'scripts/object-picker.js'
        },    
        {
            type: 'script', 
            url: 'scripts/camera-controller.js'
        },
        {
            type: 'texture', 
            url: 'ui/cursor.png'
        },
        {
            type: 'font', 
            url: 'ui/Montserrat-Black.json'
        }
    ];

    var count = 0;
    setTimeout(function () {
        assetList.forEach(function (a) {
            app.assets.loadFromUrl(a.url,a.type, 
                function(err, asset) {
                    count++;
                    app.fire("preload:progress", count / assetList.length)
                    if (count === assetList.length) {
                        buildScene();
                    }
                });
        });
    }, 1);

    ///////////////////
    // We will continue building the scene after the assets are loaded. We wrap the 
    // rest of the creation process in a function so that it can get called only 
    // after the assets have loaded
    var buildScene = function () {
        /// READY TO GO!
        app.start();
        
        //////////////////// 
        // NODES!

        // FIRST, THE ROOM AND ALL STUFF IN IT

        // the room entity and model
        var roomEntity = new pc.Entity("Room");
        app.root.addChild(roomEntity);
        var model = app.assets.find('box-room.json', 'model');

        // add model component to entity
        roomEntity.addComponent("model", {
            type: "asset",
            asset: model,
            castShadows: false,
            castShadowsLightmap: true,
            receiveShadows: true,
            isStatic:  false,
            lightmapped: true,
            lightmapSizeMultiplier: 1,
            layers: [pc.LAYERID_WORLD]
        });

        var l = new pc.Entity("Down Dynamic");
        l.translate(0,7.107,0);
        l.addComponent("light", {
            type: "directional",
            color: pc.Color.WHITE,
            intensity: 1,
            isStatic: false,
            bake: false,
            affectDynamic: true,
            castShadows: false,
            layers: [pc.LAYERID_WORLD]
        });
        roomEntity.addChild(l);

        l = new pc.Entity("Up Dynamic");
        l.translate(0,7.107,0);
        l.rotate(180,0,0);
        l.addComponent("light", {
            type: "directional",
            color: new pc.Color(121/255.0,171/255.0,253/255.0),
            intensity: 0.4,
            affectDynamic: true,
            castShadows: false,
            layers: [pc.LAYERID_WORLD]
        });
        roomEntity.addChild(l);

        // get the light sphere material from the assets
        var lightMat = app.assets.find('Light.json', 'material');

        // instead of creating 6 spheres one by one, we use a function to 
        // create the same structure at different locations on the ceiling of
        // the room.
        var createLightSphere = function(x: number, y: number, z: number) {
            var ls = new pc.Entity("Light Sphere");
            ls.addComponent("model", {
                type: "sphere",
                materialAsset: lightMat,
                layers: [pc.LAYERID_WORLD]
            });
            ls.setLocalScale(1, 1, 1);
            ls.translate(x, y, z);

            var l1 = new pc.Entity("Bounce");
            l1.translate(0,-9.87,0);
            l1.setEulerAngles(180,0,0);
            l1.addComponent("light", {
                type: "spot",
                color: new pc.Color(121/255.0,171/255.0,253/255.0),
                intensity: 1,
                range: 20,
                falloffMode: pc.LIGHTFALLOFF_INVERSESQUARED,
                innerConeAngle: 20,
                outerConeAngle: 80,
                isStatic: false,
                bake: true,
                bakeDir: true,
                affectDynamic: false,
                affectLightMapped: false,
                castShadows: false,
                layers: [pc.LAYERID_WORLD]
            });
            ls.addChild(l1);
            
            l1 = new pc.Entity("Down");
            l1.addComponent("light", {
                type: "spot",
                color: pc.Color.WHITE,
                intensity: 4,
                range: 30,
                falloffMode: pc.LIGHTFALLOFF_INVERSESQUARED,
                innerConeAngle: 40,
                outerConeAngle: 75,
                isStatic: false,
                bake: true,
                bakeDir: true,
                affectDynamic: false,
                affectLightMapped: false,
                castShadows: true,
                shadowResolution: 1024,
                shadowDistance: 40,
                shadowType: pc.SHADOW_VSM32,
                vsmBlurMode: pc.BLUR_BOX,
                vsmBlurSize: 5,
                vsmBias: 0.05,
                layers: [pc.LAYERID_WORLD]
            });
            ls.addChild(l1);        
            roomEntity.addChild(ls);
        }
        createLightSphere(-9.472, 9.107, 10.767);
        createLightSphere(-9.472, 9.107, -10.767);
        createLightSphere(10.489, 9.107, -10.767);
        createLightSphere(10.489, 9.107, 10.767);
        createLightSphere(0.201, 9.107, -0.309);

        // the floor is invisible, but it's bounding box
        // is still used by the scripts.
        var floor = new pc.Entity("Floor");
        floor.addComponent("model", {
            type: "box",
            castShadows: true,
            castShadowsLightmap: true,
            receiveShadows: true,
            isStatic: false,
            lightmapped: false,
            layers: [pc.LAYERID_WORLD]
        });
        floor.enabled = true;
        floor.model!.enabled = false;
        floor.translate(0, -0.5, 0);
        floor.setLocalScale(40,1,40);
        floor.tags.add("pickable");
        floor.tags.add("teleportable");  
        roomEntity.addChild(floor);

        // as with lights, we create 3 cubes using a functions
        var cubeMat = app.assets.find('Box.json', 'material');
        var createCube = function (x: number, y: number, z:number) {
            var cube = new pc.Entity("Box");
            cube.addComponent("model", {
                type: "box",
                materialAsset: cubeMat,
                castShadows: false,
                castShadowsLightmap: true,
                receiveShadows: true,
                isStatic: false,
                lightmapped: true,
                lightmapSizeMultiplier: 1,
                layers: [pc.LAYERID_WORLD]
            });
            cube.setLocalScale(1, 1, 1);
            cube.translate(x, y, z);
            cube.tags.add("pickable");
            cube.tags.add("interactive");
            roomEntity.addChild(cube);
        };
        createCube(3,1,-5);
        createCube(0,1,-5);
        createCube(-3,1,-5);

        ////////////////////
        // NOW THE CAMERA

        var cameraParent = new pc.Entity("Camera Parent");
        app.root.addChild(cameraParent);
        cameraParent.translate(0,1.572,4.249);

        var camera = new pc.Entity("Camera");
        camera.addComponent('camera', {
            clearColor: new pc.Color(184 / 255, 184 / 255, 184 / 255)
        });
        cameraParent.addChild(camera);

        cameraParent.addComponent("script");
        cameraParent.script!.create("camera-controller", {
            attributes: {
                height: 1.6,
                movementSpeed:1.5,
                rotateSpeed:45,
                rotateThreshold: 0.5,
                rotateResetThreshold: 0.25,
                camera: camera
            }
        });

        //////////////////////
        // NOW THE CONTROLLER template.  It will be instanciated twice.
        // the Controller is disabled, and will be cloned.

        var controller = new pc.Entity("Controller");
        controller.enabled = false;
        controller.translate(0,1.6,0);
        controller.addComponent("script");
        controller.script!.create("controller");
        app.root.addChild(controller);

        var controllerMat = app.assets.find('Controller.json', 'material');
        var controllerModel = new pc.Entity("model");
        controllerModel.addComponent("model", {
            type: "box",
            materialAsset: controllerMat,
            castShadows: false,
            castShadowsLightmap: false,
            receiveShadows: true,
            isStatic: false,
            lightmapped: false,
            layers: [pc.LAYERID_WORLD]
        });
        controllerModel.setLocalScale(0.05,0.05,0.05);
        controller.addChild(controllerModel);

        var pointerTexture = app.assets.find('cursor.png', 'texture');
        var pointer = new pc.Entity("pointer");

        pointer.addComponent("element", {
            type: pc.ELEMENTTYPE_IMAGE,
            anchor: new pc.Vec4(0.5,0.5,0.5,0.5),
            pivot: new pc.Vec2(0.5,0.5),
            width: 2,
            height: 2,
            color: pc.Color.WHITE,
            opacity: 1,
            rect: new pc.Vec4(0,0,1,1),
            mask: false,
            textureAsset: pointerTexture,
            useInput: false,
            layers: [pc.LAYERID_UI]
        });
        pointer.setLocalScale(0.01,0.01,0.01);
        pointer.translate(0,0,-2);
        controller.addChild(pointer);

        ////////////////////////////
        // Finally, the 2D SCREEN UI

        var screen = new pc.Entity("2D Screen");
        screen.translate(0,4,0);
        screen.addComponent("screen", {
            screenSpace: true,
            referenceResolution: new pc.Vec2(1280,960),
            scaleMode: pc.SCALEMODE_BLEND,
            scaleBlend: 0.5
        });
        app.root.addChild(screen);

        var button = new pc.Entity("Button");
        var text = new pc.Entity("Text");
        var textFont = app.assets.find('Montserrat-Black.json', 'font');
        text.addComponent("element", {
            type: pc.ELEMENTTYPE_TEXT,
            anchor: new pc.Vec4(0.5,0.5,0.5,0.5),
            pivot: new pc.Vec2(0.5,0.5),
            autoWidth: true,
            autoHeight: true,
            alignment: new pc.Vec2(0.5,0.5),
            fontAsset: textFont,
            text: "VR",
            fontSize: 48,
            lightHeight: 48,
            wrapLines: true,
            spacing: 1,
            color: pc.Color.WHITE,
            opacity: 1,
            outlineColor: pc.Color.BLACK,
            outlineThickness: 0,
            shadowColor: pc.Color.BLACK,
            shadowOffset: new pc.Vec2(0,0),
            useInput: false,
            layers: [pc.LAYERID_UI]
        });
        button.addChild(text);

        button.addComponent("button", {
            transitionMode: pc.BUTTON_TRANSITION_MODE_TINT,
            hoverTint: new pc.Color(1, 0.5,0),
            pressedTint: pc.Color.WHITE,
            inactiveTint: new pc.Color (0,0,20/255.0),
            fadeDuration: 0
        });
        button.addComponent("element", {
            type: pc.ELEMENTTYPE_IMAGE,
            anchor: new pc.Vec4(0.5,0.5,0.5,0.5),
            pivot: new pc.Vec2(0.5,0.5),
            width: 196,
            height: 196,
            color: pc.Color.BLACK,
            opacity: 0.4,
            rect: new pc.Vec4(0,0,1,1),
            mask: false,
            useInput: true,
            layers: [pc.LAYERID_UI]
        });
        button.button!.imageEntity = button;
        screen.addChild(button);

        var textMsg = function(name: string, text: string) {
            var t = new pc.Entity(name);
            t.translate(16,0,0);
            t.addComponent("element", {
                type: pc.ELEMENTTYPE_TEXT,
                anchor: new pc.Vec4(0.5,0.5,0.5,0.5),
                pivot: new pc.Vec2(0.5,0.5),
                autoWidth: true,
                autoHeight: true,
                alignment: new pc.Vec2(0.5,0.5),
                fontAsset: textFont,
                text: text,
                fontSize: 32,
                lightHeight: 32,
                wrapLines: true,
                spacing: 1,
                color: pc.Color.WHITE,
                opacity: 1,
                outlineColor: pc.Color.BLACK,
                outlineThickness: 0,
                shadowColor: pc.Color.BLACK,
                shadowOffset: new pc.Vec2(0,0),
                useInput: false,
                layers: [pc.LAYERID_UI]
            });
            screen.addChild(t);
            return t;
        };
        var textUnsupported = textMsg("Text Unsupported","WebXR is not supported");
        var textHTTPSRequired = textMsg("Text HTTPS required","WebXR requires a secure connection (HTTPS)");
        textHTTPSRequired.element!.autoWidth = false;
        textHTTPSRequired.element!.width = 600;

        /////////////////////
        /// SCRIPTS!
        /// doing this at the end since we need to reference a bunch of objects
        /// that we created along the way.
        //
        // We are just leaving the scripts as-is. But, we could move some of them to be
        // here as methods in the main code file if we wanted, especially 
        // the "vr", "object-pickers", and "controllers" scripts which live on the root.
        // 
        app.root.addComponent("script");
        app.root.script!.create("vr", {
            attributes: {
                buttonVr: button,
                elementUnsupported: textUnsupported,
                elementHttpsRequired: textHTTPSRequired,
                cameraEntity: camera
            }
        });
        app.root.script!.create("controllers", {
            attributes: {
                controllerTemplate: controller,
                cameraParent: cameraParent
            }
        });
        app.root.script!.create("objectPicker");

        // back the lights before starting
        app.lightmapper.bake(null, pc.BAKE_COLOR);



        //// not used here, but many of the engine examples add an update event on 
        //// "app", which is essentially equivalent to the requestAnimationFrame update
        //// loop that would be done in three.js and babylon.js for your main loop
        //
        // app.on("update", function (dt) {
        //    // code for your main loop
        // });
    }
};
    pc.script.createLoadingScreen(function (app) {
        var showSplash = function () {
            // splash wrapper
            var wrapper = document.createElement('div');
            wrapper.id = 'application-splash-wrapper';
            document.body.appendChild(wrapper);

            // splash
            var splash = document.createElement('div');
            splash.id = 'application-splash';
            wrapper.appendChild(splash);
            splash.style.display = 'none';

            var logo = document.createElement('img');
            logo.src = 'a1c-splash.png';
            splash.appendChild(logo);
            logo.onload = function () {
                splash.style.display = 'block';
            };

            var container = document.createElement('div');
            container.id = 'progress-bar-container';
            splash.appendChild(container);

            var bar = document.createElement('div');
            bar.id = 'progress-bar';
            container.appendChild(bar);

        };

        var createCss = function () {
            var css = [
                'body {',
                '    background-color: #283538;',
                '}',

                '#application-splash-wrapper {',
                '    position: absolute;',
                '    top: 0;',
                '    left: 0;',
                '    height: 100%;',
                '    width: 100%;',
                '    background-color: #283538;',
                '}',

                '#application-splash {',
                '    position: absolute;',
                '    top: calc(50% - 28px);',
                '    width: 264px;',
                '    left: calc(50% - 132px);',
                '}',

                '#application-splash img {',
                '    width: 100%;',
                '}',

                '#progress-bar-container {',
                '    margin: 20px auto 0 auto;',
                '    height: 2px;',
                '    width: 100%;',
                '    background-color: #1d292c;',
                '}',

                '#progress-bar {',
                '    width: 0%;',
                '    height: 100%;',
                '    background-color: #f60;',
                '}',
                '@media (max-width: 480px) {',
                '    #application-splash {',
                '        width: 170px;',
                '        left: calc(50% - 85px);',
                '    }',
                '}'

            ].join('\n');

            var style = document.createElement('style');
            style.type = 'text/css';
            style.appendChild(document.createTextNode(css));
        
            document.head.appendChild(style);
        };


        createCss();

        showSplash();

    });

    function setupSplash(app: pc.Application) {
        var hideSplash = function () {
            var splash = document.getElementById('application-splash-wrapper');
            if (splash) {
                splash!.parentElement!.removeChild(splash);
            }
        };
    
        var setProgress = function (value: number) {
            var bar = document.getElementById('progress-bar');
            if (bar) {
                value = Math.min(1, Math.max(0, value));
                bar.style.width = value * 100 + '%';
            }
        };
    
        app.on('preload:end', function () {
            app.off('preload:progress');
        });
        app.on('preload:progress', setProgress);
        app.on('start', hideSplash);
    }
    