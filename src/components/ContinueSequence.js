import React from 'react';

import * as mm from '@magenta/music'

import { StaffVisualizer } from './StaffVisualizer.js';

export class ContinueSequence extends React.Component {
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
            <div>
                <input
                    type='file'
                    id='fileInput'
                    onChange={e => this.handleInputFileChoosen(e.target.files[0])} />
            </div>
            <br />
            <StaffVisualizer sequence={this.state.inputSequence} />
            <br />
            <div>
            <button
                onClick={() => this.continueInputSequence()}>
                Continue sequence
            </button>
            </div>
            <br />
            <StaffVisualizer sequence={this.state.outputSequence} />
            
        </div>);
    }
}

