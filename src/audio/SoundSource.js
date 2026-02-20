export default class SoundSource {
    constructor(audioEngine, options = {}) {
        this.engine = audioEngine;
        this.context = audioEngine.context;
        this.panner = this.context.createPanner();

        // HRTF for better 3D spatialization with headphones
        this.panner.panningModel = 'HRTF';
        this.panner.distanceModel = 'inverse';
        this.panner.refDistance = 1;
        this.panner.maxDistance = 10000;
        this.panner.rolloffFactor = 1;

        // Position
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.z = options.z || 0;
        this.setPosition(this.x, this.y, this.z);

        // Connect to Master and Reverb
        this.panner.connect(this.engine.masterGain);
        this.panner.connect(this.engine.reverbNode);
    }

    setPosition(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        const time = this.context.currentTime;
        if (this.panner.positionX) {
            this.panner.positionX.setValueAtTime(x, time);
            this.panner.positionY.setValueAtTime(y, time);
            this.panner.positionZ.setValueAtTime(z, time);
        } else {
            this.panner.setPosition(x, y, z);
        }
    }

    // Abstract method to play specific sound
    play() {
        // Implementation depends on specific sound type
    }
}
