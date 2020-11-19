<template>
    <q-page class="q-pa-md row items-center justify-evenly" style="margin-top: 16px;">
        <select-room-multiplayer></select-room-multiplayer>
    </q-page>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import SelectRoomMultiplayer from 'components/Room/SelectRoom.vue';

@Component({
    components: { SelectRoomMultiplayer },
})
export default class SelectRoomMultiplayerPage extends Vue {
}
</script>
