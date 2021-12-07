import React from 'react';

import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'

import * as mm from '@magenta/music'

import { SOUND_PLAYER_SOUNDFONTS_URL, saveBlob } from './Common.js';

export class MultiStaffVisualizer2 extends React.Component {
    player = undefined;

    constructor(props) {
        super(props);
        this.myRef1 = React.createRef();
        this.myRef2 = React.createRef();
        this.myRef3 = React.createRef();
        this.myRef4 = React.createRef();

        this.player = new mm.SoundFontPlayer(SOUND_PLAYER_SOUNDFONTS_URL);
    }

    displaySequence(sequence) {
        new mm.StaffSVGVisualizer(sequence[0], this.myRef1.current);
        new mm.StaffSVGVisualizer(sequence[1], this.myRef2.current);
        new mm.StaffSVGVisualizer(sequence[2], this.myRef3.current);
        new mm.StaffSVGVisualizer(sequence[3], this.myRef4.current);
    }

    play(sequence) {
        if (sequence !== undefined) {
            console.log("Play...");
            if (this.player.isPlaying()) {
                this.player.stop();
            }
            this.player.setTempo(200);
            this.player.start(sequence[0]);
            this.player.stop();
        }
    }

    stop() {
        if (this.player.isPlaying()) {
            this.player.stop();
        }
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
                </ButtonGroup>
                <div ref={this.myRef1} width='400px' height='400px' />
                <div ref={this.myRef2} width='400px' height='400px' />
                <div ref={this.myRef3} width='400px' height='400px' />
                <div ref={this.myRef4} width='400px' height='400px' />
            </div>
        );
    }
}