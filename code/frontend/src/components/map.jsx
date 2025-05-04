import React, { useRef, useEffect } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import './map.css';

const Map = ({ location }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  // const tokyo = { lng: 139.753, lat: 35.6844 };
  const zoom = 14;

  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once
  
    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.BASIC,
      center: [location.longitude, location.latitude],
      zoom: zoom
    });

    new maptilersdk.Marker({color: "#FF0000"})
      .setLngLat([location.longitude,location.latitude])
      .addTo(map.current);
  
  }, [location.longitude, location.latitude, zoom]);
  
  // maptilersdk.config.apiKey = process.env.MAPTILER_API_KEY;
  // console.log("MapTiler API Key: ", process.env.MAPTILER_API_KEY);
  maptilersdk.config.apiKey = "uHaQJm2AugCsrjansXXn";

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
};

export default Map;