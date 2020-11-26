import { Component, Mixins } from 'vue-property-decorator';
import SocketMixin from 'src/mixins/socketMixin';
import Player from 'src/models/Player';

@Component({
    filters: {
        /**
         * Transforme le booléen Player.isReady en label lisible par l'utilisateur.
         * @param isReady
         */
        transformIsReadyIntoLabel(isReady: boolean): string {
            return isReady ? `Ready` : `Not ready`;
        },

        /**
         * Transforme le booléen Player.isReady en couleur.
         * @param isReady
         */
        transformIsReadyIntoColor(isReady: boolean): string {
            return isReady ? `positive` : `negative`;
        },
    },
})
export default class PlayerMixin extends Mixins(SocketMixin) {
    public playerIsCurrentQuestion(numberQuestion: number, player: Player) {
        return player.currentQuestionNumber === numberQuestion + 1 && !player.hasFinished;
    }
}
