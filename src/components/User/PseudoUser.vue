<template>
    <q-btn v-if="me" flat>
        {{ me.pseudo }}
        <q-popup-edit
            v-model="internalPseudo"
            buttons
            @save="onSave"
            @before-show="internalPseudo = me.pseudo"
        >
            <q-input v-model="internalPseudo" autofocus dense />
        </q-popup-edit>
    </q-btn>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import UserMixin from 'src/mixins/userMixin';

@Component
export default class extends Mixins(UserMixin) {
    // region Data

    private internalPseudo: string = '';

    // endregion

    // region Event handlers

    private onSave() {
        this.savePseudo();
    }

    // endregion

    // region Methods

    private savePseudo() {
        // noinspection JSConstantReassignment
        this.me = { id: this.me.id, pseudo: this.internalPseudo };
    }

    // endregion
}
</script>
