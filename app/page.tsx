'use client'

import { useState } from 'react';
import { auth, firestore } from '@/firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); 
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/inventory');
    } catch (error) {
      console.error("Login error: ", error); 
      setError('Failed to login. Please check your email and password.');
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(firestore, 'users', user.uid), {
        email: user.email,
        createdAt: new Date(),
        inventory: [],
      });
      router.push('/');
    } catch (error) {
      console.error("Registration error: ", error); 
      setError('Failed to register. Please check your email and password.');
    }
    setLoading(false);
  };

  return (
    <main className='font-mono text-2xl w-full h-screen flex items-center justify-center bg-green-300'>
      <div className='flex flex-col rounded-3xl shadow-2xl border-4 border-green-600 bg-white p-6 w-full max-w-md'>
        <h1 className='text-4xl font-bold mb-8 text-center'>{isRegistering ? 'Register' : 'Login'}</h1>
        {error && <p className='text-red-500 mb-4'>{error}</p>}
        <label className='text-left text-lg mb-2' htmlFor='username'>Username</label>
        <input
          id='username'
          type='email'
          className='border border-gray-300 rounded-lg p-3 mb-6 w-full'
          placeholder='Enter your email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className='text-left text-lg mb-2' htmlFor='password'>Password</label>
        <input
          id='password'
          type='password'
          className='border border-gray-300 rounded-lg p-3 mb-6 w-full'
          placeholder='Enter your password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className='text-blue-500 text-base flex flex-row justify-between mb-4'>
          <label 
            className='hover:cursor-pointer hover:underline'
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? 'Already have an account?' : 'Don’t have an account?'}
          </label>
          <label className='hover:cursor-pointer hover:underline'>
            Forgot password?
          </label>
        </div>
        <button
          type='button'
          className='bg-green-600 text-white rounded-lg py-3 px-6 mt-4 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500'
          onClick={isRegistering ? handleRegister : handleLogin}
          disabled={loading}
        >
          {loading ? 'Loading...' : isRegistering ? 'Register' : 'Login'}
        </button>
      </div>
    </main>
  );
}
