<template>
    <q-card class="text-center" style="max-width: 300px; width: 100%;">
        <q-card-section class="bg-primary text-white">
            <div v-if="numberQuestions" class="text-h3">Results</div>
        </q-card-section>

        <q-separator></q-separator>

        <q-card-section class="text-h5">
            <div>Score:</div>
            <span class="text-bold text-primary">{{ score }} </span>
            <span class="text-grey">/ {{ numberQuestions }}</span>
        </q-card-section>

        <q-card-section v-if="time" class="text-h5">
            <div>Time:</div>
            <span class="text-bold text-primary">{{ time.minutes }}:{{ time.seconds }}</span>
            <span class="text-grey">:{{ time.milliseconds }}</span>
        </q-card-section>

        <q-card-section>
            <q-btn class="full-width" color="primary" @click="$emit('play-again')">Play again!
            </q-btn>
        </q-card-section>
    </q-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Time } from 'src/const';

@Component
export default class ResultQuiz extends Vue {
    // region Props

    @Prop({ required: true }) score!: number;

    @Prop({ required: true }) numberQuestions!: number;

    @Prop({ required: false, default: null }) time!: Time;

    // endregion
}
</script>
