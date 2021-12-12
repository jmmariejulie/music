import * as mm from '@magenta/music'
import { NoteSequence } from '@magenta/music'
import { Note } from "@tonaljs/tonal"; // https://github.com/tonaljs/tonal

// Split a noteSequence into several sequences, each per instrument
export const splitVoices = (noteSequence: NoteSequence): NoteSequence[] => {
    const instruments = getInstruments(noteSequence);
    const voiceNumber = instruments.length;

    const noteSequences = [];
    for (var i: number = 0; i < voiceNumber; i++) {
        const ns = mm.sequences.clone(noteSequence);
        noteSequences.push(ns);

        ns.notes = [];
        copyToSequence(noteSequence, ns, i);
    }

    return noteSequences;
}

export const midiNoteToTextNotation = (note: NoteSequence.Note, quantizationStep: number): string => {
    return toNoteName(note) + '/' + getDuration(note, quantizationStep);
}   

export const toNoteName = (magentaNote: NoteSequence.Note): string => {
    return Note.fromMidi(magentaNote.pitch);
}

export const getDuration = (note: NoteSequence.Note, quantizationStep: number): string => {
    const durationQuantized = note.quantizedEndStep - note.quantizedStartStep;
    //const durationQuantizedStep = durationQuantized / (quantizationStep / 4);
    let durationQuantizedStep = durationQuantized;
    if(quantizationStep == 2) {
        durationQuantizedStep  = durationQuantized * 2;
    } else if(quantizationStep == 1) {
        durationQuantizedStep  = durationQuantized * 4;
    }  

    switch (durationQuantizedStep) {
        case 16: return 'w'; // ronde
        case 15: return 'h., ' + toNoteName(note) + '/8.'; // blanche pointee + une croche pointee
        case 14: return 'h., ' + toNoteName(note) + '/8'; // blanche pointee + une croche
        case 13: return 'h., ' + toNoteName(note) + '/16'; // blanche pointee + une double croche
        case 12: return 'h.'; // blanche pointee
        case 11: return 'h, ' + toNoteName(note) + '/8.'; // blanche + une croche pointee
        case 10: return 'h, ' + toNoteName(note) + '/8'; // blanche + une croche
        case 9: return 'h, ' + toNoteName(note) + '/16'; // blanche + une double croche
        case 8: return 'h'; // blanche
        case 7: return 'q.'; // noire pointee
        case 6: return 'q.'; // noire pointee
        case 5: return 'q, ' + toNoteName(note) + '/16'; // noire + une double croche
        case 4: return 'q'; // noire
        case 3: return '8.'; // croche pointee
        case 2: return '8'; // croche
        case 1: return '16'; // double croche
    }

    return "unrecognized durationQuantized: " + durationQuantized + " durationQuantizedStep: " + durationQuantizedStep;
}

const getInstruments = (noteSequence: NoteSequence): number[] => {
    let instruments: number[] = [];
    for (var i = 0; i < noteSequence.notes.length; i++) {
        const note = noteSequence.notes[i];
        if (!instruments.includes(note.instrument!)) {
            instruments.push(note.instrument!);
        }
    }
    return instruments;
}

const copyToSequence = (sourceSequence: NoteSequence, destSequence: NoteSequence, instrument: number): void => {
    for (var i = 0; i < sourceSequence.notes.length; i++) {
        const note = sourceSequence.notes[i];
        if (note.instrument === instrument) {
            destSequence.notes.push(note);
        }
    }
}

