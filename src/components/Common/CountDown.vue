<template>
    <q-card
        :class="`${time.totalSeconds < 5 && time.totalSeconds > 0 ? 'bg-negative blink': ''} ${time.totalSeconds <= 0 ? 'bg-negative': ''}`"
        class="q-pa-sm bg-secondary text-white"
        style="display: flex; align-items: center;"
    >
        <q-icon class="q-pr-sm" name="schedule" size="sm"></q-icon>

        <span class="text-bold" style="font-size: 24px; font-family: Consolas,serif;">
            <span v-if="time.totalSeconds >= 0">{{ time.totalSeconds | formatSeconds }}</span>
            <span v-else>{{ 0 | formatSeconds }}</span>
        </span>
    </q-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import TextFormatMixin from 'src/mixins/textFormatMixin';
import { Time } from 'src/models/Time';

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
