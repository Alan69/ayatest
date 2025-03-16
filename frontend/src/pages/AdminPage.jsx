import { createSignal, createEffect, Show, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAuth } from '../hooks/useAuth';

const AdminPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = createSignal('users');
  const [users, setUsers] = createSignal([]);
  const [products, setProducts] = createSignal([]);
  const [tests, setTests] = createSignal([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);

  // Check if user is admin
  createEffect(() => {
    if (auth.isAuthenticated() && auth.user()?.role !== 'ADMIN') {
      navigate('/', { replace: true });
    } else if (!auth.isAuthenticated()) {
      navigate('/login', { replace: true });
    }
  });

  // Fetch data based on active tab
  createEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab() === 'users') {
          const response = await fetch('/api/admin/users', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (!response.ok) throw new Error('Failed to fetch users');
          const data = await response.json();
          setUsers(data);
        } else if (activeTab() === 'products') {
          const response = await fetch('/api/admin/products', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (!response.ok) throw new Error('Failed to fetch products');
          const data = await response.json();
          setProducts(data);
        } else if (activeTab() === 'tests') {
          const response = await fetch('/api/admin/tests', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (!response.ok) throw new Error('Failed to fetch tests');
          const data = await response.json();
          setTests(data);
        }
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (auth.isAuthenticated() && auth.user()?.role === 'ADMIN') {
      fetchData();
    }
  });

  // Render users table
  const renderUsersTable = () => (
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white">
        <thead>
          <tr class="bg-gray-100">
            <th class="py-2 px-4 border-b text-left">ID</th>
            <th class="py-2 px-4 border-b text-left">Username</th>
            <th class="py-2 px-4 border-b text-left">Email</th>
            <th class="py-2 px-4 border-b text-left">Role</th>
            <th class="py-2 px-4 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <For each={users()}>
            {(user) => (
              <tr class="hover:bg-gray-50">
                <td class="py-2 px-4 border-b">{user.id}</td>
                <td class="py-2 px-4 border-b">{user.username}</td>
                <td class="py-2 px-4 border-b">{user.email}</td>
                <td class="py-2 px-4 border-b">{user.role}</td>
                <td class="py-2 px-4 border-b">
                  <button class="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                  <button class="text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );

  // Render products table
  const renderProductsTable = () => (
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white">
        <thead>
          <tr class="bg-gray-100">
            <th class="py-2 px-4 border-b text-left">ID</th>
            <th class="py-2 px-4 border-b text-left">Title</th>
            <th class="py-2 px-4 border-b text-left">Type</th>
            <th class="py-2 px-4 border-b text-left">Score</th>
            <th class="py-2 px-4 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <For each={products()}>
            {(product) => (
              <tr class="hover:bg-gray-50">
                <td class="py-2 px-4 border-b">{product.id}</td>
                <td class="py-2 px-4 border-b">{product.title}</td>
                <td class="py-2 px-4 border-b">{product.productType}</td>
                <td class="py-2 px-4 border-b">{product.score || 'N/A'}</td>
                <td class="py-2 px-4 border-b">
                  <button class="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                  <button class="text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );

  // Render tests table
  const renderTestsTable = () => (
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white">
        <thead>
          <tr class="bg-gray-100">
            <th class="py-2 px-4 border-b text-left">ID</th>
            <th class="py-2 px-4 border-b text-left">Title</th>
            <th class="py-2 px-4 border-b text-left">Product</th>
            <th class="py-2 px-4 border-b text-left">Questions</th>
            <th class="py-2 px-4 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <For each={tests()}>
            {(test) => (
              <tr class="hover:bg-gray-50">
                <td class="py-2 px-4 border-b">{test.id}</td>
                <td class="py-2 px-4 border-b">{test.title}</td>
                <td class="py-2 px-4 border-b">{test.product?.title || 'N/A'}</td>
                <td class="py-2 px-4 border-b">{test.numberOfQuestions || 'N/A'}</td>
                <td class="py-2 px-4 border-b">
                  <button class="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                  <button class="text-green-500 hover:text-green-700 mr-2">Questions</button>
                  <button class="text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );

  return (
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Tabs */}
      <div class="flex border-b mb-6">
        <button 
          class={`py-2 px-4 mr-2 ${activeTab() === 'users' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          class={`py-2 px-4 mr-2 ${activeTab() === 'products' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button 
          class={`py-2 px-4 ${activeTab() === 'tests' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('tests')}
        >
          Tests
        </button>
      </div>
      
      {/* Content */}
      <div class="bg-white p-6 rounded shadow">
        <Show 
          when={!loading()} 
          fallback={<p class="text-center">Loading...</p>}
        >
          <Show 
            when={!error()} 
            fallback={<p class="text-red-500 text-center">{error()}</p>}
          >
            <div class="flex justify-between mb-4">
              <h2 class="text-xl font-semibold">
                {activeTab() === 'users' ? 'Users' : activeTab() === 'products' ? 'Products' : 'Tests'}
              </h2>
              <button class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                Add {activeTab() === 'users' ? 'User' : activeTab() === 'products' ? 'Product' : 'Test'}
              </button>
            </div>
            
            <Show when={activeTab() === 'users'}>
              {renderUsersTable()}
            </Show>
            <Show when={activeTab() === 'products'}>
              {renderProductsTable()}
            </Show>
            <Show when={activeTab() === 'tests'}>
              {renderTestsTable()}
            </Show>
          </Show>
        </Show>
      </div>
    </div>
  );
};

export default AdminPage; 