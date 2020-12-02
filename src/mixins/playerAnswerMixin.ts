import { Component, Vue } from 'vue-property-decorator';
import PlayerAnswerHistory from 'src/models/PlayerAnswerHistory';

@Component
export default class PlayerAnswerMixin extends Vue {
    public answerIsPerfect(playerAnswerHistory: PlayerAnswerHistory): boolean {
        return (playerAnswerHistory.found && playerAnswerHistory.totalScore !== undefined && playerAnswerHistory.score === playerAnswerHistory.totalScore && playerAnswerHistory.answers.length === 1)
            || (playerAnswerHistory.found && playerAnswerHistory.totalScore === 0 && playerAnswerHistory.answers.length === 1 && playerAnswerHistory.found);
    }
}
