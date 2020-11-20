<template>
    <q-list bordered separator>
        <q-item v-for="room in rooms" :key="room.id">
            <q-item-section>
                <q-item-label class="text-bold">
                    {{ room.name }}
                    <span v-if="userHasJoinedRoom(room)" class="text-bold text-accent"> (active room)</span>
                </q-item-label>
                <q-item-label caption>Owner: {{ room.owner.pseudo }}</q-item-label>
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
                    v-if="user && user.id === room.owner.id"
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
import { Component, Prop, Vue } from 'vue-property-decorator';
import Room from 'src/models/Room';
import UserStore from 'src/store/modules/UserStore';
import User from 'src/models/User';
import SocketStore from 'src/store/modules/SocketStore';
import { getModule } from 'vuex-module-decorators';
import { uniqueID } from 'src/utils/randomNumber';
import Participant from 'src/models/Participant';

@Component
export default class ListRoom extends Vue {
    // region Props

    @Prop({ required: true }) rooms!: Room[];

    // endregion

    // region Data

    private socket: SocketStore = getModule(SocketStore, this.$store);

    // endregion

    // region Computed properties

    private get user(): User | undefined {
        return UserStore.user;
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
            const participant: Participant = {
                id: uniqueID(),
                user: this.user,
                answerHistory: [],
                currentQuestionNumber: 0,
                hasFinished: false,
            };

            this.socket.joinRoom({ roomToJoin, participant });
        }
    }

    private leaveRoom(roomToLeave: Room) {
        if (this.user?.id) {
            const userID = this.user.id;

            const participant: Participant | undefined = roomToLeave.participants.find(p => p.user.id === userID);

            if (participant) {
                this.socket.leaveRoom({ roomToLeave, participant });
            }
        }
    }

    private deleteRoom(roomToDelete: Room) {
        this.socket.deleteRoom(roomToDelete);
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
