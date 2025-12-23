# @nativefy/geolocation-rn

Adapter de geolocalización para Nativefy Framework usando `@react-native-community/geolocation`.

## Instalación

```bash
pnpm add @nativefy/geolocation-rn @react-native-community/geolocation
```

### iOS

Agrega el permiso en `ios/YourApp/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Necesitamos tu ubicación para mostrarte lugares cercanos</string>

<!-- Opcional: Para ubicación en background -->
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Necesitamos tu ubicación para rastrear tu ubicación en tiempo real</string>
```

Luego:

```bash
cd ios && pod install && cd ..
```

### Android

Agrega el permiso en `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

## Uso

### Configuración del Provider

```typescript
import { NativefyProvider } from "@nativefy/core";
import { RnGeolocationAdapter } from "@nativefy/geolocation-rn";
import { RnPermissionsAdapter } from "@nativefy/permissions-rn";

const config = {
  geolocation: new RnGeolocationAdapter(),
  permissions: new RnPermissionsAdapter(),
  // ... otros adapters
};

function App() {
  return (
    <NativefyProvider config={config}>
      <MyApp />
    </NativefyProvider>
  );
}
```

## Obtener Ubicación Actual

### Uso Básico

```typescript
import { useAdapter, GeolocationPort } from "@nativefy/core";

function MyComponent() {
  const geolocation = useAdapter<GeolocationPort>("geolocation");

  const getCurrentLocation = async () => {
    try {
      const currentLocation = await geolocation.getCurrentPosition();
      console.log("Latitude:", currentLocation.latitude);
      console.log("Longitude:", currentLocation.longitude);
      console.log("Accuracy:", currentLocation.accuracy, "meters");
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  return <Button onPress={getCurrentLocation} title="Get Location" />;
}
```

### Con Opciones de Precisión

```typescript
// Alta precisión (GPS)
const location = await locationService.getCurrentPosition({
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 0, // Siempre obtener nueva ubicación
});

// Baja precisión (más rápido, menos batería)
const location = await locationService.getCurrentPosition({
  enableHighAccuracy: false,
  timeout: 10000,
  maximumAge: 60000, // Aceptar ubicación de hasta 1 minuto
});
```

### Con Verificación de Permisos

```typescript
import { useAdapter, GeolocationPort, PermissionPort, PermissionStatus } from "@nativefy/core";

function LocationButton() {
  const geolocation = useAdapter<GeolocationPort>("geolocation");
  const permissions = useAdapter<PermissionPort>("permissions");

  const requestLocation = async () => {
    // Verificar permiso
    const status = await permissions.check("location");
    
    if (status !== PermissionStatus.GRANTED) {
      // Solicitar permiso
      const newStatus = await permissions.request("location");
      if (newStatus !== PermissionStatus.GRANTED) {
        alert("Se necesita permiso de ubicación");
        return;
      }
    }

    // Verificar si el servicio está habilitado
    const isEnabled = await geolocation.isLocationEnabled();
    if (!isEnabled) {
      alert("Por favor activa el servicio de ubicación");
      return;
    }

    // Obtener ubicación
    try {
      const currentLocation = await geolocation.getCurrentPosition();
      console.log("Location:", currentLocation);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return <Button onPress={requestLocation} title="Get Location" />;
}
```

## Observar Cambios de Ubicación

### Watch Position Simple

```typescript
function LocationTracker() {
  const geolocation = useAdapter<GeolocationPort>("geolocation");
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  useEffect(() => {
    const stopWatching = geolocation.watchPosition((newLocation) => {
      setCurrentLocation(newLocation);
      console.log("New location:", newLocation);
    });

    // Limpiar al desmontar
    return stopWatching;
  }, []);

  return (
    <View>
      {currentLocation && (
        <Text>
          Lat: {currentLocation.latitude}, Lng: {currentLocation.longitude}
        </Text>
      )}
    </View>
  );
}
```

### Con Filtro de Distancia

```typescript
// Solo actualizar si el dispositivo se mueve más de 10 metros
const stopWatching = geolocation.watchPosition(
  (newLocation) => {
    console.log("Location updated:", newLocation);
  },
  {
    enableHighAccuracy: true,
    distanceFilter: 10, // 10 metros
    interval: 5000, // Mínimo 5 segundos entre actualizaciones
  }
);
```

### Para Navegación en Tiempo Real

```typescript
function NavigationScreen() {
  const geolocation = useAdapter<GeolocationPort>("geolocation");
  const [route, setRoute] = useState<Location[]>([]);

  useEffect(() => {
    const stopWatching = geolocation.watchPosition(
      (newLocation) => {
        // Agregar a la ruta
        setRoute((prev) => [...prev, newLocation]);
        
        // Actualizar mapa
        updateMapMarker(newLocation);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 5, // Actualizar cada 5 metros
        interval: 1000, // Máximo 1 actualización por segundo
      }
    );

    return stopWatching;
  }, []);

  return <MapView route={route} />;
}
```

## Calcular Distancia

### Distancia Entre Dos Puntos

```typescript
const geolocation = useAdapter<GeolocationPort>("geolocation");

// Coordenadas de origen y destino
const origin: Coordinates = {
  latitude: 40.7128,
  longitude: -74.0060,
  accuracy: 10,
};

const destination: Coordinates = {
  latitude: 40.7589,
  longitude: -73.9851,
  accuracy: 10,
};

// Calcular distancia en metros
const distance = geolocation.calculateDistance(origin, destination);
console.log(`Distance: ${distance.toFixed(2)} meters`);
console.log(`Distance: ${(distance / 1000).toFixed(2)} kilometers`);
```

### Distancia a Múltiples Puntos

```typescript
const findNearestPlace = async (places: Array<{ name: string; coordinates: Coordinates }>) => {
  const currentLocation = await geolocation.getCurrentPosition();
  
  const distances = places.map((place) => ({
    ...place,
    distance: geolocation.calculateDistance(currentLocation, place.coordinates),
  }));

  // Ordenar por distancia
  distances.sort((a, b) => a.distance - b.distance);

  return distances[0]; // El más cercano
};
```

## Calcular Bearing (Dirección)

```typescript
const geolocation = useAdapter<GeolocationPort>("geolocation");

const origin: Coordinates = {
  latitude: 40.7128,
  longitude: -74.0060,
  accuracy: 10,
};

const destination: Coordinates = {
  latitude: 40.7589,
  longitude: -73.9851,
  accuracy: 10,
};

// Calcular dirección en grados (0-360)
const bearing = geolocation.calculateBearing(origin, destination);
console.log(`Bearing: ${bearing.toFixed(2)}°`);

// Convertir a dirección cardinal
const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const direction = directions[Math.round(bearing / 45) % 8];
console.log(`Direction: ${direction}`);
```

## Casos de Uso Comunes

### Verificar Si el Usuario Está Cerca de un Lugar

```typescript
const checkIfNearPlace = async (
  placeCoordinates: Coordinates,
  radiusMeters: number
): Promise<boolean> => {
  const currentLocation = await geolocation.getCurrentPosition();
  const distance = geolocation.calculateDistance(currentLocation, placeCoordinates);
  
  return distance <= radiusMeters;
};
```

### Rastreo de Ruta (Tracking)

```typescript
function RouteTracker() {
  const geolocation = useAdapter<GeolocationPort>("geolocation");
  const [route, setRoute] = useState<Location[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const stopWatchingRef = useRef<(() => void) | null>(null);

  const startTracking = () => {
    setIsTracking(true);
    setRoute([]);

    stopWatchingRef.current = geolocation.watchPosition(
      (newLocation) => {
        setRoute((prev) => [...prev, newLocation]);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 5, // Registrar cada 5 metros
        interval: 2000,
      }
    );
  };

  const stopTracking = () => {
    setIsTracking(false);
    stopWatchingRef.current?.();
    stopWatchingRef.current = null;
  };

  const calculateTotalDistance = () => {
    if (route.length < 2) return 0;

    let total = 0;
    for (let i = 1; i < route.length; i++) {
      total += geolocation.calculateDistance(route[i - 1], route[i]);
    }

    return total;
  };

  return (
    <View>
      <Button
        title={isTracking ? "Stop Tracking" : "Start Tracking"}
        onPress={isTracking ? stopTracking : startTracking}
      />
      {route.length > 0 && (
        <Text>Distance: {(calculateTotalDistance() / 1000).toFixed(2)} km</Text>
      )}
    </View>
  );
}
```

### Geofencing (Detección de Entrada/Salida de Zona)

```typescript
function GeofenceMonitor({ center, radius }: { center: Coordinates; radius: number }) {
  const geolocation = useAdapter<GeolocationPort>("geolocation");
  const [isInside, setIsInside] = useState(false);

  useEffect(() => {
    const stopWatching = geolocation.watchPosition(
      (newLocation) => {
        const distance = geolocation.calculateDistance(newLocation, center);
        const inside = distance <= radius;

        if (inside !== isInside) {
          setIsInside(inside);
          if (inside) {
            console.log("Entered geofence!");
            onEnterGeofence();
          } else {
            console.log("Exited geofence!");
            onExitGeofence();
          }
        }
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Verificar cada 10 metros
      }
    );

    return stopWatching;
  }, [center, radius]);

  return null;
}
```

### UseCase de Ubicación

```typescript
import { GeolocationPort } from "@nativefy/core";

export class GetNearbyPlacesUseCase {
  constructor(private readonly geolocation: GeolocationPort) {}

  async execute(radiusKm: number): Promise<Place[]> {
    // Obtener ubicación actual
    const currentLocation = await this.geolocation.getCurrentPosition({
      enableHighAccuracy: true,
    });

    // Obtener lugares desde API
    const allPlaces = await this.fetchPlacesFromAPI();

    // Filtrar por distancia
    const nearbyPlaces = allPlaces.filter((place) => {
      const distance = this.geolocation.calculateDistance(
        currentLocation,
        place.coordinates
      );
      return distance <= radiusKm * 1000; // Convertir km a metros
    });

    // Ordenar por distancia
    nearbyPlaces.sort((a, b) => {
      const distA = this.geolocation.calculateDistance(currentLocation, a.coordinates);
      const distB = this.geolocation.calculateDistance(currentLocation, b.coordinates);
      return distA - distB;
    });

    return nearbyPlaces;
  }
}
```

## API

### GeolocationPort

| Método | Descripción |
|--------|-------------|
| `getCurrentPosition(options?)` | Obtiene ubicación actual |
| `watchPosition(callback, options?)` | Observa cambios de ubicación |
| `isLocationEnabled()` | Verifica si el servicio está habilitado |
| `calculateDistance(from, to)` | Calcula distancia en metros |
| `calculateBearing(from, to)` | Calcula dirección en grados |

### LocationOptions

```typescript
interface LocationOptions {
  enableHighAccuracy?: boolean; // default: true
  timeout?: number; // default: 15000 (15 segundos)
  maximumAge?: number; // default: 0 (siempre nueva)
}
```

### WatchLocationOptions

```typescript
interface WatchLocationOptions extends LocationOptions {
  distanceFilter?: number; // default: 0 (todas las actualizaciones)
  interval?: number; // default: 1000 (1 segundo)
}
```

### Location

```typescript
interface Location extends Coordinates {
  timestamp: number;
}

interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  verticalAccuracy?: number;
  heading?: number;
  speed?: number;
}
```

## Notas

- **Permisos**: Siempre verifica y solicita permisos antes de usar la ubicación
- **Batería**: Usar `enableHighAccuracy: false` y `distanceFilter` para ahorrar batería
- **Precisión**: `enableHighAccuracy: true` usa GPS (más preciso pero consume más batería)
- **Timeout**: Configura un timeout razonable para evitar esperas infinitas
- **Watch Position**: Siempre limpia los watchers en `useEffect` cleanup
- **iOS**: Requiere configuración en `Info.plist`
- **Android**: Requiere permisos en `AndroidManifest.xml`

## Integración con Módulos

```typescript
import { createModule } from "@nativefy/core";
import { GetNearbyPlacesUseCase } from "./usecases/GetNearbyPlacesUseCase";

export const PlacesModule = createModule("places", "Places")
  .requires("geolocation", "permissions")
  .useCase("getNearbyPlaces", (adapters) => {
    return new GetNearbyPlacesUseCase(adapters.geolocation);
  })
  .build();
```

