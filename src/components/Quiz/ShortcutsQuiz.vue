<template>
    <q-card v-if="$q.platform.is.desktop" class="q-pa-xs">
        <q-card-section class="text-bold q-pb-none">
            Shortcuts
        </q-card-section>

        <q-card-section
            v-if="!quizStageModule.isDisplayAnswer && !quizStageModule.isQuizFinished"
            class="q-pt-none"
        >
            <table>
                <tr
                    v-for="shortcutInAnsweringStage in shortcutsInAnsweringStage"
                    :key="shortcutInAnsweringStage.shortcut"
                >
                    <td class="text-right">
                        <switch-keyboard>{{ shortcutInAnsweringStage.shortcut }}</switch-keyboard>
                    </td>
                    <td class="q-pl-sm">
                        {{ shortcutInAnsweringStage.description }}
                    </td>
                </tr>
            </table>
        </q-card-section>

        <q-card-section v-if="quizStageModule.isQuizFinished" class="q-pt-none">
            <table>
                <tr
                    v-for="shortcutInQuizFinishedStage in shortcutsInQuizFinishedStage"
                    :key="shortcutInQuizFinishedStage.shortcut"
                >
                    <td class="text-right">
                        <switch-keyboard>{{ shortcutInQuizFinishedStage.shortcut }}</switch-keyboard>
                    </td>
                    <td class="q-pl-sm">
                        {{ shortcutInQuizFinishedStage.description }}
                    </td>
                </tr>
            </table>
        </q-card-section>
    </q-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import QuizStageStore from 'src/store/modules/QuizStageStore';
import SwitchKeyboard from 'components/Common/SwitchKeyboard.vue';
import Quiz from 'src/models/Quiz';

interface Shortcut {
    shortcut: string;
    description: string;
}

@Component({
    components: { SwitchKeyboard },
})
export default class ShortcutsQuiz extends Vue {
    // region Props

    @Prop({ required: true }) quiz!: Quiz;

    // endregion

    // region Data

    private shortcutsInQuizFinishedStage: Shortcut[] = [
        {
            shortcut: 'H',
            description: 'Toggle history.',
        },
        {
            shortcut: 'R',
            description: 'Play again!',
        },
    ];

    // endregion

    // region Computed properties

    public get quizStageModule(): typeof QuizStageStore {
        return QuizStageStore;
    }

    private get shortcutsInAnsweringStage(): Shortcut[] {
        const shortcuts = [];

        shortcuts.push({
            shortcut: 'SHIFT + /',
            description: 'Focus answer input.',
        });

        if (!this.quiz.onlyOneTry) {
            shortcuts.push({
                shortcut: '↑',
                description: 'Last answer.',
            });
        }

        if (this.quiz.canSkipQuestion) {
            shortcuts.push({
                shortcut: 'F9',
                description: 'Skip.',
            });
        }

        return shortcuts;
    }

    // endregion
}
</script>

<style>
    .shortcut {
        font-family: monospace;
    }
</style>
