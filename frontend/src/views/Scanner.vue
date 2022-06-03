<script setup lang="ts">
// @ts-ignore
import { QrcodeStream } from 'qrcode-reader-vue3'
import {ref} from "vue";
import { useMutation } from '@vue/apollo-composable'
import gql from "graphql-tag";
import {useRouter} from "vue-router";
import {apolloClient} from "@/apollo";
const router = useRouter();

let token = router.currentRoute.value.query.token as string | null;
if (token) {
  localStorage.setItem('token', token);
  router.replace({
    ...router.currentRoute,
    query: {
      token: null
    }
  })
} else{
  window.location.href = import.meta.env.VITE_BACKEND_API_URL + "google/advancedRedirect";
}

const {mutate: setUserStateById} = useMutation(gql`
      mutation ($userId: String!) {
        updateStateById (id: $userId) {
          result
          user {
            name
            surname
            email
        }
      }
   }
`);

const dialog = ref(false);

const state = ref<string | null>(null);
const name = ref<string | null>(null);
const surname = ref<string | null>(null);
const email = ref<string | null>(null);

async function decoded(decodedUserId: string){
  name.value = null;
  surname.value = null;
  email.value = null;
  dialog.value = false;

  let result;
  try {
    result = await setUserStateById({userId: decodedUserId});
  }catch (e) {
    state.value = "NotFound";
    dialog.value = true;
    return;
  }
  if(result == null){
    return;
  }
  state.value = result.data.updateStateById.result;
  name.value = result.data.updateStateById.user.name;
  surname.value = result.data.updateStateById.user.surname;
  email.value = result.data.updateStateById.user.email;
  dialog.value = true;
}

function paintOutline (detectedCodes: any, ctx: any) {
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
                <v-list-item-subtitle>{{ state }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content v-if="name">
                <v-list-item-title>Nome</v-list-item-title>
                <v-list-item-subtitle>{{ name }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content v-if="surname">
                <v-list-item-title>Cognome</v-list-item-title>
                <v-list-item-subtitle>{{ surname }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content v-if="email">
                <v-list-item-title>EMAIL</v-list-item-title>
                <v-list-item-subtitle>{{email}}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-divider></v-divider>
        </v-card>
      </v-dialog>
    </v-row>
    <QrcodeStream @decode="decoded" :track="paintOutline"></QrcodeStream>
  </v-container>
</template>

<style scoped>

</style>
