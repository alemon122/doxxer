import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, Dimensions, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const IpDetailScreen = ({ route, navigation }) => {
  const { log, linkInfo } = route.params;
  const [mapRegion, setMapRegion] = useState(null);
  const [hasLocation, setHasLocation] = useState(false);
  
  useEffect(() => {
    // Parse location data
    if (log.location) {
      // Try to extract coordinates from location data
      const locationParts = log.location.split(', ');
      let lat = null;
      let lon = null;
      
      // Look for latitude and longitude in the location string
      for (const part of locationParts) {
        if (part.includes('lat:') && part.includes('lon:')) {
          const coordParts = part.match(/lat:([\d.-]+),\s*lon:([\d.-]+)/);
          if (coordParts && coordParts.length === 3) {
            lat = parseFloat(coordParts[1]);
            lon = parseFloat(coordParts[2]);
          }
        }
      }
      
      if (lat && lon && !isNaN(lat) && !isNaN(lon)) {
        setMapRegion({
          latitude: lat,
          longitude: lon,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        setHasLocation(true);
      }
    }
  }, [log]);
  
  const openInGoogleMaps = () => {
    if (mapRegion) {
      const url = `https://www.google.com/maps/search/?api=1&query=${mapRegion.latitude},${mapRegion.longitude}`;
      Linking.openURL(url).catch(err => console.error('Could not open Google Maps', err));
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>IP Details</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Connection Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>IP Address:</Text>
            <Text style={styles.infoValue}>{log.ipAddress}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Timestamp:</Text>
            <Text style={styles.infoValue}>
              {new Date(log.timestamp).toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tracking Link:</Text>
            <Text style={styles.infoValue}>{linkInfo?.alias || 'Unknown'}</Text>
          </View>
          
          {linkInfo?.fakeDomain && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Domain Used:</Text>
              <Text style={styles.infoValue}>{linkInfo.fakeDomain}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Location Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>{log.location || 'Unknown'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ISP Provider:</Text>
            <Text style={styles.infoValue}>{log.isp || 'Unknown'}</Text>
          </View>
          
          {hasLocation && (
            <>
              <View style={styles.mapContainer}>
                <MapView 
                  style={styles.map}
                  region={mapRegion}
                  customMapStyle={darkMapStyle}
                >
                  <Marker
                    coordinate={{
                      latitude: mapRegion.latitude,
                      longitude: mapRegion.longitude,
                    }}
                    title={log.ipAddress}
                    description={log.location}
                    pinColor="#FF0000"
                  />
                </MapView>
              </View>
              
              <TouchableOpacity 
                style={styles.openMapsButton}
                onPress={openInGoogleMaps}
              >
                <Text style={styles.openMapsButtonText}>Open in Google Maps</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Device Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Browser:</Text>
            <Text style={styles.infoValue}>{log.browser || 'Unknown'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Operating System:</Text>
            <Text style={styles.infoValue}>{log.os || 'Unknown'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Device Type:</Text>
            <Text style={styles.infoValue}>{log.deviceType || 'Unknown'}</Text>
          </View>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>User Agent</Text>
          <Text style={styles.userAgentText}>{log.userAgent || 'Unknown'}</Text>
        </View>
        
        <Text style={styles.footer}>
          Doxxer by 『ꪶ𝒁𝑬𝑭𝑰𝑹𝜣̸͢ꫂ 𝒜𝓵ℯ𝓂ℴ𝓷
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// Dark map style for the MapView
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#FF0000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 120,
    color: '#888',
    fontSize: 14,
  },
  infoValue: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  userAgentText: {
    color: '#BBB',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  footer: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginVertical: 20,
  },
  mapContainer: {
    marginTop: 16,
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  openMapsButton: {
    marginTop: 12,
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'center',
  },
  openMapsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default IpDetailScreen;