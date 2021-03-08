<template>
    <div>
        <br>
        <v-card class="mx-auto" max-width="700">

            <v-row class="ma-2">
                <v-col cols="12" md="4">
                    <v-select :items="barbers" v-model="barber" name="barber" item-text="name" item-value="id" label="Filter by barber" outlined/>
                </v-col>
            </v-row>

            <v-row justify="center" class="ma-2" v-if="!hideCalendar">
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
                        <v-chip-group active-class="deep-purple accent-4 white--text" column>
                            <v-chip v-for="hour in Object.keys(hours)" :key="hour" v-on:click="hourSelected = hour">{{hour}}</v-chip>
                        </v-chip-group>
                    </v-card-text>
                    <v-card-text v-if="Object.keys(hours).length == 0">
                        No available dates.
                    </v-card-text>
                    <v-btn class="mr-4" type="submit" v-on:click="$emit('back')">
                        Back
                    </v-btn>
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
            daysOfWeekBarbers: {},
            hideCalendar: false
        };
    },
    props: {
        clientAddressId: {
            required: true
        },
        services: {
            required: true
        }
    },
    mounted() {

    },
    methods: {
        submit: function() {
            this.errors = [];
            var hoursData = this.hours[this.hourSelected];
            const appointmentDetails = {
                clientAddressId: this.clientAddressId,
                date: this.selectedDate.format('YYYY-MM-DD'),
                estimatedInit: hoursData.estimatedInit,
                estimatedEnd: hoursData.estimatedEnd,
                barbers: hoursData.barbers,
                services: this.services.services
            };
            console.log(hoursData);
            axios
                .post(api.base + '/appointments/registerUnconfirmedAppointment', appointmentDetails)
                .then(response => {
                    this.info = response;
                    //this.$router.push({ name: 'AppointmentConfirmation', params: { appointmentId: response.id } });
                    this.$emit('next', response.data.id);
                })
                .catch(e => {
                    console.log(e);
                    this.errors = [e.response.data.message]
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
                    const minHours = 3; // El minimo de horas a las que se puede agendar si la fecha es del dia de hoy
                    const minTimeAppointment = 30; // El tiempo que se separa de cita a cita (s'olo para tener un orden)
                    // Voy a recorrer las lista de barberos seleccionados (puede ser uno en especifico o todos los posibles de su zona)
                    // y su disponibilidad en la fecha seleccionada
                    for (var i = 0; i < barbersAvailability.length; i++) {
                        var barber = barbersAvailability[i];
                        var servicesDuration = this.services.estimatedDuration + barber.tripAverageTimeMin;
                        // Si la fecha es igual al dia de hoy entonces la cita se puede hacer unicamente despues de tres horas
                        // de hoy                        
                        const from = selectedDate.isSame(dayjs()) ? dayjs().add(minHours, 'hour') : dayjs(barber.barber_schedules[0].fromHour, 'HH:mm:ss');
                        const to = dayjs(barber.barber_schedules[0].toHour, 'HH:mm:ss');                        
                        var t = from;            
                                                
                        // Voy a recorrer de la hora de entrada del barbero a su hora de salida
                        // y si hay un horario ocupado entonces no lo voy agregar a la lista de horas disponibles
                        while (t.isBefore(to)) {
                            var available = true;
                            const startAppointment = t;                            
                            const endAppointment = startAppointment.add(servicesDuration, 'minute');
                            for (var a = 0; a < barber.appointments.length; a++) {
                                const appointment = barber.appointments[a];
                                const init = dayjs(appointment.estimatedInit, 'HH:mm:ss');
                                const end = dayjs(appointment.estimatedEnd, 'HH:mm:ss');
                                // Si la posible cita se encuentra dentro del rango de una cita ya agendada para el barbero
                                // entonces la proxima posible cita empezara al final de la cita programada del barbero
                                if (!((endAppointment.isBefore(init) || endAppointment.isSame(init)) 
                                        || (startAppointment.isAfter(end) || startAppointment.isSame(end)))) {                                                                    
                                    available = false;                                
                                    t = end;
                                    break;      
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
                                // La compensacion funciona en casos en los casos en que hay horas ocupadas y cómo habia una hora
                                // ocupada se puso un horario al finalizar la cita por ejemplo 9:10 en ese caso
                                // la siguiente posible cita debe empezar 9:30 sin embargo como la posible cita anterior empieza 9:10
                                // se pondria a las 9:40, para eliminar esos 10 minutos extra hay que hacer la compensacion
                                // tambien se puede dar el caso que la posible cita despues de una cita ocupada empiece 9:40, entonces
                                // la siguiente posible cita deberia sugerir 10:00
                                var compensation = t.minute() == 0 ? 0 : (t.minute() < minTimeAppointment ? t.minute() : t.minute() - minTimeAppointment);
                                //var compensation = 0;
                                console.log(compensation);
                                t = t.add(minTimeAppointment - compensation, 'minute');                                                                                                     
                            }                            
                        }
                        this.hours = hours;
                        this.hourSelected = '';
                    }
                })
                .catch(e => this.errors = ["There was an reading availability.", e.response.data.message])
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
            console.log(newValue);
            //this.selectedHour = this.hours[Object.keys(this.hours)[newValue]];
        },
        clientAddressId(newValue) {
            console.log(this.services);
            console.log(newValue);
            axios.post(api.base + "/appointments/barbers/byZone", { clientAddressId: newValue })
                .then(response => {
                    console.log(response);
                    let anyBarber = [{
                        id: -1,
                        name: "Any"
                    }];
                    this.barbers = anyBarber.concat(response.data);
                    this.hideCalendar = false;
                })
                .catch(e => {
                    this.hideCalendar = true;
                    this.errors.push(e.response.data.message)
                })
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