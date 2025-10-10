import React, { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaDirections, FaRegBookmark } from "react-icons/fa";
import Navbar from "./Navbar"; // Update path if needed

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const MapPage = () => {
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState("");
  const [mapCenter, setMapCenter] = useState(null);
  const [parkingLocations, setParkingLocations] = useState([]);
  const [providerLocations, setProviderLocations] = useState([]); // ✅ New state
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const userId =
    sessionStorage.getItem("userId") || localStorage.getItem("userId");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setUserLocation([lat, lon]);
        setMapCenter([lat, lon]);
        fetchParkingLocations(lat, lon);
        fetchProviderLocations(lat, lon); // Pass coordinates to filter nearby providers
      },
      () => {
        const defaultCoords = [28.6139, 77.209];
        setUserLocation(defaultCoords);
        setMapCenter(defaultCoords);
        fetchParkingLocations(defaultCoords[0], defaultCoords[1]);
        fetchProviderLocations(defaultCoords[0], defaultCoords[1]); // Pass coordinates to filter nearby providers
      }
    );
  }, []);

  const fetchParkingLocations = async (lat, lon) => {
    setLoading(true);
    const radius = 0.05;
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node["amenity"="parking"](${
      lat - radius
    },${lon - radius},${lat + radius},${lon + radius});out;`;

    try {
      const response = await fetch(overpassUrl);
      
      // Handle rate limiting from Overpass API
      if (response.status === 429) {
        console.log("Overpass API rate limited, using fallback data");
        setParkingLocations([]);
        return;
      }
      
      const data = await response.json();
      
      if (data.elements) {
        // Limit to first 6 parking spots to reduce API load
        const limitedElements = data.elements.slice(0, 6);
        const locations = [];
        
        // Process sequentially to avoid rate limiting
        for (let i = 0; i < limitedElements.length; i++) {
          const node = limitedElements[i];
          
          try {
            // Get real location name with better error handling
            const locationName = await fetchLocationName(node.lat, node.lon);
            
            locations.push({ 
              id: node.id, 
              lat: node.lat, 
              lon: node.lon, 
              name: locationName || `Parking Area ${i + 1}`
            });
            
            // Longer delay between API calls to prevent rate limiting
            if (i < limitedElements.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          } catch (error) {
            // Fallback if individual location fetch fails
            locations.push({ 
              id: node.id, 
              lat: node.lat, 
              lon: node.lon, 
              name: `Parking Area ${i + 1}`
            });
          }
        }
        
        setParkingLocations(locations);
      }
    } catch (error) {
      console.error("Error fetching parking locations:", error);
      // Set empty array on error to avoid crashes
      setParkingLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderLocations = async (centerLat = null, centerLon = null) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/providers`
      );
      const data = await response.json();

      // Calculate distance between two points in kilometers
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      // Validate and filter provider data
      const formatted = data
        .map((provider, index) => {
          // Check if provider has coordinates (new format)
          if (provider.coordinates) {
            const parts = provider.coordinates.split(",");
            if (parts.length === 2) {
              const lat = parseFloat(parts[0]);
              const lon = parseFloat(parts[1]);

              if (!isNaN(lat) && !isNaN(lon)) {
                return {
                  id: `provider-${provider._id || index}`,
                  lat,
                  lon,
                  name: provider.name,
                  address: provider.displayAddress || provider.location,
                  price: provider.price,
                  phone: provider.phone,
                  email: provider.email,
                  imageUrl: provider.imageUrl,
                  type: "provider",
                };
              }
            }
          }

          // Fallback for old format (if any old data exists)
          if (provider.location && provider.location.includes(",")) {
            const parts = provider.location.split(",");
            if (parts.length === 2) {
              const lat = parseFloat(parts[0]);
              const lon = parseFloat(parts[1]);

              if (!isNaN(lat) && !isNaN(lon)) {
                return {
                  id: `provider-${provider._id || index}`,
                  lat,
                  lon,
                  name: provider.name,
                  address: provider.location,
                  price: provider.price,
                  phone: provider.phone,
                  email: provider.email,
                  imageUrl: provider.imageUrl,
                  type: "provider",
                };
              }
            }
          }

          return null; // Skip invalid entries
        })
        .filter(Boolean) // Remove null entries
        .filter((provider) => {
          // Only show providers within a reasonable radius of current search/location
          if (centerLat && centerLon) {
            const distance = calculateDistance(
              centerLat,
              centerLon,
              provider.lat,
              provider.lon
            );
            
            console.log(`Provider ${provider.name}: ${distance.toFixed(2)}km from search location`);
            
            // Reduced radius to 25km for more precise filtering
            return distance <= 25; // 25km radius
          }
          return false; // Don't show any providers if no center point
        });

      setProviderLocations(formatted);
    } catch (error) {
      console.error("Error fetching provider locations:", error);
    }
  };

  const fetchLocationName = async (lat, lon) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "EazePark/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Create a meaningful location name from address components
      if (data.address) {
        const components = [];
        
        // Add specific place name if available
        if (data.address.amenity) components.push(data.address.amenity);
        if (data.address.building) components.push(data.address.building);
        if (data.address.shop) components.push(data.address.shop);
        
        // Add area information
        const area = data.address.neighbourhood || 
                    data.address.suburb || 
                    data.address.city_district ||
                    data.address.village ||
                    data.address.town;
                    
        if (area) components.push(area);
        
        // Add city if different from area
        if (data.address.city && data.address.city !== area) {
          components.push(data.address.city);
        }
        
        if (components.length > 0) {
          return components.slice(0, 2).join(", "); // Limit to 2 components
        }
      }
      
      // Fallback to display name
      if (data.display_name) {
        const parts = data.display_name.split(",");
        return parts.slice(0, 2).join(",").trim();
      }
      
      return null; // Return null to use fallback naming
    } catch (error) {
      console.log("Location name fetch failed:", error.message);
      return null; // Return null to use fallback naming
    }
  };

  const handleSearch = async () => {
    if (!searchLocation.trim()) {
      alert("Please enter a valid location.");
      return;
    }

    setLoading(true);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      searchLocation
    )}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.length === 0) {
        alert("Location not found. Try another search.");
        setLoading(false);
        return;
      }

      const newCenter = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      setMapCenter(newCenter);
      fetchParkingLocations(newCenter[0], newCenter[1]);
      fetchProviderLocations(newCenter[0], newCenter[1]); // Also fetch nearby providers when searching
    } catch (error) {
      console.error("Error fetching search location:", error);
      alert("Failed to fetch location. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (parkingSpot) => {
    if (!userId) {
      alert("User not logged in. Please log in first.");
      return;
    }

    if (!userLocation) {
      alert("User location not available");
      return;
    }

    const bookingData = {
      userId,
      userLat: userLocation[0],
      userLon: userLocation[1],
      parkingId: parkingSpot.id,
      parkingLat: parkingSpot.lat,
      parkingLon: parkingSpot.lon,
      parkingName: parkingSpot.name,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/book-parking`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData),
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log("Booking successful:", data);
        navigate("/vehicledetails", { state: { parkingSpot } });
      } else {
        alert(data.error || "Booking failed");
      }
    } catch (error) {
      console.error("Error booking parking:", error);
      alert("Booking failed");
    }
  };

  const handleNavigate = (lat, lon) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      {/* Enhanced Search Bar */}
      <div className="lg:pt-6 pt-4 px-4 lg:px-6">
        <div className="max-w-6xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex items-center bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl p-2 border border-white/20"
          >
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search for parking locations..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full pl-6 pr-12 py-4 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none text-lg"
              />
              <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center space-x-2 whitespace-nowrap ${
                loading
                  ? "opacity-75 cursor-not-allowed"
                  : "hover:from-blue-600 hover:to-indigo-700"
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <FaSearch />
              )}
              <span className="font-semibold hidden sm:inline">Search</span>
            </button>
          </form>
        </div>
      </div>

      {/* Map Container with Modern Design */}
      <div className="px-4 lg:px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="h-[70vh] relative">
              {loading ? (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-6"></div>
                    <p className="text-gray-600 font-semibold text-lg">
                      Finding parking spots...
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Searching in your area
                    </p>
                  </div>
                </div>
              ) : (
                mapCenter && (
                  <MapContainer
                    center={mapCenter}
                    zoom={14}
                    style={{ width: "100%", height: "100%" }}
                    className="z-10 rounded-3xl"
                  >
                    <MapUpdater center={mapCenter} />
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {userLocation && (
                      <Marker position={userLocation}>
                        <Popup className="custom-popup">
                          <div className="text-center p-2">
                            <strong className="text-blue-600">
                              📍 Your Location
                            </strong>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                    {parkingLocations.map((location) => (
                      <Marker
                        key={location.id}
                        position={[location.lat, location.lon]}
                        icon={L.icon({
                          iconUrl:
                            "https://cdn-icons-png.flaticon.com/512/3448/3448732.png",
                          iconSize: [32, 32],
                        })}
                      >
                        <Popup className="custom-popup">
                          <div className="p-3 min-w-[220px]">
                            <h3 className="font-bold text-gray-800 mb-3">
                              🅿️ {location.name}
                            </h3>
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  handleNavigate(location.lat, location.lon)
                                }
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1 transform hover:scale-105"
                              >
                                <FaDirections size={14} />
                                <span>Navigate</span>
                              </button>
                              <button
                                onClick={() => handleBook(location)}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1 transform hover:scale-105"
                              >
                                <FaRegBookmark size={14} />
                                <span>Book</span>
                              </button>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                    {providerLocations.map((provider) => {
                      if (
                        !provider ||
                        typeof provider.lat !== "number" ||
                        typeof provider.lon !== "number" ||
                        isNaN(provider.lat) ||
                        isNaN(provider.lon)
                      ) {
                        return null;
                      }
                      return (
                        <Marker
                          key={provider.id}
                          position={[provider.lat, provider.lon]}
                          icon={L.icon({
                            iconUrl:
                              "https://cdn-icons-png.flaticon.com/512/25/25694.png", // Different icon for providers
                            iconSize: [35, 35],
                          })}
                        >
                          <Popup className="custom-popup">
                            <div className="p-3 min-w-[250px]">
                              <div className="text-center mb-3">
                                <h3 className="font-bold text-lg text-purple-600 mb-1">
                                  🏢 {provider.name}
                                </h3>
                                <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-semibold">
                                  Private Parking
                                </span>
                              </div>

                              <div className="space-y-2 text-sm">
                                <div className="flex items-start space-x-2">
                                  <span className="text-gray-500">📍</span>
                                  <span className="text-gray-700 flex-1">
                                    {provider.address}
                                  </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-500">💰</span>
                                  <span className="text-gray-700 font-semibold">
                                    ₹{provider.price}/hour
                                  </span>
                                </div>

                                {provider.phone && (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-500">📞</span>
                                    <span className="text-gray-700">
                                      {provider.phone}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex space-x-2 mt-3">
                                <button
                                  onClick={() =>
                                    handleNavigate(provider.lat, provider.lon)
                                  }
                                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1 transform hover:scale-105"
                                >
                                  <FaDirections size={14} />
                                  <span>Navigate</span>
                                </button>
                                <button
                                  onClick={() => handleBook(provider)}
                                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1 transform hover:scale-105"
                                >
                                  <FaRegBookmark size={14} />
                                  <span>Book</span>
                                </button>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Parking Spots List */}
      <div className="max-w-6xl mx-auto px-4 lg:px-6 pb-32 lg:pb-24">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Available Parking Spots
          </h2>
          <p className="text-gray-600 text-lg">
            Found{" "}
            <span className="font-semibold text-blue-600">
              {parkingLocations.length}
            </span>{" "}
            public spots and{" "}
            <span className="font-semibold text-purple-600">
              {providerLocations.length}
            </span>{" "}
            private spots
          </p>
        </div>

        {/* Public Parking Locations */}
        {parkingLocations.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-bold text-gray-700 mb-6 flex items-center space-x-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span>Public Parking (Free)</span>
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {parkingLocations.map((location) => (
                <div
                  key={location.id}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/40 hover:border-blue-200"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">
                        🅿️ {location.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        Available now
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full font-medium">
                          Free
                        </span>
                        <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
                          Public
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleNavigate(location.lat, location.lon)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105 shadow-lg"
                    >
                      <FaDirections size={16} />
                      <span>Navigate</span>
                    </button>
                    <button
                      onClick={() => handleBook(location)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105 shadow-lg"
                    >
                      <FaRegBookmark size={16} />
                      <span>Book</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Provider Parking Locations */}
        {providerLocations.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-bold text-gray-700 mb-6 flex items-center space-x-2">
              <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
              <span>Private Parking (Paid)</span>
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {providerLocations.map((provider) => (
                <div
                  key={provider.id}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/40 hover:border-purple-200"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">
                        🏢 {provider.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                        {provider.address}
                      </p>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-xs text-purple-600 bg-purple-100 px-3 py-1 rounded-full font-medium">
                          ₹{provider.price}/hr
                        </span>
                        <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
                          Private
                        </span>
                      </div>
                      {provider.phone && (
                        <p className="text-xs text-gray-500">
                          📞 {provider.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleNavigate(provider.lat, provider.lon)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105 shadow-lg"
                    >
                      <FaDirections size={16} />
                      <span>Navigate</span>
                    </button>
                    <button
                      onClick={() => handleBook(provider)}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105 shadow-lg"
                    >
                      <FaRegBookmark size={16} />
                      <span>Book</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {parkingLocations.length === 0 &&
          providerLocations.length === 0 &&
          !loading && (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">🚗</div>
              <h3 className="text-2xl font-bold text-gray-600 mb-4">
                No parking spots found
              </h3>
              <p className="text-gray-500 text-lg">
                Try searching for a different location or area
              </p>
              <button
                onClick={() => {
                  if (userLocation) {
                    setMapCenter(userLocation);
                    fetchParkingLocations(userLocation[0], userLocation[1]);
                  }
                }}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Search Near Me
              </button>
            </div>
          )}
      </div>
    </div>
  );
};

export default MapPage;
