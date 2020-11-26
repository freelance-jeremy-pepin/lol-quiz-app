<template>
    <main-layout></main-layout>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import SocketMixin from 'src/mixins/socketMixin';
import PseudoUser from 'components/User/PseudoUser.vue';
import UserMixin from 'src/mixins/userMixin';
import MainLayout from 'layouts/MainLayout.vue';

@Component({
    components: { MainLayout, PseudoUser },
})
export default class QuizLayout extends Mixins(UserMixin, SocketMixin) {
    // region Data

    // endregion
}
</script>
