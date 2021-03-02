<template>
  <div>
    <!-- <input type="text" v-model="location"> -->
    <v-text-field v-model="location" label="Ubication" autocomplete="off" outlined></v-text-field>
    <!-- <ul>
            <li v-for="(result, i) in searchResults" :key="i" v-on:click="getPlacesDetails(result)">
              {{ result.description }} // list of all places
            </li>
          </ul>  -->
    <v-list dense v-if="showList">
      <!-- <v-subheader>REPORTS</v-subheader> -->
      <v-list-item-group v-model="selectedItem" color="primary">
        <v-list-item v-for="(result, i) in searchResults" :key="i" v-on:click="getPlacesDetails(result)">
          <v-list-item-icon>
            <v-icon large>mdi-map-marker-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="result.description"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
    <iframe width="650" height="450" style="border:0" loading="lazy" allowfullscreen
      :src="urlEmbedMap"></iframe>
  </div>

</template>

// Places.vue

<script>
export default {
  data: () => ({
    location: '',
    searchResults: [],
    service: null, // will reveal this later 🕵️
    placesService: null,
    selectedItem: null,
    currentPlaceId: "ChIJy3mhUO0SK4cRrBtKNfjHaYw",
    urlEmbedMap: "https://www.google.com/maps/embed/v1/place?q=place_id:ChIJy3mhUO0SK4cRrBtKNfjHaYw&key=AIzaSyAy2PXCKOXU3LmiMv7N-GjTfbtOSmMPb-I"
  }),
  metaInfo() {
    return {
      script: [{
        src: `https://maps.googleapis.com/maps/api/js?key=AIzaSyA7EeFINwNTuiXJrxfjkN2DWVlF2NKkcZQ&libraries=places`,
        async: true,
        defer: true,
        showList: false,
        locationShot: false,
        callback: () => this.MapsInit() // will declare it in methods
      }]
    }
  },
  methods: {
    MapsInit() {
      this.service = new window.google.maps.places.AutocompleteService();
      this.placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
    },
    displaySuggestions(predictions, status) {
      if (status !== window.google.maps.places.PlacesServiceStatus.OK) {
        this.searchResults = []
        return
      }
      console.log(predictions);
      this.searchResults = predictions.map(prediction => prediction)
    },
    getPlacesDetails(prediction) {      
      console.log(prediction);
      const placeId = prediction.place_id;
      this.urlEmbedMap = this.urlEmbedMap.replace(this.currentPlaceId, placeId);
      this.currentPlaceId = placeId;
      this.showList = false;
      this.placesService.getDetails({
        placeId: placeId
      }, (place, status) => {
        let place_details = place;
        console.log(place_details);
        console.log(status);
        this.locationShot = true;
        this.location = place_details.formatted_address;
        this.$emit('on-place-selected', place_details, placeId);
      });
    }
  },
  watch: {
    location(newValue) {
      if (newValue) {
        if (!this.locationShot) {
          this.showList = true;
          this.service.getPlacePredictions({
            input: this.location,
            //componentRestrictions: { country: ['us'] },            
            location: new window.google.maps.LatLng(33.6050991, -112.4052392), 
            radius: 10000,
            types: ['address']
          }, this.displaySuggestions);
        } else {
          this.locationShot = false;
        }

      }
    }
  }
}
</script>