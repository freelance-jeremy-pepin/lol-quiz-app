<template>
    <div class="column items-center" style="max-width: 300px; width: 100%;">
        <q-btn v-if="state === 'beginning'" color="primary" push size="xl" @click="onPickItem">
            Start
        </q-btn>

        <q-card
            v-else
            style="width: 100%;"
            @keydown.shift="onPickItem"
        >
            <q-card-section v-if="state === 'loading'" class="column items-center">
                <q-spinner color="primary" size="3em"></q-spinner>
            </q-card-section>

            <q-card-section v-else class="column items-center q-pa-md q-gutter-y-md">
                <icon-item :item="item" :with-tooltip="state !== 'answering'"></icon-item>

                <span
                    v-if="state === 'answerGiven' || state === 'right'"
                    class="text-bold"
                >
                {{ item.name }}
            </span>

                <q-input
                    v-if="state !== 'answerGiven' && state !== 'right'"
                    v-model="answer"
                    autofocus
                    borderless
                    class="full-width"
                    label="Your answer"
                    outlined
                    @keydown.enter.stop="onVerifyAnswer"
                ></q-input>

                <q-btn
                    v-if="state !== 'answerGiven' && state !== 'right'"
                    :color="state === 'wrong' ? 'negative' : 'primary'"
                    class="full-width"
                    @click="onVerifyAnswer"
                >
                    {{ state === 'wrong' ? 'Wrong' : 'Verify' }}
                </q-btn>

                <q-btn v-else class="full-width" color="secondary" @click="onPickItem">
                    Play again
                </q-btn>

                <q-btn
                    v-if="state === 'answering' || state === 'wrong'"
                    class="full-width"
                    color="primary"
                    outline
                    @click="onGiveAnswer"
                >
                    Ask answer
                </q-btn>

                <q-page-sticky :offset="[18, 18]" position="bottom-right">
                    <q-btn color="secondary" fab icon="replay" @click="state = 'beginning'">
                        <q-tooltip
                            anchor="center left"
                            content-class="bg-secondary"
                            content-style="font-size: 16px;"
                            self="center right"
                        >New game
                        </q-tooltip>
                    </q-btn>
                </q-page-sticky>

                <q-page-sticky :offset="[18, 18]" position="top-right">
                    <stop-watch v-if="state !== 'loading' && state !== 'beginning'"></stop-watch>
                </q-page-sticky>
            </q-card-section>
        </q-card>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Item } from 'src/models/item';
import IconItem from 'components/Item/IconItem.vue';
import StopWatch from 'components/Common/StopWatch.vue';

enum State {
    loading = 'loading',
    beginning = 'beginning',
    answering = 'answering',
    right = 'right',
    wrong = 'wrong',
    answerGiven = 'answerGiven'
}

@Component({
    components: { StopWatch, IconItem },
})
export default class NameQuiz extends Vue {
    // region Props

    @Prop({ required: true }) items!: Item[];

    // endregion

    // region Data

    private item: Item | null = null;

    private answer: string = '';

    private state: State = State.loading;

    // endregion

    // region Hooks

    private mounted() {
        this.state = State.beginning;
    }

    // endregion

    // region Event handlers

    private onVerifyAnswer() {
        if (this.verifyAnswer()) {
            this.state = State.right;
        } else {
            this.state = State.wrong;

            setTimeout(() => {
                this.state = State.answering;
            }, 1000);
        }
    }

    private onGiveAnswer() {
        this.giveAnswer();
    }

    private onPickItem() {
        this.pickItem();

        this.answer = '';
    }

    // endregion

    // region Methods

    private verifyAnswer(): boolean {
        if (this.item) {
            const itemName = this.item.name.replace(/[^a-z0-9]/gi, '').toLowerCase();
            const answer = this.answer.replace(/[^a-z0-9]/gi, '').toLowerCase();

            return itemName === answer;
        }

        return false;
    }

    private giveAnswer() {
        this.state = State.answerGiven;
    }

    private pickItem() {
        this.item = this.items[Math.floor(Math.random() * this.items.length)];
        this.state = State.answering;

        if (process.env.NODE_ENV === 'development') {
            console.log(`%c ${this.item.name}`, 'color: #bada55');
            console.log(this.item);
        }
    }

    // endregion
}
</script>
