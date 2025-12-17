"use client";

import * as React from "react";
import Map, { Marker, NavigationControl, Source, Layer } from "react-map-gl/mapbox";
import type { LayerProps, MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapboxMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  onMove?: (lat: number, lng: number) => void;
  origin?: { lat: number; lng: number } | null;
  destination?: { lat: number; lng: number } | null;
}

export default function MapboxMap({
  latitude,
  longitude,
  zoom = 14,
  onMove,
  origin,
  destination,
}: MapboxMapProps) {
  const mapRef = React.useRef<MapRef>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  React.useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: zoom,
        duration: 2000,
      });
    }
  }, [latitude, longitude, zoom]);


  const routeGeoJSON = React.useMemo(() => {
    if (!origin || !destination) return null;
    return {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: [
          [origin.lng, origin.lat],
          [destination.lng, destination.lat],
        ],
      },
    };
  }, [origin, destination]);

  const lineLayer: LayerProps = {
    id: "route",
    type: "line",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "#0046FF", // Azul Duoc
      "line-width": 4,
      "line-opacity": 0.8,
    },
  };

  if (!token) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 p-4 text-center border rounded-lg">
        <p>
          Falta el token de Mapbox. <br />
          Agrega <code>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> a tu archivo <code>.env.local</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden relative">
      <Map
        ref={mapRef}
        mapboxAccessToken={token}
        initialViewState={{
          longitude: longitude,
          latitude: latitude,
          zoom: zoom,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onMove={(evt) => {
          if (onMove) {
            onMove(evt.viewState.latitude, evt.viewState.longitude);
          }
        }}
      >
        <NavigationControl position="top-right" />

        {/* Marcador de Origen (Verde) */}
        {origin && (
          <Marker longitude={origin.lng} latitude={origin.lat} color="green" />
        )}

        {/* Marcador de Destino (Rojo) */}
        {destination && (
          <Marker longitude={destination.lng} latitude={destination.lat} color="red" />
        )}

        {/* Si no hay origen ni destino específicos, mostramos el marcador genérico en el centro */}
        {!origin && !destination && (
          <Marker longitude={longitude} latitude={latitude} color="gray" />
        )}

        {/* Línea de ruta */}
        {routeGeoJSON && (
          <Source id="route-source" type="geojson" data={routeGeoJSON}>
            <Layer {...lineLayer} />
          </Source>
        )}
      </Map>
    </div>
  );
}
