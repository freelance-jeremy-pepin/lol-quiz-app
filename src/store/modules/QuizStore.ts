import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from 'src/store';
import Participant, { createDefaultParticipant } from 'src/models/Participant';

@Module({
    dynamic: true,
    store,
    name: 'quiz',
    namespaced: true,
})
class QuizStore extends VuexModule {
    // region State

    private _participant: Participant = createDefaultParticipant();

    // endregion

    // region Mutations

    @Mutation
    public setParticipant(participant: Participant) {
        this._participant = participant;
    }

    // endregion

    // region Getters

    public get participant(): Participant {
        return this._participant;
    }

    // endregion
}

export default getModule(QuizStore);
