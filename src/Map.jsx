import { useRef, useState } from "react";

//icons
import { toast } from "react-hot-toast";
import { IoNavigate } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";
import { MdTripOrigin } from "react-icons/md";
import { FaLocationDot } from "react-icons/fa6";

// GOOGLE MAP COMPONENETS
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import axios from "axios";
// set default center for map  ex-mumbai
const center = { lat: 19.601194, lng: 75.552979 };

const Map = () => {
  const [loading, setLoading] = useState(false);
  // LOCATIONS
  // const [pickup, setPickup] = useState("");
  // const [destination, setDestination] = useState("");

  // navigate again to map default position when clicked on icon
  const [map, setMap] = useState(/**@type google.maps.Map */ (null));

  // DIRECTION RESPONSE
  const [directionResponse, setDirectionResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  /**@type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef(); //pickup location
  /**@type React.MutableRefObject<HTMLInputElement> */
  const destinationRef = useRef();
  // function to calcualate
  async function calculateDirectionRoute() {
    if (originRef.current.value === "" || destinationRef.current.value === "") {
      toast("Select Route");
    } else {
      setLoading(true);
      const directionService = new google.maps.DirectionsService();
      const directionResult = await directionService.route({
        origin: originRef.current.value,
        destination: destinationRef.current.value,
        travelMode: google.maps.TravelMode.DRIVING,
      });

      // console.log(directionResult);
      // console.log(directionResult?.routes[0]?.legs[0]?.distance?.text);
      // console.log(directionResult?.routes[0]?.legs[0]?.duration?.text);

      setDirectionResponse(directionResult);
      setDistance(directionResult?.routes[0]?.legs[0]?.distance?.text);
      setDuration(directionResult?.routes[0]?.legs[0]?.duration?.text);
      setLoading(false);
    }
  }
  function clearDirectionRoute() {
    setDirectionResponse(null);
    setDistance("");
    setDuration("");
    originRef.current.value = "";
    destinationRef.current.value = "";
    // setPassengerRoute({ pickup: "", destination: "" });
  }

  // AUTOCOMPLETE ON PLACE CHANGE
  const [locationObj, setLocationObj] = useState({});
  function onLoad(selectPlace) {
    setLocationObj(selectPlace);
  }

  async function onPlaceChanged() {
    const place = locationObj.getPlace();
    const { lat, lng } = place.geometry.location;
    // lat and long are function , call them
    let latitude = lat();
    let longitude = lng();

    const response = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=166e9c08befd40909204b8042a4b028a`
    );
    console.log(response?.data?.results[0].components?.city);
  }
  // LOAD JS API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: `${import.meta.env.VITE_GOOGLE_MAP_API_KEY}`,
    libraries: ["places"],
  });
  // if js api loaded or not
  if (!isLoaded) {
    return <FaSpinner className="text-2xl" />;
  }

  return (
    <div className=" ">
      {/* google map displaying markers directions*/}
      <div className="absolute w-full h-[45rem] text-white">
        <GoogleMap
          center={center}
          zoom={10}
          // without this map would be invisible
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={{
            zoonControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          // when clicked on navigate icon
          onLoad={(map) => setMap(map)}
        >
          {/* marker not visible */}
          <Marker
            // set marker at default position
            position={center}
          />
          {directionResponse && (
            <DirectionsRenderer directions={directionResponse} />
          )}
        </GoogleMap>
      </div>
      {/* search box */}
      <div className="absolute right-0 m-1 bg-white w-fit pt-4 pb-2 px-5  rounded-xl">
        <section className="flex justify-end pb-3">
          <button
            className="border-[1px] border-gray-200 text-xs px-2 py-0.5 hover:bg-black hover:text-white rounded-md"
            onClick={clearDirectionRoute}
          >
            Clear
          </button>
        </section>
        <section className="space-y-3  flex flex-col ">
          <div className="flex gap-2">
            <Autocomplete
              onLoad={onLoad} //first on load gets called
              onPlaceChanged={onPlaceChanged} //after onLoad storing place obj result
            >
              <input
                type="text"
                placeholder="Pickup"
                ref={originRef}
                className="border-2 py-2 px-2  italic rounded-xl w-full"
              />
            </Autocomplete>
          </div>
          <div className="flex gap-2">
            <Autocomplete>
              <input
                type="text"
                placeholder="Destination"
                ref={destinationRef}
                className="border-2 py-2 px-2  italic rounded-xl"
              />
            </Autocomplete>
          </div>
          <button
            className="bg-gray-200 py-1.5  px-2 text-white text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl  rounded-lg flex justify-center "
            onClick={calculateDirectionRoute}
          >
            {loading ? (
              <FaSpinner className="animate-spin m-auto" />
            ) : (
              "Find Route"
            )}
          </button>
        </section>

        <section className="py-2 mt-2 flex  flex-col justify-between gap-2 mt-7 ">
          {distance && duration && (
            <>
              <div className="space-y-3">
                <p className="flex gap-1">
                  <MdTripOrigin className="mt-1 text-orange-400" />
                  <span>{originRef.current.value}</span>
                </p>
                <p className="flex gap-1">
                  <FaLocationDot className="mt-1 text-red-600" />
                  <span>{destinationRef.current.value}</span>
                </p>
                <p className="flex gap-1">
                  <p>Distance: </p>
                  <span>{distance}</span>
                </p>
                <p className="flex gap-1">
                  <p>Duration: </p>
                  <span>{duration}</span>
                </p>
              </div>
            </>
          )}

          <div className="flex justify-end  mt-3 ">
            <IoNavigate
              className="text-3xl text-end hover:text-blue-500 cursor-pointer border-[2px] border-blue-300  p-1 rounded-[50%]"
              onClick={() => {
                map.panTo(center);
                clearDirectionRoute();
              }}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Map;
