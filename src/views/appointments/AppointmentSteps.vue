<template>
    <v-stepper v-model="e6" vertical>
        <v-stepper-step :complete="e6 > 1" step="1">
            Basic Info
            <!-- <small>Fill your personal data</small> -->
        </v-stepper-step>

        <v-stepper-content step="1">
            <!-- <v-card color="grey lighten-1" class="mb-12" height="200px"></v-card> -->
            <Appointment v-on:appointment-address="onAppointmentAddress"></Appointment>
            <!-- <v-btn color="primary" @click="e6 = 2">
                                Continue
                            </v-btn>
                            <v-btn text>
                                Cancel
                            </v-btn> -->
        </v-stepper-content>

        <v-stepper-step :complete="e6 > 2" step="2">
            Address
        </v-stepper-step>

        <v-stepper-content step="2">
            <!-- <v-card color="grey lighten-1" class="mb-12" height="200px"></v-card> -->
            <AppointmentAddress v-bind:idClient="clientId" v-bind:phonenumberConfirmed="phonenumberConfirmed" v-on:next="onAppointmentServices" v-on:back="e6=1"></AppointmentAddress>
            <!-- <v-btn color="primary" @click="e6 = 3">
                            Continue
                        </v-btn>
                        <v-btn text>
                            Cancel
                        </v-btn> -->
        </v-stepper-content>

        <v-stepper-step :complete="e6 > 3" step="3">
            Services
        </v-stepper-step>

        <v-stepper-content step="3">
            <!-- <v-card color="grey lighten-1" class="mb-12" height="200px"></v-card> -->
            <AppointmentServices v-bind:idClient="clientId" v-on:next="onAppointmentAvailability" v-on:back="e6=2"></AppointmentServices>
            <!-- <v-btn color="primary" @click="e6 = 4">
                            Continue
                        </v-btn>
                        <v-btn text>
                            Cancel
                        </v-btn> -->
        </v-stepper-content>

        <v-stepper-step :complete="e6 > 3" step="4">
            Availability
        </v-stepper-step>
        <v-stepper-content step="4">
            <!-- <v-card color="grey lighten-1" class="mb-12" height="200px"></v-card> -->
            <AppointmentAvailability v-bind:clientAddressId="clientAddressId" v-bind:services="services" v-on:next="onAppointmentConfirmation" v-on:back="e6=3"></AppointmentAvailability>
            <!-- <v-btn color="primary" @click="e6 = 1">
                            Continue
                        </v-btn>
                        <v-btn text>
                            Cancel
                        </v-btn> -->
        </v-stepper-content>

        <v-stepper-step :complete="e6 > 3" step="5">
            Confirmation
        </v-stepper-step>
        <v-stepper-content step="5">
            <!-- <v-card color="grey lighten-1" class="mb-12" height="200px"></v-card> -->
            <appointment-confirmation v-bind:appointmentId="appointmentId" v-on:next="finish" v-on:back="e6=4"></appointment-confirmation>
            <!-- <v-btn color="primary" @click="e6 = 1">
                            Continue
                        </v-btn>
                        <v-btn text>
                            Cancel
                        </v-btn> -->
        </v-stepper-content>
    </v-stepper>
    
</template>

<script>
//import Appointment from '../../models/appointments/appointment.model.js'
//import axios from "axios";
//import Places from '../../components/Inputs/Places.vue';
//import api from '../../config/api.config.js'
import Appointment from './Appointment.vue';
import AppointmentAddress from './AppointmentAddress.vue';
import AppointmentServices from './AppointmentServices.vue';
import AppointmentAvailability from './AppointmentAvailability.vue';
import AppointmentConfirmation from './AppointmentConfirmation.vue';

export default {
    name: 'AppointmentSteps',    
    data: function() {        
        return {
            e6: 1,
            clientId: -1,
            clientAddressId: -1,
            services: [],
            appointmentId: -1,
            phonenumberConfirmed: false
        };
    },
    methods: {
        onAppointmentAddress: function(clientId, phonenumberConfirmed) {
            console.log(clientId);
            this.clientId = clientId;
            this.phonenumberConfirmed = phonenumberConfirmed;
            this.e6 = 2;
        },
        onAppointmentServices: function(clientAddressId) {
            console.log(clientAddressId);
            this.clientAddressId = clientAddressId;
            this.e6 = 3;
        },
        onAppointmentAvailability: function(services) {
            console.log(services)
            this.services = services;
            this.e6 = 4;
        },
        onAppointmentConfirmation: function(appointmentId) {
            this.appointmentId = appointmentId;
            this.e6 = 5;
        },
        finish: function() {
            this.e6 = 6;
        }

    },
    components: {
        Appointment,
        AppointmentAddress,
        AppointmentServices,
        AppointmentAvailability,
        AppointmentConfirmation

    },
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