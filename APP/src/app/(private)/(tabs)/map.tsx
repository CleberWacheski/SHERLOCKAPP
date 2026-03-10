import { Layout } from "@/components/ui/Layout";
import { AppText } from "@/components/ui/Text";
import { useLocation, type NearbyUser } from "@/hooks/useLocation";
import { LATITUDE_DELTA, LONGITUDE_DELTA } from "@/lib/constants";
import { getStatusColor } from "@/lib/get-status-color";
import { theme } from "@/lib/theme";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { Locate } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useDebouncedCallback } from "use-debounce";

type LocationProps = {
  lat: number;
  lon: number;
};

export default function Map() {
  const router = useRouter();
  const mapRegion = useRef<LocationProps | null>(null);
  const [queryCoords, setQueryCoords] = useState<LocationProps | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(true);
  const currentLocation = useRef<LocationProps | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const isFollowingUser = useRef(true);
  const mapRef = useRef<MapView | null>(null);
  const { data } = useLocation({
    coords: queryCoords,
  });
  const [selectedCustomer, setSelectedCustomer] = useState<NearbyUser | null>(
    null,
  );

  const debouncedFetch = useDebouncedCallback(() => {
    if (mapRegion.current) {
      setQueryCoords({ ...mapRegion.current });
    }
  }, 6000);

  const handleMarkerPress = (user: { name: string }) => {
    router.push({
      pathname: "/(private)/(tabs)/customers",
      params: { search: user.name },
    });
  };

  const setRegionToCurrentLocation = useCallback(() => {
    if (!currentLocation.current || !mapRef.current) return;
    isFollowingUser.current = true;
    mapRef.current.animateToRegion(
      {
        latitude: currentLocation.current.lat,
        longitude: currentLocation.current.lon,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      500,
    );
  }, []);

  useEffect(() => {
    if (currentLocation.current && isMapReady) {
      mapRegion.current = currentLocation.current;
      setQueryCoords({ ...currentLocation.current });
    }
  }, [isMapReady]);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    async function startLocationUpdates() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionGranted(status === "granted");
      if (status !== "granted") {
        return;
      }
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
        },
        (newLocation) => {
          if (!isMapReady) {
            setIsMapReady(true);
          }
          currentLocation.current = {
            lat: newLocation.coords.latitude,
            lon: newLocation.coords.longitude,
          };
          if (isFollowingUser.current && mapRef.current) {
            mapRef.current.animateToRegion(
              {
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
              },
              500,
            );
          }
        },
      );
    }
    startLocationUpdates();
    return () => {
      subscription?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelect(customer: NearbyUser) {
    setSelectedCustomer(customer);

    mapRef.current?.animateToRegion({
      latitude: customer.lat,
      longitude: customer.lon,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }

  if (!permissionGranted) {
    return (
      <Layout>
        <View style={styles.centered}>
          <Text style={styles.title}>Localização necessária</Text>
          <Text style={styles.description}>
            Precisamos da sua localização para mostrar o mapa. Por favor,
            habilite a localização nas configurações.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={Linking.openSettings}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Abrir Configurações</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }

  if (!isMapReady || !currentLocation.current) {
    return (
      <Layout>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <MapView
        ref={mapRef}
        provider="google"
        style={StyleSheet.absoluteFillObject}
        onPress={() => {
          if (selectedCustomer) {
            setSelectedCustomer(null);
          }
        }}
        onPanDrag={() => {
          isFollowingUser.current = false;
        }}
        initialRegion={{
          latitude: currentLocation.current.lat,
          longitude: currentLocation.current.lon,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        onRegionChangeComplete={(region) => {
          mapRegion.current = {
            lat: region.latitude,
            lon: region.longitude,
          };
          if (!isFollowingUser.current) {
            debouncedFetch();
          }
        }}
      >
        {data?.nearbyUsers.map((customer) => (
          <Marker
            key={customer.id}
            style={{
              zIndex: 999,
            }}
            coordinate={{
              latitude: customer.lat,
              longitude: customer.lon,
            }}
            onPress={() => handleSelect(customer)}
          >
            <Image
              source={
                customer.status === "AGUARDANDO VISITA"
                  ? require("../../../../assets/images/marker.png")
                  : require("../../../../assets/images/marker-green.png")
              }
              style={styles.marker}
            />
          </Marker>
        ))}
      </MapView>
      <TouchableOpacity
        style={styles.fab}
        onPress={setRegionToCurrentLocation}
        activeOpacity={0.7}
      >
        <Locate size={24} color={theme.colors.primary} />
      </TouchableOpacity>
      {selectedCustomer && (
        <TouchableOpacity
          onPress={() => handleMarkerPress(selectedCustomer)}
          style={styles.card}
        >
          <AppText weight="bold">{selectedCustomer.name}</AppText>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(selectedCustomer.status) },
              ]}
            />
            <AppText
              size={10}
              color={theme.colors.text.secondary}
              style={styles.statusText}
            >
              {selectedCustomer.status}
            </AppText>
          </View>
        </TouchableOpacity>
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 50,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    justifyContent: "center",
    alignItems: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  marker: {
    width: 32,
    height: 32,
  },
  card: {
    position: "absolute",
    bottom: 40,
    left: 20,
    gap: 8,
    right: 20,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    elevation: 5,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  status: {
    fontSize: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    color: theme.colors.text.secondary,
  },
});
