<template>
    <q-card
        class="q-pa-sm bg-secondary text-white"
        style="font-size: 16px; font-family: Consolas,serif;"
    >
        <span class="text-bold">{{ minutes }}:{{ seconds }}</span>
        <span class="text-grey-4">:{{ miliseconds }}</span>
    </q-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class StopWatch extends Vue {
    // region Data

    private minutes: string = '00';
    private seconds: string = '00';
    private miliseconds: string = '000';
    private interval: NodeJS.Timeout | null = null;
    private timeBegan: Date = new Date();

    // endregion

    // region Hooks

    private mounted() {
        this.interval = setInterval(this.running, 10);
        this.timeBegan = new Date();
    }

    private unmounted() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    // endregion

    // region Methods

    private running() {
        let timeElapsed = new Date().getTime() - this.timeBegan.getTime();

        const ms = timeElapsed % 1000;
        timeElapsed = (timeElapsed - ms) / 1000;
        const secs = timeElapsed % 60;
        timeElapsed = (timeElapsed - secs) / 60;
        const mins = timeElapsed % 60;

        this.minutes = this.pad(mins);
        this.seconds = this.pad(secs);
        this.miliseconds = this.pad(ms, 3);
    }

    private pad(n: number, z: number = 2) {
        z = z || 2;
        return ('00' + n).slice(-z);
    }

    // endregion
}
</script>
