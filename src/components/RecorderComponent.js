import React from 'react';

import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'

import * as mm from '@magenta/music'
import { SOUND_PLAYER_SOUNDFONTS_URL, saveBlob } from './Common.js';


export class RecorderComponent extends React.Component {
    recorder = undefined;
    player = undefined;

    constructor(props) {
        super(props);
        this.myRef = React.createRef();
        this.player = new mm.SoundFontPlayer(SOUND_PLAYER_SOUNDFONTS_URL);

        this.recorder = new mm.Recorder();
        this.recorder.initialize();
        this.recorder.setTempo(60);
        this.recorder.enablePlayClick();
    }

    // Stream recording.
    record = () => {
        this.recorder.callbackObject = {
            run: (seq) => {
                console.log('RecorderComponent.record() ' + seq);
                if (seq) {
                    // tslint:disable-next-line:no-unused-expression
                    seq.tempos.push({ qpm: 60 });
                    new mm.StaffSVGVisualizer(seq, this.myRef.current);
                }
            },
            noteOn: (pitch, velocity, device) => {
                console.log('We have received a noteOn event!');
            },
            noteOff: (pitch, velocity, device) => { console.log('We have received a noteOff event!') }
        };
        this.recorder.start();
    };

    stop = () => {
        const seq = this.recorder.stop();

        if (seq) {
            seq.tempos.push({ qpm: 60 });
            console.log('RecorderComponent.stop() ' + seq);
            new mm.StaffSVGVisualizer(seq, this.myRef.current);
        }
    };

    render() {
        return (
            <div>
                <ButtonGroup className="mb-2">
                    <Button
                        variant="primary"
                        onClick={() => this.record()}>
                        Record</Button>
                    <Button
                        variant="primary" onClick={() => this.stop()}>
                        Stop</Button>
                </ButtonGroup>
                <div ref={this.myRef} width='400px' height='200px' />
            </div>
        );
    }
}