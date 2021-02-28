<template>
    <div>
        <br>
        <v-card class="mx-auto" max-width="700">

            <v-row class="ma-2">
                <v-col cols="12" md="4">
                    <v-select :items="barbers" v-model="barber" name="barber" item-text="name" item-value="id" label="Filter by barber" outlined/>
                </v-col>
            </v-row>

            <v-row justify="center" class="ma-2">
                <v-date-picker v-model="picker" :allowed-dates="ad" full-width></v-date-picker>
            </v-row>

            <!-- Filter By Barber -->
            <v-form v-model="valid" @submit.prevent="submit">

                <p v-if="errors.length">
                    <v-alert dense outlined type="error" v-for="error in errors" :key="error">
                        {{ error }}
                    </v-alert>
                </p>
                <v-container>
                    <v-card-text>
                        <v-chip-group v-model="hourSelected" active-class="deep-purple accent-4 white--text" column>
                            <v-chip v-for="hour in Object.keys(hours)" :key="hour">{{hour}}</v-chip>
                        </v-chip-group>
                    </v-card-text>
                    <v-card-text v-if="Object.keys(hours).length == 0">
                        No available appointments.
                    </v-card-text>
                    
                    <v-btn class="mr-4" type="submit" :disabled="!valid">
                        Confirm
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
            valid: true,
            errors: [],
            picker: date,
            today: date,
            barbers: [],
            hours: {},
            allHours: {},
            hourSelected: '',
            barber: {},
            selectedDate: '',
            selectedHour: '',
            barberIds: [],
            allowedDates: [],
            dateBarbers: {},
            daysOfWeekBarbers: {}
        };
    },
    props: {
        services: {
            required: true
        }
    },
    mounted() {
        console.log(this.services);
        axios.post(api.base + "/appointments/barbers/byZone", { clientAddressId: this.$route.params.clientAddressId })
            .then(response => {
                let anyBarber = [{
                    id: -1,
                    name: "Any"
                }];
                this.barbers = anyBarber.concat(response.data);
            })
            .catch(e => this.errors.push(e))
    },
    methods: {
        submit: function() {
            this.errors = [];
            var hoursData = this.hours[Object.keys(this.hours)[this.hourSelected]];
            console.log(hoursData);
            axios
                .post(api.base + '/appointments/registerUnconfirmedAppointment', {
                    clientAddressId: this.$route.params.clientAddressId,
                    date: this.selectedDate.format('YYYY-MM-DD'),
                    estimatedInit: hoursData.estimatedInit,
                    estimatedEnd: hoursData.estimatedEnd,
                    barbers: hoursData.barbers,
                    services: this.services.services                 
                })
                .then(response => {
                    this.info = response;
                    this.$router.push({ name: 'AppointmentConfirmation', params: { appointmentId: response.id } });
                })
                .catch(e => {
                    console.log(e);
                    this.errors = [e]
                })
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
        },
        ad: function(val) {
            return this.allowedDates.indexOf(val) !== -1;
        }
    },
    watch: {
        picker(newValue) {
            console.log(newValue);
            const selectedDate = dayjs(newValue);
            const barberIds = this.daysOfWeekBarbers[selectedDate.day()];
            console.log(barberIds);
            this.selectedDate = selectedDate;
            axios
                .post(api.base + '/appointments/barbers/appointmentsByDate', {
                    date: newValue,
                    barberIds: barberIds,
                })
                .then(response => {
                    const barbersAvailability = response.data;
                    var hours = {};
                    console.log(response);


                    // TODO: tomar en cuenta que en el dia de hoy minimo se tiene que 
                    for (var i = 0; i < barbersAvailability.length; i++) {
                        var barber = barbersAvailability[i];
                        var servicesDuration = this.services.estimatedDuration + barber.tripAverageTimeMin;
                        // Si la fecha es igual al dia de hoy entonces la cita se puede hacer unicamente despues de tres horas
                        // de hoy
                        const from = selectedDate.isSame(dayjs()) ? dayjs().add(3, 'hour') : dayjs(barber.barber_schedules[0].fromHour, 'HH:mm:ss');
                        const to = dayjs(barber.barber_schedules[0].toHour, 'HH:mm:ss');
                        const minTimeAppointment = 30;
                        var t = from;                        
                        const endAppointment = t.add(servicesDuration, 'minute');
                        while(t.isBefore(to)) {
                            var available = true;                                                                                    
                            const startAppointment = t;
                            for (var a = 0; a < barber.appointments.length; a++) {
                                const appointment = barber.appointments[a];
                                const init = dayjs(appointment.estimatedInit, 'HH:mm:ss');
                                const end = dayjs(appointment.estimatedEnd, 'HH:mm:ss');
                                if ((endAppointment.isBefore(init) || endAppointment.isSame(init)) || (startAppointment.isAfter(end) || startAppointment.isSame(end))) {
                                    //available = true;
                                } else {
                                    available = false;                                    
                                }
                            }
                            if (available) {
                                const endDateWithoutTrip = t.add(this.services.estimatedDuration, 'minute');
                                const tFormatted = t.format('HH:mm') + " - " + endDateWithoutTrip.format('HH:mm');
                                if (!(tFormatted in hours)) {
                                    hours[tFormatted] = {
                                        barbers: [],
                                        estimatedInit: startAppointment.format('HH:mm'),
                                        estimatedEnd: endAppointment.format('HH:mm')
                                    };
                                }
                                hours[tFormatted].barbers.push(this.getSimpleBarber(barber));
                            }
                            t = t.add(minTimeAppointment, 'minute');
                        }
                        this.hours = hours;                        
                    }
                })
                .catch(e => this.errors = ["There was an reading availability.", e])
        },
        barber(selectedBarberId) {
            console.log(selectedBarberId);
            // let hours = {};
            // if (selectedBarberId < 0) {
            //     // any
            //     this.hours = this.allHours;
            //     return;
            // }
            // for (var k = 0; k < Object.keys(this.hours).length; k++) {
            //     var key = Object.keys(this.hours)[k];
            //     console.log(this.hours[key]);
            //     var barber = this.checkIfContainsBarber(this.hours[key], selectedBarberId);
            //     if (barber != null) {
            //         hours[key] = [];
            //         hours[key].push(this.getSimpleBarber(barber));
            //     }
            // }
            // this.hours = hours;
            var barbers = [selectedBarberId];
            if (selectedBarberId < 0) {
                barbers = this.barbers.map(b => b.id);
            }
            axios.post(api.base + "/appointments/barbers/schedules", { barberIds: barbers })
                .then(response => {
                    const barbersSchedules = response.data;
                    console.log(barbersSchedules);
                    // Aqui lo que estoy haciendo es crear un objecto de dias de la semana con el arreglo
                    // de los ids barberos disponibles para ese dia de la semana
                    // Por ejemplo: { 0: [1, 2, 3], 1: [1, 2] }
                    var daysOfWeekBarbers = {};
                    for (var b = 0; b < barbersSchedules.length; b++) {
                        const barber = barbersSchedules[b];
                        console.log(barber);
                        for (var d = 0; d < barber.barber_schedules.length; d++) {
                            const dayOfWeek = barber.barber_schedules[d].dayOfWeek;
                            if (!(dayOfWeek in daysOfWeekBarbers)) {
                                daysOfWeekBarbers[dayOfWeek] = [];
                            }
                            daysOfWeekBarbers[dayOfWeek].push(barber.id);
                        }
                    }

                    // Voy a poner en allowDates las fechas a partir del dia de hoy hasta dentro de un mes
                    // en los dias que el barbero trabaja
                    // Aun puede haber posibilidad de que no haya disponibilidad ese dia pero eso
                    // ya se hara cuando se obtenga sus citas dentro de un día
                    var from = dayjs();
                    var to = dayjs().add(30, 'day');
                    var allowedDates = [];
                    for (var t = from; t.isBefore(to); t = t.add(1, 'day')) {
                        if (t.day() in daysOfWeekBarbers) {
                            allowedDates.push(t.format('YYYY-MM-DD'));
                        }
                    }
                    this.allowedDates = allowedDates;
                    this.daysOfWeekBarbers = daysOfWeekBarbers;
                    console.log(allowedDates);
                    console.log(daysOfWeekBarbers);
                })
                .catch(e => this.errors.push(e))
        },
        hourSelected(newValue) {
            console.log(Object.keys(this.hours)[newValue]);
            //this.selectedHour = this.hours[Object.keys(this.hours)[newValue]];
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