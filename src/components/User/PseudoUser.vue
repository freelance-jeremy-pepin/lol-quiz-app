<template>
    <q-btn v-if="me" flat>
        {{ me.pseudo }}
        <q-popup-edit v-model="internalPseudo" buttons @save="onSave" @before-show="internalPseudo = me.pseudo">
            <q-input v-model="internalPseudo" autofocus dense />
        </q-popup-edit>
    </q-btn>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import UserStore from 'src/store/modules/UserStore';
import User from 'src/models/User';

@Component
export default class extends Vue {
    // region Props

    // endregion

    // region Data

    private internalPseudo: string = '';

    // endregion

    // region Computed properties

    private get me(): User | undefined {
        return UserStore.me;
    }

    // endregion

    // region Hooks

    // endregion

    // region Event handlers

    private onSave() {
        this.savePseudo();
    }

    // endregion

    // region Methods

    private savePseudo() {
        UserStore.setMe({ id: this.me.id, pseudo: this.internalPseudo });
    }

    // endregion

    // region Watchers

    // endregion
}
</script>
