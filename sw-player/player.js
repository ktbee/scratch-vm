const AudioEngine = require('scratch-audio');
const ScratchStorage = require('scratch-storage');
const ScratchRender = require('scratch-render');
const ScratchSVGRenderer = require('scratch-svg-renderer');
const VirtualMachine = require('../..');
const IOEvents = require('./io');
const {ProjectKeys, VirtualKeys} = require('./keys');

class HeartsMonitor {
    constructor (vm, heartsDiv) {
        this.vm = vm;
        this.heartsDiv = heartsDiv;

        setInterval(() => {
            this.update();
        }, 100);
    }

    /**
     * Update the page's counter based on data from the project's "hearts" monitor.
     */
    update () {
        if (this.vm.runtime.targets[0] && this.vm.runtime.targets[0].variables) {
            const heartMonitor = Object.values(this.vm.runtime.targets[0].variables)
                .find(({name}) => name === 'hearts');
            if (heartMonitor) {
                this.heartsDiv.innerText = heartMonitor.value;
            }
        }
    }
}

class Player {
    constructor (canvas) {
        this.canvas = canvas;
        this.rect = null;
        this.projectKeys = null;
        this.virtualKeys = null;
        this.desktopIOEvents = {
            mouse: {
                el: document.body,
                events: [
                    'mousemove',
                    'mousedown',
                    'mouseup'
                ]
            },
            keyboard: {
                any: [{
                    el: document.body,
                    events: [
                        'keydown',
                        'keyup'
                    ]
                }]
            }
        };

        this.updateRect(this.canvas);
    }

    updateRect (canvas) {
        this.rect = canvas.getBoundingClientRect();
    }

    /**
     * Initialize the VM and grab the data, HTML elements, and event listeners we need for the player
     */
    init () {
        this.vm = this.initVM();
        this.loadProject();
        this.addFullscreen();
        this.heartsMonitor = new HeartsMonitor(this.vm, document.getElementById('hearts'));
    }

    /**
     * @param {Asset} projectAsset - calculate a URL for this asset.
     * @returns {string} a URL to download a project file.
     */
    projectGetConfig (projectAsset) {
        return `https://projects.scratch.mit.edu/${projectAsset.assetId}`;
    }

    /**
     * @param {Asset} asset - calculate a URL for this asset.
     * @returns {string} a URL to download a project asset (PNG, WAV, etc.)
     */
    assetGetConfig (asset) {
        return `https://assets.scratch.mit.edu/internalapi/asset/${asset.assetId}.${asset.dataFormat}/get/`;
    }

    /**
     * Add dependencies to the Virtual Machine and start it
     * @returns {VirtualMachine} an intialized and started instance of VirtualMachine
     */
    initVM () {
        const vm = new VirtualMachine();
        vm.attachV2BitmapAdapter(new ScratchSVGRenderer.BitmapAdapter());
        vm.attachV2SVGAdapter(new ScratchSVGRenderer.SVGRenderer());

        // Initialize storage
        const storage = new ScratchStorage();
        const AssetType = storage.AssetType;
        storage.addWebStore([AssetType.Project], this.projectGetConfig);
        storage.addWebStore([AssetType.ImageVector, AssetType.ImageBitmap, AssetType.Sound], this.assetGetConfig);

        vm.attachStorage(storage);

        // Compatibility mode will set the frame rate to 30 TPS,
        // which is the standard for the scratch player.
        vm.setCompatibilityMode(true);

        // Instantiate the renderer and connect it to the VM.
        const renderer = new ScratchRender(this.canvas);
        vm.attachRenderer(renderer);
        const audioEngine = new AudioEngine();
        vm.attachAudioEngine(audioEngine);

        // Resets size of canvas directly for proper image calcuations
        // when the window is resized
        const resize = () => {
            renderer.resize(this.canvas.clientWidth, this.canvas.clientHeight);
            this.updateRect(this.canvas);
        };
        window.addEventListener('resize', resize);
        resize();

        vm.on('workspaceUpdate', () => {
            this.projectKeys = new ProjectKeys(this.vm).keys;
            const ioEvents = new IOEvents(vm, this.rect);
            ioEvents.addIOEvents(this.desktopIOEvents);

            if ('ontouchstart' in window && this.projectKeys) {
                this.virtualKeys = new VirtualKeys(this.vm, this.projectKeys);
                if (this.virtualKeys) {
                    const buttonsDiv = this.virtualKeys.addKeysDom();
                    const stageContainer = document.getElementsByClassName('stage-container')[0];

                    stageContainer.appendChild(buttonsDiv);
                    ioEvents.addIOEvents(this.virtualKeys.virtualIO);
                }
            }
            setTimeout(() => {
                // Run threads
                this.vm.start();
                this.vm.greenFlag();
            }, 1000);
        });

        return vm;
    }

    /**
     * Get a project id to load from the URL or use the default project
     */
    loadProject () {
        // Get the project id from the hash, or use the default project.
        let projectId;

        if (window.location.hash) {
            projectId = window.location.hash.substring(1);
        }
        if (projectId) {
            this.vm.downloadProjectId(projectId);
        } else {
            // If no project ID is supplied, load a local project
            fetch('./playground.sb3').then(response => response.arrayBuffer())
                .then(arrayBuffer => {
                    this.vm.loadProject(arrayBuffer);
                });
        }
    }

    /**
     * Attempt to make the player fullscreen when the canvas is clicked or tapped.
     */
    addFullscreen () {
        // Start project after canvas clicked and attempt to go fullscreen
        let attemptFullscreen = Boolean(document.body.requestFullscreen);
        const goFullScreen = () => {
            if (attemptFullscreen) {
                document.documentElement.requestFullscreen();
                attemptFullscreen = false;
            }
        };
        this.canvas.addEventListener('click', goFullScreen);
        this.canvas.addEventListener('touchstart', goFullScreen);
    }
}
module.exports = Player;
