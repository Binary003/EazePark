import React, { useState } from "react";

const ProviderRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    price: "",
    image: null,
  });

  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleLocationFetch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const address = data.display_name || `${latitude}, ${longitude}`;
          setFormData((prev) => ({ ...prev, location: address }));
        } catch (error) {
          alert("Unable to fetch address. Try again.");
        }
      });
    } else {
      alert("Geolocation not supported.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, phone, location, price, image } = formData;
    if (!name || !email || !phone || !location || !price || !image) {
      alert("❌ Please fill in all fields.");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/provider-register`,
        {
          method: "POST",
          body: data,
        }
      );

      const text = await response.text();

      let result;
      try {
        result = JSON.parse(text);
      } catch {
        console.error("❌ Failed to parse JSON:", text);
        throw new Error("Invalid server response");
      }

      if (response.ok) {
        setSubmitStatus("success");
        alert("✅ Registration successful!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          location: "",
          price: "",
          image: null,
        });
      } else {
        setSubmitStatus("error");
        alert(result?.error || "❌ Registration failed.");
      }
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      setSubmitStatus("error");
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-yellow-50">
      {/* Left Image */}
      <div className="w-1/2 hidden md:flex flex-col items-center justify-center p-8">
        <img
          src="/register.png"
          alt="Register Illustration"
          className="rounded-lg shadow-lg w-11/12 object-contain"
        />
        <h1 className="text-4xl font-bold mt-6 text-center">
          Earn by Listing Your Parking Space
        </h1>
        <p className="text-center text-gray-700 mt-3 text-lg max-w-md">
          Monetize your idle parking space, and earn monthly income
        </p>
      </div>

      {/* Right Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-yellow-50 border-l-4 border-black p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Register Your Parking Space
        </h1>

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
          <input
            type="text"
            name="name"
            placeholder="Your Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border border-black rounded-md"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-black rounded-md"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-3 border border-black rounded-md"
          />
          <div className="flex space-x-2">
            <input
              type="text"
              name="location"
              placeholder="Parking Location"
              value={formData.location}
              onChange={handleChange}
              className="flex-grow p-3 border border-black rounded-md"
            />
            <button
              type="button"
              onClick={handleLocationFetch}
              className="bg-yellow-500 text-white px-4 rounded-md hover:bg-yellow-600"
              title="Detect location"
            >
              📍
            </button>
          </div>
          <input
            type="number"
            name="price"
            placeholder="Price per hour"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-3 border border-black rounded-md"
          />
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="w-full p-2 border border-black rounded-md"
          />

          <button
            type="submit"
            className="w-full p-3 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600"
          >
            Submit Registration
          </button>
        </form>

        {submitStatus === "success" && (
          <p className="text-green-700 mt-4">Registration successful!</p>
        )}
        {submitStatus === "error" && (
          <p className="text-red-600 mt-4">
            Failed to register. Please try again.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProviderRegister;
