import React from 'react';

import * as mm from '@magenta/music'

import { MEL_TWINKLE, MEL_TEAPOT, writeMemory } from './Common.js';

export class TestMusic extends React.Component {
    CHECKPOINTS_DIR = 'https://storage.googleapis.com/magentadata/js/checkpoints';
    SOUND_PLAYER_SOUNDFONTS_URL = 'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus';

    testPlayer() {
        // Create a player to play the sequence we'll get from the model.
        var rnnPlayer = new mm.SoundFontPlayer(this.SOUND_PLAYER_SOUNDFONTS_URL);

        console.log("Play...");
        if (rnnPlayer.isPlaying()) {
            rnnPlayer.stop();
            return;
        }
        rnnPlayer.start(MEL_TWINKLE);
        rnnPlayer.stop();
    }

    async testContinueSong() {
        var rnnPlayer = new mm.SoundFontPlayer(this.SOUND_PLAYER_SOUNDFONTS_URL);
        var music_rnn = new mm.MusicRNN(this.CHECKPOINTS_DIR + '/music_rnn/basic_rnn');
        await music_rnn.initialize();

        if (rnnPlayer.isPlaying()) {
            rnnPlayer.stop();
            return;
        }

        music_rnn
            .continueSequence(MEL_TWINKLE, this.rnn_steps, this.rnn_temperature)
            .then((sample) => rnnPlayer.start(sample));
    }

    async coconetTest() {
        var rnnPlayer = new mm.SoundFontPlayer(this.SOUND_PLAYER_SOUNDFONTS_URL);

        var coconet_model = new mm.Coconet(this.CHECKPOINTS_DIR + '/coconet/bach');

        //coconet_model.initialize().then(()=>console.log('Coconet: initialised=' + coconet_model.initialized));

        await coconet_model.initialize();

        if (rnnPlayer.isPlaying()) {
            rnnPlayer.stop();
            return;
        }

        var output = undefined;
        try {
            output = await coconet_model.infill(MEL_TWINKLE, { numIterations: 1 });
        } catch (error) {
            console.error(error);
        }
        coconet_model.dispose();
        rnnPlayer.start(output);
    }

    render() {
        return (
            <div>
                <p>Music</p>
                <br />
                <button
                    onClick={() => this.testPlayer()}>
                    Test player
            </button>
                <button
                    onClick={() => this.testContinueSong()}>
                    Test continue sequence
            </button>
                <button
                    onClick={() => this.coconetTest()}
                >Test coconet
            </button>
            </div>
        );
    }
}

