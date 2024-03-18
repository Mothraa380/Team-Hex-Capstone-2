
import React, { useState, useEffect, useRef, useCallback, ReactHTMLElement } from "react";
import { Loader } from '@googlemaps/js-api-loader';
import { Link } from 'react-router-dom';
import "./dashboard.css"; 
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../../Translations/language-selector';

import { db } from "../../firebase.ts";
import {collection, getDocs, } from 'firebase/firestore'


//testing marking 'bathroom' locations
const locationsArray = [
  { address: "908 Granview Drive, Lewisville, TX, USA", distance: 1.1 },
  { address: "2021 Vista Drive, Lewisville, TX, USA", distance: 2.3 },
  { address: "1812 Blair Oak Drive, Lewisville, TX, USA", distance: 0.8 },
  { address: "118 Lynn Avenue, Lewisville, TX, USA", distance: 3.5 },
  { address: "2003 Buffalo Bend Dr lewisville tx", distance: 2.0 },
  { address: "801 W Main St, Lewisville, TX 75067", distance: 4.4 },
  { address: "835 W Main St, Lewisville, TX 75067", distance: 4.4 },
  { address: "1288 W Main Street, Lewisville , TX", distance: 4.4 }
];
let nearbyLocations=[] as { address: string, distance: number }[];
interface MarkerWithInfoWindow extends google.maps.Marker {
  infoWindow: google.maps.InfoWindow;
}
let locationMarkers: MarkerWithInfoWindow[] = []; // Variable to store location markers



//deal with the search bar, map api, and search functions
function SearchLocation(){
  const [dataLoaded, setDataLoaded] = useState(false);
  const [location, setLocation] = useState(''); //location in search bar
  const [opened, setOpen] = useState(false);  //to activate circle radius on map
  const [userPosition, setUserPosition] = useState({ lat: 33.253946, lng: -97.152896 });  //auto set users position
  const [map, setMap] = useState<google.maps.Map | null>(null); //google map api
  const [distance, setDistance] = useState(.5);
  //const [infoWindow, setInfoWindow] = useState(null);
  const isFindTheWayRunning = useRef(false);
  const [searchUpdatedPosition, setSearchUpdatedPosition] = useState(false);
  const [rerenderSavedSales, setRerenderSavedSales] = useState(false);
  const [circle, setCircle] = useState<google.maps.Circle | null>(null);
  const memoizedFindTheWay = useCallback(async (circle, map, userPosition) => {
    try {
      // Your asynchronous logic goes here
      // For example:
      const result = await findTheWay(circle, map, userPosition);
      // Process the result if needed
      return result;
    } catch (error) {
      // Handle errors
      console.error('Error:', error);
    } finally {
      // Finally block executes whether there's an error or not
      // You can perform cleanup or other actions here
      console.log('Finally block executed');
    }
  }, []);
  const [routeBool, setRouteBool] = useState(false);
  let routeIndex = null;

  //nearbyLocations = [];
  console.log("martinnn");

  const findTheWay = async (circle, map, userPosition) => {
    nearbyLocations = [];
  
    if(locationMarkers.length !=0)
    {
      locationMarkers.forEach(marker => {
        console.log('delete');
        // Remove the marker from the map
        marker.setMap(null);
    });
    // Empty the locationMarkers array
      locationMarkers = [];
    }
    const processedAddresses = new Set();
      //if (!processedAddresses.has(location.address)) {
      try {
        // Perform geocoding to convert address to coordinates using a geocoding service
        const restroomSnap = await getDocs(collection(db, "restrooms"));
        await Promise.all(restroomSnap.docs.map(async (doc) => {
          const data = doc.data();
          const street = data.street;
          const city = data.city;
          const state = data.state;
          const country = data.country;
    
          // Concatenate street, city, state, and country to form complete address
          const address = `${street}, ${city}, ${state}, ${country}`;
    
          console.log("Attempting geocoding for address:", address);
    
          // Perform geocoding to convert address to coordinates
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyDLRmzWGSVuOYRHHFJ0vrEApxLuSVVgf1o`
          );
    
          if (response.ok) {
            const geoData = await response.json();
            console.log("Geocoding response:", geoData); // Log the response from geocoding API
            if (geoData.results && geoData.results[0] && geoData.results[0].geometry) {
              const { lat, lng } = geoData.results[0].geometry.location;
    
              // Calculate distance between the location and user's position
              const distance = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(lat, lng),
                new google.maps.LatLng(userPosition.lat, userPosition.lng)
              );
    
              // Check if the location is within the selected radius
              if (distance <= circle.getRadius()) {
                // Push the location to the nearbyLocations array
                const distanceInMiles = parseFloat((distance / 1609.34).toFixed(2));
                nearbyLocations.push({ address, distance: distanceInMiles });

                // const locationName = data.results[0].address_components.find(component =>
                //       component.types.includes('establishment')
                //     )?.long_name || '';
                //     console.log(locationName);
                const marker = new google.maps.Marker({
                      position: { lat, lng },
                      map,
                      title: address,
                      icon: {
                        url: "/assets/marker.PNG",
                        scaledSize: new google.maps.Size(30, 45)
                      }
                    })as MarkerWithInfoWindow;

                    const infoWindow = new google.maps.InfoWindow({
                            content: `<div>${address}</div><div>Distance: ${distanceInMiles} miles</div>`
                          });

                    marker.addListener('click', () => {
                          infoWindow.open(map, marker);
                        });      
                    locationMarkers.push(marker);

              }
            } else {
              console.error("Invalid location:", address);
            }
          } else {
            console.error("Geocoding request failed");
  
          }
        }));
    
        // Sort nearby locations by distance
        nearbyLocations.sort((a, b) => a.distance - b.distance);
        locationMarkers.sort((markerA, markerB) => {
          const locationA = nearbyLocations.find(location => location.address === markerA.getTitle());
          const locationB = nearbyLocations.find(location => location.address === markerB.getTitle());
          if (locationA && locationB) {
              return locationA.distance - locationB.distance;
          } else {
              // Handle cases where a location is not found for a marker
              return 0;
          }
      });
        setDataLoaded(true);
        if(dataLoaded){
          console.log('yooo whats good');
        }
        
        // Log the number of locations found
        console.log("Number of nearby restroom locations:", nearbyLocations.length);
    
      } catch (error) {
        console.error("Error fetching restroom data:", error);
      }
    };


  //load google map api and operate location search functions
  useEffect(() => {

    console.log("BITCCCCHHHHH");
        const loader = new Loader({
          apiKey: 'AIzaSyDLRmzWGSVuOYRHHFJ0vrEApxLuSVVgf1o',
          version: 'weekly',
          libraries: ['places', 'geometry'],
        });
    
        loader.load().then(() => {
          const mapElement = document.getElementById('map');
          const inputElement = document.getElementById('locationInput') as HTMLInputElement;
    
          const mapStyles = [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [
                { visibility: 'off' } //hide all extra markers
              ]
            }
          ];
    
          if (!mapElement || !inputElement || !userPosition) { //if map isnt loaded or input is empty
            return;
          }
          setSearchUpdatedPosition(false);
    
          //setting map info
          let mapInstance;
          if(!routeBool)
          {
            mapInstance = new window.google.maps.Map(mapElement, { 
              center: { lat: 33.253946, lng: -97.152896 },
              zoom: userPosition ? 17 : 1,
              styles: mapStyles
            });
          }
          else
          {
            mapInstance = new window.google.maps.Map(mapElement, { 
              center: userPosition,
              zoom: userPosition ? 17 : 1,
              styles: mapStyles
            });
          }

          setMap(mapInstance);  //store map info 
    
          const searchBox = new window.google.maps.places.SearchBox(inputElement);  //suggest locations based on user input
    
          searchBox.addListener('places_changed', horsie);  //handle search for whichever location user selects
    
          // const searchButton = document.getElementById('searchButton');
          // if (searchButton) {
          //   searchButton.addEventListener('click', handleSearch);
          // }
    
          function horsie() { //search based on user selection
            const places = searchBox.getPlaces(); 
    
            if (!places || places.length === 0) { //if places not loaded or no places shown
              return;
            }

            const place = places[0];  //store place user selected
            if (place.geometry && place.geometry.location) {  //check if location is valid
              setOpen(true);  //allow circle radius to appear
              setLocation(place.formatted_address ?? ''); //store the selected location in user input bar

              //store lat and lng of selected place as users location
              const { lat, lng } = place.geometry.location; 
              const newPosition = { lat: lat(), lng: lng() };
              setUserPosition(newPosition);
              mapInstance.panTo(newPosition); //zoom in to users new position
             
            //   console.log(routeBool, routeIndex);
            //   if(!routeBool || routeIndex===null) return;
            //   console.log("WHORE");
            //   const directionsService = new google.maps.DirectionsService();
            //   const directionsRenderer = new google.maps.DirectionsRenderer();

            //   directionsRenderer.setMap(map);
            //   const position = locationMarkers[routeIndex].getPosition();
            //   let request;

            //   if(position){
            //   request = {
            //     origin: {
            //       lat: userPosition.lat,
            //       lng: userPosition.lng
            //     }, // Use user's position as the origin
            //     destination: {
            //       lat: position.lat(),
            //       lng: position.lng()
            //     },
            //     travelMode: google.maps.TravelMode.DRIVING,
            //   };
            // }

            //   directionsService.route(request, (result, status) => {
            //     if (status === "OK") {
            //       directionsRenderer.setDirections(result);
            //     } else {
            //       console.error("Directions request failed due to " + status);
            //     }
            //   });
            //   setRouteBool(false);
             }
          }
        }).catch(error => { //if map failed to load
          console.error('Error loading Google Maps API:', error);
        });

        console.log('AMMMEEERRRIIICAAAA');
      }, [userPosition, distance, routeBool]); //depends on if userPosition changes

      
  //add markers to map and create circle radius
  useEffect(() => {

    if (!map || !userPosition) return;  //if map failed to load or user position undefined
    if(routeBool) return;
  
    //allow marker for user position after first valid address 
    if(opened){
    map.panTo(userPosition);
    const marker = new google.maps.Marker({
      position: userPosition,
      map: map,
      title: 'Your Location',
      icon: {
        url: "/assets/userMarker.PNG",
        scaledSize: new google.maps.Size(29, 52)
      },
    });
    //locationMarkers.push(marker);
  //   locationMarkers.forEach((marker) => {
  //     const newMarker = new google.maps.Marker({
  //         position: marker.getPosition(),
  //         map: map,
  //         // Set other properties of the marker as needed
  //     });
  //     console.log('horseshit',locationMarkers.length);
  
  //     // Optionally, you can store the new markers in a separate array if needed
  //     // newMarkers.push(newMarker);
  // });
    
    //create circle for map
    if (circle) {
      circle.setMap(null);
    }

    // Create new circle
    const newCircle = new google.maps.Circle({
      map,
      center: userPosition,
      radius: distance * 1609.34, // Convert miles to meters
      fillColor: '#4285F4',
      fillOpacity: 0.2,
      strokeColor: '#4285F4',
      strokeOpacity: 0.8,
      strokeWeight: 2
    });

    // Set the new circle instance
    setCircle(newCircle);

      
          
    // Adjust the map bounds to include the marker and circle
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(marker.getPosition()!);
    bounds.union(newCircle.getBounds()!);
    map.fitBounds(bounds); 

    //add markers for locations within radius
    //findTheWay(circle, map, userPosition);
    if(newCircle !== undefined){

      memoizedFindTheWay(newCircle, map, userPosition);
           

        }

        console.log('horseshit p2',locationMarkers.length); 

//     locationMarkers.forEach((marker) => {
//     const newMarker = new google.maps.Marker({
//         position: marker.getPosition(),
//         map: map,
//         // Set other properties of the marker as needed
//     });

//     // Optionally, you can store the new markers in a separate array if needed
//     // newMarkers.push(newMarker);
// });

    //zoom in 
    const zoomLevel = map.getZoom();
    if (zoomLevel && zoomLevel > 15) {
      map.setZoom(17);
    }
    }

    setRerenderSavedSales(prevState => !prevState);
  
  }, [map]);  // map changes

  useEffect(() => {
    // Perform actions that depend on dataLoaded here
    // For example, you can fetch data or trigger other updates
    // This effect will re-run whenever dataLoaded changes
    if (dataLoaded) {
      // Perform actions here that need to be executed when dataLoaded changes
      console.log('Data loaded!');
      setDataLoaded(false);
      
    }
  }, [dataLoaded]);

  //another handle search function using 'enter' and search button
  const handleSearch = async () => {
    if (location.trim() !== '') { //if location input isnt empty
      console.log('HEYOOOO TEST');
      //request geocode for location
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=AIzaSyDLRmzWGSVuOYRHHFJ0vrEApxLuSVVgf1o`
        );
        
        //if gets response, update user position with data recieved 
        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results[0] && data.results[0].geometry) {
            const { lat, lng } = data.results[0].geometry.location;
            setOpen(true);
            setUserPosition({ lat, lng });
            setSearchUpdatedPosition(true);
            console.log("User position updated successfully!");
          } else {
            console.log(data);
          }
        } else {  //if no response
          console.error("Geocoding request failed");
        }
      } catch (error) { //if error in connecting to googleapis
        console.error("Error during geocoding:", error);
      }
    }
  };

  //handle current location 
  const handleCurrentLocation = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const newPosition = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setOpen(true);
            setUserPosition(newPosition);
            console.log("User position updated successfully:", newPosition);
          },
          (error) => {
            console.error('Error getting user location:', error);
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    } catch (error) {
      console.error('Error getting user location:', error);
    }
  };
  
  const handleEnterKey = (e) => {
          // if (e.key === 'Enter') {
          //   handleSearch(); //call search function with 'enter' key press
          // }
        };

 const testing = (index) => {
   // routeIndex = index;
    console.log("whoisit");
   // setRouteBool(true);
 };
    

        const {t} = useTranslation();
       function SavedSales({ update }) {
          const [dropdownOpenB, setdropdownOpenB] = useState(false);
          const {t} = useTranslation();
          const [savedDistance, setSavedDistance] = useState(.5);
          //setDataLoaded(false);
          console.log("radishes");
        
          const handleDistanceDropdown = () => {
            setdropdownOpenB(!dropdownOpenB); // Toggle the dropdown
            console.log('wassuuuppp guurll');
          };
          const handleDistanceChange = (newDistance) =>{
            setDistance(newDistance);
            setSavedDistance(newDistance);
          };

          const highlightMarker = (index: number) => {
            if (locationMarkers[index]) {
              locationMarkers[index].setAnimation(google.maps.Animation.BOUNCE);
            }
          };
          
          // Function to reset the marker
          const resetMarker = (index: number) => {
            if (locationMarkers[index]) {
              locationMarkers[index].setAnimation(null);
            }
          };

          const handleListItemClick = (index) => {
            // Close any previously opened InfoWindows
            //closeAllInfoWindows();
            
            // Open InfoWindow for the clicked marker
            const marker = locationMarkers[index];
            const infoWindow = marker.infoWindow;
            infoWindow.open(map, marker);
        };
        
        const closeAllInfoWindows = () => {
            locationMarkers.forEach(marker => {
                marker.infoWindow.close();
            });
        };
          return (
            <div className="saved">
            <div className="sidebar-container">
            <div className="sidebar">
                <div className="name">
                {t("global.dashboard.title")}
                  <button className="result-sales-button"><Link to="/create-post" style={{ textDecoration: 'none', color: 'inherit'}}>{t("global.dashboard.addPost")}</Link></button>
                </div>
                <div className="locationSettings">
                  <button className="setDistance"  onClick={handleDistanceDropdown}>
                        <span>Within {distance} miles </span>
                      <img
                          //src="https://i.seadn.io/gcs/files/3085b3fc65f00b28699b43efb4434eec.png?auto=format&dpr=1&w=1000"
                          src="https://static.thenounproject.com/png/551749-200.png"
                          className="open-dropdown"
                          alt=""
                        />
                  </button>
                    <div className={`dropdown-contentB ${dropdownOpenB ? 'flex' : 'hidden'}`}>
                      <span onClick={()=>handleDistanceChange(0.5)}>Within 0.5 miles</span>
                      <span onClick={()=>handleDistanceChange(1.0)}>Within 1.0 miles</span>
                      <span onClick={()=>handleDistanceChange(2.0)}>Within 2.0 miles</span>
                      <span onClick={()=>handleDistanceChange(5.0)}>Within 5.0 miles</span>
                      <span onClick={()=>handleDistanceChange(10.0)}>Within 10.0 miles</span>
                      <span onClick={()=>handleDistanceChange(15.0)}>Within 15.0 miles</span>
                    </div>

                </div>
                <ul>
                  {nearbyLocations.map((location, index) => (
                //<li key={location}>{location}  <button className="result-sales-button"><Link to="/reviewpage" style={{ textDecoration: 'none', color: 'inherit'}}>Review</Link></button></li>
                    <li key={`${location.address}-${index}`}
                    onMouseEnter={() => highlightMarker(index)} 
                    onMouseLeave={()=>resetMarker(index)}
                    onClick={()=>{resetMarker(index);}}>
                      <div className="locationInfo">
                        <span className="location-text">{location.address}</span>
                        <span className="routeDistance">{location.distance} miles</span>
                      </div>
                      <button className="result-sales-button"
                      onClick={()=>testing(index)}
                      >
                        --
                        {/* <Link to="/reviewpage" style={{ textDecoration: 'none', color: 'inherit'}}>Review</Link> */}
                      </button>
                    </li>
                  ))}
                </ul>
            </div>
            </div>
            </div>
          );
        }

  return (
    <div className="lower-content">
        <SavedSales update={dataLoaded} />
          <div className="search-map">
            <div className="input-container">
              <input
                id="locationInput"
                name="location"
                type="text"
                placeholder={t("global.dashboard.searchbar")}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={ handleEnterKey}
                aria-label="Search Location"
              />
              <button id="searchButton" type="button" className="searchButton" onClick={handleSearch}>
              {t("global.dashboard.search")}
              </button>
              <img className="currentLocationButton" 
                onClick={handleCurrentLocation}
                src="/assets/currentLocationButton.png"
                alt="current_location"
              />
            </div>
            <div className="map" id="map"></div>
          </div>
          </div>
      );
}

// function SavedSales() {
//   const [dropdownOpen, setdropdownOpen] = useState(false);
//   const [savedDistance, setSavedDistance] = useState(globalDistance);
//   const handleDistanceDropdown = () => {
//     setdropdownOpen(!dropdownOpen); // Toggle the dropdown
//   };
//   const handleDistanceChange = (newDistance) =>{
//     globalDistance = newDistance;
//     setSavedDistance(newDistance);
//   };
//   return (
//     <div className="saved">
//     <div className="sidebar-container">
//     <div className="sidebar">
//         <div className="name">
//           Locations
//           <button className="result-sales-button"><Link to="/create-post" style={{ textDecoration: 'none', color: 'inherit'}}>Add</Link></button>
//         </div>
//         <div className="locationSettings">
//           <button className="setDistance"  onClick={handleDistanceDropdown}>
//                 <text>Within {globalDistance} miles </text>
//               <img
//                   //src="https://i.seadn.io/gcs/files/3085b3fc65f00b28699b43efb4434eec.png?auto=format&dpr=1&w=1000"
//                   src="https://static.thenounproject.com/png/551749-200.png"
//                   className="open-dropdown"
//                   alt=""
//                 />
//             </button>
//             <div className={`dropdown-content ${dropdownOpen ? 'show' : ''}`}>
//               <p onClick={()=>handleDistanceChange(0.5)}>Within 0.5 miles</p>
//               <p onClick={()=>handleDistanceChange(1.0)}>Within 1.0 miles</p>
//             </div>
//         </div>
//         <ul>
//           {locationsArray.map(location => (
//         //<li key={location}>{location}  <button className="result-sales-button"><Link to="/reviewpage" style={{ textDecoration: 'none', color: 'inherit'}}>Review</Link></button></li>
//             <li key={location}>
//               <span className="location-text">{location}</span>
//               <button className="result-sales-button">
//                 <Link to="/reviewpage" style={{ textDecoration: 'none', color: 'inherit'}}>Review</Link>
//               </button>
//             </li>
//           ))}
//         </ul>
//     </div>
//     </div>
//     </div>
//   );
// }

function UserProfile(){
  const {t} = useTranslation();
  const [dropdownOpen, setdropdownOpen] = useState(false);
  const handleProfileDropdown = () => {
    setdropdownOpen(!dropdownOpen); // Toggle the dropdown
  };

  const [languagesOpen, setlanguagesOpen] = useState(false);
  const handleLanguagesDropdown = () => {
    setlanguagesOpen(!languagesOpen); // Toggle the dropdown
  };

  let settingsRef = useRef();
  let profileRef = useRef();
  let backRef = useRef();
  //let testRef = useRef();

  useEffect(() =>{
    let handler = (e)=> {
      if(settingsRef.current.contains(e.target)){
        setdropdownOpen(false);
        setlanguagesOpen(true);
      }
      if(!profileRef.current.contains(e.target)){
        setdropdownOpen(false);
        setlanguagesOpen(false);
      }
      if(backRef.current.contains(e.target)){
        setdropdownOpen(true);
        setlanguagesOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);

    return() => {
      document.removeEventListener("mousedown", handler);
    }
  })


  return (
    <div className="profile" ref={profileRef}>
            <button type="button"  onClick={handleProfileDropdown}>
              Name
            <img
                //src="https://i.seadn.io/gcs/files/3085b3fc65f00b28699b43efb4434eec.png?auto=format&dpr=1&w=1000"
                src="https://i.pinimg.com/736x/b9/49/0a/b9490abd30c15850908b8ee0570f8b19.jpg"
                className="pfp"
                alt="profile_picture"
              />
            
          </button>
          <div className={`dropdown-content ${dropdownOpen ? 'show' : ''}`}>
            <a href="https://www.google.com/">{t("global.dropdown.profile")}</a>
            <a>{t("global.dropdown.settings")}</a>
            <button ref={settingsRef} type="button">
            {t("global.dropdown.language")}       
            </button >
            <Link to="/">{t("global.dropdown.signout")}</Link>
          </div>
          <div className={`dropdown-content ${languagesOpen ? 'show' : ''}`}>
            <LanguageSelector />
            <a ref={backRef}>{t("global.dropdown.return")}</a>
          </div>

          <div>

          

          </div>
        </div>
  );
}

// function UserNotifications(){
// }

// async function notifyUser(notificationText = "Thank you for enabling notifications!") { //logic for notifying a user
// }

function Dashboard(){
  
  useEffect(() => {
    // Set nearbyLocations to empty array when component is mounted
    nearbyLocations = [];
    console.log("jorge")
  }, []);
   const {t} = useTranslation();
    return(
    <div className="dashboard">
      <div className="topbar">
          <div className="content">
            <div className="image-container">
              <img
                src="/assets/tempLogo.PNG"
                className="logo"
                alt="logo"
              />
            </div>
            <div className="name">{t("global.header.name")}</div>        
          </div>
          {UserProfile()}
      </div>
        {SearchLocation()}

    </div>
  );
}

export default Dashboard;