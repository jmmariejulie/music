import React from 'react';

// https://ourcodeworld.com/articles/read/293/rendering-music-notation-music-sheet-in-javascript-with-vexflow-2
import Vex from 'vexflow'

import { getDuration, toNoteName } from './Helper';
import { NoteSequence } from '@magenta/music';

interface IProps {
    sequence: NoteSequence;
    quantizationStep: number;
}

interface IState {
    hasError?: boolean;
}

type Voice = {
    notesInBar: string;
    clef: string;
    stem: string;
}

export class VexFlowVisualizer extends React.Component<IProps, IState> {
    private myRef = React.createRef<HTMLDivElement>();

    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    displaySequence(sequence: NoteSequence) {
        if(!this.myRef.current) {
            console.log("displaySequence() no myRef: " + this.myRef.current);
        }
        // elementId has to be used.
        var vf = new Vex.Flow.Factory({
            renderer: {
                elementId: this.myRef.current,
                height: 200,
                width: 1600
            }
        });

        var score = vf.EasyScore();
        const timeSignature = '4/4';
        score.set({ time: timeSignature });

        this.displayNoteSequence(vf, score, sequence);

        vf.draw();
    }

    x = 0;
    y = 20;
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
        const width = 300;

        let firstBar = true;
        let barDuration = 0;
        let notesInBar = [];
        const stepsPerBar = 4 * this.props.quantizationStep;

        for (let i = 0; i < sequence.notes.length; i++) {
            const note: any = sequence.notes[i];
            if (note) {
                const duration = note.quantizedEndStep! - note.quantizedStartStep!;
                barDuration += duration;
                notesInBar.push(note);
                if (barDuration === stepsPerBar) {
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
        return toNoteName(note) + '/' + getDuration(note, this.props.quantizationStep);
    }

    static getDerivedStateFromError(error: any) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.log("VexFlowVisualizer error: " + error + " errorInfo:" + errorInfo);
    }

    componentDidMount() {
        console.log('StaffVisualizer.render() sequence:' + this.props.sequence);
        if (this.props.sequence) {
            this.displaySequence(this.props.sequence);
        }
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <h1>Something went wrong.</h1>;
        }

        
        return (
            <div>
                < div ref={this.myRef} />
            </div>
        );
    }
}