import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from '../redux/user/userSlice';
import OAuth from '../components/OAuth';

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(data);
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="p-9 max-w-md mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-3xl text-center font-semibold my-7 text-gray-800">
        Sign In
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <input
          type="email"
          placeholder="Email"
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          id="email"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          id="password"
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className="bg-blue-600 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? 'Loading...' : 'Sign In'}
        </button>
        <OAuth />
      </form>
      <div className="flex justify-center gap-2 mt-5">
        <p className="text-gray-600">Don't have an account?</p>
        <Link to={'/sign-up'}>
          <span className="text-blue-700 font-semibold hover:underline">
            Sign up
          </span>
        </Link>
      </div>
      {error && (
        <p className="text-red-500 mt-5 text-center">{error}</p>
      )}
    </div>
    </div>
  );
}