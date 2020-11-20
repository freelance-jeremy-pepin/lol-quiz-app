<template>
    <q-dialog v-model="$attrs.value" v-bind="$attrs" v-on="$listeners">
        <q-card
            style
                ="max-width: 500px; width: 100%;"
        >

            <q-list>
                <answer-history-line
                    v-for="(answerHistory, index) in answersHistory"
                    :key="answerHistory.id"
                    :answer-history="answerHistory"
                    :is-last="index === answersHistory.length - 1"
                ></answer-history-line>
            </q-list>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { Prop, Vue } from 'vue-property-decorator';
import AnswerHistory from 'src/models/AnswerHistory';
import Component from 'vue-class-component';
import AnswerHistoryLine from 'components/AnswerHistory/AnswerHistoryLine.vue';

@Component({
    components: { AnswerHistoryLine },
})
export default class AnswersHistoryList extends Vue {
    // region Props

    @Prop({ required: true }) answersHistory!: AnswerHistory[];

    // endregion
}
</script>
