import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Hash passwords
  const hashedSellerPassword = await bcrypt.hash('seller123', 10);
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@example.com',
      password_hash: hashedAdminPassword,
      is_active: true,
      administrators: {
        create: {
          admin_level: 1,
          can_manage_products: true,
          can_manage_users: true,
          can_manage_orders: true,
          can_manage_refunds: true,
        },
      },
    },
  });

  console.log('Created admin user:', admin.id);

  // Create seller user
  const user = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      username: 'seller_user',
      email: 'seller@example.com',
      password_hash: hashedSellerPassword,
      is_active: true,
    },
  });

  console.log('Created user:', user.id);

  // Create a seller
  const seller = await prisma.seller.upsert({
    where: { user_id: user.id },
    update: {},
    create: {
      user_id: user.id,
      store_name: 'Tech Store',
      store_description: 'Your one-stop shop for all tech products',
      rating: 5,
      is_verified: true,
    },
  });

  console.log('Created seller:', seller.id);

  // Create categories
  const categories = [
    {
      name: 'Electronics',
      description: 'Electronic devices and accessories',
    },
    {
      name: 'Computers',
      description: 'Laptops, desktops, and computer accessories',
    },
    {
      name: 'Mobile Phones',
      description: 'Smartphones and mobile accessories',
    },
    {
      name: 'Audio',
      description: 'Headphones, speakers, and audio equipment',
    },
    {
      name: 'Gaming',
      description: 'Gaming consoles, games, and accessories',
    },
  ];

  const createdCategories = [];
  for (const category of categories) {
    // Check if category exists by name
    const existing = await prisma.category.findFirst({
      where: { name: category.name },
    });
    
    const created = existing || await prisma.category.create({
      data: category,
    });
    
    createdCategories.push(created);
    console.log('Created/found category:', created.name);
  }

  // Create products for each category
  const products = [
    // Electronics
    {
      name: 'Smart TV 55"',
      description: '4K Ultra HD Smart LED TV with HDR',
      price: 599.99,
      in_stock: true,
      stock_quantity: 25,
      image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500',
      category_id: createdCategories[0].id,
      seller_id: seller.id,
    },
    {
      name: 'Wireless Router',
      description: 'Dual-band WiFi 6 router with advanced security',
      price: 89.99,
      in_stock: true,
      stock_quantity: 50,
      image_url: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
      category_id: createdCategories[0].id,
      seller_id: seller.id,
    },
    {
      name: 'Smart Watch',
      description: 'Fitness tracker with heart rate monitor',
      price: 199.99,
      in_stock: true,
      stock_quantity: 100,
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      category_id: createdCategories[0].id,
      seller_id: seller.id,
    },
    // Computers
    {
      name: 'Gaming Laptop',
      description: 'High-performance laptop with RTX 4060 GPU',
      price: 1299.99,
      in_stock: true,
      stock_quantity: 15,
      image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500',
      category_id: createdCategories[1].id,
      seller_id: seller.id,
    },
    {
      name: 'Mechanical Keyboard',
      description: 'RGB backlit mechanical keyboard with blue switches',
      price: 79.99,
      in_stock: true,
      stock_quantity: 75,
      image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
      category_id: createdCategories[1].id,
      seller_id: seller.id,
    },
    {
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with 6 programmable buttons',
      price: 39.99,
      in_stock: true,
      stock_quantity: 120,
      image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
      category_id: createdCategories[1].id,
      seller_id: seller.id,
    },
    {
      name: '27" Monitor',
      description: '2K QHD IPS monitor with 144Hz refresh rate',
      price: 349.99,
      in_stock: true,
      stock_quantity: 30,
      image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500',
      category_id: createdCategories[1].id,
      seller_id: seller.id,
    },
    // Mobile Phones
    {
      name: 'Smartphone Pro',
      description: 'Latest flagship smartphone with 5G',
      price: 999.99,
      in_stock: true,
      stock_quantity: 40,
      image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
      category_id: createdCategories[2].id,
      seller_id: seller.id,
    },
    {
      name: 'Phone Case',
      description: 'Protective case with military-grade drop protection',
      price: 24.99,
      in_stock: true,
      stock_quantity: 200,
      image_url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500',
      category_id: createdCategories[2].id,
      seller_id: seller.id,
    },
    {
      name: 'Screen Protector',
      description: 'Tempered glass screen protector',
      price: 12.99,
      in_stock: true,
      stock_quantity: 150,
      image_url: 'https://images.unsplash.com/photo-1585789575802-b4eb8e6f6e7e?w=500',
      category_id: createdCategories[2].id,
      seller_id: seller.id,
    },
    // Audio
    {
      name: 'Wireless Headphones',
      description: 'Noise-cancelling over-ear headphones',
      price: 249.99,
      in_stock: true,
      stock_quantity: 60,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      category_id: createdCategories[3].id,
      seller_id: seller.id,
    },
    {
      name: 'Bluetooth Speaker',
      description: 'Portable waterproof speaker with 20-hour battery',
      price: 79.99,
      in_stock: true,
      stock_quantity: 80,
      image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
      category_id: createdCategories[3].id,
      seller_id: seller.id,
    },
    {
      name: 'Earbuds Pro',
      description: 'True wireless earbuds with active noise cancellation',
      price: 179.99,
      in_stock: true,
      stock_quantity: 90,
      image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
      category_id: createdCategories[3].id,
      seller_id: seller.id,
    },
    // Gaming
    {
      name: 'Gaming Console',
      description: 'Next-gen gaming console with 1TB storage',
      price: 499.99,
      in_stock: true,
      stock_quantity: 20,
      image_url: 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=500',
      category_id: createdCategories[4].id,
      seller_id: seller.id,
    },
    {
      name: 'Gaming Controller',
      description: 'Wireless controller with haptic feedback',
      price: 69.99,
      in_stock: true,
      stock_quantity: 100,
      image_url: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=500',
      category_id: createdCategories[4].id,
      seller_id: seller.id,
    },
    {
      name: 'VR Headset',
      description: 'Virtual reality headset with motion controllers',
      price: 399.99,
      in_stock: true,
      stock_quantity: 25,
      image_url: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=500',
      category_id: createdCategories[4].id,
      seller_id: seller.id,
    },
  ];

  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    });
    console.log('Created product:', created.name);
  }

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
