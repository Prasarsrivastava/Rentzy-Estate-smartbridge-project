import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import SwiperCore from 'swiper';
import 'swiper/css/bundle';
import ListingItem from '../components/ListingItem';
;
export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  SwiperCore.use([Navigation]);

  useEffect(() => {
    const fetchOfferListings = async () => {
      try {
        const res = await fetch('/api/listing/get?offer=true&limit=4');
        const data = await res.json();
        setOfferListings(data);
        fetchRentListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchRentListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=rent&limit=4');
        const data = await res.json();
        setRentListings(data);
        fetchSaleListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchSaleListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=sale&limit=4');
        const data = await res.json();
        setSaleListings(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchOfferListings();
  }, []);

  return (
    <div
      className="bg-cover bg-center min-h-screen"
      style={{
        backgroundImage: "url('https://sl.bing.net/cX0TNRe5QXI')",
      }}
    >
      {/* Hero Section */}
      <div className="flex flex-col gap-9 p-20 sm:p-20 px-3 max-w-6xl mx-auto mt-24 text-center">
        <h1 className="text-slate-700 font-bold text-3xl lg:text-6xl">
          Find your next <span className="text-blue-600">perfect</span>
          <br />
          place with ease
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Rentzy is the best place to find your next perfect place to live.
          <br />
          We have a wide range of properties for you to choose from.
        </p>
        <Link
          to={'/search'}
          className="text-sm sm:text-base text-blue-800 font-bold hover:underline"
        >
          Let's get started...
        </Link>
      </div>

      {/* Swiper Section */}
      <div className="max-w-6xl mx-auto my-10">
        <Swiper navigation className="rounded-lg overflow-hidden">
          {offerListings &&
            offerListings.length > 0 &&
            offerListings.map((listing) => (
              <SwiperSlide key={listing._id}>
                <div
                  style={{
                    background: `url(${listing.imageUrls[0]}) center no-repeat`,
                    backgroundSize: 'cover',
                  }}
                  className="h-[300px] sm:h-[500px] rounded-lg"
                ></div>
              </SwiperSlide>
            ))}
        </Swiper>
      </div>

      {/* Listings Section */}
      <div className="max-w-6xl mx-auto p-7 flex flex-col gap-12 my-10">
        {offerListings && offerListings.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-slate-600">
                Recent Offers
              </h2>
              <Link
                className="text-sm text-blue-800 hover:underline"
                to={'/search?offer=true'}
              >
                Show more offers
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {offerListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}

        {rentListings && rentListings.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-slate-600">
                Recent Places for Rent
              </h2>
              <Link
                className="text-sm text-blue-800 hover:underline"
                to={'/search?type=rent'}
              >
                Show more places for rent
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6">
              {rentListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}

        {saleListings && saleListings.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-slate-600">
                Recent Places for Sale
              </h2>
              <Link
                className="text-sm text-blue-800 hover:underline"
                to={'/search?type=sale'}
              >
                Show more places for sale
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {saleListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}