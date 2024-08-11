'use client';

import { useState, useEffect } from 'react';
import { auth, firestore } from '@/firebase/config';
import { signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, query, orderBy, where, deleteDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { TextField, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function Inventory() {
    const [items, setItems] = useState<any[]>([]);
    const [newItem, setNewItem] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [adding, setAdding] = useState(0)
    const router = useRouter();

    useEffect(() => {
        const fetchItems = async () => {
            const user = auth.currentUser;
            setLoading(true);
            try {
                if (user) {
                    const userInventoryRef = collection(firestore, 'users', user.uid, 'inventory');
                    const q = searchQuery
                        ? query(userInventoryRef, where('name', '>=', searchQuery), where('name', '<=', searchQuery + '\uf8ff'), orderBy('name'))
                        : query(userInventoryRef, orderBy('createdAt', 'desc'));
                    const querySnapshot = await getDocs(q);
                    const itemsArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setItems(itemsArray);
                }
            } catch (error) {
                setError('Error fetching items.');
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    useEffect(() => {
        const fetchItems = async () => {
            const user = auth.currentUser;
            setLoading(true);
            try {
                if (user) {
                    const userInventoryRef = collection(firestore, 'users', user.uid, 'inventory');
                    const q = searchQuery
                        ? query(userInventoryRef, where('name', '>=', searchQuery), where('name', '<=', searchQuery + '\uf8ff'), orderBy('name'))
                        : query(userInventoryRef, orderBy('createdAt', 'desc'));
                    const querySnapshot = await getDocs(q);
                    const itemsArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setItems(itemsArray);
                }
            } catch (error) {
                setError('Error fetching items.');
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [router, searchQuery, adding]);

    const handleAddItem = async () => {
        setAdding(adding+1)
        const user = auth.currentUser;
        if (!user) {
            router.push('');
            return;
        }

        if (!newItem.trim()) {
            setError('Item name cannot be empty.');
            return;
        }

        setLoading(true);
        try {
            const userInventoryRef = collection(firestore, 'users', user.uid, 'inventory');
            await addDoc(userInventoryRef, {
                name: newItem,
                createdAt: new Date(),
            });
            setNewItem('');
            setSearchQuery(''); // Reset search query to show all items
        } catch (error) {
            setError('Error adding item.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveItem = async (itemId: string) => {
        const user = auth.currentUser;
        if (!user) {
            router.push('/');
            return;
        }

        setLoading(true);
        try {
            const userInventoryRef = doc(firestore, 'users', user.uid, 'inventory', itemId);
            await deleteDoc(userInventoryRef);
            // Refresh the items list after deletion
            const q = query(collection(firestore, 'users', user.uid, 'inventory'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const itemsArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setItems(itemsArray);
        } catch (error) {
            setError('Error removing item.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <main className='font-mono text-2xl w-full h-screen flex flex-col items-center justify-center bg-green-300 p-6'>
            <h1 className='text-4xl font-bold mb-6 text-white'>Inventory</h1>
            <div className='flex flex-col w-2/3'>
                <div className='flex items-center mb-4'>
                    <TextField
                        label='Search Items'
                        variant='outlined'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='flex-grow'
                    />
                    <IconButton
                        onClick={() => setSearchQuery(searchQuery)}
                        color='primary'
                        aria-label='search'
                        className='ml-2'
                    >
                        <SearchIcon />
                    </IconButton>
                </div>
                <input
                    type='text'
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    className='border border-gray-300 rounded-lg p-3 mb-4 w-full'
                    placeholder='Add a new item'
                />
                <button
                    onClick={handleAddItem}
                    className='bg-green-600 text-white rounded-lg py-2 px-4 mb-6 hover:bg-green-700'
                    disabled={loading}
                >
                    {loading ? 'Adding...' : 'Add Item'}
                </button>
                {error && <p className='text-red-500 mb-4'>{error}</p>}
                <div className='bg-white rounded-3xl shadow-2xl p-4'>
                    {items.map(item => (
                        <div key={item.id} className='mb-2 p-2'>
                            <div className='flex flex-row gap-x-2 items-center'>
                                <p className='underline mx-auto text-center font-semibold'>{item.name}</p>
                                <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    className='text-red-600'
                                >
                                    x
                                </button>
                            </div>
                            <hr className='w-3/4 mx-auto mt-2' />
                        </div>
                    ))}
                </div>
            </div>
            <button
                onClick={handleSignOut}
                className='bg-red-600 text-white rounded-lg py-2 px-4 mt-6 hover:bg-red-700'
            >
                Sign Out
            </button>
        </main>
    );
}
