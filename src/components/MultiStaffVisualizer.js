import React from 'react';

import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'

import * as mm from '@magenta/music'

// https://ourcodeworld.com/articles/read/293/rendering-music-notation-music-sheet-in-javascript-with-vexflow-2
import Vex from 'vexflow'

import { getDuration, toNoteName } from './Helper';

import { SOUND_PLAYER_SOUNDFONTS_URL, saveBlob } from './Common.js';

export class MultiStaffVisualizer extends React.Component {
    player = undefined;

    constructor(props) {
        super(props);
        this.myRef = React.createRef();

        this.player = new mm.SoundFontPlayer(SOUND_PLAYER_SOUNDFONTS_URL);
    }

    displaySequence(sequence) {
        // elementId has to be used.
        var vf = new Vex.Flow.Factory({
            renderer: {
                elementId: this.myRef.current,
                height: 800,
                width: 800
            }
        });

        var score = vf.EasyScore();
        var system = undefined;

        const timeSignature = '4/4';
        score.set({ time: timeSignature });

        this.displayNoteSequence(vf, score, sequence);

        /*
        const voices = [{
            notesInBar: 'C#5/q, B4, A4, G#4',
            clef: 'treble',
            stem: 'up'
        }
        ]
        system = this.addBar(vf, score, system, voices, true, 400);

        const voices2 = [{
            notesInBar: 'C#5/q, B4, A4, G#4',
            clef: 'treble',
            stem: 'up'
        },
        {
            notesInBar: 'C#3/q, B2, A2/8, B2, C#3, D3',
            clef: 'bass',
            stem: 'up'
        }
        ]
        system = this.addBar(vf, score, system, voices2, false, 400);
        */
        vf.draw();
    }

    x = 0;
    y = 80;
    makeSystem(vf, width) {
        var system = vf.System({ x: this.x, y: this.y, width: width, spaceBetweenStaves: 10 });
        this.x += width;
        return system;
    }

    // [{notesInBar, clef, stem}] 
    addBar(vf, score, system, voices, isFirstBar, width) {
        system = this.makeSystem(vf, width);

        let vexFlowVoices = [];
        for (const voice of voices) {
            let vexFlowVoice = score.voice(score.notes(voice.notesInBar, {
                clef: voice.clef,
                stem: voice.stem
            }));
            vexFlowVoices.push(vexFlowVoice);
        }

        if (isFirstBar) {
            system.addStave({
                voices: vexFlowVoices
            }).addClef('treble').addTimeSignature('4/4');
        } else {
            system.addStave({
                voices: vexFlowVoices
            });
        }
        return system;
    }

    displayNoteSequence(vf, score, sequence) {
        var system = undefined;

        let barDuration = 0;
        let notesInBar = [];

        for (let i = 0; i < sequence.notes.length; i++) {
            const note = sequence.notes[i];
            const duration = note.quantizedEndStep - note.quantizedStartStep;
            barDuration += duration;
            notesInBar.push(note);
            if (barDuration == 16) {
                // create a new bar
                const vexFlowNotesInBar = this.convertNotesToVexFlowNotes(notesInBar)
                const voice = [{
                    notesInBar: vexFlowNotesInBar,
                    clef: 'treble',
                    stem: 'up'
                }];

                console.log("displayNoteSequence() notes: " + vexFlowNotesInBar);

                const width = 400;
                system = this.addBar(vf, score, system, voice, false, width);

                barDuration = 0;
                notesInBar = [];
            }
        }
    }

    convertNotesToVexFlowNotes(notes) {
        let vexFlowNotes = [];
        for (const note of notes) {
            vexFlowNotes.push(this.convertNoteToVexFlowNote(note));
        }
        return vexFlowNotes.join();
    }

    convertNoteToVexFlowNote(note) {
        return toNoteName(note) + '/' + getDuration(note, 4);
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
                <div ref={this.myRef} width='400px' height='400px' />

            </div>
        );
    }
}