import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Users
  const passwordHash = await argon2.hash('Password123!');

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@ecommerce.com' },
    update: {},
    create: {
      email: 'superadmin@ecommerce.com',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+919999999991',
      role: 'SUPER_ADMIN',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecommerce.com' },
    update: {},
    create: {
      email: 'admin@ecommerce.com',
      passwordHash,
      firstName: 'Main',
      lastName: 'Admin',
      phone: '+919999999992',
      role: 'ADMIN',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@ecommerce.com' },
    update: {},
    create: {
      email: 'manager@ecommerce.com',
      passwordHash,
      firstName: 'Store',
      lastName: 'Manager',
      phone: '+919999999993',
      role: 'MANAGER',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@ecommerce.com' },
    update: {},
    create: {
      email: 'customer@ecommerce.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+919999999994',
      role: 'CUSTOMER',
      addresses: {
        create: {
          street: '123 MG Road, Koramangala',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560034',
          country: 'IN',
          isDefault: true,
        },
      },
    },
  });

  console.log('✅ Users seeded successfully');

  // 2. Create Categories
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Gadgets, smartphones, audio and electronics',
    },
  });

  const mobiles = await prisma.category.upsert({
    where: { slug: 'mobiles' },
    update: {},
    create: {
      name: 'Mobiles',
      slug: 'mobiles',
      description: 'Smartphones and accessories',
      parentId: electronics.id,
    },
  });

  const audio = await prisma.category.upsert({
    where: { slug: 'audio' },
    update: {},
    create: {
      name: 'Audio',
      slug: 'audio',
      description: 'Headphones, earphones and speakers',
      parentId: electronics.id,
    },
  });

  const fashion = await prisma.category.upsert({
    where: { slug: 'fashion' },
    update: {},
    create: {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Clothing, footwear and apparel',
    },
  });

  const footwear = await prisma.category.upsert({
    where: { slug: 'footwear' },
    update: {},
    create: {
      name: 'Footwear',
      slug: 'footwear',
      description: 'Shoes, sneakers and sports footwear',
      parentId: fashion.id,
    },
  });

  console.log('✅ Categories seeded successfully');

  // 3. Create Brands
  const apple = await prisma.brand.upsert({
    where: { slug: 'apple' },
    update: {},
    create: {
      name: 'Apple',
      slug: 'apple',
      description: 'Think Different',
      logoUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300',
    },
  });

  const nike = await prisma.brand.upsert({
    where: { slug: 'nike' },
    update: {},
    create: {
      name: 'Nike',
      slug: 'nike',
      description: 'Just Do It',
      logoUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
    },
  });

  const sony = await prisma.brand.upsert({
    where: { slug: 'sony' },
    update: {},
    create: {
      name: 'Sony',
      slug: 'sony',
      description: 'Be Moved',
      logoUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
    },
  });

  const samsung = await prisma.brand.upsert({
    where: { slug: 'samsung' },
    update: {},
    create: {
      name: 'Samsung',
      slug: 'samsung',
      description: 'Do What You Cant',
      logoUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300',
    },
  });

  console.log('✅ Brands seeded successfully');

  // 4. Create Products & Variants
  const iphone15 = await prisma.product.upsert({
    where: { slug: 'iphone-15-pro' },
    update: {},
    create: {
      name: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description:
        'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and a more versatile pro camera system.',
      categoryId: mobiles.id,
      brandId: apple.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
            altText: 'iPhone 15 Pro Titanium',
            isPrimary: true,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: 'IPH15P-BLK-128',
            price: 134900.0,
            color: 'Black Titanium',
            size: '128GB',
            weight: 0.187,
            inventory: {
              create: {
                availableStock: 50,
                reservedStock: 0,
                soldStock: 0,
              },
            },
          },
          {
            sku: 'IPH15P-BLU-256',
            price: 144900.0,
            color: 'Blue Titanium',
            size: '256GB',
            weight: 0.187,
            inventory: {
              create: {
                availableStock: 30,
                reservedStock: 0,
                soldStock: 0,
              },
            },
          },
        ],
      },
    },
  });

  const nikeAirMax = await prisma.product.upsert({
    where: { slug: 'nike-air-max-270' },
    update: {},
    create: {
      name: 'Nike Air Max 270',
      slug: 'nike-air-max-270',
      description:
        "Boasting Nike's biggest heel Air unit yet, the Nike Air Max 270 delivers visible air under every step.",
      categoryId: footwear.id,
      brandId: nike.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
            altText: 'Nike Air Max Red Black',
            isPrimary: true,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: 'AIRMAX-BLK-8',
            price: 12995.0,
            color: 'Black/Red',
            size: 'UK 8',
            weight: 0.75,
            inventory: {
              create: {
                availableStock: 25,
                reservedStock: 0,
                soldStock: 0,
              },
            },
          },
          {
            sku: 'AIRMAX-BLK-9',
            price: 12995.0,
            color: 'Black/Red',
            size: 'UK 9',
            weight: 0.78,
            inventory: {
              create: {
                availableStock: 20,
                reservedStock: 0,
                soldStock: 0,
              },
            },
          },
        ],
      },
    },
  });

  const sonyHeadphones = await prisma.product.upsert({
    where: { slug: 'sony-wh-1000xm5' },
    update: {},
    create: {
      name: 'Sony WH-1000XM5 Wireless Headphones',
      slug: 'sony-wh-1000xm5',
      description:
        'Industry Leading Noise Canceling with two processors and 8 microphones for unprecedented noise cancellation and exceptional call quality.',
      categoryId: audio.id,
      brandId: sony.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
            altText: 'Sony WH-1000XM5 Black',
            isPrimary: true,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: 'SONY-XM5-BLK',
            price: 29990.0,
            color: 'Black',
            size: 'Over-Ear',
            weight: 0.25,
            inventory: {
              create: {
                availableStock: 40,
                reservedStock: 0,
                soldStock: 0,
              },
            },
          },
          {
            sku: 'SONY-XM5-SLV',
            price: 29990.0,
            color: 'Silver',
            size: 'Over-Ear',
            weight: 0.25,
            inventory: {
              create: {
                availableStock: 15,
                reservedStock: 0,
                soldStock: 0,
              },
            },
          },
        ],
      },
    },
  });

  console.log('✅ Products & Variants seeded successfully');

  // 5. Create Coupons
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 2);

  await prisma.coupon.upsert({
    where: { code: 'SAVE20' },
    update: {},
    create: {
      code: 'SAVE20',
      description: '20% off on orders above ₹2000 (Max ₹1000)',
      discountType: 'PERCENTAGE',
      discountValue: 20.0,
      minOrderValue: 2000.0,
      maxDiscount: 1000.0,
      usageLimit: 1000,
      perUserLimit: 2,
      validFrom: new Date(),
      validUntil: futureDate,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'WELCOME500' },
    update: {},
    create: {
      code: 'WELCOME500',
      description: 'Flat ₹500 off on first order above ₹2500',
      discountType: 'FIXED',
      discountValue: 500.0,
      minOrderValue: 2500.0,
      usageLimit: 500,
      perUserLimit: 1,
      validFrom: new Date(),
      validUntil: futureDate,
    },
  });

  console.log('✅ Coupons seeded successfully');

  // 6. Create sample review
  await prisma.review.upsert({
    where: {
      userId_productId: {
        userId: customer.id,
        productId: nikeAirMax.id,
      },
    },
    update: {},
    create: {
      userId: customer.id,
      productId: nikeAirMax.id,
      rating: 5,
      title: 'Extremely comfortable sneakers!',
      comment: 'The air cushion is amazing for daily walking. Great build quality.',
      isVerified: true,
    },
  });

  console.log('✅ Sample reviews seeded');
  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
