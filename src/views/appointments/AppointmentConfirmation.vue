<template>
    <div>
        <br>
        <v-card class="mx-auto" max-width="1000">
            <v-card-text>                

                <div class="my-4 subtitle-1">
                    Date: {{ details.date }}
                </div>

                <div class="my-4 subtitle-1">
                    Time: {{ details.estimatedInit }}
                </div>

                <div class="my-4 subtitle-1">
                    Barber: {{ details.barber.name }}
                </div>

                <div class="my-4 subtitle-1">
                    Address: {{ details.clients_address.formattedAddress }}
                </div>
                
            </v-card-text>
            <v-form v-model="valid" @submit.prevent="submit">
                <p v-if="errors.length">
                    <v-alert dense outlined type="error" v-for="error in errors" :key="error">
                        {{ error }}
                    </v-alert>
                </p>
                <v-container>
                    <v-row>
                        <v-col cols="12" md="4">
                            <v-text-field v-model="pin" :counter="4" label="Confirmation code" required outlined></v-text-field>
                        </v-col>
                    </v-row>
                    <v-btn class="mr-4" type="submit" :disabled="!valid">
                        Next
                    </v-btn>
                </v-container>
            </v-form>
        </v-card>
    </div>
</template>
<script>

//import Appointment from '../../models/appointments/appointment.model.js'
import axios from "axios";
//import Places from '../../components/Inputs/Places.vue';
import api from '../../config/api.config.js'

export default {
    name: 'AppointmentConfirmation',
    data: function() {
        // const appointmentDetails = {
        //         clientAddressId: this.clientAddressId,
        //         date: this.selectedDate.format('YYYY-MM-DD'),
        //         estimatedInit: hoursData.estimatedInit,
        //         estimatedEnd: hoursData.estimatedEnd,
        //         barbers: hoursData.barbers,
        //         services: this.services.services
        //     };
        return {
            valid: false,
            errors: [],
            pin: "",
            details: {},
            services: []
        };
    },
    props: {
        appointmentId: {
            required: true
        },
    },
    methods: {
        submit: function() {
            // this.errors = [];
            // axios
            //     .post(api.base + '/appointments/confirm', {
            //         appointmentId: this.appointmentId,
            //         confirmationCode: this.pin,                    
            //     })
            //     .then(response => {
            //         this.info = response;
            //         //this.$router.push({ name: 'AppointmentAddress', params: { idClient: response.id } })
            //     })
            //     .catch(e => this.errors = ["There was an error registering information.", e])
            this.$emit('next');
        },
    },
    watch: {
        appointmentId(newValue) {
            axios
                .get(api.base + '/appointments/details/' + newValue)
                .then(response => {
                    this.info = response;
                    console.log(response);
                    this.details = response.data.details;
                    this.services = response.data.services;
                    //this.$router.push({ name: 'AppointmentAddress', params: { idClient: response.id } })
                })
                .catch(e => this.errors = ["There was an error registering information.", e]);
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