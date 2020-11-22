<template>
    <div class="q-gutter-y-sm" style="max-width: 500px; width: 100%;">
        <card-with-title-and-action
            :action-color="participant.isReady | formatIsReadyColor"
            :action-label="participant.isReady | formatIsReadyLabel"
            :center-content="false"
            :max-width="500"
            :title="room.name"
            @action="onToggleIsReady"
        >
            <q-card-section>
                <div class="text-bold text-h6">
                    Quiz:
                </div>

                <ul class="q-mt-none">
                    <li> {{ room.quizConfiguration.quiz.name }}</li>
                    <li> {{ room.quizConfiguration.numberQuestions }} questions</li>
                    <li> {{ room.quizConfiguration.withStopWatch | formatWithStopWatch }}</li>
                </ul>
            </q-card-section>

            <q-card-section class="q-pt-none">
                <div class="text-bold text-h6">
                    Participants ({{ room.participants.length }}):
                </div>

                <div v-for="participant in room.participants" :key="participant.id">
                    {{ getPseudoById(participant.userId) }}
                    <span
                        :class="`text-${$options.filters.formatIsReadyColor(participant.isReady)}`"
                        class="text-bold"
                    >
                        ({{ participant.isReady | formatIsReadyLabel }})
                    </span>
                </div>
            </q-card-section>
        </card-with-title-and-action>

        <q-btn class="full-width" color="grey" flat @click="onLeaveRoom">Leave room</q-btn>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';
import Room from 'src/models/Room';
import QuizConfigurationMixin from 'src/mixins/quizConfigurationMixin';
import SocketMixin from 'src/mixins/socketMixin';
import UserMixin from 'src/mixins/userMixin';
import Participant from 'src/models/Participant';
import CardWithTitleAndAction from 'components/Common/CardWithTitleAndAction.vue';
import ParticipantMixin from 'src/mixins/participantMixin';

@Component({
    components: { CardWithTitleAndAction },
})
export default class JoinedRoom extends Mixins(SocketMixin, UserMixin, QuizConfigurationMixin, ParticipantMixin) {
    // region Props

    @Prop({ required: true }) room!: Room;

    // endregion

    // region Computed properties

    private get participant(): Participant | undefined {
        return this.room.participants.find(p => p.userId === this.me?.id);
    }

    private get allParticipantsAreReady(): boolean {
        return this.room.participants.every(p => p.isReady);
    }

    // endregion

    // region Event handlers

    private onLeaveRoom() {
        this.leaveRoom();
    }

    private onToggleIsReady() {
        this.toggleIsReady();
    }

    // endregion

    // region Methods

    private leaveRoom() {
        if (this.participant) {
            this.roomSocketStore.leaveRoom({
                roomToLeave: this.room,
                participant: this.participant,
            });
        }
    }

    private toggleIsReady() {
        if (this.participant) {
            const participant = { ...this.participant, isReady: !this.participant?.isReady };
            this.roomSocketStore.updateParticipant({ room: this.room, participant });
        }
    }

    // endregion

    // region Watchers

    @Watch('allParticipantsAreReady')
    private onAllParticipantsAreReady() {
        if (this.allParticipantsAreReady) {
            this.roomSocketStore.createOrUpdateRoom({ ...this.room, inGame: true });

            this.$router.push({
                path: `/quiz/${this.room.quizConfiguration.quiz.internalName}`,
                query: {
                    room: this.room.id.toString(),
                },
            });
        }
    }

    // endregion
}
</script>
