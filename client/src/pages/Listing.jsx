import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { useSelector } from 'react-redux';
import 'swiper/css';
import 'swiper/css/navigation';
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
} from 'react-icons/fa';

export default function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        
        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            text ? `Server error: ${text}` : `Server error: ${res.status} ${res.statusText}`
          );
        }

        const data = await res.json().catch(() => {
          throw new Error('Invalid JSON response from server');
        });

        if (data.success === false) {
          throw new Error(data.message || 'Failed to fetch listing');
        }

        setListing(data);
      } catch (err) {
        setError(err.message || 'An unexpected error occurred');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen  bg-gray-100 mt-32 mx-32 pb-8">
      {loading && (
        <div className="flex justify-center items-center h-64">
          <p className="text-2xl text-gray-600 font-medium">Loading...</p>
        </div>
      )}
      {error && (
        <div className="flex justify-center items-center h-64">
          <p className="text-2xl text-red-600 font-medium">{error}</p>
        </div>
      )}
      {listing && !loading && !error && (
        <div className="max-w-6xl mx-auto mt-32 py-8">
          {/* Swiper Section */}
          <div className="relative">
            <Swiper
              navigation
              modules={[Navigation]}
              className="rounded-xl overflow-hidden shadow-lg"
            >
              {listing.imageUrls.map((url) => (
                <SwiperSlide key={url}>
                  <div
                    className="h-[400px] sm:h-[550px] w-full"
                    style={{
                      background: `url(${url}) center no-repeat`,
                      backgroundSize: 'cover',
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/*Share Button */}
            <button
              className="absolute top-4 right-4 z-10 bg-white p-3 rounded-full shadow-md hover:bg-gray-100 transition-colors"
              onClick={handleShare}
              aria-label="Share listing"
            >
              <FaShare className="text-gray-600 text-lg" />
            </button>
            {copied && (
              <p className="absolute top-16 right-4 z-10 bg-white text-gray-700 px-3 py-1 rounded-md shadow-md">
                Link copied!
              </p>
            )}
          </div>

          {/* Listing Details */}
          <div className="mt-8 bg-white rounded-xl shadow-md p-6 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {listing.name} - $
              {listing.offer
                ? listing.discountPrice.toLocaleString('en-US')
                : listing.regularPrice.toLocaleString('en-US')}
              {listing.type === 'rent' && ' / month'}
            </h1>
            
            <p className="flex items-center gap-2 text-gray-600 mb-4">
              <FaMapMarkerAlt className="text-green-700" />
              <span className="text-sm">{listing.address}</span>
            </p>

            <div className="flex flex-wrap gap-4 mb-6">
              <span className="bg-red-600 text-white px-4 py-2 rounded-md font-medium">
                {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
              </span>
              {listing.offer && (
                <span className="bg-green-600 text-white px-4 py-2 rounded-md font-medium">
                  ${(+listing.regularPrice - +listing.discountPrice).toLocaleString('en-US')} OFF
                </span>
              )}
            </div>

            <p className="text-gray-700 mb-6">
              <span className="font-semibold text-gray-800">Description - </span>
              {listing.description}
            </p>

            <ul className="grid grid-cols-2 gap-4 text-green-700 font-medium text-sm mb-6">
              <li className="flex items-center gap-2">
                <FaBed className="text-lg" />
                {listing.bedrooms > 1 ? `${listing.bedrooms} Beds` : '1 Bed'}
              </li>
              <li className="flex items-center gap-2">
                <FaBath className="text-lg" />
                {listing.bathrooms > 1 ? `${listing.bathrooms} Baths` : '1 Bath'}
              </li>
              <li className="flex items-center gap-2">
                <FaParking className="text-lg" />
                {listing.parking ? 'Parking Available' : 'No Parking'}
              </li>
              <li className="flex items-center gap-2">
                <FaChair className="text-lg" />
                {listing.furnished ? 'Furnished' : 'Unfurnished'}
              </li>
            </ul>

            {currentUser && listing.userRef !== currentUser._id && !contact && (
              <button
                onClick={() => setContact(true)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg uppercase font-medium hover:bg-blue-700 transition-colors"
              >
                Contact Landlord
              </button>
            )}
            {contact && <Contact listing={listing} />}
          </div>
        </div>
      )}
    </main>
  );
}