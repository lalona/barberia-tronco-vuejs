<template>
    <div>
        <br>
        <v-card class="mx-auto" max-width="700">

            <!-- Filter By Barber -->
            <v-form v-model="valid" @submit.prevent="submit">

                <p v-if="errors.length">
                    <v-alert dense outlined type="error" v-for="error in errors" :key="error">
                        {{ error }}
                    </v-alert>
                </p>
                <v-container>
                    <v-row justify="center">
                        <v-date-picker v-model="picker"></v-date-picker>
                    </v-row>

                    <v-row>
                        <v-col cols="12" md="4">
                            <v-select :items="barbers" v-model="barber" name="barber" item-text="name" item-value="id" label="Filter by barber" outlined/>
                        </v-col>
                    </v-row>
                    <v-card-text>
                        <v-chip-group v-model="hourSelected" active-class="deep-purple accent-4 white--text" column>
                            <v-chip v-for="hour in Object.keys(hours)" :key="hour">{{hour}}</v-chip>
                        </v-chip-group>
                    </v-card-text>
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
import api from '../../config/api.config.js';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

export default {
    name: 'AppointmentAvailability',
    data: function() {
        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        return {
            valid: false,
            errors: [],
            picker: date,
            today: date,
            barbers: [],
            hours: {},
            allHours: {},
            hourSelected: '',
            barber: {},
            selectedHour: '',
            services: []
        };
    },
    mounted() {
        axios.get(api.base + '/appointments/barbers/services')
            .then(response => {
                console.log(response);
                this.services = response.data;
            })
            .catch(e => this.errors = ["There was an error getting services.", e])
    },
    methods: {
        submit: function() {
            this.errors = [];
            axios
                .post(api.base + '/appointments/clients/register', {
                    name: this.firstname,
                    lastname: this.lastname,
                    phonenumber: this.phonenumber,
                    phonenumberCountry: "us"
                })
                .then(response => {
                    this.info = response;
                    this.$router.push({ name: 'AppointmentAddress', params: { idClient: response.id } })
                })
                .catch(e => this.errors = ["There was an error registering information.", e])
        },
        checkIfContainsBarber: function(barbers, barberId) {
            console.log(barbers);
            for (var i = 0; i < barbers.length; i++) {
                if (barbers[i].id == barberId) {
                    return barbers[i];
                }
            }
            return null;
        },
        getSimpleBarber: function(barber) {
            return {
                id: barber.id
            };
        }
    },
    watch: {
        picker(newValue) {
            console.log(newValue);
            axios
                .post(api.base + '/appointments/barbers/findAvailability', {
                    date: newValue,
                    clientAddressId: this.$route.params.clientAddressId,
                })
                .then(response => {
                    const barbersAvailability = response.data;
                    let anyBarber = [{
                        id: -1,
                        name: "Any"
                    }];
                    this.barbers = anyBarber.concat(barbersAvailability);
                    var hours = {};
                    console.log(response);

                    for (var i = 0; i < barbersAvailability.length; i++) {
                        var barber = barbersAvailability[i];
                        const from = dayjs(barber.barber_schedules[0].fromHour, 'HH:mm:ss');
                        const to = dayjs(barber.barber_schedules[0].toHour, 'HH:mm:ss');
                        const minTimeAppointment = 30;
                        for (var t = from; t.isBefore(to); t = t.add(minTimeAppointment, 'minute')) {
                            var available = true;
                            for (var a = 0; a < barber.appointments.length; a++) {
                                const appointment = barber.appointments[a];
                                const init = dayjs(appointment.estimatedInit, 'HH:mm:ss');
                                const end = dayjs(appointment.estimatedEnd, 'HH:mm:ss');
                                if ((t.isAfter(init) || t.isSame(init)) && (t.isBefore(end) || t.isSame(end))) {
                                    available = false;
                                }
                            }
                            if (available) {
                                const tFormatted = t.format('HH:mm');
                                if (!(tFormatted in hours)) {
                                    hours[tFormatted] = [];
                                }
                                hours[tFormatted].push(this.getSimpleBarber(barber));
                            }
                        }
                        this.hours = hours;
                        this.allHours = hours;
                    }
                })
                .catch(e => this.errors = ["There was an reading availability.", e])
        },
        barber(selectedBarberId) {
            console.log(selectedBarberId);
            let hours = {};
            if (selectedBarberId < 0) {
                // any
                this.hours = this.allHours;
                return;
            }
            for (var k = 0; k < Object.keys(this.hours).length; k++) {
                var key = Object.keys(this.hours)[k];
                console.log(this.hours[key]);
                var barber = this.checkIfContainsBarber(this.hours[key], selectedBarberId);
                if (barber != null) {
                    hours[key] = [];
                    hours[key].push(this.getSimpleBarber(barber));
                }
            }
            this.hours = hours;
        },
        hourSelected(newValue) {
            console.log(Object.keys(this.hours)[newValue]);
            this.selectedHour = this.hours[Object.keys(this.hours)[newValue]];
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