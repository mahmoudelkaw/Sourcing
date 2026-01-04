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

// My Orders Page
buyerPages.get('/orders', (c) => {
  const content = `
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p class="text-gray-600">Track your orders and delivery status</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="flex items-center space-x-4">
            <select id="status-filter" class="px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">All Status</option>
                <option value="pending_payment">Pending Payment</option>
                <option value="payment_received">Payment Received</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_warehouse">In Warehouse</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
            </select>
            <button onclick="loadOrders()" class="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700">
                <i class="fas fa-filter mr-2"></i>Filter
            </button>
        </div>
    </div>

    <!-- Orders List -->
    <div id="orders-list" class="space-y-4">
        <div class="text-center py-12 text-gray-400">
            <i class="fas fa-spinner fa-spin text-4xl mb-3"></i>
            <p>Loading orders...</p>
        </div>
    </div>

    <!-- Pagination -->
    <div id="pagination" class="mt-6"></div>

    <script>
        async function loadOrders(page = 1) {
            try {
                const status = document.getElementById('status-filter').value;
                const params = new URLSearchParams({ page: page.toString(), limit: '10' });
                if (status) params.append('status', status);
                
                const res = await apiCall('/api/orders?' + params);
                if (res.success) {
                    displayOrders(res.data.orders);
                    displayPagination(res.data.pagination);
                } else {
                    showError(res.error || 'Failed to load orders');
                }
            } catch (error) {
                console.error('Load orders error:', error);
                showError('Failed to load orders');
            }
        }

        function displayOrders(orders) {
            const container = document.getElementById('orders-list');
            if (!orders || orders.length === 0) {
                container.innerHTML = \`
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <i class="fas fa-inbox text-gray-300 text-5xl mb-4"></i>
                        <h3 class="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h3>
                        <p class="text-gray-500 mb-4">Your orders will appear here once created.</p>
                        <a href="/buyer/catalog" class="inline-block px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700">
                            Browse Catalog
                        </a>
                    </div>
                \`;
                return;
            }

            const statusColors = {
                pending_payment: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'fa-clock' },
                payment_received: { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'fa-check-circle' },
                confirmed: { bg: 'bg-green-100', text: 'text-green-800', icon: 'fa-check-double' },
                in_warehouse: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: 'fa-warehouse' },
                qa_pending: { bg: 'bg-orange-100', text: 'text-orange-800', icon: 'fa-clipboard-check' },
                shipped: { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'fa-shipping-fast' },
                delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: 'fa-box-open' },
                completed: { bg: 'bg-gray-100', text: 'text-gray-800', icon: 'fa-check-circle' }
            };

            container.innerHTML = orders.map(order => {
                const status = statusColors[order.status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: 'fa-question' };
                return \`
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <div class="flex items-center space-x-3 mb-3">
                                    <span class="text-sm font-mono bg-purple-100 text-purple-800 px-3 py-1 rounded-lg">\${order.order_number}</span>
                                    <span class="text-sm \${status.bg} \${status.text} px-3 py-1 rounded-lg capitalize">
                                        <i class="fas \${status.icon} mr-1"></i>\${order.status.replace(/_/g, ' ')}
                                    </span>
                                    \${order.qa_status ? \`<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">QA: \${order.qa_status}</span>\` : ''}
                                </div>
                                <div class="mb-3">
                                    <span class="text-2xl font-bold text-gray-900">EGP \${Number(order.total_amount).toLocaleString()}</span>
                                </div>
                                <div class="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                                    <div><i class="fas fa-calendar mr-1"></i>Ordered: \${new Date(order.created_at).toLocaleDateString()}</div>
                                    \${order.confirmed_at ? \`<div><i class="fas fa-check mr-1"></i>Confirmed: \${new Date(order.confirmed_at).toLocaleDateString()}</div>\` : ''}
                                    \${order.shipped_at ? \`<div><i class="fas fa-truck mr-1"></i>Shipped: \${new Date(order.shipped_at).toLocaleDateString()}</div>\` : ''}
                                    \${order.delivered_at ? \`<div><i class="fas fa-box-open mr-1"></i>Delivered: \${new Date(order.delivered_at).toLocaleDateString()}</div>\` : ''}
                                </div>
                                <div class="text-sm text-gray-500">
                                    <i class="fas fa-map-marker-alt mr-1"></i>\${order.delivery_address}
                                </div>
                            </div>
                            <div class="ml-6 flex flex-col space-y-2">
                                <button onclick="viewOrderDetails(\${order.id})" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
                                    <i class="fas fa-eye mr-1"></i>View Details
                                </button>
                                \${order.status === 'pending_payment' ? \`
                                    <button onclick="makePayment(\${order.id})" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                                        <i class="fas fa-credit-card mr-1"></i>Pay Now
                                    </button>
                                \` : ''}
                            </div>
                        </div>
                    </div>
                \`;
            }).join('');
        }

        function displayPagination(pagination) {
            const container = document.getElementById('pagination');
            if (pagination.totalPages <= 1) {
                container.innerHTML = '';
                return;
            }

            let pages = '';
            for (let i = 1; i <= pagination.totalPages; i++) {
                const active = i === pagination.page ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100';
                pages += \`<button onclick="loadOrders(\${i})" class="\${active} px-4 py-2 border border-gray-300 font-medium">\${i}</button>\`;
            }

            container.innerHTML = \`
                <div class="flex items-center justify-center space-x-1">
                    \${pages}
                </div>
            \`;
        }

        async function viewOrderDetails(orderId) {
            try {
                const res = await apiCall(\`/api/orders/\${orderId}\`);
                if (res.success) {
                    showOrderModal(res.data.order, res.data.items, res.data.payment);
                } else {
                    showToast(res.error || 'Failed to load order', 'error');
                }
            } catch (error) {
                showToast('Failed to load order', 'error');
            }
        }

        function showOrderModal(order, items, payment) {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
            modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
            
            modal.innerHTML = \`
                <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-900">\${order.order_number}</h2>
                            <p class="text-sm text-gray-600">RFQ: \${order.rfq_title || order.rfq_number}</p>
                        </div>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                    
                    <div class="p-6">
                        <!-- Order Summary -->
                        <div class="bg-gray-50 rounded-lg p-4 mb-6">
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span class="text-gray-600">Status:</span>
                                    <span class="ml-2 font-semibold capitalize">\${order.status.replace(/_/g, ' ')}</span>
                                </div>
                                <div>
                                    <span class="text-gray-600">QA Status:</span>
                                    <span class="ml-2 font-semibold capitalize">\${order.qa_status || 'Pending'}</span>
                                </div>
                                <div>
                                    <span class="text-gray-600">Total Amount:</span>
                                    <span class="ml-2 font-bold text-purple-600">EGP \${Number(order.total_amount).toLocaleString()}</span>
                                </div>
                                <div>
                                    <span class="text-gray-600">Vendor:</span>
                                    <span class="ml-2 font-semibold">\${order.vendor_company}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Order Items -->
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
                            <div class="space-y-2">
                                \${items.map(item => \`
                                    <div class="border border-gray-200 rounded-lg p-3 flex justify-between">
                                        <div>
                                            <div class="font-medium text-gray-900">\${item.item_name}</div>
                                            <div class="text-sm text-gray-600">Quantity: \${item.quantity} \${item.unit}</div>
                                        </div>
                                        <div class="text-right">
                                            <div class="font-semibold text-gray-900">EGP \${Number(item.buyer_unit_price).toLocaleString()}</div>
                                            <div class="text-sm text-gray-600">Total: EGP \${Number(item.line_total).toLocaleString()}</div>
                                        </div>
                                    </div>
                                \`).join('')}
                            </div>
                        </div>

                        <!-- Payment Info -->
                        \${payment ? \`
                            <div class="bg-blue-50 rounded-lg p-4">
                                <h3 class="text-lg font-semibold text-gray-900 mb-2">Payment Information</h3>
                                <div class="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span class="text-gray-600">Payment #:</span>
                                        <span class="ml-2 font-mono">\${payment.payment_number}</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-600">Status:</span>
                                        <span class="ml-2 font-semibold capitalize">\${payment.status}</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-600">Amount:</span>
                                        <span class="ml-2 font-bold">EGP \${Number(payment.amount).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-600">Method:</span>
                                        <span class="ml-2 capitalize">\${payment.payment_method?.replace(/_/g, ' ')}</span>
                                    </div>
                                </div>
                            </div>
                        \` : ''}

                        <!-- Delivery Address -->
                        <div class="mt-4 text-sm text-gray-600">
                            <i class="fas fa-map-marker-alt mr-1"></i>
                            <span class="font-medium">Delivery Address:</span>
                            <span class="ml-1">\${order.delivery_address}</span>
                        </div>
                    </div>
                </div>
            \`;
            
            document.body.appendChild(modal);
        }

        async function makePayment(orderId) {
            const method = prompt('Payment Method (bank_transfer/cash/credit_card):', 'bank_transfer');
            if (!method) return;
            
            const reference = prompt('Transaction Reference (optional):');
            
            try {
                const res = await apiCall(\`/api/orders/\${orderId}/confirm-payment\`, {
                    method: 'POST',
                    body: JSON.stringify({
                        payment_method: method,
                        transaction_reference: reference
                    })
                });
                
                if (res.success) {
                    showToast('Payment confirmation submitted for verification');
                    loadOrders();
                } else {
                    showToast(res.error || 'Failed to submit payment', 'error');
                }
            } catch (error) {
                showToast('Failed to submit payment', 'error');
            }
        }

        function showError(message) {
            document.getElementById('orders-list').innerHTML = \`
                <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <i class="fas fa-exclamation-circle text-red-600 text-3xl mb-2"></i>
                    <p class="text-red-800">\${message}</p>
                </div>
            \`;
        }

        function showToast(message, type = 'success') {
            const toast = document.createElement('div');
            const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
            toast.className = \`fixed top-4 right-4 \${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50\`;
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        // Load orders on page load
        loadOrders();
    </script>
  `
  
  return c.html(buyerLayout(content, 'orders'))
})

// Upload & OCR Page
buyerPages.get('/upload', (c) => {
  const content = `
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Upload & Create RFQ</h1>
        <p class="text-gray-600">Upload images of invoices, quotes, or product catalogs to auto-create RFQs</p>
    </div>

    <!-- Upload Section -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">
            <i class="fas fa-cloud-upload-alt mr-2 text-purple-600"></i>
            Upload Image for OCR
        </h2>
        
        <div class="mb-6">
            <div id="drop-zone" class="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-purple-500 transition-colors cursor-pointer">
                <i class="fas fa-file-image text-6xl text-gray-300 mb-4"></i>
                <p class="text-lg font-medium text-gray-700 mb-2">Drop an image here or click to browse</p>
                <p class="text-sm text-gray-500 mb-4">Supported: JPG, PNG, WebP (Max 5MB)</p>
                <input type="file" id="file-input" accept="image/jpeg,image/jpg,image/png,image/webp" class="hidden">
                <button onclick="document.getElementById('file-input').click()" class="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700">
                    <i class="fas fa-folder-open mr-2"></i>Select File
                </button>
            </div>
        </div>

        <div id="preview-section" class="hidden">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Selected File</h3>
            <div class="flex items-center space-x-4 mb-4">
                <img id="preview-image" src="" alt="Preview" class="w-32 h-32 object-cover rounded-lg border border-gray-200">
                <div class="flex-1">
                    <p class="font-medium text-gray-900" id="file-name">filename.jpg</p>
                    <p class="text-sm text-gray-600" id="file-size">0 KB</p>
                    <button onclick="clearFile()" class="text-sm text-red-600 hover:text-red-800 mt-2">
                        <i class="fas fa-times mr-1"></i>Remove
                    </button>
                </div>
            </div>
            <button onclick="processOCR()" id="process-btn" class="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                <i class="fas fa-magic mr-2"></i>Process with AI OCR
            </button>
        </div>
    </div>

    <!-- Results Section -->
    <div id="results-section" class="hidden">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">
                <i class="fas fa-check-circle mr-2 text-green-600"></i>
                Extracted Data
            </h2>
            
            <div id="extracted-data" class="space-y-4">
                <!-- Results will be populated here -->
            </div>

            <div class="mt-6 pt-6 border-t border-gray-200">
                <button onclick="createRFQFromOCR()" class="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700">
                    <i class="fas fa-file-alt mr-2"></i>Create RFQ from This Data
                </button>
                <button onclick="resetForm()" class="ml-4 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200">
                    <i class="fas fa-redo mr-2"></i>Upload Another
                </button>
            </div>
        </div>
    </div>

    <script>
        let selectedFile = null;
        let extractedData = null;

        // File input change handler
        document.getElementById('file-input').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                handleFileSelect(file);
            }
        });

        // Drag and drop
        const dropZone = document.getElementById('drop-zone');
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-purple-500', 'bg-purple-50');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('border-purple-500', 'bg-purple-50');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-purple-500', 'bg-purple-50');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleFileSelect(file);
            } else {
                showToast('Please drop an image file', 'error');
            }
        });

        function handleFileSelect(file) {
            selectedFile = file;
            
            // Show preview
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('preview-image').src = e.target.result;
                document.getElementById('file-name').textContent = file.name;
                document.getElementById('file-size').textContent = (file.size / 1024).toFixed(2) + ' KB';
                document.getElementById('preview-section').classList.remove('hidden');
                document.getElementById('results-section').classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }

        function clearFile() {
            selectedFile = null;
            document.getElementById('preview-section').classList.add('hidden');
            document.getElementById('file-input').value = '';
        }

        async function processOCR() {
            if (!selectedFile) {
                showToast('Please select a file first', 'error');
                return;
            }

            const processBtn = document.getElementById('process-btn');
            processBtn.disabled = true;
            processBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';

            try {
                const formData = new FormData();
                formData.append('file', selectedFile);

                const token = localStorage.getItem('token');
                const response = await fetch('/api/upload/ocr', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    extractedData = result.data.extracted_data;
                    displayExtractedData(extractedData);
                    document.getElementById('results-section').classList.remove('hidden');
                    showToast('Data extracted successfully!');
                } else {
                    showToast(result.error || 'Failed to process image', 'error');
                }
            } catch (error) {
                console.error('OCR error:', error);
                showToast('Failed to process image', 'error');
            } finally {
                processBtn.disabled = false;
                processBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>Process with AI OCR';
            }
        }

        function displayExtractedData(data) {
            const container = document.getElementById('extracted-data');
            
            let html = \`
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 class="font-semibold text-blue-900 mb-2">
                        <i class="fas fa-robot mr-2"></i>AI Extracted Information
                    </h3>
                    <div class="space-y-2 text-sm">
                        <div><strong>Title:</strong> \${data.title || 'Not detected'}</div>
                        \${data.delivery_address ? \`<div><strong>Delivery Address:</strong> \${data.delivery_address}</div>\` : ''}
                        \${data.notes ? \`<div><strong>Notes:</strong> \${data.notes}</div>\` : ''}
                    </div>
                </div>

                <div>
                    <h4 class="font-semibold text-gray-900 mb-3">Extracted Items (\${data.items?.length || 0})</h4>
                    <div class="space-y-2">
                        \${(data.items || []).map((item, index) => \`
                            <div class="border border-gray-200 rounded-lg p-4">
                                <div class="flex items-start justify-between">
                                    <div class="flex-1">
                                        <div class="font-medium text-gray-900">\${index + 1}. \${item.item_name}</div>
                                        <div class="text-sm text-gray-600 mt-1">
                                            <span class="mr-4"><i class="fas fa-cubes mr-1"></i>Qty: \${item.quantity || 1} \${item.unit || 'pieces'}</span>
                                            \${item.brand ? \`<span class="mr-4"><i class="fas fa-tag mr-1"></i>Brand: \${item.brand}</span>\` : ''}
                                        </div>
                                        \${item.specifications ? \`<div class="text-xs text-gray-500 mt-1">\${item.specifications}</div>\` : ''}
                                    </div>
                                    <i class="fas fa-check-circle text-green-600 text-xl"></i>
                                </div>
                            </div>
                        \`).join('')}
                    </div>
                </div>
            \`;
            
            container.innerHTML = html;
        }

        async function createRFQFromOCR() {
            if (!extractedData) {
                showToast('No data to create RFQ', 'error');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/upload/create-rfq', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: extractedData.title || 'Uploaded RFQ',
                        description: extractedData.notes || 'Created from uploaded image',
                        delivery_address: extractedData.delivery_address || 'To be specified',
                        items: extractedData.items,
                        source: 'ocr'
                    })
                });

                const result = await response.json();

                if (result.success) {
                    showToast('RFQ created successfully!');
                    setTimeout(() => {
                        window.location.href = '/buyer/rfqs';
                    }, 1500);
                } else {
                    showToast(result.error || 'Failed to create RFQ', 'error');
                }
            } catch (error) {
                console.error('Create RFQ error:', error);
                showToast('Failed to create RFQ', 'error');
            }
        }

        function resetForm() {
            selectedFile = null;
            extractedData = null;
            document.getElementById('preview-section').classList.add('hidden');
            document.getElementById('results-section').classList.add('hidden');
            document.getElementById('file-input').value = '';
        }

        function showToast(message, type = 'success') {
            const toast = document.createElement('div');
            const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
            toast.className = \`fixed top-4 right-4 \${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50\`;
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
    </script>
  `
  
  return c.html(buyerLayout(content, 'upload'))
})

export default buyerPages
