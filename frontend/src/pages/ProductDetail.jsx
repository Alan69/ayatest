import { createSignal, createEffect, Show } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { createQuery } from '@urql/solid';
import { GET_PRODUCT } from '../api/queries';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  
  const [product, productState] = createQuery({
    query: GET_PRODUCT,
    variables: { id: params.id },
  });

  const handleStartTest = () => {
    navigate(`/test-selection/${params.id}`);
  };

  return (
    <div class="container mx-auto px-4 py-8">
      <Show when={!productState.fetching} fallback={<LoadingSpinner />}>
        <Show when={!productState.error} fallback={<div class="text-red-500">Error loading product details</div>}>
          <Show when={product()?.product} fallback={<div>Product not found</div>}>
            <div class="bg-white rounded-lg shadow-md p-6">
              <h1 class="text-3xl font-bold mb-4">{product().product.name}</h1>
              <div class="mb-6">
                <p class="text-gray-700">{product().product.description}</p>
              </div>
              <div class="mb-6">
                <h2 class="text-xl font-semibold mb-2">Details</h2>
                <ul class="list-disc list-inside">
                  <li>Category: {product().product.category}</li>
                  <li>Available Tests: {product().product.testCount}</li>
                </ul>
              </div>
              <button
                onClick={handleStartTest}
                class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Start Test
              </button>
              <button
                onClick={() => navigate('/products')}
                class="ml-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Back to Products
              </button>
            </div>
          </Show>
        </Show>
      </Show>
    </div>
  );
};

export default ProductDetail; 