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
                <tr v-for="shortcutInAnsweringStage in shortcutsInAnsweringStage" :key="shortcutInAnsweringStage.shortcut">
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
                <tr v-for="shortcutInQuizFinishedStage in shortcutsInQuizFinishedStage" :key="shortcutInQuizFinishedStage.shortcut">
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
import { Component, Vue } from 'vue-property-decorator';
import QuizStageStore from 'src/store/modules/QuizStageStore';
import SwitchKeyboard from 'components/Common/SwitchKeyboard.vue';

interface Shortcut {
    shortcut: string;
    description: string;
}

@Component({
    components: { SwitchKeyboard },
})
export default class ShortcutsQuiz extends Vue {
    // region Data

    private shortcutsInAnsweringStage: Shortcut[] = [
        {
            shortcut: 'SHIFT + /',
            description: 'Focus answer input.',
        },
        {
            shortcut: 'F9',
            description: 'Skip item.',
        },
    ];

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

    // endregion
}
</script>

<style>
    .shortcut {
        font-family: monospace;
    }
</style>
