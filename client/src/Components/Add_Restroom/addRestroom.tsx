import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from "../../firebase.ts";
import {collection, addDoc, serverTimestamp, } from 'firebase/firestore'
import './addRestroom.css';

function AddRestroom() {
    let navigate = useNavigate();

  const [formState, setFormState] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    country: '',
    accessible: '',
    unisex: '',
    changingTable: '',
    directions: '',
    comments: '',
    created_at: '',
    latitude: '',
    longitude: '',
    thumbs_up: 0,
    thumbs_down: 0
  });

  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formState);
    try {
      const { street, city, state, country } = formState;
      const address = `${street}, ${city}, ${state}, ${country}`;
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyDLRmzWGSVuOYRHHFJ0vrEApxLuSVVgf1o`;
      const response = await fetch(geocodeUrl);
      const data = await response.json();

      if (data.results.length > 0) {
        const location = data.results[0].geometry.location;
        const latitude = location.lat;
        const longitude = location.lng;
        const timestamp = serverTimestamp();
        const formDataWithTimestamp = { ...formState, latitude, longitude, created_at: timestamp }
        const docRef = await addDoc(collection(db, 'restrooms'), formDataWithTimestamp);
        console.log("Document written with ID: ", docRef.id);
        navigate('/dashboard');
      } else {
        console.error("Error geocoding address: Address not found");
      }
  } catch (error) {
      console.error("Error adding document: ", error);
  }
  };

  return (
    <div className="add-restroom-container">
    <form onSubmit={handleSubmit} className="add-restroom-form">
      <h2>Submit a Restroom</h2>
      <label>Name:<input type="text" name="name" value={formState.name} onChange={handleChange} required /></label>
      <label>Street:<input type="text" name="street" value={formState.street} onChange={handleChange} required /></label>
      <label>City:<input type="text" name="city" value={formState.city} onChange={handleChange} required /></label>
      <label>State:<input type="text" name="state" value={formState.state} onChange={handleChange} required /></label>
      <label>Country:<input type="text" name="country" value={formState.country} onChange={handleChange} required /></label>
      <label>Accessible:<select name="accessible" value={formState.accessible} onChange={handleChange} required>
          <option value="">Select Option</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
      </select></label>
      <label>Unisex:<select name="unisex" value={formState.unisex} onChange={handleChange} required>
          <option value="">Select Option</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
      </select></label>
      <label>Changing Table:<select name="changingTable" value={formState.changingTable} onChange={handleChange} required>
          <option value="">Select Option</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
      </select></label>
      <label>
      Directions:
      <textarea name="directions" placeholder="Second floor in the back..., etc." onChange={handleChange}></textarea>
      </label>
      <label>
      Comment:
      <textarea name="comments" placeholder="Have to be a paying customer..., etc." onChange={handleChange}></textarea>
      </label>
        <div className="form-actions">
          <button type="submit">Save Restroom</button>
          <button type="button" onClick={() => navigate('/')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddRestroom;
