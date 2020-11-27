<template>
    <q-page class="q-pa-md row items-center justify-center q-gutter-md" style="margin-top: 16px;">
        <q-btn color="deep-purple" icon="person" size="xl" to="/single-player">Single player</q-btn>
        <q-btn color="pink" icon="people_alt" size="xl" to="/rooms">Multi player</q-btn>
    </q-page>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import FormQuizConfiguration from 'components/QuizConfiguration/FormQuizConfiguration.vue';
import CardWithTitleAndAction from 'components/Common/CardWithTitleAndAction.vue';

@Component({
    components: { CardWithTitleAndAction, FormQuizConfiguration },
})
export default class IndexPage extends Vue {

}
</script>
