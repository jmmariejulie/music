import React from 'react';

import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'

import * as mm from '@magenta/music'

import { SOUND_PLAYER_SOUNDFONTS_URL, saveBlob } from './Common.js';


export class StaffVisualizer extends React.Component {
    player = undefined;

    constructor(props) {
        super(props);
        this.myRef = React.createRef();

        this.player = new mm.SoundFontPlayer(SOUND_PLAYER_SOUNDFONTS_URL);
    }

    displaySequence(sequence) {
        new mm.StaffSVGVisualizer(sequence, this.myRef.current);
    }

    play(sequence) {
        if (sequence !== undefined) {
            console.log("Play...");
            if (this.player.isPlaying()) {
                this.player.stop();
            }
            this.player.start(sequence);
            this.player.stop();
        }
    }

    stop() {
        if (this.player.isPlaying()) {
            this.player.stop();
        }
    }

    saveOutputAsMidi(sequence) {
        if (sequence === undefined) {
            return;
        }

        sequence.notes.forEach(n => n.velocity = 100);
        const midi_bytes_array = mm.sequenceProtoToMidi(sequence);

        // Convert byte array to file
        const magentaFile = new Blob([midi_bytes_array], { type: 'audio/midi' });

        const magentaURL = URL.createObjectURL(magentaFile);
        console.log('Music.saveOutputAsMidi() url:' + magentaURL);

        saveBlob(magentaFile, 'test.mid');
    }

    render() {
        console.log('StaffVisualizer.render() sequence:' + this.props.sequence);
        if (this.props.sequence !== undefined) {
            this.displaySequence(this.props.sequence);
        }
        return (
            <div>
                <ButtonGroup className="mb-2">
                    <Button
                        variant="primary"
                        onClick={() => this.play(this.props.sequence)}>
                        Play</Button>
                    <Button
                        variant="primary" onClick={() => this.stop()}>
                        Stop</Button>
                    <Button
                        variant="primary" onClick={() => this.saveOutputAsMidi(this.props.sequence)}>
                        Save</Button>
                </ButtonGroup>
                <div ref={this.myRef} width='400px' height='200px' />
            </div>
        );
    }
}