<template>
    <q-list bordered separator>
        <q-item v-for="room in rooms" :key="room.id">
            <q-item-section>
                <q-item-label class="text-bold">
                    {{ room.name }}
                </q-item-label>
                <q-item-label caption>Owner: {{ getPseudoById(room.ownerId) }}</q-item-label>
                <q-item-label caption>
                    Quiz: {{ room.quizConfiguration.quiz.name }}
                    <q-icon name="info">
                        <q-tooltip>
                            <div>Quiz: {{ room.quizConfiguration.quiz.name }}</div>
                            <div>Number of questions: {{ room.quizConfiguration.numberQuestions }}</div>
                            <div>With stopwatch: {{ room.quizConfiguration.withStopWatch }}</div>
                        </q-tooltip>
                    </q-icon>
                </q-item-label>
            </q-item-section>

            <q-item-section side>
                <div class="text-grey-8">
                    <q-btn
                        color="primary"
                        flat
                        @click="onJoinRoom(room)"
                    >Join room
                    </q-btn>
                    <q-btn dense flat icon="more_vert" round size="12px">
                        <q-menu>
                            <q-list style="min-width: 100px">
                                <q-item v-close-popup clickable>
                                    <q-item-section class="text-negative" @click="onDeleteRoom(room)">Delete room</q-item-section>
                                </q-item>
                            </q-list>
                        </q-menu>
                    </q-btn>
                </div>
            </q-item-section>
        </q-item>
    </q-list>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import Room from 'src/models/Room';
import UserStore from 'src/store/modules/UserStore';
import User from 'src/models/User';
import { createDefaultParticipant } from 'src/models/Participant';
import SocketMixin from 'src/mixins/socketMixin';
import UserMixin from 'src/mixins/userMixin';

@Component
export default class ListRoom extends Mixins(SocketMixin, UserMixin) {
    // region Props

    @Prop({ required: true }) rooms!: Room[];

    // endregion

    // region Computed properties

    private get user(): User | undefined {
        return UserStore.me;
    }

    // endregion

    // region Events handlers

    private onJoinRoom(roomToJoin: Room) {
        this.joinRoom(roomToJoin);
    }

    private onDeleteRoom(roomToDelete: Room) {
        this.deleteRoom(roomToDelete);
    }

    // endregion

    // region Methods

    private joinRoom(roomToJoin: Room) {
        if (this.user) {
            let participant = createDefaultParticipant();

            participant = {
                ...participant,
                userId: this.user.id,
            };

            this.roomSocketStore.joinRoom({ roomToJoin, participant });
        }
    }

    private deleteRoom(roomToDelete: Room) {
        this.roomSocketStore.deleteRoom(roomToDelete);
    }

    // endregion
}
</script>
