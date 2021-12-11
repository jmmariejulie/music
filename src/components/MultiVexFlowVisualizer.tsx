import React from 'react';

import { NoteSequence } from '@magenta/music';
import { VexFlowVisualizer } from './VexFlowVisualizer';

interface IProps {
    sequences: NoteSequence[];
    quantizationStep: number;
}

interface IState {
    hasError?: boolean;
}

export class MultiVexFlowVisualizer extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
         return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.log("MultiVexFlowVisualizer error: " + error + " errorInfo:" + errorInfo);
    }

    render() {
        console.log("MultiVexFlowVisualizer render()");
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <h1>Something went wrong.</h1>;
        }

        if (this.props.sequences) {
            var sequences = this.props.sequences;
            return (
            <div>
                {sequences.map((sequence, index) => (
                    <VexFlowVisualizer key={index} sequence={sequence} quantizationStep={this.props.quantizationStep} clef={index==3?'bass':'treble'}/>
                ))}
            </div>
            )
        }
        return (<h1>Nothing to display</h1>);
    }
}