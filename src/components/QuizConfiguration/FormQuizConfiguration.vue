<template>
    <div>
        <div>
            <div class="text-bold">Quiz</div>

            <q-btn :disable="readOnly" color="primary">
                <q-menu fit>
                    <q-list style="min-width: 100px">
                        <div v-for="(quiz, index) in quizList" :key="quiz.id">
                            <q-item v-close-popup clickable>
                                <q-item-section @click="onQuizChanged(quiz)">{{ quiz.name }}</q-item-section>
                            </q-item>
                            <q-separator v-if="index !== quizList.length -1" />
                        </div>
                    </q-list>
                </q-menu>
                {{ internalQuizConfiguration.quiz.name }}
            </q-btn>
        </div>

        <div class="q-pt-md">
            <div class="text-bold">Number of questions</div>
            <q-btn-toggle
                v-model="internalQuizConfiguration.numberQuestions"
                :disable="readOnly"
                :options="[
                    { label: '1', value: 1 },
                    { label: '5', value: 5 },
                    { label: '10', value: 10 },
                    { label: '20', value: 20 },
                    { label: '25', value: 25 },
                    { label: '30', value: 30 },
                ]"
                toggle-color="primary"
                @input="onInput"
            />
        </div>

        <div
            v-if="internalQuizConfiguration.quiz.internalName === 'champion-image'"
            class="q-pt-md"
        >
            <div class="text-bold">Image type</div>
            <q-btn-toggle
                v-model="internalQuizConfiguration.imageType"
                :disable="readOnly"
                :options="[
                    { label: 'splash', value: 'splash' },
                    { label: 'loading', value: 'loading' },
                    { label: 'portrait', value: 'portrait' },
                ]"
                toggle-color="primary"
                @input="onInput"
            />
        </div>

        <div
            v-if="internalQuizConfiguration.quiz.internalName === 'champion-image' && internalQuizConfiguration.imageType !== 'portrait'"
            class="q-pt-md"
        >
            <div class="text-bold">Skins</div>
            <q-btn-toggle
                v-model="internalQuizConfiguration.skins"
                :disable="readOnly"
                :options="[
                    { label: 'only default', value: 'only default' },
                    { label: 'all without default', value: 'all without default' },
                    { label: 'all', value: 'all' },
                ]"
                toggle-color="primary"
                @input="onInput"
            />
        </div>

        <div
            v-if="internalQuizConfiguration.quiz.internalName === 'champion-spell' || internalQuizConfiguration.quiz.internalName === 'rune-name' || internalQuizConfiguration.quiz.internalName === 'item-name'"
            class="q-pt-md"
        >
            <div class="text-bold">Question type</div>
            <q-btn-toggle
                v-model="internalQuizConfiguration.questionType"
                :disable="readOnly"
                :options="[
                    { label: 'icon', value: 'icon' },
                    { label: 'description', value: 'description' },
                ]"
                toggle-color="primary"
                @input="onInput"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Quiz, { quizList, QuizListInternalName } from 'src/models/Quiz';
import QuizConfiguration, { createDefaultQuizConfiguration } from 'src/models/QuizConfiguration';
import QuizConfigurationChampion from 'src/models/QuizConfigurationChampion';
import QuizConfigurationItem from 'src/models/QuizConfigurationItem';
import QuizConfigurationChampionSpell from 'src/models/QuizConfigurationChampionSpell';
import { ImageTypesChampionLolApi } from 'src/models/LolApi/ChampionLolApi';

@Component
export default class FormQuizConfiguration extends Vue {
    // region Props

    @Prop({ required: false, default: false, type: Boolean }) readOnly!: boolean;

    // endregion

    // region Data

    private internalQuizConfiguration: QuizConfiguration | QuizConfigurationItem | QuizConfigurationChampion | QuizConfigurationChampionSpell = createDefaultQuizConfiguration();

    // noinspection JSMismatchedCollectionQueryUpdate
    private quizList: Quiz[] = quizList;

    // endregion

    // region Hooks

    // noinspection JSUnusedLocalSymbols
    private mounted() {
        this.restoreQuizSelectedFromLocalStorage();
        this.restoreQuizConfigurationFromLocalStorage();
        this.internalQuizConfiguration.withStopWatch = false;
    }

    // endregion

    // region Events handlers

    private onQuizChanged(quiz: Quiz) {
        this.internalQuizConfiguration.quiz = quiz;

        this.saveQuizSelectedInLocalStorage();

        this.restoreQuizConfigurationFromLocalStorage();

        this.$emit('form-changed');
    }

    private onInput() {
        this.saveQuizConfigurationInLocalStorage();
        this.$emit('input', this.internalQuizConfiguration);
        this.$emit('form-changed');
    }

    // endregion

    // region Methods

    private restoreQuizSelectedFromLocalStorage() {
        const quizSelectedInLocalStorage = this.$q.localStorage.getItem('quiz-selected') as string | undefined;

        if (quizSelectedInLocalStorage) {
            const quizFound = quizList.find(q => q.id === quizSelectedInLocalStorage);

            if (quizFound) {
                this.internalQuizConfiguration.quiz = quizFound;
            }
        }
    }

    private restoreQuizConfigurationFromLocalStorage() {
        const quizConfigurationsInLocalStorage = this.$q.localStorage.getItem('quiz-configurations') as QuizConfiguration[] | undefined;

        if (quizConfigurationsInLocalStorage) {
            const quizConfigurationInLocalStorage = quizConfigurationsInLocalStorage.find(qc => qc.quiz.id === this.internalQuizConfiguration.quiz.id);

            if (quizConfigurationInLocalStorage) {
                this.$emit('input', quizConfigurationInLocalStorage);
                this.internalQuizConfiguration = quizConfigurationInLocalStorage;
            }
        }
    }

    private saveQuizSelectedInLocalStorage() {
        this.$q.localStorage.set('quiz-selected', this.internalQuizConfiguration.quiz.id);

        const quizFound = quizList.find(q => q.internalName === this.internalQuizConfiguration.quiz.internalName);

        if (quizFound) {
            this.internalQuizConfiguration.quiz = quizFound;
        }
    }

    private saveQuizConfigurationInLocalStorage() {
        let quizConfigurations: QuizConfiguration[] = [];

        const quizConfigurationsInLocalStorage = this.$q.localStorage.getItem('quiz-configurations') as QuizConfiguration[];
        if (quizConfigurationsInLocalStorage) {
            quizConfigurations = quizConfigurationsInLocalStorage;
        }

        const quizConfigurationIndexFound = quizConfigurations.findIndex(qc => qc.quiz.id === this.internalQuizConfiguration.quiz.id);
        if (quizConfigurationIndexFound > -1) {
            quizConfigurations[quizConfigurationIndexFound] = { ...this.internalQuizConfiguration };
        } else {
            quizConfigurations.push(this.internalQuizConfiguration);
        }

        this.$q.localStorage.set('quiz-configurations', quizConfigurations);
    }

    // endregion

    // region Watchers

    @Watch('$attrs.value', { deep: true })
    public onValueChanged(value: QuizConfiguration): void {
        this.internalQuizConfiguration = value;
    }

    @Watch('internalQuizConfiguration', { deep: true, immediate: true })
    public onInternalQuizConfiguration(): void {
        if (this.internalQuizConfiguration.quiz.internalName !== QuizListInternalName.ChampionImage && 'imageType' in this.internalQuizConfiguration) {
            this.internalQuizConfiguration.imageType = undefined;
        }

        if (this.internalQuizConfiguration.quiz.internalName !== QuizListInternalName.ChampionImage && 'skins' in this.internalQuizConfiguration) {
            this.internalQuizConfiguration.skins = undefined;
        }

        if (this.internalQuizConfiguration.quiz.internalName !== QuizListInternalName.ChampionSpell && this.internalQuizConfiguration.quiz.internalName !== QuizListInternalName.RuneName && this.internalQuizConfiguration.quiz.internalName !== QuizListInternalName.ItemName && 'questionType' in this.internalQuizConfiguration) {
            this.internalQuizConfiguration.questionType = undefined;
        }

        if (this.internalQuizConfiguration.quiz.internalName === QuizListInternalName.ChampionImage && this.internalQuizConfiguration.imageType === ImageTypesChampionLolApi.portrait) {
            this.internalQuizConfiguration.skins = 'only default';
        }
    }

    // endregion
}
</script>
