<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <select-quiz></select-quiz>
    </q-page>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import NameQuiz from 'components/Quiz/NameQuiz.vue';
import SelectQuiz from 'components/Quiz/SelectQuiz.vue';

@Component({
    components: { SelectQuiz, NameQuiz },
})
export default class PageIndex extends Vue {

}
</script>
