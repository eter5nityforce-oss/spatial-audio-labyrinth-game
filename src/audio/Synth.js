import SoundSource from './SoundSource.js';

export default class Synth extends SoundSource {
    constructor(audioEngine, options = {}) {
        super(audioEngine, options);
        this.type = options.type || 'sine'; // oscillator type
        this.baseFreq = options.freq || 440;
        this.loop = options.loop || false;
        this.oscillators = [];
        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.panner);
        this.isPlaying = false;
    }

    startDrone() {
        if (this.isPlaying) return;

        const osc = this.context.createOscillator();
        osc.type = this.type;
        osc.frequency.setValueAtTime(this.baseFreq, this.context.currentTime);

        // LFO for movement
        const lfo = this.context.createOscillator();
        lfo.frequency.value = 0.5; // 0.5 Hz
        const lfoGain = this.context.createGain();
        lfoGain.gain.value = 10;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        osc.connect(this.gainNode);
        osc.start();

        this.oscillators.push(osc, lfo);
        this.isPlaying = true;
    }

    stop() {
        this.oscillators.forEach(osc => {
            try { osc.stop(); } catch(e){}
        });
        this.oscillators = [];
        this.isPlaying = false;
    }

    playPing() {
        const osc = this.context.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.context.currentTime + 0.1);

        const gain = this.context.createGain();
        gain.gain.setValueAtTime(0.5, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.panner);

        osc.start();
        osc.stop(this.context.currentTime + 0.5);
    }
}
