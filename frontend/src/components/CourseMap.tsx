import { useEffect, useState } from "react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

type LatLng = { lat: number; lng: number };

export function CourseMap({ address }: { address: string }) {
  const [loading, loaderError] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_KEY,
    libraries: ["services"],
    url: "https://dapi.kakao.com/v2/maps/sdk.js",
  });
  const [position, setPosition] = useState<LatLng | null>(null);
  const [geocodeFailed, setGeocodeFailed] = useState(false);

  useEffect(() => {
    if (loading || loaderError) return;

    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result, status) => {
      if (status === kakao.maps.services.Status.OK && result[0]) {
        setPosition({ lat: Number(result[0].y), lng: Number(result[0].x) });
      } else {
        setGeocodeFailed(true);
      }
    });
  }, [loading, loaderError, address]);

  if (loaderError || geocodeFailed) {
    return <p className="text-sm text-muted-foreground">{address}</p>;
  }

  if (loading || !position) {
    return (
      <div className="h-48 w-full rounded-lg bg-muted animate-pulse" />
    );
  }

  return (
    <Map center={position} style={{ width: "100%", height: "192px" }} level={4}>
      <MapMarker position={position} />
    </Map>
  );
}
