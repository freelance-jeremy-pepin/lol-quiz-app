<template>
    <span
        :class="$q.dark.isActive ? 'bg-white text-black' : 'bg-primary text-white'"
        class="shortcut q-px-xs rounded-borders"
    >
        <slot></slot>
    </span>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class SwitchKeyboard extends Vue {
}
</script>
