import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
} from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(null); // Changed undefined to null for clarity
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(null); // Changed to null for better error handling
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    password: '',
    avatar: currentUser?.avatar || ''
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = async (file) => {
    try {
      setFileUploadError(null);
      const storage = getStorage(app);
      const fileName = `${new Date().getTime()}-${file.name}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setFilePerc(Math.round(progress));
        },
        (error) => {
          setFileUploadError('Failed to upload image (max 2MB)');
          setFilePerc(0);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setFormData((prev) => ({ ...prev, avatar: downloadURL }));
            setFilePerc(0);
          });
        }
      );
    } catch (error) {
      setFileUploadError('Error during upload process');
      setFilePerc(0);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (!res.ok || data.success === false) {
        dispatch(updateUserFailure(data.message || 'Update failed'));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000); // Clear success message after 3s
    } catch (error) {
      dispatch(updateUserFailure(error.message || 'Network error'));
    }
  };

  const handleDeleteUser = async () => {
    if (window.confirm('Are you sure you want to delete your account?')) {
      try {
        dispatch(deleteUserStart());
        const res = await fetch(`/api/user/delete/${currentUser._id}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        
        if (!res.ok || data.success === false) {
          dispatch(deleteUserFailure(data.message || 'Deletion failed'));
          return;
        }
        dispatch(deleteUserSuccess());
      } catch (error) {
        dispatch(deleteUserFailure(error.message || 'Network error'));
      }
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      
      if (!res.ok || data.success === false) {
        dispatch(deleteUserFailure(data.message || 'Sign out failed'));
        return;
      }
      dispatch(deleteUserSuccess());
    } catch (error) {
      dispatch(deleteUserFailure(error.message || 'Network error'));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      
      if (!res.ok || data.success === false) {
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      
      if (!res.ok || data.success === false) {
        console.error(data.message || 'Failed to delete listing');
        return;
      }
      setUserListings((prev) => prev.filter((listing) => listing._id !== listingId));
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto mt-32 bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">Profile</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            onChange={(e) => setFile(e.target.files[0])}
            type="file"
            ref={fileRef}
            hidden
            accept="image/*"
          />
          <div className="flex flex-col items-center">
            <img
              onClick={() => fileRef.current?.click()}
              src={formData.avatar || currentUser?.avatar || 'https://via.placeholder.com/150'}
              alt="profile"
              className="rounded-full h-32 w-32 object-cover cursor-pointer border-4 border-gray-200 hover:border-blue-500 transition-colors"
            />
            <p className="mt-2 text-sm text-center">
              {fileUploadError ? (
                <span className="text-red-600 font-medium">{fileUploadError}</span>
              ) : filePerc > 0 && filePerc < 100 ? (
                <span className="text-gray-600">{`Uploading ${filePerc}%`}</span>
              ) : filePerc === 100 ? (
                <span className="text-green-600 font-medium">Image uploaded successfully!</span>
              ) : (
                <span className="text-gray-500">Click to change avatar</span>
              )}
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              defaultValue={currentUser?.username}
              id="username"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              onChange={handleChange}
            />
            <input
              type="email"
              placeholder="Email"
              defaultValue={currentUser?.email}
              id="email"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              onChange={handleChange}
            />
            <input
              type="password"
              placeholder="New Password (leave blank to keep current)"
              id="password"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              onChange={handleChange}
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg uppercase font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
          
          <Link
            to="/create-listing"
            className="block w-full bg-green-600 text-white p-3 rounded-lg uppercase font-medium text-center hover:bg-green-700 transition-colors"
          >
            Create Listing
          </Link>
        </form>

        <div className="flex justify-between mt-6 text-sm">
          <button
            onClick={handleDeleteUser}
            className="text-red-600 font-medium hover:text-red-800 transition-colors"
          >
            Delete Account
          </button>
          <button
            onClick={handleSignOut}
            className="text-red-600 font-medium hover:text-red-800 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {error && (
          <p className="text-red-600 mt-4 text-center font-medium">{error}</p>
        )}
        {updateSuccess && (
          <p className="text-green-600 mt-4 text-center font-medium">
            Profile updated successfully!
          </p>
        )}

        <button
          onClick={handleShowListings}
          className="w-full mt-6 text-blue-600 font-medium hover:text-blue-800 transition-colors"
        >
          Show My Listings
        </button>

        {showListingsError && (
          <p className="text-red-600 mt-4 text-center font-medium">
            Error loading listings
          </p>
        )}

        {userListings.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
              Your Listings
            </h2>
            <div className="space-y-4">
              {userListings.map((listing) => (
                <div
                  key={listing._id}
                  className="bg-gray-50 rounded-lg p-4 flex items-center justify-between gap-4 hover:bg-gray-100 transition-colors"
                >
                  <Link to={`/listing/${listing._id}`} className="flex items-center gap-4">
                    <img
                      src={listing.imageUrls[0] || 'https://via.placeholder.com/64'}
                      alt="listing cover"
                      className="h-16 w-16 object-cover rounded-md"
                    />
                    <p className="text-slate-700 font-medium truncate flex-1">
                      {listing.name}
                    </p>
                  </Link>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleListingDelete(listing._id)}
                      className="text-red-600 uppercase text-sm hover:text-red-800 transition-colors"
                    >
                      Delete
                    </button>
                    <Link to={`/update-listing/${listing._id}`}>
                      <button className="text-green-600 uppercase text-sm hover:text-green-800 transition-colors">
                        Edit
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}