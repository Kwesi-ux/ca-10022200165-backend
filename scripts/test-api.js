const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';
const prisma = new PrismaClient();

// Helper function to make API calls
async function apiRequest(endpoint, method = 'GET', data = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  };

  try {
    const response = await fetch(url, options);
    const responseData = await response.json().catch(() => ({}));
    
    return {
      status: response.status,
      ok: response.ok,
      data: responseData,
    };
  } catch (error) {
    console.error(`API Request Error (${method} ${endpoint}):`, error);
    throw error;
  }
}

// Test suite
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  let testProductId = null;
  let testCategoryId = null;
  let testSellerId = null;

  try {
    // Clean up any existing test data
    console.log('🧹 Cleaning up test data...');
    await prisma.product.deleteMany({
      where: { name: { contains: '[TEST]' } },
    });

    // Get or create test category
    testCategoryId = await setupTestCategory();
    testSellerId = await setupTestSeller();

    // Test 1: Create a new product
    console.log('\n✅ Test 1: Create Product');
    const newProduct = {
      name: '[TEST] New Product',
      description: 'This is a test product',
      price: '19.99',
      stock_quantity: '100',
      in_stock: true,
      category_id: testCategoryId,
      seller_id: testSellerId,
      image_url: 'https://example.com/test.jpg',
    };

    let result = await apiRequest('/products', 'POST', newProduct);
    testProductId = result.data.id;
    
    console.log('Create Product Status:', result.status);
    console.log('Created Product ID:', testProductId);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (!result.ok) {
      throw new Error('Failed to create test product');
    }

    // Test 2: Get all products
    console.log('\n✅ Test 2: Get All Products');
    result = await apiRequest('/products?limit=5');
    console.log('Get Products Status:', result.status);
    console.log('Total Products:', result.data.pagination?.total);
    console.log('First 5 Products:', JSON.stringify(result.data.data, null, 2));

    // Test 3: Get single product
    console.log('\n✅ Test 3: Get Single Product');
    result = await apiRequest(`/products/${testProductId}`);
    console.log('Get Product Status:', result.status);
    console.log('Product Details:', JSON.stringify(result.data, null, 2));

    // Test 4: Update product
    console.log('\n✅ Test 4: Update Product');
    const updatedProduct = {
      name: '[TEST] Updated Product',
      price: '24.99',
      stock_quantity: '50',
      category_id: testCategoryId,
      seller_id: testSellerId,
    };

    result = await apiRequest(`/products/${testProductId}`, 'PUT', updatedProduct);
    console.log('Update Status:', result.status);
    console.log('Updated Product:', JSON.stringify(result.data, null, 2));

    // Test 5: Delete product
    console.log('\n✅ Test 5: Delete Product');
    result = await apiRequest(`/products/${testProductId}`, 'DELETE');
    console.log('Delete Status:', result.status);
    console.log('Product Deleted:', result.status === 204 ? 'Yes' : 'No');

    // Test 6: Verify product was deleted
    console.log('\n✅ Test 6: Verify Deletion');
    result = await apiRequest(`/products/${testProductId}`);
    console.log('Get Deleted Product Status:', result.status);
    console.log('Product Found:', result.status === 200 ? 'Yes' : 'No');

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Clean up test data
    if (testProductId) {
      await prisma.product.deleteMany({
        where: { id: testProductId },
      }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

// Helper function to ensure we have a test category
async function setupTestCategory() {
  // Try to find an existing test category
  let category = await prisma.category.findFirst({
    where: { name: 'Test Category' },
  });

  // If not found, create one
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Test Category',
        description: 'A test category for API testing',
      },
    });
  }

  return category.id;
}

// Helper function to ensure we have a test seller
async function setupTestSeller() {
  // Try to find an existing test seller
  let seller = await prisma.seller.findFirst({
    where: { store_name: 'Test Store' },
  });

  // If not found, create one
  if (!seller) {
    // First create a user
    const user = await prisma.user.create({
      data: {
        username: 'testseller',
        email: 'seller@test.com',
        password_hash: 'hashedpassword', // In a real test, this should be properly hashed
      },
    });

    // Then create the seller
    seller = await prisma.seller.create({
      data: {
        store_name: 'Test Store',
        store_description: 'A test store for API testing',
        user: {
          connect: { id: user.id },
        },
      },
    });
  }

  return seller.id;
}

// Run the tests
runTests().catch(console.error);
