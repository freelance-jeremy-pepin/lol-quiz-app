<template>
    <div class="q-gutter-y-sm">
        <card-with-title-and-action
            v-if="!isMultiplayer"
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

        <q-btn v-if="!isMultiplayer" class="full-width" color="grey" flat @click="$emit('view-history')">
            View history
        </q-btn>

        <leader-board-multiplayer v-if="isMultiplayer && room" :room="room"></leader-board-multiplayer>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import { Time } from 'src/models/Time';
import CardWithTitleAndAction from 'components/Common/CardWithTitleAndAction.vue';
import LeaderBoardMultiplayer from 'components/Multiplayer/LeaderBoardMultiplayer.vue';
import Room from 'src/models/Room';
import SocketMixin from 'src/mixins/socketMixin';

@Component({
    components: { LeaderBoardMultiplayer, CardWithTitleAndAction },
})
export default class ResultQuiz extends Mixins(SocketMixin) {
    // region Props

    @Prop({ required: true }) score!: number;

    @Prop({ required: true }) numberQuestions!: number;

    @Prop({ required: false, default: null }) time!: Time;

    @Prop({ required: false, default: false, type: Boolean }) isMultiplayer!: boolean;

    // endregion

    // region Computed properties

    private get room(): Room | undefined | null {
        if (this.isMultiplayer) {
            return this.roomSocketStore.room;
        }

        return undefined;
    }

    // endregion
}
</script>
