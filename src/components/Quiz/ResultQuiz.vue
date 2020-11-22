<template>
    <div class="q-gutter-y-sm">
        <card-with-title-and-action
            :max-width="300"
            action-label="Play again!"
            title="Results"
            @action="$emit('play-again')"
        >
            <q-card-section class="text-h5">
                <div>Score</div>
                <span class="text-bold text-primary">{{ score }} </span>
                <span class="text-grey">/ {{ numberQuestions }}</span>
            </q-card-section>

            <q-card-section v-if="time" class="text-h5">
                <div>Time:</div>
                <span class="text-bold text-primary">{{ time.minutes }}:{{ time.seconds }}</span>
                <span class="text-grey">:{{ time.milliseconds }}</span>
            </q-card-section>
        </card-with-title-and-action>

        <q-btn class="full-width" color="grey" flat @click="$emit('view-history')">
            View history
        </q-btn>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Time } from 'src/models/Time';
import CardWithTitleAndAction from 'components/Common/CardWithTitleAndAction.vue';

@Component({
    components: { CardWithTitleAndAction },
})
export default class ResultQuiz extends Vue {
    // region Props

    @Prop({ required: true }) score!: number;

    @Prop({ required: true }) numberQuestions!: number;

    @Prop({ required: false, default: null }) time!: Time;

    // endregion
}
</script>
