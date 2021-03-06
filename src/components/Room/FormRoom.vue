<template>
    <q-dialog
        v-model="$attrs.value"
        v-bind="$attrs"
        v-on="$listeners"
        @before-show="onBeforeShow"
    >
        <card-with-title-and-action
            :action-disable="!me || !socketStore.isConnected"
            :action-label="editMode ? 'Update room' : 'Create room'"
            :title="editMode ? 'Edit room' : 'New room'"
            style="max-width: 500px;"
            @action="onCreateOrUpdateRoom"
        >
            <q-card-section>
                <q-form @submit="onCreateOrUpdateRoom">
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
import { Component, Mixins, Prop } from 'vue-property-decorator';
import Room, { createDefaultRoom } from 'src/models/Room';
import FormQuizConfiguration from 'components/QuizConfiguration/FormQuizConfiguration.vue';
import SocketMixin from 'src/mixins/socketMixin';
import CardWithTitleAndAction from 'components/Common/CardWithTitleAndAction.vue';
import QuizConfigurationMixin from 'src/mixins/quizConfigurationMixin';
import UserMixin from 'src/mixins/userMixin';

@Component({
    components: { CardWithTitleAndAction, FormQuizConfiguration },
})
export default class FormRoom extends Mixins(UserMixin, SocketMixin, QuizConfigurationMixin) {
    // region Props

    @Prop({ required: true }) room!: Room;

    @Prop({ required: false, type: Boolean, default: false }) editMode!: boolean;

    // endregion

    // region Data

    private internalRoom: Room = createDefaultRoom();

    // endregion

    // region Computed properties

    public get totalRoomsOfUser(): number {
        const userID = this.me.id;
        return this.roomSocketStore.rooms.filter(r => r.ownerId === userID).length;
    }

    // endregion

    // region Events handlers

    private onBeforeShow() {
        this.initRoom();

        this.setOwner();
    }

    private onCreateOrUpdateRoom() {
        this.createRoom();

        this.hide();
    }

    // endregion

    // region Methods

    private initRoom() {
        this.internalRoom = { ...this.room };

        if (!this.editMode) {
            this.internalRoom.name = `${this.me.pseudo}'s room #${this.totalRoomsOfUser + 1}`;
        }
    }

    private setOwner() {
        this.internalRoom.ownerId = this.me.id;
    }

    private createRoom() {
        this.internalRoom.quizConfiguration = this.specialiseQuizConfiguration(this.internalRoom.quizConfiguration);

        this.roomSocketStore.createOrUpdateRoom(this.internalRoom);

        this.$emit('creating-room', this.internalRoom);
    }

    private hide() {
        this.$emit('input', false);
    }

    // endregion
}
</script>
