<template>
    <q-dialog
        v-if="user"
        v-model="$attrs.value"
        v-bind="$attrs"
        v-on="$listeners"
        @before-show="onBeforeShow"
    >
        <q-card align="center" style="max-width: 500px; width: 100%;">
            <q-card-section class="bg-primary text-white">
                <div class="text-h3">New room</div>
            </q-card-section>

            <q-card-section>
                <q-form class="q-gutter-y-lg" @submit="onCreateRoom">
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

            <q-card-actions class="q-pa-none">
                <q-btn
                    class="full-width"
                    style="border-top-left-radius: 0; border-top-right-radius: 0;"
                    color="accent"
                    size="lg"
                    type="submit"
                >Create room
                </q-btn>
            </q-card-actions>
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
