import { useEffect, useState } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

export default function UpdateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const params = useParams();
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch listing data
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/user/listings?id=${params.listingId}`);
        const data = await res.json();
        if (data.success === false) {
          console.log(data.message);
          return;
        }
        setFormData(data);
      } catch (err) {
        console.error('Error fetching listing:', err);
      }
    };

    fetchListing();
  }, [params.listingId]);

  // Update listing
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError('You must upload at least one image');
      if (+formData.regularPrice < +formData.discountPrice)
        return setError('Discount price must be lower than regular price');
      setLoading(true);
      setError(false);
      const res = await fetch(`/api/user/update?id=${params.listingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
      }
      navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Delete listing
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/user/delete?id=${params.listingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        navigate('/listings');
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error deleting listing:', err);
      setError('Failed to delete listing');
    }
  };

  return (
    <main className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-semibold text-center my-7 text-gray-800">
        Update a Listing
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-8">
        {/* Left Section */}
        <div className="flex flex-col gap-6 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            type="text"
            placeholder="Description"
            className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />
          <div className="flex gap-4 flex-wrap">
            {[
              { id: 'sale', label: 'Sell' },
              { id: 'rent', label: 'Rent' },
              { id: 'parking', label: 'Parking spot' },
              { id: 'furnished', label: 'Furnished' },
              { id: 'offer', label: 'Offer' },
            ].map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={item.id}
                  className="w-5 h-5"
                  onChange={handleChange}
                  checked={formData[item.id]}
                />
                <label htmlFor={item.id} className="text-gray-700">
                  {item.label}
                </label>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-6">
            {[
              { id: 'bedrooms', label: 'Beds', min: 1, max: 10 },
              { id: 'bathrooms', label: 'Baths', min: 1, max: 10 },
              { id: 'regularPrice', label: 'Regular price', min: 50, max: 10000000 },
            ].map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <input
                  type="number"
                  id={item.id}
                  min={item.min}
                  max={item.max}
                  required
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={handleChange}
                  value={formData[item.id]}
                />
                <p>{item.label}</p>
              </div>
            ))}
            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountPrice"
                  min="0"
                  max="10000000"
                  required
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={handleChange}
                  value={formData.discountPrice}
                />
                <p>Discounted price</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col flex-1 gap-6">
          <p className="font-semibold text-gray-700">
            Images:
            <span className="font-normal text-gray-500 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              onChange={(e) => setFiles(e.target.files)}
              className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              type="file"
              id="images"
              accept="image/*"
              multiple
            />
            <button
              type="button"
              disabled={uploading}
              onClick={handleImageSubmit}
              className="p-3 bg-green-600 text-white rounded-lg uppercase hover:bg-green-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          {imageUploadError && (
            <p className="text-red-600 text-sm">{imageUploadError}</p>
          )}
          <div className="grid grid-cols-2 gap-4">
            {formData.imageUrls.map((url, index) => (
              <div
                key={url}
                className="relative border rounded-lg overflow-hidden"
              >
                <img
                  src={url}
                  alt="listing"
                  className="w-full h-32 object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            disabled={loading || uploading}
            className="p-3 bg-blue-600 text-white rounded-lg uppercase hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update listing'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="p-3 bg-red-600 text-white rounded-lg uppercase hover:bg-red-700"
          >
            Delete Listing
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
}