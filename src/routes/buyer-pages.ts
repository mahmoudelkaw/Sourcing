// Buyer Portal Page Routes

import { Hono } from 'hono'
import { buyerLayout } from '../lib/buyer-layout'
import type { Bindings } from '../types'

const buyerPages = new Hono<{ Bindings: Bindings }>()

// Product Catalog Page
buyerPages.get('/catalog', (c) => {
  const content = `
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Product Catalog</h1>
        <p class="text-gray-600">Browse our extensive catalog of B2B products</p>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
                <div class="relative">
                    <input type="text" id="search-input" placeholder="Search by name, SKU, or brand..."
                           class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <i class="fas fa-search absolute left-3 top-4 text-gray-400"></i>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select id="category-filter" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="">All Categories</option>
                </select>
            </div>
        </div>
    </div>

    <!-- Products Grid -->
    <div id="products-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <!-- Loading state -->
        <div class="bg-white rounded-lg shadow p-6 animate-pulse">
            <div class="h-40 bg-gray-200 rounded mb-4"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
    </div>

    <!-- Pagination -->
    <div id="pagination" class="mt-8 flex justify-center"></div>

    <script>
      let currentPage = 1;
      let currentCategory = '';
      let currentSearch = '';
      
      // Load categories
      function loadCategories() {
        axios.get('/api/products/categories/list')
          .then(response => {
            if (response.data.success) {
              const select = document.getElementById('category-filter');
              response.data.data.categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name + ' (' + cat.product_count + ')';
                select.appendChild(option);
              });
            }
          });
      }
      
      // Load products
      function loadProducts() {
        const params = new URLSearchParams({ page: currentPage, limit: 12 });
        if (currentCategory) params.append('category', currentCategory);
        if (currentSearch) params.append('search', currentSearch);
        
        axios.get('/api/products?' + params.toString())
          .then(response => {
            if (response.data.success) {
              displayProducts(response.data.data.products);
              displayPagination(response.data.data.pagination);
            }
          });
      }
      
      // Display products
      function displayProducts(products) {
        const grid = document.getElementById('products-grid');
        if (products.length === 0) {
          grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500"><i class="fas fa-box-open text-4xl mb-2"></i><p>No products found</p></div>';
          return;
        }
        
        grid.innerHTML = products.map(product => \`
          <div class="product-card bg-white rounded-lg shadow overflow-hidden">
            <div class="h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
              <i class="fas fa-box text-5xl text-purple-400"></i>
            </div>
            <div class="p-6">
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-gray-900">\${product.name}</h3>
                \${product.base_price ? \`<span class="text-purple-600 font-bold">EGP \${product.base_price.toFixed(2)}</span>\` : ''}
              </div>
              <p class="text-sm text-gray-600 mb-2">\${product.name_ar || ''}</p>
              <div class="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <span class="bg-gray-100 px-2 py-1 rounded">\${product.sku}</span>
                \${product.brand ? \`<span class="bg-purple-100 text-purple-700 px-2 py-1 rounded">\${product.brand}</span>\` : ''}
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500">MOQ: \${product.moq} \${product.unit}</span>
                <button onclick="addToCart(\${product.id})" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm">
                  <i class="fas fa-plus mr-1"></i>Add to RFQ
                </button>
              </div>
            </div>
          </div>
        \`).join('');
      }
      
      // Display pagination
      function displayPagination(pagination) {
        const div = document.getElementById('pagination');
        if (pagination.totalPages <= 1) {
          div.innerHTML = '';
          return;
        }
        
        let html = '<div class="flex gap-2">';
        if (pagination.page > 1) {
          html += \`<button onclick="changePage(\${pagination.page - 1})" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Previous</button>\`;
        }
        for (let i = 1; i <= pagination.totalPages; i++) {
          if (i === pagination.page) {
            html += \`<button class="px-4 py-2 bg-purple-600 text-white rounded-lg">\${i}</button>\`;
          } else if (i === 1 || i === pagination.totalPages || Math.abs(i - pagination.page) <= 1) {
            html += \`<button onclick="changePage(\${i})" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">\${i}</button>\`;
          } else if (Math.abs(i - pagination.page) === 2) {
            html += '<span class="px-2 py-2">...</span>';
          }
        }
        if (pagination.page < pagination.totalPages) {
          html += \`<button onclick="changePage(\${pagination.page + 1})" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Next</button>\`;
        }
        html += '</div>';
        div.innerHTML = html;
      }
      
      // Change page
      function changePage(page) {
        currentPage = page;
        loadProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      // Search
      document.getElementById('search-input').addEventListener('input', function(e) {
        currentSearch = e.target.value;
        currentPage = 1;
        setTimeout(loadProducts, 300);
      });
      
      // Category filter
      document.getElementById('category-filter').addEventListener('change', function(e) {
        currentCategory = e.target.value;
        currentPage = 1;
        loadProducts();
      });
      
      // Add to cart (RFQ)
      function addToCart(productId) {
        // Store in localStorage for now
        let cart = JSON.parse(localStorage.getItem('rfq_cart') || '[]');
        const exists = cart.find(item => item.productId === productId);
        if (!exists) {
          cart.push({ productId, quantity: 1 });
          localStorage.setItem('rfq_cart', JSON.stringify(cart));
          alert('Product added to RFQ! Go to Create RFQ to submit.');
        } else {
          alert('Product already in RFQ cart');
        }
      }
      
      // Initialize
      loadCategories();
      loadProducts();
    </script>
  `
  
  return c.html(buyerLayout(content, 'catalog'))
})

// Create RFQ Page
buyerPages.get('/rfq/create', (c) => {
  const content = `
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Create RFQ</h1>
        <p class="text-gray-600">Request for Quotation - Add items manually or upload a file</p>
    </div>

    <div class="bg-white rounded-lg shadow p-8">
        <form id="rfq-form" class="space-y-6">
            <!-- RFQ Details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        RFQ Title <span class="text-red-500">*</span>
                    </label>
                    <input type="text" name="title" required
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                           placeholder="e.g., Office Supplies Q1 2026">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        RFQ Title (Arabic)
                    </label>
                    <input type="text" name="title_ar"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                           placeholder="مستلزمات مكتبية Q1 2026">
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Description
                </label>
                <textarea name="description" rows="3"
                         class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                         placeholder="Additional details about this RFQ..."></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Address <span class="text-red-500">*</span>
                    </label>
                    <input type="text" name="delivery_address" required
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                           placeholder="123 Main St, Cairo">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Required Delivery Date
                    </label>
                    <input type="date" name="required_delivery_date"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                </div>
            </div>

            <!-- Items Section -->
            <div class="border-t pt-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-gray-900">RFQ Items</h3>
                    <button type="button" onclick="addItem()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                        <i class="fas fa-plus mr-2"></i>Add Item
                    </button>
                </div>

                <div id="items-container" class="space-y-4">
                    <!-- Items will be added here -->
                </div>
            </div>

            <!-- Error Message -->
            <div id="error-message" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"></div>

            <!-- Submit Button -->
            <div class="flex gap-4">
                <button type="submit" class="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 font-medium">
                    <i class="fas fa-paper-plane mr-2"></i>Create RFQ
                </button>
                <button type="button" onclick="window.location.href='/buyer/rfqs'" class="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 font-medium">
                    Cancel
                </button>
            </div>
        </form>
    </div>

    <script>
      let itemCount = 0;
      
      // Add item row
      function addItem() {
        itemCount++;
        const container = document.getElementById('items-container');
        const itemDiv = document.createElement('div');
        itemDiv.id = 'item-' + itemCount;
        itemDiv.className = 'bg-gray-50 p-4 rounded-lg border border-gray-200';
        itemDiv.innerHTML = \`
          <div class="flex justify-between items-center mb-4">
            <h4 class="font-medium text-gray-900">Item #\${itemCount}</h4>
            <button type="button" onclick="removeItem(\${itemCount})" class="text-red-600 hover:text-red-700">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
              <input type="text" name="items[\${itemCount}][item_name]" required
                     class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                     placeholder="e.g., A4 Copy Paper">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <input type="text" name="items[\${itemCount}][brand]"
                     class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                     placeholder="e.g., Double A">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
              <input type="number" name="items[\${itemCount}][quantity]" required min="1"
                     class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                     placeholder="100">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
              <input type="text" name="items[\${itemCount}][unit]" required
                     class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                     placeholder="e.g., ream, piece, box">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Specifications</label>
              <input type="text" name="items[\${itemCount}][specifications]"
                     class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                     placeholder="Optional">
            </div>
          </div>
        \`;
        container.appendChild(itemDiv);
      }
      
      // Remove item
      function removeItem(id) {
        const item = document.getElementById('item-' + id);
        if (item) item.remove();
      }
      
      // Form submission
      document.getElementById('rfq-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const items = [];
        
        // Parse items
        for (let i = 1; i <= itemCount; i++) {
          const itemName = formData.get(\`items[\${i}][item_name]\`);
          if (itemName) {
            items.push({
              item_name: itemName,
              brand: formData.get(\`items[\${i}][brand]\`) || '',
              quantity: parseFloat(formData.get(\`items[\${i}][quantity]\`)),
              unit: formData.get(\`items[\${i}][unit]\`),
              specifications: formData.get(\`items[\${i}][specifications]\`) || ''
            });
          }
        }
        
        if (items.length === 0) {
          document.getElementById('error-message').textContent = 'Please add at least one item';
          document.getElementById('error-message').classList.remove('hidden');
          return;
        }
        
        const rfqData = {
          title: formData.get('title'),
          title_ar: formData.get('title_ar') || '',
          description: formData.get('description') || '',
          delivery_address: formData.get('delivery_address'),
          required_delivery_date: formData.get('required_delivery_date') || null,
          items
        };
        
        try {
          const response = await axios.post('/api/rfqs', rfqData);
          if (response.data.success) {
            alert('RFQ created successfully! RFQ Number: ' + response.data.data.rfq_number);
            window.location.href = '/buyer/rfqs';
          }
        } catch (error) {
          const errorMsg = error.response?.data?.error || 'Failed to create RFQ';
          document.getElementById('error-message').textContent = errorMsg;
          document.getElementById('error-message').classList.remove('hidden');
        }
      });
      
      // Add first item automatically
      addItem();
    </script>
  `
  
  return c.html(buyerLayout(content, 'create-rfq'))
})

// My RFQs Listing Page
buyerPages.get('/rfqs', (c) => {
  const content = `
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">My RFQs</h1>
        <p class="text-gray-600">View and manage your requests for quotation</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
        <div class="flex gap-4">
            <select id="status-filter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="vendor_assigned">Vendor Assigned</option>
                <option value="bids_received">Bids Received</option>
                <option value="quotation_sent">Quotation Sent</option>
                <option value="accepted">Accepted</option>
            </select>
            <button onclick="loadRFQs()" class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                <i class="fas fa-sync mr-2"></i>Refresh
            </button>
        </div>
    </div>

    <!-- RFQs Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFQ Number</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody id="rfqs-table" class="bg-white divide-y divide-gray-200">
                <tr>
                    <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                        <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                        <p>Loading RFQs...</p>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    <div id="pagination" class="mt-8 flex justify-center"></div>

    <script>
      let currentPage = 1;
      let currentStatus = '';
      
      // Load RFQs
      function loadRFQs() {
        const params = new URLSearchParams({ page: currentPage, limit: 20 });
        if (currentStatus) params.append('status', currentStatus);
        
        axios.get('/api/rfqs?' + params.toString())
          .then(response => {
            if (response.data.success) {
              displayRFQs(response.data.data.rfqs);
              displayPagination(response.data.data.pagination);
            }
          })
          .catch(error => {
            document.getElementById('rfqs-table').innerHTML = '<tr><td colspan="6" class="px-6 py-12 text-center text-red-600">Failed to load RFQs</td></tr>';
          });
      }
      
      // Display RFQs
      function displayRFQs(rfqs) {
        const tbody = document.getElementById('rfqs-table');
        
        if (rfqs.length === 0) {
          tbody.innerHTML = \`
            <tr>
              <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                <i class="fas fa-file-alt text-4xl mb-2"></i>
                <p class="mb-4">No RFQs found</p>
                <a href="/buyer/rfq/create" class="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                  <i class="fas fa-plus mr-2"></i>Create Your First RFQ
                </a>
              </td>
            </tr>
          \`;
          return;
        }
        
        tbody.innerHTML = rfqs.map(rfq => {
          const statusColors = {
            draft: 'bg-gray-100 text-gray-700',
            submitted: 'bg-blue-100 text-blue-700',
            vendor_assigned: 'bg-yellow-100 text-yellow-700',
            bids_received: 'bg-purple-100 text-purple-700',
            quotation_sent: 'bg-green-100 text-green-700',
            accepted: 'bg-green-600 text-white'
          };
          
          return \`
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">\${rfq.rfq_number}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">\${rfq.title}</div>
                \${rfq.title_ar ? \`<div class="text-sm text-gray-500">\${rfq.title_ar}</div>\` : ''}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">\${rfq.item_count || rfq.total_items} items</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full \${statusColors[rfq.status] || 'bg-gray-100 text-gray-700'}">
                  \${rfq.status.replace('_', ' ')}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                \${new Date(rfq.created_at).toLocaleDateString()}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <a href="/buyer/rfqs/\${rfq.id}" class="text-purple-600 hover:text-purple-900 mr-3">
                  <i class="fas fa-eye"></i> View
                </a>
                \${rfq.status === 'draft' ? \`
                  <button onclick="submitRFQ(\${rfq.id})" class="text-green-600 hover:text-green-900">
                    <i class="fas fa-paper-plane"></i> Submit
                  </button>
                \` : ''}
              </td>
            </tr>
          \`;
        }).join('');
      }
      
      // Display pagination
      function displayPagination(pagination) {
        const div = document.getElementById('pagination');
        if (pagination.totalPages <= 1) {
          div.innerHTML = '';
          return;
        }
        
        let html = '<div class="flex gap-2">';
        if (pagination.page > 1) {
          html += \`<button onclick="changePage(\${pagination.page - 1})" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Previous</button>\`;
        }
        for (let i = 1; i <= pagination.totalPages; i++) {
          if (i === pagination.page) {
            html += \`<button class="px-4 py-2 bg-purple-600 text-white rounded-lg">\${i}</button>\`;
          } else if (i === 1 || i === pagination.totalPages || Math.abs(i - pagination.page) <= 1) {
            html += \`<button onclick="changePage(\${i})" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">\${i}</button>\`;
          }
        }
        if (pagination.page < pagination.totalPages) {
          html += \`<button onclick="changePage(\${pagination.page + 1})" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Next</button>\`;
        }
        html += '</div>';
        div.innerHTML = html;
      }
      
      // Change page
      function changePage(page) {
        currentPage = page;
        loadRFQs();
      }
      
      // Status filter
      document.getElementById('status-filter').addEventListener('change', function(e) {
        currentStatus = e.target.value;
        currentPage = 1;
        loadRFQs();
      });
      
      // Submit RFQ
      async function submitRFQ(rfqId) {
        if (!confirm('Are you sure you want to submit this RFQ? You will not be able to edit it after submission.')) {
          return;
        }
        
        try {
          const response = await axios.post(\`/api/rfqs/\${rfqId}/submit\`);
          if (response.data.success) {
            alert('RFQ submitted successfully!');
            loadRFQs();
          }
        } catch (error) {
          alert('Failed to submit RFQ: ' + (error.response?.data?.error || 'Unknown error'));
        }
      }
      
      // Initialize
      loadRFQs();
    </script>
  `
  
  return c.html(buyerLayout(content, 'rfqs'))
})

export default buyerPages
