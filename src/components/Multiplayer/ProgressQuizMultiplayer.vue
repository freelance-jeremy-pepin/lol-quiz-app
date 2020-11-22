<template>
    <q-card class="q-pa-sm">
        <q-card-section class="text-bold">
            {{ room.name }}
        </q-card-section>

        <q-card-section class="q-pt-none">
            <div v-for="participant in room.participants" :key="participant.id">
                <span :class="`${me.id === participant.userId ? 'text-bold text-accent' : ''}`">
                    {{ getPseudoById(participant.userId) }}: {{ participant.currentQuestionNumber }} / {{ room.quizConfiguration.numberQuestions }}
                </span>
            </div>
        </q-card-section>
    </q-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import Room from 'src/models/Room';
import UserMixin from 'src/mixins/userMixin';

@Component
export default class ProgressQuizMultiplayer extends Mixins(UserMixin) {
    // region Props

    @Prop({ required: true }) room!: Room;

    // endregion
}
</script>
