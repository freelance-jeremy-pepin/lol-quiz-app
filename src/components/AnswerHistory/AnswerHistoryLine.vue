<template>
    <div>
        <q-item :class="`${backgroundColor} text-black`">
            <q-item-section avatar>
                <icon-item
                    :item="answerHistory.item"
                    :with-tooltip="!answerHistory.isAnswering"
                ></icon-item>
            </q-item-section>

            <q-item-section>
                <q-item-label class="text-bold">
                    <span v-if="answerHistory.isAnswering">???</span>
                    <span v-else>{{ answerHistory.item.name }}</span>
                </q-item-label>

                <q-item-label>
                    <span v-if="answerHistory.skipped">(skipped)</span>
                </q-item-label>

                <q-item-label v-if="answerHistory.answers.length > 0">
                    Your answers:

                    <span
                        v-for="answer in answerHistory.answers"
                        :key="answer.id"
                        :class="answer.isRight ? 'text-positive' : 'text-negative'"
                        class="text-bold"
                    >
                    [{{ answer.answer }}]
                </span>
                </q-item-label>

                <q-item-label v-else-if="!answerHistory.isAnswering" class="text-italic">
                    You didn't even try!
                </q-item-label>
            </q-item-section>
        </q-item>

        <q-separator v-if="!isLast" color="black"></q-separator>
    </div>
</template>

<script lang="ts">
import { Prop, Vue } from 'vue-property-decorator';
import { AnswerHistory } from 'src/models/answerHistory';
import Component from 'vue-class-component';
import IconItem from 'components/Item/IconItem.vue';

@Component({
    components: { IconItem },
})
export default class AnswerHistoryLine extends Vue {
    // region Props

    @Prop({ required: true }) answerHistory!: AnswerHistory;

    @Prop({ required: true }) isLast!: boolean;

    // endregion

    // region Computed properties

    private get backgroundColor(): string {
        if (this.answerHistory.found) {
            return 'bg-green-2';
        }

        if (this.answerHistory.isAnswering) {
            return 'bg-yellow-2';
        }

        return 'bg-red-2';
    }

    // endregion
}
</script>
