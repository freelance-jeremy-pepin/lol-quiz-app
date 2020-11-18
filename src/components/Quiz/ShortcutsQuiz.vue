<template>
    <q-card class="q-pa-xs">
        <q-card-section class="text-bold q-pb-none">
            Shortcuts
        </q-card-section>

        <q-card-section
            v-if="!quizStageModule.isDisplayAnswer && !quizStageModule.isQuizFinished"
            class="q-pt-none"
        >
            <table>
                <tr>
                    <td class="text-right">
                        <switch-keyboard>SHIFT + /</switch-keyboard>
                    </td>
                    <td class="q-pl-sm">
                        Focus answer input.
                    </td>
                </tr>

                <tr>
                    <td class="text-right">
                        <switch-keyboard>F9</switch-keyboard>
                    </td>
                    <td class="q-pl-sm">
                        Skip item.
                    </td>
                </tr>
            </table>
        </q-card-section>

        <q-card-section v-if="quizStageModule.isQuizFinished" class="q-pt-none">
            <table>
                <tr>
                    <td class="text-right">
                        <switch-keyboard>H</switch-keyboard>
                    </td>
                    <td class="q-pl-sm">
                        Toggle history.
                    </td>
                </tr>

                <tr>
                    <td class="text-right">
                        <switch-keyboard>R</switch-keyboard>
                    </td>
                    <td class="q-pl-sm">
                        Play again!
                    </td>
                </tr>
            </table>
        </q-card-section>
    </q-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import QuizStageModule from 'src/store/modules/quiz-stage-module';
import SwitchKeyboard from 'components/Common/SwitchKeyboard.vue';

@Component({
    components: { SwitchKeyboard },
})
export default class ShortcutsQuiz extends Vue {
    // region Computed properties

    public get quizStageModule(): QuizStageModule {
        return QuizStageModule;
    }

    // endregion
}
</script>

<style>
    .shortcut {
        font-family: monospace;
    }
</style>
