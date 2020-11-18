import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from 'src/store';

export enum QuizStage {
    loading = 'loading',
    answering = 'answering',
    right = 'right',
    wrong = 'wrong',
    verifyingAnswer = 'verifyingAnswer',
    answerGiven = 'answerGiven',
    quizFinished = 'quizFinished'
}

@Module({
    dynamic: true,
    store,
    name: 'quiz',
    namespaced: true,
})
class QuizStageModule extends VuexModule {
    // region State

    private _stage?: QuizStage = undefined;

    // endregion

    // region Mutations

    @Mutation
    public setLoading() {
        this._stage = QuizStage.loading;
    }

    @Mutation
    public setAnswering() {
        this._stage = QuizStage.answering;
    }

    @Mutation
    public setRight() {
        this._stage = QuizStage.right;
    }

    @Mutation
    public setWrong() {
        this._stage = QuizStage.wrong;
    }

    @Mutation
    public setVerifyingAnswer() {
        this._stage = QuizStage.verifyingAnswer;
    }

    @Mutation
    public setAnswerGiven() {
        this._stage = QuizStage.answerGiven;
    }

    @Mutation
    public setQuizFinished() {
        this._stage = QuizStage.quizFinished;
    }

    // endregion

    // region Getters

    public get stage(): QuizStage | undefined {
        return this._stage;
    }

    public get isLoading(): boolean {
        return this._stage === QuizStage.loading;
    }

    public get isAnswering(): boolean {
        return this._stage === QuizStage.answering;
    }

    public get isRight(): boolean {
        return this._stage === QuizStage.right;
    }

    public get isWrong(): boolean {
        return this._stage === QuizStage.wrong;
    }

    public get isVerifyingAnswer(): boolean {
        return this._stage === QuizStage.verifyingAnswer;
    }

    public get isAnswerGiven(): boolean {
        return this._stage === QuizStage.answerGiven;
    }

    public get isQuizFinished(): boolean {
        return this._stage === QuizStage.quizFinished;
    }

    public get isDisplayAnswer(): boolean {
        return this.isAnswerGiven || this.isRight;
    }

    // endregion
}

export default getModule(QuizStageModule);
