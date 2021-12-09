import React from 'react';

import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'

import * as mm from '@magenta/music'

// https://ourcodeworld.com/articles/read/293/rendering-music-notation-music-sheet-in-javascript-with-vexflow-2
import Vex from 'vexflow'

import { getDuration, toNoteName } from './Helper';

import { SOUND_PLAYER_SOUNDFONTS_URL, saveBlob } from './Common.js';
import { NoteSequence } from '@magenta/music';

type MultiStaffVisualizerProps = {
    sequence: NoteSequence;
}

type Voice = {
    notesInBar: string;
    clef: string;
    stem: string;
}

export class MultiStaffVisualizer extends React.Component<MultiStaffVisualizerProps> {
    player: mm.SoundFontPlayer;
    myRef = React.createRef<HTMLDivElement>();

    constructor(props: any) {
        super(props);
        this.myRef = React.createRef<HTMLDivElement>();

        this.player = new mm.SoundFontPlayer(SOUND_PLAYER_SOUNDFONTS_URL);
    }

    displaySequence(sequence: NoteSequence) {
        // elementId has to be used.
        var vf = new Vex.Flow.Factory({
            renderer: {
                elementId: this.myRef.current,
                height: 800,
                width: 800
            }
        });

        var score = vf.EasyScore();
        const timeSignature = '4/4';
        score.set({ time: timeSignature });

        this.displayNoteSequence(vf, score, sequence);

        vf.draw();
    }

    x = 0;
    y = 80;
    makeSystem(vf: Vex.Flow.Factory, width: number) {
        var system = vf.System({ x: this.x, y: this.y, width: width, spaceBetweenStaves: 10 });
        this.x += width;
        return system;
    }

    addBar(vf: Vex.Flow.Factory, score: Vex.Flow.EasyScore, system: Vex.Flow.System, voices: Voice[], isFirstBar: boolean, width: number): Vex.Flow.System {
        let vexFlowVoices = [];
        for (const voice of voices) {
            let vexFlowVoice = score.voice(score.notes(voice.notesInBar, {
                clef: voice.clef,
                stem: voice.stem
            }), null);
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

    displayNoteSequence(vf: Vex.Flow.Factory, score: Vex.Flow.EasyScore, sequence: NoteSequence) {
        var system: Vex.Flow.System;
        const width = 400;

        let firstBar = true;
        let barDuration = 0;
        let notesInBar = [];

        for (let i = 0; i < sequence.notes.length; i++) {
            const note: any = sequence.notes[i];
            if (note) {
                const duration = note.quantizedEndStep! - note.quantizedStartStep!;
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

                    system = this.makeSystem(vf, width);
                    system = this.addBar(vf, score, system, voice, firstBar, width);
                    firstBar = false;

                    barDuration = 0;
                    notesInBar = [];
                }
            }
        }
    }

    convertNotesToVexFlowNotes(notes: NoteSequence.Note[]) {
        let vexFlowNotes = [];
        for (const note of notes) {
            vexFlowNotes.push(this.convertNoteToVexFlowNote(note));
        }
        return vexFlowNotes.join();
    }

    convertNoteToVexFlowNote(note: NoteSequence.Note) {
        return toNoteName(note) + '/' + getDuration(note, 4);
    }

    play(sequence: NoteSequence) {
        if (sequence !== undefined) {
            console.log("Play...");
            if (this.player.isPlaying()) {
                this.player.stop();
            }
            this.player.setTempo(200);
            this.player.start(sequence);
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
                <ButtonGroup className="mb-2" >
                    <Button
                        variant="primary"
                        onClick={() => this.play(this.props.sequence)
                        }>
                        Play </Button>
                    < Button
                        variant="primary" onClick={() => this.stop()}>
                        Stop </Button>
                </ButtonGroup>
                < div ref={this.myRef} />
            </div>
        );
    }
}