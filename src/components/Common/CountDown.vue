<template>
    <q-card
        :class="`${time.totalSeconds < 5 && time.time > 0 ? 'bg-negative blink': ''} ${time.time === 0 ? 'bg-negative': ''}`"
        class="q-pa-sm bg-secondary text-white blink_me"
        style="font-size: 16px; font-family: Consolas,serif;"
    >
        <span class="text-bold">{{ time.minutes | formatMinutes }}:{{ time.seconds | formatSeconds }}</span>
        <span class="text-grey-4">:{{ time.milliseconds | formatMilliseconds }}</span>
    </q-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import { Time } from 'src/models/Time';
import TextFormatMixin from 'src/mixins/textFormatMixin';

@Component
export default class CountDown extends Mixins(TextFormatMixin) {
    // region Props

    @Prop({ required: true }) time!: Time;

    // endregion
}
</script>

<style scoped>
    /*noinspection ALL*/
    .blink {
        animation: blinker 1s linear infinite;
    }

    @keyframes blinker {
        50% {
            opacity: 0;
        }
    }
</style>
