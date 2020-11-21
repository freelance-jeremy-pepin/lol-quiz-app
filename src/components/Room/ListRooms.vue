<template>
    <q-list bordered separator>
        <q-item v-for="room in rooms" :key="room.id">
            <q-item-section>
                <q-item-label class="text-bold">
                    {{ room.name }}
                    <span
                        v-if="userHasJoinedRoom(room)"
                        class="text-bold text-accent"
                    >
                        (active room)
                    </span>
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
                <q-btn
                    v-if="!userHasJoinedRoom(room)"
                    color="primary"
                    flat
                    @click="onJoinRoom(room)"
                >Join room
                </q-btn>
                <q-btn
                    v-else
                    color="accent"
                    flat
                    @click="onLeaveRoom(room)"
                >Leave room
                </q-btn>
                <q-btn
                    v-if="user && user.id === room.ownerId"
                    color="negative"
                    flat
                    @click="onDeleteRoom(room)"
                >Delete room
                </q-btn>
            </q-item-section>
        </q-item>
    </q-list>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import Room from 'src/models/Room';
import UserStore from 'src/store/modules/UserStore';
import User from 'src/models/User';
import Participant, { createDefaultParticipant } from 'src/models/Participant';
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

    private onLeaveRoom(roomToLeave: Room) {
        this.leaveRoom(roomToLeave);
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
                user: this.user,
            };

            this.roomSocketStore.joinRoom({ roomToJoin, participant });
        }
    }

    private leaveRoom(roomToLeave: Room) {
        if (this.user?.id) {
            const userID = this.user.id;

            const participant: Participant | undefined = roomToLeave.participants.find(p => p.user.id === userID);

            if (participant) {
                this.roomSocketStore.leaveRoom({ roomToLeave, participant });
            }
        }
    }

    private deleteRoom(roomToDelete: Room) {
        this.roomSocketStore.deleteRoom(roomToDelete);
    }

    private userHasJoinedRoom(room: Room): boolean {
        if (this.user?.id) {
            const userID = this.user.id;
            return room.participants.some(p => p.user.id === userID);
        }

        return false;
    }

    // endregion
}
</script>
