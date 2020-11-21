<template>
    <div class="q-gutter-y-sm" style="max-width: 500px; width: 100%;">
        <q-card class="full-width">

            <q-card-section class="bg-primary text-h3 text-white ">
                {{ room.name }}
            </q-card-section>

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

            <q-card-section>
                <div class="text-bold text-h6">
                    Participants ({{ room.participants.length }}):
                </div>

                <div v-for="participant in room.participants" :key="participant.id">
                    {{ getPseudoById(participant.userId) }}
                </div>
            </q-card-section>

        </q-card>

        <q-btn class="full-width" color="grey" flat @click="leaveRoom">Leave room</q-btn>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import SocketMixin from 'src/mixins/socketMixin';
import Room from 'src/models/Room';
import UserStore from 'src/store/modules/UserStore';
import User from 'src/models/User';
import UserMixin from 'src/mixins/userMixin';
import QuizConfigurationMixin from 'src/mixins/quizConfigurationMixin';

@Component
export default class JoinedRoom extends Mixins(SocketMixin, UserMixin, QuizConfigurationMixin) {
    // region Props

    @Prop({ required: true }) room!: Room;

    // endregion

    // region Data

    // endregion

    // region Computed properties

    private me(): User | undefined {
        return UserStore.me;
    }

    // endregion

    // region Hooks

    // endregion

    // region Event handlers

    private onLeaveRoom() {
        this.leaveRoom();
    }

    // endregion

    // region Methods

    private leaveRoom() {
        if (this.me) {
            const participant = this.room.participants.find(p => p.userId === UserStore.me.id);

            if (participant) {
                this.roomSocketStore.leaveRoom({ roomToLeave: this.room, participant });
            }
        }
    }

    // endregion

    // region Watchers

    // endregion
}
</script>
