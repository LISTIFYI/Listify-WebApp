import React from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";

interface Property {
    id: number;
    lat: number;
    lng: number;
    price: number;
}

const properties: Property[] = [
    { id: 1, lat: 24.5854, lng: 73.7125, price: 16200 },
    { id: 2, lat: 24.5858, lng: 73.7050, price: 14265 },
    { id: 3, lat: 24.5740, lng: 73.6995, price: 7600 },
    { id: 4, lat: 24.5731, lng: 73.6920, price: 7190 },
    // add more listings here
];

const containerStyle = {
    width: "100%",
    height: "600px",
};

const center = {
    lat: 24.5854, // Udaipur center
    lng: 73.7125,
};

const MapWithMarkers: React.FC = () => {
    const [selected, setSelected] = React.useState<Property | null>(null);

    return (
        <LoadScript googleMapsApiKey={"AIzaSyAgfV-EJzC32o4aAvCq_zRhg4gs-bVh-FM"}>
            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
                {properties.map((property) => (
                    <Marker
                        key={property.id}
                        position={{ lat: property.lat, lng: property.lng }}
                        label={{
                            text: `₹${property.price.toLocaleString()}`,
                            fontSize: "14px",
                            fontWeight: "bold",
                        }}
                        onClick={() => setSelected(property)}
                    />
                ))}

                {selected && (
                    <InfoWindow
                        position={{ lat: selected.lat, lng: selected.lng }}
                        onCloseClick={() => setSelected(null)}
                    >
                        <div>
                            <h4>Price: ₹{selected.price.toLocaleString()}</h4>
                            <p>Property ID: {selected.id}</p>
                            {/* Here you can add image, link to details page etc. */}
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </LoadScript>
    );
};

export default MapWithMarkers;
