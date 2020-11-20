<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <select-quiz></select-quiz>
    </q-page>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import SelectQuiz from 'components/Quiz/SelectQuiz.vue';

@Component({
    components: { SelectQuiz },
})
export default class PageIndex extends Vue {

}
</script>
