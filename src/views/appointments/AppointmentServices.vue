<template>
    <div>
        <br>
        <v-card class="mx-auto" max-width="400">
            <v-list flat subheader three-line>
                <v-subheader>General</v-subheader>
                <v-list-item-group v-model="settings" multiple active-class="">
                    <div v-for="service in services" :key="service.id">
                        <v-list-item v-on:click="service=selectService(service)">
                            <template v-slot:default="{ active }">
                                <v-list-item-action>
                                    <v-checkbox :input-value="active"></v-checkbox>
                                </v-list-item-action>

                                <v-list-item-content>
                                    <v-list-item-title>{{service.name}} - ${{service.price}} dlls.</v-list-item-title>
                                    <v-list-item-subtitle>{{service.description}}</v-list-item-subtitle>
                                </v-list-item-content>
                            </template>
                        </v-list-item>
                        <div v-if="service.selectedCount > 0">
                            <v-btn class="ma-2" outlined color="indigo" v-on:click="service.selectedCount -= 1" :disabled="service.selectedCount <= 1">
                                -
                            </v-btn>
                            <v-btn class="ma-2" outlined color="indigo">
                                {{service.selectedCount}}
                            </v-btn>
                            <v-btn class="ma-2" outlined color="indigo" v-on:click="service.selectedCount += 1">
                                +
                            </v-btn>
                        </div>
                    </div>
                </v-list-item-group>
            </v-list>
            <v-btn class="ma-2" outlined color="indigo" v-on:click="submit">
                Next
            </v-btn>            
        </v-card>
    </div>
</template>
<script>

//import Appointment from '../../models/appointments/appointment.model.js'
import axios from "axios";
//import Places from '../../components/Inputs/Places.vue';
import api from '../../config/api.config.js';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

export default {
    name: 'AppointmentServices',
    data: function() {
        return {
            valid: false,
            errors: [],
            services: []
        };
    },
    mounted() {
        axios.get(api.base + '/appointments/barbers/services')
            .then(response => {
                console.log(response);
                this.services = response.data.map(s => {
                    s.selected = false;
                    s.selectedCount = 0;
                    return s;
                });
            })
            .catch(e => this.errors = ["There was an error getting services.", e])
    },
    methods: {
        selectService: function(service) {
            service.selected = !service.selected;
            service.selectedCount = service.selected ? 1 : 0;
            console.log(this.services);
            return service;
        },
        submit: function() {
            this.$router.push({ name: 'AppointmentAvailability', params: { clientAddressId: this.$route.params.clientAddressId } })
        }
    }
    // components: {
    //   Places,
    // }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
    margin: 40px 0 0;
}

ul {
    list-style-type: none;
    padding: 0;
}

li {
    display: inline-block;
    margin: 0 10px;
}

a {
    color: #42b983;
}
</style>