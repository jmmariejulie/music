import React, { useRef, useEffect } from 'react';

// https://ourcodeworld.com/articles/read/293/rendering-music-notation-music-sheet-in-javascript-with-vexflow-2
// https://git.bz-inc.com/mirror/vexflow/-/wikis/Home
import Vex from 'vexflow'

import { midiNoteToTextNotation } from './Helper';
import { NoteSequence } from '@magenta/music';

interface IProps {
    sequence: NoteSequence;
    quantizationStep: number;
    clef: string;
}

type Voice = {
    notesInBar: string;
    clef: string;
    stem: string;
}

export const VexFlowVisualizer = (props: IProps) => {
    const myRef = useRef<HTMLDivElement>(null);
    var barWidth = 300;

    var currentBarx = 0;
    var currentBary = 20;

    const displaySequence = (sequence: NoteSequence) => {
        initScore(myRef.current);
        // elementId has to be used.
        var vf = new Vex.Flow.Factory({
            renderer: {
                elementId: myRef.current,
                height: 200,
                width: 1600
            }
        });

        var score = vf.EasyScore();
        const timeSignature = '4/4';
        score.set({ time: timeSignature });

        displayNoteSequence(vf, score, sequence);

        vf.draw();
    }

    const initScore = (drawArea: any) => {
        drawArea!.innerHTML = "";

        currentBarx = 0;
        currentBary = 20;
    }

    const makeSystem = (vf: Vex.Flow.Factory, width: number) => {
        var system = vf.System({ x: currentBarx, y: currentBary, width: width, spaceBetweenStaves: 10 });
        currentBarx += width;
        return system;
    }

    const addBar = (vf: Vex.Flow.Factory, score: Vex.Flow.EasyScore, system: Vex.Flow.System, voices: Voice[], isFirstBar: boolean, width: number): Vex.Flow.System => {
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
            }).addClef(props.clef).addTimeSignature('4/4');
        } else {
            system.addStave({
                voices: vexFlowVoices
            });
        }
        return system;
    }


    const displayNoteSequence = (vf: Vex.Flow.Factory, score: Vex.Flow.EasyScore, sequence: NoteSequence) => {
        var system: Vex.Flow.System;

        const bars = noteSequenceToBars(vf, score, sequence);

        var firstBar = true;
        for (let i = 0; i < bars.length; i++) {
            const bar = bars[i];
            const voice = [{
                notesInBar: bar,
                clef: props.clef,
                stem: 'up'
            }];
            system = makeSystem(vf, barWidth);
            addBar(vf, score, system, voice, firstBar, barWidth);
            
            firstBar = false;
        }
    }

    const noteSequenceToBars = (vf: Vex.Flow.Factory, score: Vex.Flow.EasyScore, sequence: NoteSequence): string[] => {
        var bars: string[] = [];

        let firstBar = true;
        let barDuration = 0;
        let notesInBar = [];
        const stepsPerBar = 4 * props.quantizationStep;

        for (let i = 0; i < sequence.notes.length; i++) {
            const note: any = sequence.notes[i];
            if (note) {
                const duration = note.quantizedEndStep! - note.quantizedStartStep!;
                barDuration += duration;
                notesInBar.push(note);
                if (barDuration >= stepsPerBar) {
                    // create a new bar
                    let vexFlowNotesInBar = undefined;
                    let voice: Voice[];
                    if (barDuration === stepsPerBar) {
                        vexFlowNotesInBar = convertNotesToVexFlowNotes(notesInBar)
                        voice = [{
                            notesInBar: vexFlowNotesInBar,
                            clef: props.clef,
                            stem: 'up'
                        }];
                    } else {
                        // last note is too long, must be splitted
                        var lastNote = notesInBar[notesInBar.length - 1];
                        lastNote.quantizedEndStep -= barDuration - stepsPerBar;
                        vexFlowNotesInBar = convertNotesToVexFlowNotes(notesInBar)
                        voice = [{
                            notesInBar: vexFlowNotesInBar,
                            clef: props.clef,
                            stem: 'up'
                        }];

                        // insert a new note (this will be in the next bar)
                        const noteToBeInsertedDuration = barDuration - stepsPerBar;
                        const noteToBeInserted = { ...note };
                        noteToBeInserted.quantizedStartStep = lastNote.quantizedEndStep + 1;
                        noteToBeInserted.quantizedEndStep = noteToBeInserted.quantizedStartStep + noteToBeInsertedDuration;
                        insertNote(sequence, noteToBeInserted, i + 1);
                    }

                    console.log("displayNoteSequence() notes: " + vexFlowNotesInBar);

                    bars.push(vexFlowNotesInBar);
                    //addBar(vf, score, system, voice, firstBar, barWidth);
                    firstBar = false;

                    barDuration = 0;
                    notesInBar = [];
                }
            }
        }
        return bars;
    }

    const insertNote = (sequence: NoteSequence, note: NoteSequence.Note, position: number) => {
        sequence.notes.splice(position, 0, note);
    }

    const convertNotesToVexFlowNotes = (notes: NoteSequence.Note[]) => {
        let vexFlowNotes = [];
        for (const note of notes) {
            vexFlowNotes.push(midiNoteToTextNotation(note, props.quantizationStep));
        }
        return vexFlowNotes.join();
    }

    useEffect(() => {
        if (!myRef.current) {
            console.log("VexFlowVisualizer.render() no myRef: " + myRef.current);
        }
        if (props.sequence && myRef.current) {
            console.log('VexFlowVisualizer.render() sequence:' + props.sequence);
            displaySequence(props.sequence);
        }
    });

    return (
        < div id='vexflow-visualizer' ref={myRef} />
    );
}