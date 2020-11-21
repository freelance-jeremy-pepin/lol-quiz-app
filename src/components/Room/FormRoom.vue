<template>
    <q-dialog
        v-if="user"
        v-model="$attrs.value"
        v-bind="$attrs"
        v-on="$listeners"
        @before-show="onBeforeShow"
    >
        <q-card style="max-width: 400px; width: 100%;">
            <q-card-section>
                <q-form class="q-gutter-y-lg" @submit="onCreateRoom">
                    <q-input v-model="internalRoom.name" label="Room's name" outlined></q-input>

                    <form-quiz-configuration
                        v-model="internalRoom.quizConfiguration"
                        class="text-center"
                    ></form-quiz-configuration>

                    <q-btn class="full-width" color="primary" type="submit">Create room</q-btn>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import Room, { createDefaultRoom } from 'src/models/Room';
import FormQuizConfiguration from 'components/QuizConfiguration/FormQuizConfiguration.vue';
import UserStore from 'src/store/modules/UserStore';
import User from 'src/models/User';
import SocketMixin from 'src/mixins/socketMixin';

@Component({
    components: { FormQuizConfiguration },
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
            return this.roomSocketStore.rooms.filter(r => r.owner.id === userID).length;
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
