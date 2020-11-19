<template>
    <q-dialog v-model="$attrs.value" v-bind="$attrs" v-on="$listeners">
        <q-card>
            <q-card-section>
                <q-form class="q-gutter-y-md">
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
import { Component, Vue } from 'vue-property-decorator';
import Room, { createDefaultRoom } from 'src/models/Room';
import SelectQuiz from 'components/Quiz/SelectQuiz.vue';
import FormQuizConfiguration from 'components/QuizConfiguration/FormQuizConfiguration.vue';

@Component({
    components: { FormQuizConfiguration, SelectQuiz },
})
export default class FormRoom extends Vue {
    // region Data

    private internalRoom: Room = createDefaultRoom();

    // endregion
}
</script>
