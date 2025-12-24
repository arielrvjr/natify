# @natify/geolocation-rn

Geolocation adapter for Natify Framework using `@react-native-community/geolocation`.

## Installation

```bash
pnpm add @natify/geolocation-rn @react-native-community/geolocation
```

### iOS

Add permission in `ios/YourApp/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show nearby places</string>

<!-- Optional: For background location -->
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>We need your location to track your location in real time</string>
```

Then:

```bash
cd ios && pod install && cd ..
```

### Android

Add permission in `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

## Usage

### Provider Configuration

```typescript
import { NatifyProvider } from "@natify/core";
import { RnGeolocationAdapter } from "@natify/geolocation-rn";
import { RnPermissionsAdapter } from "@natify/permissions-rn";

const config = {
  geolocation: new RnGeolocationAdapter(),
  permissions: new RnPermissionsAdapter(),
  // ... other adapters
};

function App() {
  return (
    <NatifyProvider config={config}>
      <MyApp />
    </NatifyProvider>
  );
}
```

## Get Current Location

### Basic Usage

```typescript
import { useAdapter, GeolocationPort } from "@natify/core";

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

### With Accuracy Options

```typescript
// High accuracy (GPS)
const location = await locationService.getCurrentPosition({
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 0, // Always get new location
});

// Low accuracy (faster, less battery)
const location = await locationService.getCurrentPosition({
  enableHighAccuracy: false,
  timeout: 10000,
  maximumAge: 60000, // Accept location up to 1 minute old
});
```

### With Permission Check

```typescript
import { useAdapter, GeolocationPort, PermissionPort, PermissionStatus } from "@natify/core";

function LocationButton() {
  const geolocation = useAdapter<GeolocationPort>("geolocation");
  const permissions = useAdapter<PermissionPort>("permissions");

  const requestLocation = async () => {
    // Check permission
    const status = await permissions.check("location");
    
    if (status !== PermissionStatus.GRANTED) {
      // Request permission
      const newStatus = await permissions.request("location");
      if (newStatus !== PermissionStatus.GRANTED) {
        alert("Location permission required");
        return;
      }
    }

    // Check if service is enabled
    const isEnabled = await geolocation.isLocationEnabled();
    if (!isEnabled) {
      alert("Please enable location services");
      return;
    }

    // Get location
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

## Watch Location Changes

### Simple Watch Position

```typescript
function LocationTracker() {
  const geolocation = useAdapter<GeolocationPort>("geolocation");
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  useEffect(() => {
    const stopWatching = geolocation.watchPosition((newLocation) => {
      setCurrentLocation(newLocation);
      console.log("New location:", newLocation);
    });

    // Cleanup on unmount
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

### With Distance Filter

```typescript
// Only update if device moves more than 10 meters
const stopWatching = geolocation.watchPosition(
  (newLocation) => {
    console.log("Location updated:", newLocation);
  },
  {
    enableHighAccuracy: true,
    distanceFilter: 10, // 10 meters
    interval: 5000, // Minimum 5 seconds between updates
  }
);
```

### For Real-Time Navigation

```typescript
function NavigationScreen() {
  const geolocation = useAdapter<GeolocationPort>("geolocation");
  const [route, setRoute] = useState<Location[]>([]);

  useEffect(() => {
    const stopWatching = geolocation.watchPosition(
      (newLocation) => {
        // Add to route
        setRoute((prev) => [...prev, newLocation]);
        
        // Update map
        updateMapMarker(newLocation);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 5, // Update every 5 meters
        interval: 1000, // Maximum 1 update per second
      }
    );

    return stopWatching;
  }, []);

  return <MapView route={route} />;
}
```

## Calculate Distance

### Distance Between Two Points

```typescript
const geolocation = useAdapter<GeolocationPort>("geolocation");

// Origin and destination coordinates
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

// Calculate distance in meters
const distance = geolocation.calculateDistance(origin, destination);
console.log(`Distance: ${distance.toFixed(2)} meters`);
console.log(`Distance: ${(distance / 1000).toFixed(2)} kilometers`);
```

### Distance to Multiple Points

```typescript
const findNearestPlace = async (places: Array<{ name: string; coordinates: Coordinates }>) => {
  const currentLocation = await geolocation.getCurrentPosition();
  
  const distances = places.map((place) => ({
    ...place,
    distance: geolocation.calculateDistance(currentLocation, place.coordinates),
  }));

  // Sort by distance
  distances.sort((a, b) => a.distance - b.distance);

  return distances[0]; // Nearest one
};
```

## Calculate Bearing (Direction)

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

// Calculate direction in degrees (0-360)
const bearing = geolocation.calculateBearing(origin, destination);
console.log(`Bearing: ${bearing.toFixed(2)}°`);

// Convert to cardinal direction
const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const direction = directions[Math.round(bearing / 45) % 8];
console.log(`Direction: ${direction}`);
```

## Common Use Cases

### Check If User Is Near a Place

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

### Route Tracking

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
        distanceFilter: 5, // Record every 5 meters
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

### Geofencing (Zone Entry/Exit Detection)

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
        distanceFilter: 10, // Check every 10 meters
      }
    );

    return stopWatching;
  }, [center, radius]);

  return null;
}
```

### Location UseCase

```typescript
import { GeolocationPort } from "@natify/core";

export class GetNearbyPlacesUseCase {
  constructor(private readonly geolocation: GeolocationPort) {}

  async execute(radiusKm: number): Promise<Place[]> {
    // Get current location
    const currentLocation = await this.geolocation.getCurrentPosition({
      enableHighAccuracy: true,
    });

    // Get places from API
    const allPlaces = await this.fetchPlacesFromAPI();

    // Filter by distance
    const nearbyPlaces = allPlaces.filter((place) => {
      const distance = this.geolocation.calculateDistance(
        currentLocation,
        place.coordinates
      );
      return distance <= radiusKm * 1000; // Convert km to meters
    });

    // Sort by distance
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

| Method | Description |
|--------|-------------|
| `getCurrentPosition(options?)` | Gets current location |
| `watchPosition(callback, options?)` | Watches location changes |
| `isLocationEnabled()` | Checks if service is enabled |
| `calculateDistance(from, to)` | Calculates distance in meters |
| `calculateBearing(from, to)` | Calculates direction in degrees |

### LocationOptions

```typescript
interface LocationOptions {
  enableHighAccuracy?: boolean; // default: true
  timeout?: number; // default: 15000 (15 seconds)
  maximumAge?: number; // default: 0 (always new)
}
```

### WatchLocationOptions

```typescript
interface WatchLocationOptions extends LocationOptions {
  distanceFilter?: number; // default: 0 (all updates)
  interval?: number; // default: 1000 (1 second)
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

## Notes

- **Permissions**: Always check and request permissions before using location
- **Battery**: Use `enableHighAccuracy: false` and `distanceFilter` to save battery
- **Accuracy**: `enableHighAccuracy: true` uses GPS (more accurate but consumes more battery)
- **Timeout**: Set a reasonable timeout to avoid infinite waits
- **Watch Position**: Always clean up watchers in `useEffect` cleanup
- **iOS**: Requires configuration in `Info.plist`
- **Android**: Requires permissions in `AndroidManifest.xml`

## Module Integration

```typescript
import { createModule } from "@natify/core";
import { GetNearbyPlacesUseCase } from "./usecases/GetNearbyPlacesUseCase";

export const PlacesModule = createModule("places", "Places")
  .requires("geolocation", "permissions")
  .useCase("getNearbyPlaces", (adapters) => {
    return new GetNearbyPlacesUseCase(adapters.geolocation);
  })
  .build();
```
