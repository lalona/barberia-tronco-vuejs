<template>
  <div>
    <form id="app" @submit="checkForm" action="https://vuejs.org/" method="post">

      <p v-if="errors.length">
        <b>Please review errors:</b>
        <ul>
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
      </p>

      <p>
        <label for="name">Fullname</label>
        <input id="name" v-model="appointment.fullname" type="text" name="fullname">
      </p>

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

    </form>
  </div>
</template>
<script>

import Appointment from '../../models/appointments/appointment.model.js'
import axios from "axios";

export default {
  name: 'Appointment',
  data: function() {
    let appointment = new Appointment("", "", "");
    return {
      errors: [],
      name: null,
      age: null,
      movie: null,
      appointment: appointment,
      info: ""
    };
  },
  methods: {
    checkForm: function(e) {
      if (this.name && this.age) {
        return true;
      }

      this.errors = [];

      if (!this.name) {
        this.errors.push('El nombre es obligatorio.');
      }
      if (!this.age) {
        this.errors.push('La edad es obligatoria.');
      }

      e.preventDefault();

      axios
      .post('http://164.90.149.153/api/appointments/dummyAppointment', this.appointment)
      .then(response => (this.info = response))
    }
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