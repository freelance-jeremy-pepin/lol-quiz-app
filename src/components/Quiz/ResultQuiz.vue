<template>
    <div class="q-gutter-y-sm" style="width: 350px">
        <card-with-title-and-action
            action-label="Play again!"
            title="Results"
            @action="$emit('play-again')"
        >
            <q-card-section class="text-h5">
                <div>Score</div>
                <span class="text-bold text-primary">{{ score }}</span>
                <span v-if="totalScore" class="text-grey"> / {{ totalScore }}</span>
            </q-card-section>

            <q-card-section v-if="time" class="text-h5">
                <div>Time:</div>
                <span class="text-bold text-primary">{{ time.minutes }}:{{ time.seconds }}</span>
                <span class="text-grey">:{{ time.milliseconds }}</span>
            </q-card-section>
        </card-with-title-and-action>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import { Time } from 'src/models/Time';
import CardWithTitleAndAction from 'components/Common/CardWithTitleAndAction.vue';
import SocketMixin from 'src/mixins/socketMixin';

@Component({
    components: { CardWithTitleAndAction },
})
export default class ResultQuiz extends Mixins(SocketMixin) {
    // region Props

    @Prop({ required: true }) score!: number;

    @Prop({ required: false, default: null }) totalScore!: number;

    @Prop({ required: false, default: null }) time!: Time;

    // endregion
}
</script>
