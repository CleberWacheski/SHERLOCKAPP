import { AppButton } from "@/components/ui/Button";
import { AppInput } from "@/components/ui/Input";
import { Layout } from "@/components/ui/Layout";
import { AppText } from "@/components/ui/Text";
import { useLocation } from "@/hooks/useLocation";
import { useUpdateCustomer } from "@/hooks/useUpdateCustomer";
import {
  LATITUDE_DELTA,
  LONGITUDE_DELTA,
  customerStatus,
} from "@/lib/constants";
import { getStatusColor } from "@/lib/get-status-color";
import { theme } from "@/lib/theme";
import * as Location from "expo-location";
import { Locate, MapPin, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useDebouncedCallback } from "use-debounce";

export const lightAppMapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#F3F4F6" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#FFFFFF" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#E5E7EB" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#E5E7EB" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#E5E7EB" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
];

type LocationProps = {
  lat: number;
  lon: number;
};

export default function Map() {
  const mapRegion = useRef<LocationProps | null>(null);
  const currentLocation = useRef<LocationProps | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const isFollowingUser = useRef(true);
  const mapRef = useRef<MapView | null>(null);
  const { data, isLoading, refetch } = useLocation({
    coords: mapRegion.current,
  });
  const { mutate, isPending } = useUpdateCustomer();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    name: string;
    note: string | null;
    status: (typeof customerStatus)[number];
  } | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<(typeof customerStatus)[number] | null>(
    null,
  );

  const debouncedFetch = useDebouncedCallback(() => {
    refetch();
  }, 1000);

  const handleMarkerPress = (user: {
    id: number;
    name: string;
    note: string | null;
    status: (typeof customerStatus)[number];
  }) => {
    setSelectedCustomer(user);
    setNote(user.note || "");
    setStatus(user.status);
    setModalVisible(true);
  };

  const handleUpdate = () => {
    if (!selectedCustomer || !status) return;
    mutate(
      {
        id: selectedCustomer.id,
        status: status,
        note: note,
      },
      {
        onSuccess: () => {
          setModalVisible(false);
          refetch();
        },
      },
    );
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
      refetch();
    }
  }, [isMapReady, refetch]);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    async function startLocationUpdates() {
      const { status } = await Location.requestForegroundPermissionsAsync();
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

  if (!isMapReady || !currentLocation.current) {
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

  if (isLoading) {
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
        customMapStyle={lightAppMapStyle}
        style={StyleSheet.absoluteFillObject}
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
        {data?.nearbyUsers?.map((user) => (
          <Marker
            onPress={() => handleMarkerPress(user)}
            key={user.id}
            coordinate={{
              latitude: user.lat,
              longitude: user.lon,
            }}
          >
            <View style={styles.markerContainer}>
              <View style={styles.bubble}>
                <AppText style={styles.name}>{user.name}</AppText>
                <AppText
                  style={[
                    styles.status,
                    {
                      color: getStatusColor(user.status),
                    },
                  ]}
                >
                  {user.status}
                </AppText>
              </View>

              <MapPin
                size={40}
                color={getStatusColor(user.status)}
                fill={getStatusColor(user.status)}
              />
            </View>
          </Marker>
        ))}
        {currentLocation && (
          <Marker
            key="current"
            coordinate={{
              latitude: currentLocation.current.lat,
              longitude: currentLocation.current.lon,
            }}
          >
            <View>
              <MapPin
                size={40}
                color={theme.colors.primary}
                fill={theme.colors.primary}
              />
            </View>
          </Marker>
        )}
      </MapView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle} weight="bold">
                {selectedCustomer?.name}
              </AppText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <AppText style={{ marginBottom: 8, fontWeight: "bold" }}>
                Status
              </AppText>
              <View style={styles.statusContainer}>
                {customerStatus.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusButton,
                      status === s && styles.statusButtonSelected,
                    ]}
                    onPress={() => setStatus(s)}
                  >
                    <AppText
                      style={[
                        styles.statusButtonText,
                        status === s && styles.statusButtonTextSelected,
                      ]}
                    >
                      {s}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>

              <AppInput
                label="Notas"
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={4}
                style={styles.textArea}
                placeholder="Adicione uma nota..."
              />

              <AppButton
                onPress={handleUpdate}
                isLoading={isPending}
                style={{ marginTop: 16 }}
              >
                <AppText style={{ color: "white", fontWeight: "bold" }}>
                  Salvar Alterações
                </AppText>
              </AppButton>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <TouchableOpacity
        style={styles.fab}
        onPress={setRegionToCurrentLocation}
        activeOpacity={0.7}
      >
        <Locate size={24} color={theme.colors.primary} />
      </TouchableOpacity>
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
  markerContainer: {
    alignItems: "center",
  },
  bubble: {
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    gap: 4,
  },
  name: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.colors.text.primary,
  },
  status: {
    fontSize: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text.primary,
  },
  statusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  statusButtonText: {
    fontSize: 12,
    color: theme.colors.text.primary,
  },
  statusButtonTextSelected: {
    color: "white",
    fontWeight: "bold",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
});
