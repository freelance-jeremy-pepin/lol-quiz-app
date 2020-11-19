<template>
    <q-dialog v-model="$attrs.value" v-bind="$attrs" v-on="$listeners">
        <q-card>
            <q-card-section class="row items-center">
                <div class="text-h6 text-primary">Create room</div>
                <q-space></q-space>
                <q-btn v-close-popup class="text-grey" dense flat icon="close" round></q-btn>
            </q-card-section>

            <q-separator></q-separator>

            <q-card-section>
                <q-form class="q-gutter-y-md">
                    <q-input v-model="internalRoom.name" label="Room's name" outlined></q-input>
                    <select-quiz></select-quiz>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Room, { createDefaultRoom } from 'src/models/Room';
import SelectQuiz from 'components/Quiz/SelectQuiz.vue';

@Component({
    components: { SelectQuiz },
})
export default class FormRoom extends Vue {
    // region Props

    // endregion

    // region Data

    private internalRoom: Room = createDefaultRoom();

    // endregion

    // region Hooks

    // endregion

    // region Event handlers

    // endregion

    // region Methods

    // endregion

    // region Watchers

    // endregion
}
</script>
