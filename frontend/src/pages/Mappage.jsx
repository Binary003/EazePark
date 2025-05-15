import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaDirections, FaRegBookmark } from "react-icons/fa";

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
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const userId =
    sessionStorage.getItem("userId") || localStorage.getItem("userId"); // ✅ Store userId at the start

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setUserLocation([lat, lon]);
        setMapCenter([lat, lon]);
        fetchParkingLocations(lat, lon);
      },
      () => {
        const defaultCoords = [28.6139, 77.209];
        setUserLocation(defaultCoords);
        setMapCenter(defaultCoords);
        fetchParkingLocations(defaultCoords[0], defaultCoords[1]);
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
      const data = await response.json();
      const locations = await Promise.all(
        data.elements.map(async (node) => {
          const name = await fetchLocationName(node.lat, node.lon);
          return { id: node.id, lat: node.lat, lon: node.lon, name };
        })
      );
      setParkingLocations(locations);
    } catch (error) {
      console.error("Error fetching parking locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationName = async (lat, lon) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
      const response = await fetch(url);
      const data = await response.json();
      return data.display_name || "Unknown Location";
    } catch (error) {
      console.error("Error fetching location name:", error);
      return "Unknown Location";
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
      userId, // ✅ Use stored userId instead of fetching from localStorage every time
      userLat: userLocation[0],
      userLon: userLocation[1],
      parkingId: parkingSpot.id,
      parkingLat: parkingSpot.lat,
      parkingLon: parkingSpot.lon,
      parkingName: parkingSpot.name,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/book-parking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

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
    <div className="flex flex-col items-center min-h-screen bg-gray-50 pb-20">
      {/* Search Bar */}
      <div className="w-full p-4 bg-white shadow-lg fixed top-0 z-50 flex">
        <input
          type="text"
          placeholder="Search for places"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          className="flex-grow p-3 border border-gray-300 rounded-l-lg shadow-sm"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-3 bg-blue-600 text-white rounded-r-lg shadow-sm"
        >
          <FaSearch />
        </button>
      </div>

      {/* Map Container */}
      <div className="w-full h-[500px] mt-20 rounded-lg shadow-lg">
        {loading ? (
          <p className="text-center text-gray-500">Loading parking spots...</p>
        ) : (
          mapCenter && (
            <MapContainer
              center={mapCenter}
              zoom={14}
              style={{ width: "100%", height: "100%" }}
            >
              <MapUpdater center={mapCenter} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {userLocation && (
                <Marker position={userLocation}>
                  <Popup>Your Location</Popup>
                </Marker>
              )}
              {parkingLocations.map((location) => (
                <Marker
                  key={location.id}
                  position={[location.lat, location.lon]}
                >
                  <Popup>{location.name}</Popup>
                </Marker>
              ))}
            </MapContainer>
          )
        )}
      </div>

      {/* Parking Spots List */}
      <div className="w-full p-4 mt-4">
        {parkingLocations.map((location) => (
          <div
            key={location.id}
            className="p-4 bg-white shadow-md rounded-lg mb-4 flex justify-between items-center"
          >
            <p>{location.name}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleNavigate(location.lat, location.lon)}
                className="bg-green-500 text-white px-3 py-1 rounded flex items-center"
              >
                <FaDirections className="mr-2" /> Navigate
              </button>
              <button
                onClick={() => handleBook(location)}
                className="bg-blue-600 text-white px-3 py-1 rounded flex items-center"
              >
                <FaRegBookmark className="mr-2" /> Book
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapPage;
