import { createSignal, createEffect, Show, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { createQuery } from '@urql/solid';
import { GET_PRODUCTS } from '../api/queries';
import LoadingSpinner from '../components/LoadingSpinner';

function Products() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = createSignal('');
  
  const [products, productsState] = createQuery({
    query: GET_PRODUCTS,
  });
  
  const filteredProducts = () => {
    if (!products.data?.products) return [];
    
    const term = searchTerm().toLowerCase();
    if (!term) return products.data.products;
    
    return products.data.products.filter(product => 
      product.title.toLowerCase().includes(term) || 
      product.description.toLowerCase().includes(term)
    );
  };
  
  const handleProductClick = (productId) => {
    navigate(`/test-selection/${productId}`);
  };
  
  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">Available Products</h1>
        <div class="relative">
          <input
            type="text"
            placeholder="Search products..."
            class="input pr-10"
            value={searchTerm()}
            onInput={(e) => setSearchTerm(e.target.value)}
          />
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      <Show when={!products.fetching} fallback={<LoadingSpinner />}>
        <Show when={filteredProducts().length > 0} fallback={
          <div class="text-center py-10">
            <p class="text-gray-500">No products found matching your search.</p>
          </div>
        }>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts().map(product => (
              <div 
                class="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-200"
                onClick={() => handleProductClick(product.id)}
              >
                <div class="px-4 py-5 sm:p-6">
                  <h3 class="text-lg leading-6 font-medium text-gray-900">
                    {product.title}
                  </h3>
                  <div class="mt-2 max-w-xl text-sm text-gray-500">
                    <p>{product.description}</p>
                  </div>
                  <div class="mt-5 grid grid-cols-2 gap-4">
                    <div>
                      <div class="flex items-center">
                        <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                        </svg>
                        <span class="ml-2 text-sm text-gray-500">{product.time} minutes</span>
                      </div>
                    </div>
                    <div>
                      <div class="flex items-center">
                        <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                        </svg>
                        <span class="ml-2 text-sm text-gray-500">Max {product.subjectLimit} tests</span>
                      </div>
                    </div>
                  </div>
                  <div class="mt-5">
                    <span class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                      {product.productType}
                    </span>
                    <span class="ml-3 inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Score: {product.score}
                    </span>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-4 sm:px-6">
                  <div class="text-sm">
                    <button
                      class="font-medium text-primary-600 hover:text-primary-500"
                    >
                      Select this product
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Show>
      </Show>
    </div>
  );
}

export default Products; 