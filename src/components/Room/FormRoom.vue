<template>
    <q-dialog
        v-if="user"
        v-model="$attrs.value"
        v-bind="$attrs"
        v-on="$listeners"
        @before-show="onBeforeShow"
    >
        <card-with-title-and-action
            :max-width="500"
            action-label="Create room"
            title="New room"
            @action="onCreateRoom"
        >
            <q-card-section>
                <q-form @submit="onCreateRoom">
                    <q-input
                        v-model="internalRoom.name"
                        label="Room's name"
                        outlined
                        style="max-width: 250px;"
                    ></q-input>

                    <form-quiz-configuration
                        v-model="internalRoom.quizConfiguration"
                    ></form-quiz-configuration>
                </q-form>
            </q-card-section>
        </card-with-title-and-action>
    </q-dialog>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import Room, { createDefaultRoom } from 'src/models/Room';
import FormQuizConfiguration from 'components/QuizConfiguration/FormQuizConfiguration.vue';
import UserStore from 'src/store/modules/UserStore';
import User from 'src/models/User';
import SocketMixin from 'src/mixins/socketMixin';
import CardWithTitleAndAction from 'components/Common/CardWithTitleAndAction.vue';

@Component({
    components: { CardWithTitleAndAction, FormQuizConfiguration },
})
export default class FormRoom extends Mixins(SocketMixin) {
    // region Data

    private internalRoom: Room = createDefaultRoom();

    // endregion

    // region Computed properties

    private get user(): User | undefined {
        return UserStore.me;
    }

    public get totalRoomsOfUser(): number {
        if (this.user?.id) {
            const userID = this.user.id;
            return this.roomSocketStore.rooms.filter(r => r.ownerId === userID).length;
        }

        return 0;
    }

    // endregion

    // region Events handlers

    private onBeforeShow() {
        this.initRoom();

        this.setOwner();
    }

    private onCreateRoom() {
        this.createRoom();

        this.hide();
    }

    // endregion

    // region Methods

    private initRoom() {
        if (this.user) {
            this.internalRoom = createDefaultRoom();
            this.internalRoom.name = `${this.user.pseudo}'s room #${this.totalRoomsOfUser + 1}`;
        }
    }

    private setOwner() {
        if (this.user) {
            this.internalRoom.ownerId = this.user.id;
        }
    }

    private createRoom() {
        this.roomSocketStore.createRoom(this.internalRoom);
    }

    private hide() {
        this.$emit('input', false);
    }

    // endregion
}
</script>
