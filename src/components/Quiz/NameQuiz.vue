<template>
    <q-card
        class="column q-pa-md q-gutter-y-md items-center"
        style="max-width: 300px; width: 100%;"
        @keydown.shift="onPickItem"
    >
        <q-img
            v-if="item"
            :src="imageUrl"
            style="width: 64px; height: auto;"
        >
        </q-img>

        <span
            v-if="false || (state === 'answerGiven' || state === 'right')"
            class="text-bold"
        >{{ item.name }}</span>

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

        <q-btn v-else class="full-width" color="secondary" @click="onPickItem">Play again</q-btn>

        <q-btn class="full-width" color="primary" outline @click="onGiveAnswer">Ask answer</q-btn>

        <q-page-sticky :offset="[18, 18]" position="bottom-right">
            <q-btn color="secondary" fab icon="replay" @click="onPickItem"></q-btn>
        </q-page-sticky>
    </q-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Item } from 'src/models/item';
import ItemRepository from 'src/repositories/itemRepository';

enum State {
    idle = 'idle',
    right = 'right',
    wrong = 'wrong',
    answerGiven = 'answerGiven'
}

@Component
export default class NameQuiz extends Vue {
    // region Props

    @Prop({ required: true }) items!: Item[];

    // endregion

    // region Data

    private item: Item | null = null;

    private answer: string = '';

    private state: State = State.idle;

    // endregion

    // region Computed properties

    private get imageUrl(): string {
        if (this.item) {
            return new ItemRepository().getImageUrl(this.item.id);
        }

        return '';
    }

    // endregion

    // region Hooks

    private mounted() {
        this.pickItem();
    }

    // endregion

    // region Event handlers

    private onVerifyAnswer() {
        this.state = State.idle;

        if (this.verifyAnswer()) {
            this.state = State.right;
        } else {
            this.state = State.wrong;

            setTimeout(() => {
                this.state = State.idle;
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
        this.state = State.idle;

        if (process.env.NODE_ENV === 'development') {
            console.log(`%c ${this.item.name}`, 'color: #bada55');
        }
    }

    // endregion
}
</script>
