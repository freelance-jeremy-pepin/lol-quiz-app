<template>
    <q-card
        class="q-pa-sm bg-secondary text-white"
        style="font-size: 16px; font-family: Consolas,serif;"
    >
        <span class="text-bold">{{ time.minutes }}:{{ time.seconds }}</span>
        <span class="text-grey-4">:{{ time.milliseconds }}</span>
    </q-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { createDefaultTime, Time } from 'src/models/Time';

@Component
export default class StopWatch extends Vue {
    // region Data

    private time: Time = createDefaultTime();

    private interval: NodeJS.Timeout | null = null;

    private timeBegan: Date = new Date();

    // endregion

    // region Computed properties

    public get getTime(): Time {
        return this.time;
    }

    // endregion

    // region Hooks

    // noinspection JSUnusedLocalSymbols
    private mounted() {
        this.interval = setInterval(this.running, 10);
        this.timeBegan = new Date();
    }

    // noinspection JSUnusedLocalSymbols
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

        this.time.minutes = mins.toString().padStart(2, '0');
        this.time.seconds = secs.toString().padStart(2, '0');
        this.time.milliseconds = ms.toString().padStart(3, '0');
    }

    // endregion
}
</script>
