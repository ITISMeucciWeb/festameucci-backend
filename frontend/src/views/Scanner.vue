<script setup>
import { QrcodeStream } from 'qrcode-reader-vue3'
import {ref} from "vue";

const dialog = ref(true);

function paintOutline (detectedCodes, ctx) {
  for (const detectedCode of detectedCodes) {
    const [ firstPoint, ...otherPoints ] = detectedCode.cornerPoints

    ctx.strokeStyle = "red";

    ctx.beginPath();
    ctx.moveTo(firstPoint.x, firstPoint.y);
    for (const { x, y } of otherPoints) {
      ctx.lineTo(x, y);
    }
    ctx.lineTo(firstPoint.x, firstPoint.y);
    ctx.closePath();
    ctx.stroke();
  }
}
</script>

<template>
  <v-container fluid class="pa-0">
    <v-row justify="center">
      <v-dialog
          v-model="dialog"
          hide-overlay
          transition="dialog-bottom-transition"
      >
        <v-card>
          <v-toolbar
              dark
              color="primary"
          >
            <v-btn
                icon
                dark
                @click="dialog = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>INFO</v-toolbar-title>
          </v-toolbar>
          <v-list
              three-line
              subheader
          >
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>STATO</v-list-item-title>
                <v-list-item-subtitle>STATOSTATOSTATOSTATOSTATOSTATOSTATO</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Nome</v-list-item-title>
                <v-list-item-subtitle>TEST</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Cognome</v-list-item-title>
                <v-list-item-subtitle>TEST</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>EMAIL</v-list-item-title>
                <v-list-item-subtitle>TEST@test.test</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-divider></v-divider>
        </v-card>
      </v-dialog>
    </v-row>
    <QrcodeStream @decode="dialog = true" :track="paintOutline"></QrcodeStream>
  </v-container>
</template>

<style scoped>

</style>
