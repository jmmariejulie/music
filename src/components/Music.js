import React from 'react';

import * as mm from '@magenta/music'

import { MEL_TWINKLE, MEL_TEAPOT, writeMemory } from './Common.js';
import { Visualizer } from './Visualizer.js';
import { StaffVisualizer } from './StaffVisualizer.js';

export class Music extends React.Component {
    CHECKPOINTS_DIR = 'https://storage.googleapis.com/magentadata/js/checkpoints';
    SOUND_PLAYER_SOUNDFONTS_URL = 'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus';

    player = undefined;

    constructor(props) {
        super(props);
        this.state = {
            inputSequence: undefined,
            outputSequence: undefined
        }
        this.player = new mm.SoundFontPlayer(this.SOUND_PLAYER_SOUNDFONTS_URL);
    }

    testPlayer() {
        // Create a player to play the sequence we'll get from the model.
        var rnnPlayer = new mm.SoundFontPlayer(this.SOUND_PLAYER_SOUNDFONTS_URL);

        console.log("Play...");
        if (rnnPlayer.isPlaying()) {
            rnnPlayer.stop();
            return;
        }
        rnnPlayer.start(MEL_TWINKLE);
        rnnPlayer.stop();
    }

    async testContinueSong() {
        var rnnPlayer = new mm.SoundFontPlayer(this.SOUND_PLAYER_SOUNDFONTS_URL);
        var music_rnn = new mm.MusicRNN(this.CHECKPOINTS_DIR + '/music_rnn/basic_rnn');
        await music_rnn.initialize();

        if (rnnPlayer.isPlaying()) {
            rnnPlayer.stop();
            return;
        }

        music_rnn
            .continueSequence(MEL_TWINKLE, this.rnn_steps, this.rnn_temperature)
            .then((sample) => rnnPlayer.start(sample));
    }

    async coconetTest() {
        var rnnPlayer = new mm.SoundFontPlayer(this.SOUND_PLAYER_SOUNDFONTS_URL);

        var coconet_model = new mm.Coconet(this.CHECKPOINTS_DIR + '/coconet/bach');

        //coconet_model.initialize().then(()=>console.log('Coconet: initialised=' + coconet_model.initialized));

        await coconet_model.initialize();

        if (rnnPlayer.isPlaying()) {
            rnnPlayer.stop();
            return;
        }

        var output = undefined;
        try {
            output = await coconet_model.infill(MEL_TEAPOT, { numIterations: 1 });
        } catch (error) {
            console.error(error);
        }
        coconet_model.dispose();
        rnnPlayer.start(output);
    }

    handleInputFileChoosen = (file) => {
        console.log('handleInputFileChoosen() loading file: ' + file);

        let promise = mm.blobToNoteSequence(file)
            .then((sample) => this.setState({ inputSequence: sample }));
        console.log('handleInputFileChoosen() inputNotes: ' + promise);
    }

    async continueInputSequence() {
        var music_rnn = new mm.MusicRNN(this.CHECKPOINTS_DIR + '/music_rnn/basic_rnn');
        await music_rnn.initialize();

        if (this.player.isPlaying()) {
            this.player.stop();
        }

        let rnn_steps = 80;
        let rnn_temperature = .8;
        const quantitizedInputSequence = mm.sequences.quantizeNoteSequence(this.state.inputSequence, 4);
        music_rnn
            .continueSequence(quantitizedInputSequence, rnn_steps, rnn_temperature)
            .then((sample) => {
                this.setState({ outputSequence: sample });
            });
    }

    displaySequence(sequence, canvas) {
        var viz = new mm.PianoRollCanvasVisualizer(sequence, canvas);
    }

    saveOutputAsMidi(sequence) {
        sequence.notes.forEach(n => n.velocity = 100);
        const midi_bytes_array = mm.sequenceProtoToMidi(sequence);

        // Convert byte array to file
        const magentaFile = new Blob([midi_bytes_array], { type: 'audio/midi' });

        const magentaURL = URL.createObjectURL(magentaFile);
        console.log('Music.saveOutputAsMidi() url:' + magentaURL);
    }

    render() {
        console.log('Music.render() sequence:' + this.state.inputSequence);
        return (<div>
            <p>Music</p>

            <input
                type='file'
                id='fileInput'
                onChange={e => this.handleInputFileChoosen(e.target.files[0])} />
            <StaffVisualizer sequence={this.state.inputSequence} />
            <button
                onClick={() => this.continueInputSequence()}>
                Continue sequence
            </button>
            <StaffVisualizer sequence={this.state.outputSequence} />
            <button
                onClick={() => this.testPlayer()}>
                Test player
            </button>
            <button
                onClick={() => this.testContinueSong()}>
                Test continue sequence
            </button>
            <button
                onClick={() => this.coconetTest()}
            >Test coconet
            </button>
        </div>);
    }
}

