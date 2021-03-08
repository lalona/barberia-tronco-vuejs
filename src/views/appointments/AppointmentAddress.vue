<template>
    <div>
        <br>
        <!-- <v-card class="mx-auto" max-width="700"> -->
            <v-list dense v-if="phonenumberConfirmed">                
                <v-list-item-group v-model="selectedItem" color="primary">
                    <v-list-item v-for="(address, i) in clientAddresses" :key="i" v-on:click="selectClientAddress(address.id)">
                        <!-- <v-list-item-icon>
                            <v-icon large>mdi-map-marker-outline</v-icon>
                        </v-list-item-icon> -->
                        <v-list-item-content>
                            <v-list-item-title v-text="address.formattedAddress"></v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>

            <v-form @submit.prevent="submit">
                <p v-if="errors.length">
                    <v-alert dense outlined type="error" v-for="error in errors" :key="error">
                        {{ error }}
                    </v-alert>
                </p>
                <v-container>
                    <Places v-on:on-place-selected="placeSelected">
                    </Places>
                    <br>
                    <v-btn class="mr-4" type="submit" v-on:click="$emit('back')">
                        Back
                    </v-btn>
                    <v-btn class="mr-4" type="submit" :disabled="!valid">
                        Next
                    </v-btn>                    
                </v-container>
                <p>
                    <label for="name">{{placeDetails.formatted_address}}</label>
                </p>
            </v-form>
        <!-- </v-card> -->
        <!-- <form id="app" @submit="checkForm" action="https://vuejs.org/" method="post">
                                  

                                  <p>
                                    <label for="name">Fullname</label>
                                    <v-input id="name" v-model="appointment.fullname" type="text" name="fullname" />
                                  </p>

                                  <v-text-field label="Main input" :rules="rules" hide-details="auto"></v-text-field>
                                  <p>
                                    <label for="age">Phonenumber</label>
                                    <input id="age" v-model="appointment.phonenumber" type="text" name="phonenumber">
                                  </p>

                                  <p>
                                    <label for="age">Address</label>
                                    <input id="age" v-model="appointment.address" type="text" name="address">
                                  </p>          
                                  <b>{{ info }}</b>

                                  <p>
                                    <input type="submit" value="Enviar">
                                  </p>

                                </form> -->
    </div>
</template>
<script>

//import Appointment from '../../models/appointments/appointment.model.js'
import axios from "axios";
import Places from '../../components/Inputs/Places.vue';
import api from '../../config/api.config.js'

export default {
    name: 'AppointmentAddress',
    data: function() {
        console.log(this.$route.params.idClient);
        return {
            valid: false,
            errors: [],
            placeDetails: {
                formattedAddress: ""
            },
            clientAddresses: [],            
            //idClient: this.$router.params.idClient
        };
    },
    props: {
        idClient: {
            required: true
        },
        phonenumberConfirmed: {
            required: true
        }
    },
    methods: {
        submit: function() {
            this.errors = [];
            const data = {
                clientId: this.idClient,
                placeDetails: this.placeDetails,
            };
            console.log(data);
            axios
                .post(api.base + '/appointments/clients/registerAddress', data)
                .then(response => {
                    console.log(response);
                    //this.$router.push({ name: 'AppointmentServices', params: { clientAddressId: response.id } });
                    this.$emit('next', response.data.id);
                })
                .catch(e => this.errors = ["There was an error registering address.", e.response.data.message])
        },
        selectClientAddress: function(clientAddressId) {
            this.$emit('next', clientAddressId);            
        },
        placeSelected: function(place, placeId) {
            console.log(place.address_components.lenght);
            var postalCode = false;
            this.placeDetails["extra"] = {}
            this.errors = [];
            for (var i = 0; i < place.address_components.length; i++) {
                let component = place.address_components[i];
                console.log(component);
                for (var j = 0; j < component.types.length; j++) {
                    let type = component.types[j];
                    if (type == "postal_code") {
                        postalCode = true;
                        this.placeDetails.postalCode = component.short_name;
                    }
                    if (type == "country") {
                        this.placeDetails.country = component.short_name;
                    }
                    console.log(type);
                    this.placeDetails["extra"][type] = component.long_name;
                    this.placeDetails["extra"][type] = component.short_name;
                }
            }
            // TODO: ver si tambien validar con street_number
            // TODO mandar una alerta al usuario de que necesita ignresar una direccion con codigo postal
            this.valid = postalCode;
            if (!postalCode) {
                this.errors.push("Enter an specific address");
            }

            this.placeDetails.formattedAddress = place.formatted_address;
            this.placeDetails.latLng = [place.geometry.location.lat(), place.geometry.location.lng()];
            this.placeDetails.placeId = placeId;
            console.log(this.placeDetails);
        }
    },
    watch: {
        phonenumberConfirmed(newValue) {
            // Si el telefono est'a confirmado buscar las direcciones del usuario
            if (newValue) {
                axios
                    .get(api.base + '/appointments/clients/clientAddresses/' + this.idClient)
                    .then(response => {
                        console.log(response);
                        this.clientAddresses = response.data.addresses;
                    })
                    .catch(e => this.errors = [e.response.data.message]);                
                
            }
        }
    },
    components: {
        Places,
    }
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