import React from 'react';

import * as mm from '@magenta/music'

export class Visualizer extends React.Component {
    constructor(props) {
        super(props);
    }

    displaySequence(sequence) {
        var viz = new mm.PianoRollCanvasVisualizer(sequence, this.myCanvas);
    }

    render() {
        console.log('Visualizer.render() sequence:' + this.props.sequence);
        if (this.props.sequence !== undefined) {
            this.displaySequence(this.props.sequence);
        }
        return (
            <canvas ref={canvas => this.myCanvas = canvas} width='400px' height='200px' />
        );
    }
}