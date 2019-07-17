const justArrowKeys =
    `<div class="buttons-container">
        <div class="arrow-buttons"></div>
    </div>`;

const arrowKeysTextButtons =
    `<div class="buttons-container">
        <div class="arrow-buttons"></div>
        <div class="text-buttons"></div>
    </div>`;

class ProjectKeys {
    constructor (vm) {
        this.vm = vm;
        this.keys = this.findKeys();
    }

    /**
     * Check the blocks of each target to see if they use any keyboard keys
     * @returns {Set} an iterable that has each project key listed once
     */
    findKeys () {
        const keysPressed = new Set();

        for (const target of this.vm.runtime.targets) {
            if (target.isOriginal && target.blocks) {
                for (const block of Object.values(target.blocks._blocks)) {
                    if (block.opcode === 'sensing_keyoptions' || block.opcode === 'event_whenkeypressed') {
                        keysPressed.add(block.fields.KEY_OPTION.value);
                    }
                }
            }
        }
        return keysPressed;
    }
}


class VirtualKeys {
    constructor (vm, keys) {
        this.vm = vm;
        this.projectKeys = keys;
        const virtualKeys = this.addVirtualKeys();
        this.virtualIO = {
            mouse: {
                el: document.body,
                events: [
                    'touchmove',
                    'touchstart',
                    'touchend'
                ]
            },
            keyboard: virtualKeys
        };
    }

    /**
     * Create an object that has data representing the keys used in the project,
     * including their appearance and which event listeners they will need added.
     * @returns {object} an object with the virtual keys' data.
     */
    addVirtualKeys () {
        const keyDomEvent = {
            arrow: [],
            text: [],
            any: [{
                el: document.body,
                events: ['keydown'],
                callback: () => {
                    // Listen to keypress events so that users with a keyboard and touchscreen
                    // can choose to remove virtual keys if they start using their keyboard
                    if (!this.virtualKeysConfirmed) {
                        // TODO: better UI for confirmation box
                        // eslint-disable-next-line no-alert
                        if (window.confirm('Do you want to remove the touchscreen buttons?')) {
                            this.removeVirtualKeys();
                        }
                        this.virtualKeysConfirmed = true;
                    }
                }
            }]
        };
        let arrowKey = null;
        let arrowId = null;

        this.projectKeys.forEach(key => {
            const keyObj = {
                events: [
                    'touchstart',
                    'touchend',
                    'mousedown',
                    'mouseup'
                ]
            };

            switch (key) {
            case 'up arrow':
            case 'down arrow':
            case 'left arrow':
            case 'right arrow':
                arrowKey = key.split(' ')[0];
                arrowId = arrowKey[0].toUpperCase() + arrowKey.slice(1);
                keyObj.code = `Arrow${arrowId}`;
                keyObj.eventClass = `.${arrowKey}-arrow`;
                keyDomEvent.arrow.push(keyObj);
                break;
            default:
                keyObj.code = key;
                keyObj.eventClass = `.${key}`;
                keyDomEvent.text.push(keyObj);
                break;
            }
        });

        return keyDomEvent;
    }

    /**
     * Create button elements based on their virtualIO data and add them to the DOM
     * @return {DocumentFragment} buttonsDiv - a document fragment
     * that contains the virtual buttons HTML elements.
     */
    addKeysDom () {
        const keysUI = this.projectKeys;
        const arrowKeys = [];
        const textKeys = [];
        let buttonsDiv = null;
        let hitbox = null;
        let arrowType = null;

        for (const key of keysUI) {
            const keyEl = document.createElement('button');
            keyEl.setAttribute('class', key.class);

            switch (key) {
            case 'up arrow':
            case 'down arrow':
            case 'left arrow':
            case 'right arrow':
                arrowType = key.split(' ')[0];
                keyEl.setAttribute('class', `arrow ${arrowType}-arrow touch-control`);
                arrowKeys.push(keyEl);
                break;
            default:
                // Technically the "any" key isn't a real key, but maybe
                // we want to treat it that way for virtual buttons so
                // the users have a key to press.
                keyEl.innerText = key;
                keyEl.setAttribute('class', `${key}-button touch-control text`);
                hitbox = document.createElement('div');
                hitbox.setAttribute('class', `${key} text-button-div`);
                hitbox.append(keyEl);
                textKeys.push(hitbox);
                break;
            }
        }

        // Create HTML layout and append it to document
        if (arrowKeys.length && !textKeys.length) {
            buttonsDiv = document.createRange().createContextualFragment(justArrowKeys);
            buttonsDiv.firstElementChild.classList.add('arrow-only');
        } else if (arrowKeys.length && textKeys.length === 1) {
            buttonsDiv = document.createRange().createContextualFragment(arrowKeysTextButtons);
            buttonsDiv.firstElementChild.classList.add('arrow-one-button');
        } else {
            buttonsDiv = document.createRange().createContextualFragment(arrowKeysTextButtons);
            buttonsDiv.firstElementChild.classList.add('arrow-many-buttons');
        }

        const arrowParent = buttonsDiv.querySelector(`.arrow-buttons`);
        for (const arrowKey of arrowKeys) {
            arrowParent.appendChild(arrowKey);
        }

        const textParent = buttonsDiv.querySelector('.text-buttons');
        for (const textKey of textKeys) {
            textParent.appendChild(textKey);
        }

        return buttonsDiv;
    }

    /**
     * Delete vitual buttons if a touchscreen user prefers to
     * only use the keyboard
     */
    removeVirtualKeys () {
        // TODO: make this reversible
        const buttonsDiv = document.getElementsByClassName('buttons-container')[0];
        buttonsDiv.parentElement.removeChild(buttonsDiv);
    }
}

module.exports = {ProjectKeys, VirtualKeys};
