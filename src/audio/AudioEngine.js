export default class AudioEngine {
    constructor() {
        this.context = null;
        this.listener = null;
        this.masterGain = null;
        this.reverbNode = null;
        this.isSetup = false;
    }

    async init() {
        if (this.isSetup) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
        this.listener = this.context.listener;

        // Create Master Gain
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = 0.8;
        this.masterGain.connect(this.context.destination);

        // Setup Reverb (Simple impulse response for now, can be improved)
        await this.setupReverb();

        this.isSetup = true;
    }

    async setupReverb() {
        this.reverbNode = this.context.createConvolver();

        // Generate a synthetic impulse response for a "cave-like" feel
        const duration = 2.0;
        const decay = 2.0;
        const sampleRate = this.context.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.context.createBuffer(2, length, sampleRate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const n = i / length;
            // Noise * Exponential Decay
            left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
            right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
        }

        this.reverbNode.buffer = impulse;

        // Reverb Gain (Wet mix)
        this.reverbGain = this.context.createGain();
        this.reverbGain.gain.value = 0.3; // 30% wet

        this.reverbNode.connect(this.reverbGain);
        this.reverbGain.connect(this.masterGain);
    }

    resume() {
        if (this.context && this.context.state === 'suspended') {
            return this.context.resume();
        }
        return Promise.resolve();
    }

    /**
     * Updates the listener's position and orientation.
     * @param {Object} pos - {x, y, z}
     * @param {Object} forward - {x, y, z} Front vector
     * @param {Object} up - {x, y, z} Up vector
     */
    updateListener(pos, forward, up) {
        if (!this.context) return;

        const time = this.context.currentTime;

        // Position
        if (this.listener.positionX) {
            this.listener.positionX.setValueAtTime(pos.x, time);
            this.listener.positionY.setValueAtTime(pos.y, time);
            this.listener.positionZ.setValueAtTime(pos.z, time);
        } else {
            this.listener.setPosition(pos.x, pos.y, pos.z);
        }

        // Orientation
        if (this.listener.forwardX) {
            this.listener.forwardX.setValueAtTime(forward.x, time);
            this.listener.forwardY.setValueAtTime(forward.y, time);
            this.listener.forwardZ.setValueAtTime(forward.z, time);
            this.listener.upX.setValueAtTime(up.x, time);
            this.listener.upY.setValueAtTime(up.y, time);
            this.listener.upZ.setValueAtTime(up.z, time);
        } else {
            this.listener.setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);
        }
    }

    get currentTime() {
        return this.context ? this.context.currentTime : 0;
    }
}
