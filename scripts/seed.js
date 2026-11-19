/**
 * Run with: npm run seed
 * Seeds the complete boutique data for JAI WOMENS WORLD:
 * - Admin account
 * - Store Settings (linked to admin settings & storefront footer)
 * - Default Categories with high-res boutique imagery
 * - Sample Products (Kurtis, Salwar Sets, Nighties) with real variants
 * - Dynamic Carousel Banners
 * - Verified Customer Reviews
 */
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI in .env. Add your MongoDB Atlas connection string first.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('✓ Connected to MongoDB Atlas');

  // Schemas
  const AdminSchema = new mongoose.Schema(
    { name: String, email: { type: String, unique: true }, passwordHash: String, role: String },
    { timestamps: true }
  );

  const CategorySchema = new mongoose.Schema(
    { name: String, slug: { type: String, unique: true }, image: String, description: String, sizes: [String], sortOrder: Number, isActive: Boolean },
    { timestamps: true }
  );

  const SettingsSchema = new mongoose.Schema({ key: { type: String, unique: true } }, { strict: false, timestamps: true });

  const VariantSchema = new mongoose.Schema(
    {
      color: String,
      colorHex: String,
      images: [String],
      price: Number,
      compareAtPrice: Number,
      sizes: [{ size: String, stock: Number, sku: String, price: Number }]
    },
    { _id: true }
  );

  const ProductSchema = new mongoose.Schema(
    {
      name: String,
      slug: { type: String, unique: true },
      sku: { type: String, unique: true },
      description: String,
      category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
      fabric: String,
      tags: [String],
      variants: [VariantSchema],
      basePrice: Number,
      rating: Number,
      reviewCount: Number,
      isBestSeller: Boolean,
      isTopSeller: Boolean,
      isActiveSeller: Boolean,
      isFeatured: Boolean,
      isActive: Boolean,
      soldCount: Number,
    },
    { timestamps: true }
  );

  const BannerSchema = new mongoose.Schema(
    {
      title: String,
      subtitle: String,
      image: String,
      mobileImage: String,
      link: String,
      buttonText: String,
      sortOrder: Number,
      isActive: Boolean
    },
    { timestamps: true }
  );

  const ReviewSchema = new mongoose.Schema(
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      customerName: String,
      rating: Number,
      comment: String,
      images: [String],
      isApproved: Boolean,
      isFeatured: Boolean,
      isVerifiedPurchase: Boolean
    },
    { timestamps: true }
  );

  const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
  const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
  const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
  const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
  const Banner = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);
  const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

  // 1. Admin Account
  const email = (process.env.ADMIN_EMAIL || 'jaiwomensworld@gmail.com').toLowerCase();
  const existingAdmin = await Admin.findOne({ email });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10);
    await Admin.create({ name: 'Jai Womens World Admin', email, passwordHash, role: 'owner' });
    console.log(`✓ Created admin account: ${email}`);
  } else {
    console.log(`✓ Admin account exists: ${email}`);
  }

  // 2. Global Store Settings for Jai Womens World
  await Settings.findOneAndUpdate(
    { key: 'global' },
    {
      $set: {
        key: 'global',
        storeName: 'JAI WOMENS WORLD',
        businessUnitOf: 'Jai Womens World',
        tagline: "Women's Fashion Boutique",
        whatsapp: '919500381414',
        phone: '9500381414',
        phone2: '9500381414',
        email: 'jaiwomensworld@gmail.com',
        instagram: 'jaiwomensworld',
        address: '24, Chengam Road, 2nd Street, Tiruvannamalai, Tamil Nadu – 606601, India.',
        logo: '/Jai-logo.jpeg',
        shippingFee: 49,
        freeShippingAbove: 999,
        seoTitle: "Jai Womens World | Premium Women's Fashion Boutique",
        seoDescription: "Discover curated women's kurtis, salwar sets, nighties and chic ethnic boutique collections in Tiruvannamalai, Tamil Nadu."
      }
    },
    { upsert: true, new: true }
  );
  console.log('✓ Store settings updated for JAI WOMENS WORLD');

  // 3. Categories with Images
  const categoriesData = [
    {
      name: 'Salwar Set',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      description: 'Elegant handcrafted salwar suit sets with matching dupattas for everyday charm and celebrations.'
    },
    {
      name: 'Rayon Umbrella Kurtis',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      description: 'Graceful flared umbrella kurtis crafted in ultra-breathable, silky-soft rayon fabric.'
    },
    {
      name: 'Side Open Kurtis',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      description: 'Versatile straight-cut side open kurtis perfect for college, office, and casual days.'
    },
    {
      name: 'Umbrella Kurtis',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
      description: 'Flared silhouettes designed to bring a dramatic feminine drape with everyday comfort.'
    },
    {
      name: 'Nighties',
      sizes: ['M', 'L', 'XL', 'XXL', 'Free Size'],
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      description: 'Pure 100% breathable cotton daily nightwear with reinforced seams and relaxed tailoring.'
    },
    {
      name: 'Innerwear',
      sizes: ['S', 'M', 'L', 'XL'],
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      description: 'Everyday comfort essentials tailored with smooth, stretchable, skin-friendly fabrics.'
    },
    {
      name: '2 Piece Set',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
      description: 'Coordinated kurti and bottom sets crafted for effortless styling in minutes.'
    }
  ];

  const categoryMap = {};
  for (let i = 0; i < categoriesData.length; i++) {
    const c = categoriesData[i];
    const slug = slugify(c.name, { lower: true });
    const cat = await Category.findOneAndUpdate(
      { slug },
      { $set: { ...c, slug, sortOrder: i, isActive: true } },
      { upsert: true, new: true }
    );
    categoryMap[slug] = cat;
  }
  console.log(`✓ Verified/updated ${categoriesData.length} categories with imagery`);

  // 4. Sample Products
  const productsCount = await Product.countDocuments();
  let firstProduct = null;
  if (productsCount === 0) {
    console.log('Seeding boutique products into catalog...');
    const sampleProducts = [
      {
        name: 'Floral Anarkali Rayon Umbrella Kurti',
        slug: 'floral-anarkali-rayon-umbrella-kurti',
        sku: 'JWW-RAYON-001',
        description: 'Exquisite flared anarkali kurti in premium 14kg rayon with intricate foil botanical motifs. Soft, breathable, and designed for flowing silhouette.',
        category: categoryMap['rayon-umbrella-kurtis']?._id,
        fabric: 'Premium 14kg Rayon',
        tags: ['kurti', 'umbrella', 'anarkali', 'rayon', 'bestseller'],
        basePrice: 799,
        rating: 4.9,
        reviewCount: 28,
        isBestSeller: true,
        isTopSeller: true,
        isActiveSeller: true,
        isFeatured: true,
        isActive: true,
        soldCount: 142,
        variants: [
          {
            color: 'Rose Wine',
            colorHex: '#B98270',
            price: 799,
            compareAtPrice: 1299,
            images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'],
            sizes: [
              { size: 'M', stock: 15, sku: 'JWW-RAYON-001-M', price: 799 },
              { size: 'L', stock: 20, sku: 'JWW-RAYON-001-L', price: 799 },
              { size: 'XL', stock: 12, sku: 'JWW-RAYON-001-XL', price: 799 },
              { size: 'XXL', stock: 8, sku: 'JWW-RAYON-001-XXL', price: 799 }
            ]
          }
        ]
      },
      {
        name: 'Pure Cotton Straight Cut Side Open Kurti',
        slug: 'pure-cotton-straight-cut-side-open-kurti',
        sku: 'JWW-COTTON-002',
        description: 'Handcrafted straight cut kurti in 100% fine combed cotton. Features elegant wooden button placket and comfortable side slits.',
        category: categoryMap['side-open-kurtis']?._id,
        fabric: '100% Combed Cotton',
        tags: ['kurti', 'cotton', 'side-open', 'office-wear'],
        basePrice: 549,
        rating: 4.8,
        reviewCount: 19,
        isBestSeller: false,
        isTopSeller: true,
        isActiveSeller: true,
        isFeatured: true,
        isActive: true,
        soldCount: 98,
        variants: [
          {
            color: 'Sage Mint',
            colorHex: '#8CA08B',
            price: 549,
            compareAtPrice: 899,
            images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'],
            sizes: [
              { size: 'S', stock: 10, sku: 'JWW-COTTON-002-S', price: 549 },
              { size: 'M', stock: 18, sku: 'JWW-COTTON-002-M', price: 549 },
              { size: 'L', stock: 15, sku: 'JWW-COTTON-002-L', price: 549 },
              { size: 'XL', stock: 10, sku: 'JWW-COTTON-002-XL', price: 549 }
            ]
          }
        ]
      },
      {
        name: 'Handcrafted Festive Salwar Suit Set (With Dupatta)',
        slug: 'handcrafted-festive-salwar-suit-set',
        sku: 'JWW-SALWAR-003',
        description: 'Luxurious 3-piece festive ensemble featuring zari embroidery, matching cotton silk pants, and an ethereal printed organza dupatta.',
        category: categoryMap['salwar-set']?._id,
        fabric: 'Cotton Silk Blend',
        tags: ['salwar', 'suit', 'festive', 'dupatta'],
        basePrice: 1299,
        rating: 5.0,
        reviewCount: 34,
        isBestSeller: true,
        isTopSeller: true,
        isActiveSeller: true,
        isFeatured: true,
        isActive: true,
        soldCount: 86,
        variants: [
          {
            color: 'Powder Sky Blue',
            colorHex: '#94B4C1',
            price: 1299,
            compareAtPrice: 1999,
            images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'],
            sizes: [
              { size: 'M', stock: 12, sku: 'JWW-SALWAR-003-M', price: 1299 },
              { size: 'L', stock: 14, sku: 'JWW-SALWAR-003-L', price: 1299 },
              { size: 'XL', stock: 8, sku: 'JWW-SALWAR-003-XL', price: 1299 }
            ]
          }
        ]
      },
      {
        name: 'Soft Breathable Cotton Printed Daily Nighty',
        slug: 'soft-breathable-cotton-printed-daily-nighty',
        sku: 'JWW-NIGHTY-004',
        description: 'Comfort at its purest. Ultra-soft breathable nighty with floral discharge prints and durable interlock stitching.',
        category: categoryMap['nighties']?._id,
        fabric: '100% Breathable Cotton',
        tags: ['nighty', 'cotton', 'dailywear', 'comfort'],
        basePrice: 399,
        rating: 4.9,
        reviewCount: 42,
        isBestSeller: true,
        isTopSeller: true,
        isActiveSeller: true,
        isFeatured: true,
        isActive: true,
        soldCount: 210,
        variants: [
          {
            color: 'Blush Coral',
            colorHex: '#D8B5A9',
            price: 399,
            compareAtPrice: 650,
            images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'],
            sizes: [
              { size: 'L', stock: 25, sku: 'JWW-NIGHTY-004-L', price: 399 },
              { size: 'XL', stock: 30, sku: 'JWW-NIGHTY-004-XL', price: 399 },
              { size: 'XXL', stock: 20, sku: 'JWW-NIGHTY-004-XXL', price: 399 }
            ]
          }
        ]
      },
      {
        name: 'Chic Embroidered 2-Piece Kurti & Pant Set',
        slug: 'chic-embroidered-2-piece-kurti-pant-set',
        sku: 'JWW-2PC-005',
        description: 'Effortlessly stylish dual piece set. Features delicate thread embroidery at neckline and relaxed ankle-length cigarette pants.',
        category: categoryMap['2-piece-set']?._id,
        fabric: 'Slub Cotton Blend',
        tags: ['2piece', 'co-ord', 'kurti-pant', 'stylish'],
        basePrice: 999,
        rating: 4.8,
        reviewCount: 16,
        isBestSeller: false,
        isTopSeller: true,
        isActiveSeller: true,
        isFeatured: true,
        isActive: true,
        soldCount: 74,
        variants: [
          {
            color: 'Navy Ivory',
            colorHex: '#172333',
            price: 999,
            compareAtPrice: 1499,
            images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'],
            sizes: [
              { size: 'M', stock: 15, sku: 'JWW-2PC-005-M', price: 999 },
              { size: 'L', stock: 18, sku: 'JWW-2PC-005-L', price: 999 },
              { size: 'XL', stock: 12, sku: 'JWW-2PC-005-XL', price: 999 }
            ]
          }
        ]
      },
      {
        name: 'Tiered Flared Umbrella Party Kurti',
        slug: 'tiered-flared-umbrella-party-kurti',
        sku: 'JWW-UMB-006',
        description: 'Multi-tiered umbrella silhouette creating a grand sweep. Perfect for semi-formal events, family gatherings, and festivals.',
        category: categoryMap['umbrella-kurtis']?._id,
        fabric: 'Heavy Rayon',
        tags: ['umbrella', 'tiered', 'kurti', 'festive'],
        basePrice: 849,
        rating: 4.9,
        reviewCount: 22,
        isBestSeller: false,
        isTopSeller: true,
        isActiveSeller: true,
        isFeatured: true,
        isActive: true,
        soldCount: 115,
        variants: [
          {
            color: 'Terracotta Rust',
            colorHex: '#B98270',
            price: 849,
            compareAtPrice: 1350,
            images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'],
            sizes: [
              { size: 'M', stock: 14, sku: 'JWW-UMB-006-M', price: 849 },
              { size: 'L', stock: 20, sku: 'JWW-UMB-006-L', price: 849 },
              { size: 'XL', stock: 15, sku: 'JWW-UMB-006-XL', price: 849 }
            ]
          }
        ]
      }
    ];

    for (const p of sampleProducts) {
      const created = await Product.create(p);
      if (!firstProduct) firstProduct = created;
    }
    console.log(`✓ Seeded ${sampleProducts.length} boutique products`);
  } else {
    firstProduct = await Product.findOne();
    console.log(`✓ Database already has ${productsCount} products`);
  }

  // 5. Dynamic Carousel Banners in Database
  const bannersCount = await Banner.countDocuments();
  if (bannersCount === 0) {
    await Banner.create([
      {
        title: 'Timeless Festive & Everyday Edit',
        subtitle: 'Handpicked Kurtis, Salwar Sets & Daily Comforts',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85',
        link: '/products',
        buttonText: 'Explore Collection',
        sortOrder: 0,
        isActive: true
      },
      {
        title: 'The Graceful Salwar Collection',
        subtitle: 'Elegantly Tailored with Matching Dupattas',
        image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=85',
        link: '/category/salwar-set',
        buttonText: 'Shop Salwar Sets',
        sortOrder: 1,
        isActive: true
      }
    ]);
    console.log('✓ Seeded dynamic carousel banners into database');
  } else {
    console.log(`✓ Database already has ${bannersCount} banners`);
  }

  // 6. Verified Customer Reviews in Database
  const reviewsCount = await Review.countDocuments();
  if (reviewsCount === 0 && firstProduct) {
    await Review.create([
      {
        product: firstProduct._id,
        customerName: 'Priya Sundaram',
        rating: 5,
        comment: 'The Rayon Umbrella Kurti fits like a dream! Fabric is exceptionally breathable, soft against the skin, and the stitching is truly boutique-grade. Delivery was super fast to Chennai.',
        isApproved: true,
        isFeatured: true,
        isVerifiedPurchase: true
      },
      {
        product: firstProduct._id,
        customerName: 'Anitha Rajesh',
        rating: 5,
        comment: 'The 2-piece salwar set is stunning. The colors are true to photos, fabric feels luxurious, and the drape is very flattering. Truly high quality ethnic wear.',
        isApproved: true,
        isFeatured: true,
        isVerifiedPurchase: true
      },
      {
        product: firstProduct._id,
        customerName: 'Deepa Narayanan',
        rating: 5,
        comment: 'Ordered 3 nighties and 2 side-open kurtis. Stitching, seam strength, and fabric softness are beyond what I expected. Jai Womens World is now my go-to boutique!',
        isApproved: true,
        isFeatured: true,
        isVerifiedPurchase: true
      },
      {
        product: firstProduct._id,
        customerName: 'Meenakshi Krishnan',
        rating: 5,
        comment: 'The Umbrella Kurti has such an elegant flare! Customer support on WhatsApp was prompt and helped me choose the exact right size. Wonderful experience.',
        isApproved: true,
        isFeatured: true,
        isVerifiedPurchase: true
      },
      {
        product: firstProduct._id,
        customerName: 'Kavitha Ramesh',
        rating: 5,
        comment: 'Premium boutique finish at remarkably honest prices. My mother loved the soft cotton touch and comfortable cut. Will certainly order again soon.',
        isApproved: true,
        isFeatured: true,
        isVerifiedPurchase: true
      }
    ]);
    console.log('✓ Seeded verified customer reviews into database');
  } else {
    console.log(`✓ Database already has ${reviewsCount} reviews`);
  }

  console.log('\n=============================================');
  console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
  console.log(`Store Name: JAI WOMENS WORLD`);
  console.log(`Admin Login URL: http://localhost:3000/admin/login`);
  console.log(`Admin Email: ${email}`);
  console.log(`Admin Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
  console.log('=============================================\n');

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error('Error during seed:', e);
  process.exit(1);
});
