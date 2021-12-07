import React from 'react';

import * as mm from '@magenta/music'
import { StaffVisualizer } from './StaffVisualizer.js';
import { MultiStaffVisualizer } from './MultiStaffVisualizer.js';
import { RecorderComponent } from './RecorderComponent';

import { splitVoices } from './Helper.js';

// See https://coconet.glitch.me/#67:3:0,67:4:0,67:19:0,67:20:0,65:2:0,65:5:0,65:18:0,65:21:0,64:0:0,64:1:0,64:6:0,64:11:0,64:12:0,64:16:0,64:17:0,64:22:0,64:27:0,62:7:0,62:10:0,62:14:0,62:23:0,62:26:0,62:28:0,61:30:0,60:8:0,60:9:0,60:24:0,60:25:0

export class CoconetSequence extends React.Component {
    CHECKPOINTS_DIR = 'https://storage.googleapis.com/magentadata/js/checkpoints';
    SOUND_PLAYER_SOUNDFONTS_URL = 'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus';

    player = undefined;
    recorder = new mm.Recorder();

    defaultQuantization = 4;

    constructor(props) {
        super(props);
        this.state = {
            inputSequence: undefined,
            outputSequence: undefined,
            multiVoiceOutputSequence: undefined
        }
        this.player = new mm.SoundFontPlayer(this.SOUND_PLAYER_SOUNDFONTS_URL);
        this.setInputSequence = this.setInputSequence.bind(this);
    }

    handleInputFileChoosen = (file) => {
        console.log('handleInputFileChoosen() loading file: ' + file);

        let promise = mm.blobToNoteSequence(file)
            .then((sample) => {
                const quantitizedSequence = mm.sequences.quantizeNoteSequence(sample, this.defaultQuantization);
                this.setState({ inputSequence: quantitizedSequence });

                // Just to test the VexFlow
                this.setState({ multiVoiceOutputSequence: quantitizedSequence });
            });
        console.log('handleInputFileChoosen() inputNotes: ' + promise);


    }

    async coconetInputSequence() {
        var coconet_model = new mm.Coconet(this.CHECKPOINTS_DIR + '/coconet/bach');
        await coconet_model.initialize();

        try {
            const quantitizedInputSequence = mm.sequences.quantizeNoteSequence(this.state.inputSequence, this.defaultQuantization);
            var outputSequence = await coconet_model.infill(quantitizedInputSequence, { numIterations: 10, temperature: parseFloat(0.99) });

            // https://magenta.github.io/magenta-js/music/modules/_core_sequences_.html#mergeconsecutivenotes
            outputSequence = mm.sequences.mergeConsecutiveNotes(outputSequence);
            outputSequence.tempos = this.state.inputSequence.tempos;
            outputSequence.timeSignatures = quantitizedInputSequence.timeSignatures;
            outputSequence.controlChanges = quantitizedInputSequence.controlChanges;
            outputSequence.quantizationInfo = quantitizedInputSequence.quantizationInfo;
            outputSequence.ticksPerQuarter = quantitizedInputSequence.ticksPerQuarter;
            outputSequence.totalTime = quantitizedInputSequence.totalTime;
            // unquantitize sequence in order to compute the starttime for each note
            outputSequence = mm.sequences.unquantizeSequence(outputSequence, 60);
            outputSequence = mm.sequences.quantizeNoteSequence(outputSequence, this.defaultQuantization);

            var voices = splitVoices(outputSequence);
            console.table(voices);

            this.setState({ outputSequence: outputSequence });
            this.setState({ multiVoiceOutputSequence: voices });
        } catch (error) {
            console.error(error);
        }
        coconet_model.dispose();
    }


    saveOutputAsMidi(sequence) {
        sequence.notes.forEach(n => n.velocity = 100);
        const midi_bytes_array = mm.sequenceProtoToMidi(sequence);

        // Convert byte array to file
        const magentaFile = new Blob([midi_bytes_array], { type: 'audio/midi' });

        const magentaURL = URL.createObjectURL(magentaFile);
        console.log('Music.saveOutputAsMidi() url:' + magentaURL);
    }

    setInputSequence(sequence) {
        this.setState({ inputSequence: sequence });
    }

    render() {
        console.log('Music.render() sequence:' + this.state.inputSequence);
        const inputSequenceDefined = this.state.inputSequence !== undefined;
        return (
            <div>
                <p>Coconet</p>
                <div>
                    <input
                        type='file'
                        id='fileInput'
                        onChange={e => this.handleInputFileChoosen(e.target.files[0])} />
                </div>
                <div>
                    <RecorderComponent setSequence={this.setInputSequence} />
                </div>
                <br />
                <StaffVisualizer sequence={this.state.inputSequence} />
                <br />
                <div>
                    <button
                        onClick={() => this.coconetInputSequence()}>
                        Continue sequence
                    </button>
                </div>
                <br />
                <StaffVisualizer sequence={this.state.outputSequence} />
                <MultiStaffVisualizer sequence={this.state.multiVoiceOutputSequence} />
            </div>);
    }
}

