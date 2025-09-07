// src/app/components/ProductManagement.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { collection, addDoc, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/utils/firebaseConfig';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageURL: string;
}

export default function ProductManagement() {
  const { data: session } = useSession();
  const [productForm, setProductForm] = useState({ name: '', price: 0, stock: 0 });
  const [products, setProducts] = useState<Product[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const storeId = session?.user?.id;

  useEffect(() => {
    if (!storeId) return;
    const q = query(collection(db, "products"), where("storeId", "==", storeId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsList: Product[] = [];
      snapshot.forEach(doc => {
        productsList.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(productsList);
    });
    return () => unsubscribe();
  }, [storeId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProductForm(prev => ({ ...prev, [name]: value as any }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!storeId || !imageFile) {
      setError("Falta el ID de la tienda o la imagen.");
      setLoading(false);
      return;
    }
    try {
      const imageRef = ref(storage, `product-images/${storeId}/${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      const imageURL = await getDownloadURL(imageRef);
      const newProduct = {
        ...productForm,
        price: parseFloat(productForm.price.toString()),
        stock: parseInt(productForm.stock.toString()),
        imageURL,
        storeId,
      };
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), newProduct as any);
        setEditingId(null);
      } else {
        await addDoc(collection(db, "products"), newProduct);
      }
      setProductForm({ name: '', price: 0, stock: 0 });
      setImageFile(null);
    } catch (err) {
      if (err instanceof Error) {
        setError("Error al guardar el producto: " + err.message);
      } else {
        setError("Error al guardar el producto.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await deleteDoc(doc(db, "products", productId));
      } catch (err) {
        if (err instanceof Error) {
          setError("Error al eliminar el producto: " + err.message);
        } else {
          setError("Error al eliminar el producto.");
        }
      }
    }
  };

  const handleEdit = (product: Product) => {
    setProductForm({ name: product.name, price: product.price, stock: product.stock });
    setEditingId(product.id);
  };

  return (
    <div className="p-8">
      <h3 className="text-xl font-bold mb-4">Gestión de Productos</h3>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="p-4 border rounded-md shadow-sm mb-8">
        <h4 className="text-lg font-semibold mb-2">{editingId ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
            <input type="text" name="name" value={productForm.name} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300" />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Precio</label>
            <input type="number" name="price" value={productForm.price} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300" />
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
            <input type="number" name="stock" value={productForm.stock} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300" />
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">Imagen</label>
            <input type="file" name="image" onChange={handleImageChange} required={!editingId} className="mt-1 block w-full text-sm text-gray-500" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
          {loading ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Añadir Producto')}
        </button>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product.id} className="border rounded-md shadow-md p-4 flex flex-col items-center text-center">
            <Image src={product.imageURL} alt={product.name} width={128} height={128} className="w-32 h-32 object-cover mb-2" />
            <h4 className="text-lg font-semibold">{product.name}</h4>
            <p className="text-gray-600">Precio: ${product.price}</p>
            <p className="text-gray-600">Stock: {product.stock}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => handleEdit(product)} className="py-1 px-3 text-sm rounded-md bg-yellow-500 text-white">Editar</button>
              <button onClick={() => handleDelete(product.id)} className="py-1 px-3 text-sm rounded-md bg-red-500 text-white">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}