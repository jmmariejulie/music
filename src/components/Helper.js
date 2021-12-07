import * as mm from '@magenta/music'
import { note } from 'midi-note' // https://www.npmjs.com/package/midi-note

export function splitVoices(noteSequence) {
    const instruments = getInstruments(noteSequence);
    const voiceNumber = instruments.length;

    const noteSequences = [];
    for (var i = 0; i < voiceNumber; i++) {
        const ns = mm.sequences.clone(noteSequence);
        noteSequences.push(ns);

        ns.notes = [];
        copyToSequence(noteSequence, ns, i);
    }

    return noteSequences;
}

export function toNoteName(pitch) {
    return note(pitch);
}

export function getDuration(note, quantizationStep) {
    const durationQuantized = note.quantizedEndStep - note.quantizedStartStep;
    if (quantizationStep == 4) {
        switch (durationQuantized) {
            case 16: return 'w'; // ronde
            case 12: return 'h.'; // blanche pointee
            case 8: return 'h'; // blanche
            case 6: return 'q.'; // noire pointee
            case 4: return 'q'; // noire
            case 3: return '8.'; // croche pointee
            case 2: return '8'; // croche
            case 1: return '16'; // double croche
        }
    } else return "";
}

const getInstruments = (noteSequence) => {
    let instruments = [];
    for (var i = 0; i < noteSequence.notes.length; i++) {
        const note = noteSequence.notes[i];
        if (!instruments.includes(note.instrument)) {
            instruments.push(note.instrument);
        }
    }
    return instruments;
}

const copyToSequence = (sourceSequence, destSequence, instrument) => {
    for (var i = 0; i < sourceSequence.notes.length; i++) {
        const note = sourceSequence.notes[i];
        if (note.instrument === instrument) {
            destSequence.notes.push(note);
        }
    }
}

