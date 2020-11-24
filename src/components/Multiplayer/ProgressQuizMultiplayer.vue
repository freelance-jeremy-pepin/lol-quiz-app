<template>
    <q-card class="q-pa-xs">
        <q-card-section>
            <div v-for="player in room.players" :key="player.id">
                <span :class="`${me.id === player.userId ? 'text-bold text-accent' : ''}`">
                    <span>{{ getPseudoById(player.userId) }}: </span>
                    <span v-if="player.hasFinished">Finished</span>
                    <span v-else> {{ player.currentQuestionNumber }} / {{ room.quizConfiguration.numberQuestions }}</span>
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
