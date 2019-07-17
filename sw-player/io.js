const eventIsDown = Object.freeze({
    mousedown: true,
    mouseup: false,
    mousemove: null,
    touchstart: true,
    touchend: false,
    keydown: true,
    keyup: false
});

class IOData {
    constructor (rect) {
        this.rect = rect;
        this.isDown = eventIsDown;
    }

    _getClientCoords (event) {
        let touch = null;
        let clientX = null;
        let clientY = null;

        if (event.touches) {
            touch = event.changedTouches.item(0);
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }

        return [clientX, clientY];
    }

    /**
     * Get and format the mouse data needed by the VM for virtual I/O events
     * @param {Event} event - The native event object provided by the event listener.
     * @returns {object} data - an object that contains the formated event information.
     */
    mouse (event) {
        const isDown = this.isDown[event.type];
        const [clientX, clientY] = this._getClientCoords(event);
        const data = {
            x: clientX - this.rect.left,
            y: clientY - this.rect.top,
            canvasWidth: this.rect.width,
            canvasHeight: this.rect.height
        };

        if (isDown !== null) {
            data.isDown = isDown;
        }
        return data;
    }

    /**
     * Get and format the keyboard data needed by the VM for virtual I/O events
     * @param {Event} event - The native event object provided by the event listener.
     * @param {string} keyCode - The type of virtual key that triggered the event.
     * @returns {object} data - an object that contains the formated event information.
     */
    keyboard (event, keyCode) {
        const isDown = this.isDown[event.type];
        let keyType = keyCode || event.key;
        // The space key is represented by ' ' in the VM.
        // See `_keyStringToScratchKey`in keyboard.js for more details
        keyType = keyType.toLowerCase() === 'space' ? ' ' : keyType;
        const data = {key: keyType, isDown: isDown};

        return data;
    }
}

class IOEvents {
    constructor (vm, rect) {
        this.vm = vm;
        this.rect = rect;
        this.ioParser = new IOData(this.rect);
    }

    mouseListenerCB () {
        return (event => {
            event.preventDefault();
            const data = this.ioParser.mouse(event);

            this.vm.postIOData('mouse', data);
        });
    }

    keyboardListenerCB (keyCode) {
        return (event => {
            const data = this.ioParser.keyboard(event, keyCode);
            this.vm.postIOData('keyboard', data);
        });
    }

    addIOEvents (ioEvents) {
        if (ioEvents.mouse) {
            this.addMouseEvents(ioEvents.mouse);
        }
        if (ioEvents.keyboard) {
            this.addKeyboardEvents(ioEvents.keyboard);
        }
    }

    addMouseEvents (mouseEvents) {
        const callback = this.mouseListenerCB();

        for (const eventType of mouseEvents.events) {
            mouseEvents.el.addEventListener(eventType, callback, {passive: false});
        }
    }

    addKeyboardEvents (keyEvents) {
        for (const keys of Object.values(keyEvents)) {
            for (const key of keys) {
                const callback = key.callback || this.keyboardListenerCB(key.code);

                for (const eventType of key.events) {
                    const el = key.el || document.querySelector(key.eventClass);
                    el.addEventListener(eventType, callback, {passive: false});
                }
            }
        }
    }
}

module.exports = IOEvents;
