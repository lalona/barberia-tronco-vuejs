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
          <!-- <v-list-item-icon>
                        <v-icon large>mdi-map-marker-outline</v-icon>
                      </v-list-item-icon> -->
          <v-list-item-content>
            <v-list-item-title v-text="result.description"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
    <!-- <v-row>
                    <v-col cols="12" md="4" sm="12" xs="12"> -->
    <v-icon aria-hidden="false" v-on:click="dialog = true" v-if="!hideMap">
      mdi-arrow-expand
    </v-icon>
    <v-icon aria-hidden="false" v-on:click="hideMap = true" v-if="!hideMap">
      mdi-window-minimize
    </v-icon>
    <v-icon aria-hidden="false" v-on:click="hideMap = false" v-if="hideMap">
      mdi-map
    </v-icon>
    <div class="container" v-if="!hideMap">
      <iframe class="responsive-iframe" loading="lazy" allowfullscreen :src="urlEmbedMap"></iframe>
    </div>
    <v-dialog v-model="dialog" width="100%">  
      <v-card>                
          <iframe style="width:100%" loading="lazy" allowfullscreen :src="urlEmbedMap"></iframe>                  
      </v-card>
    </v-dialog>
    <!-- </v-col>
                  </v-row> -->
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
    showList: false,
    searchCount: 0,
    urlEmbedMap: "https://www.google.com/maps/embed/v1/place?q=place_id:ChIJy3mhUO0SK4cRrBtKNfjHaYw&key=AIzaSyAy2PXCKOXU3LmiMv7N-GjTfbtOSmMPb-I",
    dialog: false,
    hideMap: false
  }),
  metaInfo() {
    return {
      script: [{
        src: `https://maps.googleapis.com/maps/api/js?key=AIzaSyA7EeFINwNTuiXJrxfjkN2DWVlF2NKkcZQ&libraries=places`,
        async: true,
        defer: true,
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
      this.searchCount += 1;
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
      if (newValue && newValue.length > 3 && this.searchCount < 12) {
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* Then style the iframe to fit in the container div with full height and width */

.responsive-iframe {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
}

.container {
  position: relative;
  overflow: hidden;
  width: 100%;
  padding-top: 56%;
  /* 16:9 Aspect Ratio (divide 9 by 16 = 0.5625) */
}
</style>