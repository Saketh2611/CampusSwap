import bcrypt from 'bcryptjs';
import { User, Listing, Favorite, Conversation, Message, Review, Notification } from '../models';
import sequelize from '../config/database';

export const seedDatabase = async () => {
  try {
    // Sync all tables
    await sequelize.sync({ force: false });

    // Check if data already exists
    const userCount = await User.count();
    if (userCount > 0) {
      console.log('Database already initialized with campus seed data.');
      return;
    }

    console.log('Seeding initial CampusSwap university marketplace data...');

    const defaultPasswordHash = await bcrypt.hash('demo1234', 10);

    // 1. Create realistic student users
    const users = await User.bulkCreate([
      {
        name: 'Alex Rivera',
        email: 'arivera@stanford.edu',
        password: defaultPasswordHash,
        university: 'Stanford University',
        campus: 'Stanford Main Campus',
        dorm: 'Wilbur Hall, Soto Wing',
        studentIdVerified: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=350',
        bio: 'Junior studying CS + Design. Selling semester textbooks, tech gear, and dorm furniture!',
        graduationYear: 2026,
        rating: 4.9,
        reviewCount: 14,
      },
      {
        name: 'Maya Chen',
        email: 'mayachen@berkeley.edu',
        password: defaultPasswordHash,
        university: 'UC Berkeley',
        campus: 'Cal Main Campus',
        dorm: 'Unit 2 (Ehrman Hall)',
        studentIdVerified: true,
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=350',
        bio: 'Pre-Med sophomore. Quick responder, meetups at Moffitt Library or MLK Student Union.',
        graduationYear: 2027,
        rating: 5.0,
        reviewCount: 19,
      },
      {
        name: 'Marcus Johnson',
        email: 'mjohnson@nyu.edu',
        password: defaultPasswordHash,
        university: 'New York University',
        campus: 'NYU Washington Square',
        dorm: 'Palladium Hall',
        studentIdVerified: true,
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=350',
        bio: 'Senior at Stern School of Business. Moving out in spring — everything negotiable!',
        graduationYear: 2025,
        rating: 4.8,
        reviewCount: 8,
      },
      {
        name: 'Sophia Patel',
        email: 'spatel@utexas.edu',
        password: defaultPasswordHash,
        university: 'UT Austin',
        campus: 'UT Austin Main Campus',
        dorm: 'Jester Center West',
        studentIdVerified: true,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=350',
        bio: 'Mechanical Engineering major. Commuter student with campus parking pass.',
        graduationYear: 2026,
        rating: 4.9,
        reviewCount: 12,
      },
      {
        name: 'Liam Vance',
        email: 'lvance@harvard.edu',
        password: defaultPasswordHash,
        university: 'Harvard University',
        campus: 'Harvard Yard / Cambridge',
        dorm: 'Lowell House',
        studentIdVerified: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=350',
        bio: 'Economics & Gov senior. Pickup at Smith Campus Center or Cabot Library.',
        graduationYear: 2025,
        rating: 5.0,
        reviewCount: 22,
      },
    ]);

    // 2. Create rich campus listings with realistic photos
    const listings = await Listing.bulkCreate([
      {
        title: 'TI-84 Plus CE Graphing Calculator (Mint Condition)',
        description: 'Used for Math 51 and Stat 116. Comes with original USB charging cable and slide case. Color screen with no scratches. Works perfectly for all engineering/math courses.',
        price: 75,
        originalPrice: 145,
        category: 'Electronics',
        condition: 'Like New',
        status: 'active',
        images: [
          'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&q=80&w=800',
        ],
        campus: 'Stanford Main Campus',
        pickupLocation: 'Green Library Rotunda or Tressider Union',
        isNegotiable: true,
        views: 142,
        favoritesCount: 18,
        sellerId: users[0].id,
      },
      {
        title: 'Calculus: Early Transcendentals (8th Ed) - Stewart',
        description: 'Standard textbook for Math 1A/1B and multi-variable calc series. Clean pages with minimal pencil highlights in Chapter 3. Saved me over $200 compared to the campus bookstore.',
        price: 45,
        originalPrice: 220,
        category: 'Textbooks',
        condition: 'Good',
        status: 'active',
        images: [
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
        ],
        campus: 'Cal Main Campus',
        pickupLocation: 'Moffitt Library 3rd Floor entrance',
        isNegotiable: false,
        views: 98,
        favoritesCount: 9,
        sellerId: users[1].id,
      },
      {
        title: 'Sony WH-1000XM4 Noise Canceling Headphones (Silver)',
        description: 'Absolute lifesaver for studying in crowded dorms or dining halls! Battery still holds 30+ hours. Includes original hard carry case, 3.5mm cable, and airplane adapter.',
        price: 160,
        originalPrice: 348,
        category: 'Electronics',
        condition: 'Like New',
        status: 'active',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800',
        ],
        campus: 'NYU Washington Square',
        pickupLocation: 'Kimmel Center Lobby or Bobst Library',
        isNegotiable: true,
        views: 310,
        favoritesCount: 42,
        sellerId: users[2].id,
      },
      {
        title: 'Dorm Desk Lamp with USB-C Fast Charging & Wireless Pad',
        description: 'Modern minimalist LED desk lamp with 5 color temperatures and stepless dimming. Built-in 15W wireless phone charger base and USB-C port for your watch/iPad. Perfect dorm size.',
        price: 25,
        originalPrice: 55,
        category: 'Dorm & Living',
        condition: 'Brand New',
        status: 'active',
        images: [
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800',
        ],
        campus: 'Stanford Main Campus',
        pickupLocation: 'Wilbur Dining Plaza or Soto Dorm',
        isNegotiable: true,
        views: 64,
        favoritesCount: 8,
        sellerId: users[0].id,
      },
      {
        title: 'Trek FX 2 Disc Hybrid Campus Commuter Bike (Medium)',
        description: 'Lightweight aluminum frame, hydraulic disc brakes, 24 speeds. Upgraded with puncture-resistant Continental commuter tires and a rear luggage rack for backpacks. Smooth ride across campus.',
        price: 280,
        originalPrice: 799,
        category: 'Bikes & Scooters',
        condition: 'Good',
        status: 'active',
        images: [
          'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&q=80&w=800',
        ],
        campus: 'UT Austin Main Campus',
        pickupLocation: 'Texas Union South Entrance / Speedway',
        isNegotiable: true,
        views: 220,
        favoritesCount: 29,
        sellerId: users[3].id,
      },
      {
        title: 'Stanley The Quencher H2.0 FlowState Tumbler (40oz Cream)',
        description: 'Keeps water ice cold all day during back-to-back lectures. Only used for a couple of weeks, thoroughly sanitized and sterilized. Comes with reusable straw.',
        price: 22,
        originalPrice: 45,
        category: 'Dorm & Living',
        condition: 'Like New',
        status: 'active',
        images: [
          'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&q=80&w=800',
        ],
        campus: 'Cal Main Campus',
        pickupLocation: 'Martin Luther King Jr. Student Union',
        isNegotiable: false,
        views: 89,
        favoritesCount: 14,
        sellerId: users[1].id,
      },
      {
        title: 'Organic Chemistry Structure Model Kit (240 pcs)',
        description: 'Essential for Chem 33 / Chem 128! Includes all molecular bonds, carbons, heteroatoms, and double bond flex links. Complete set with original storage latch box.',
        price: 18,
        originalPrice: 38,
        category: 'School Supplies',
        condition: 'Like New',
        status: 'active',
        images: [
          'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
        ],
        campus: 'Harvard Yard / Cambridge',
        pickupLocation: 'Cabot Science Library Lobby',
        isNegotiable: true,
        views: 75,
        favoritesCount: 11,
        sellerId: users[4].id,
      },
      {
        title: 'Patagonia Better Sweater 1/4-Zip Fleece (Size M, Navy)',
        description: 'Super cozy fleece for chilly library study sessions. Authentic Patagonia, washed cold and hung dry. No stains or tears.',
        price: 48,
        originalPrice: 139,
        category: 'Apparel',
        condition: 'Good',
        status: 'active',
        images: [
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
        ],
        campus: 'Stanford Main Campus',
        pickupLocation: 'Huang Engineering Center Lobby',
        isNegotiable: true,
        views: 114,
        favoritesCount: 15,
        sellerId: users[0].id,
      },
      {
        title: 'Apple Magic Keyboard with Touch ID & Numeric Keypad',
        description: 'US English layout in space gray / black. Battery lasts months on a single lightning charge. Great for dorm desk monitor setups.',
        price: 85,
        originalPrice: 199,
        category: 'Electronics',
        condition: 'Like New',
        status: 'active',
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800',
        ],
        campus: 'NYU Washington Square',
        pickupLocation: 'Paulson Center Lobby',
        isNegotiable: true,
        views: 180,
        favoritesCount: 22,
        sellerId: users[2].id,
      },
      {
        title: 'Keurig K-Mini Single Serve Coffee Maker (Oasis Teal)',
        description: 'Less than 5 inches wide, fits anywhere on dorm shelves. Brews fresh 6-12oz coffee in under 2 minutes. Includes 10 free Starbucks K-Cups to get you started!',
        price: 32,
        originalPrice: 89,
        category: 'Dorm & Living',
        condition: 'Good',
        status: 'active',
        images: [
          'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800',
        ],
        campus: 'Cal Main Campus',
        pickupLocation: 'Unit 1 Courtyard / College Ave',
        isNegotiable: false,
        views: 135,
        favoritesCount: 19,
        sellerId: users[1].id,
      },
      {
        title: 'Principles of Neural Science (6th Edition) - Kandel',
        description: 'Hardcover textbook for Neurobiology & Cognitive Sciences. Heavy book, immaculate condition, corners crisp. No markings.',
        price: 70,
        originalPrice: 185,
        category: 'Textbooks',
        condition: 'Like New',
        status: 'active',
        images: [
          'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80&w=800',
        ],
        campus: 'Harvard Yard / Cambridge',
        pickupLocation: 'Smith Campus Center Commons',
        isNegotiable: true,
        views: 92,
        favoritesCount: 13,
        sellerId: users[4].id,
      },
      {
        title: 'Xiaomi Mi Electric Scooter Essential (Foldable, 12mph)',
        description: 'Great for getting between North and South campus in 5 mins. Pneumatic shock-absorbing tires, front headlight, and rear brake light. Charger included.',
        price: 195,
        originalPrice: 399,
        category: 'Bikes & Scooters',
        condition: 'Good',
        status: 'active',
        images: [
          'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800',
        ],
        campus: 'UT Austin Main Campus',
        pickupLocation: 'PCL Library Lobby / Speedway',
        isNegotiable: true,
        views: 260,
        favoritesCount: 34,
        sellerId: users[3].id,
      },
    ]);

    // 3. Create Sample Favorites
    await Favorite.bulkCreate([
      { userId: users[0].id, listingId: listings[1].id },
      { userId: users[0].id, listingId: listings[2].id },
      { userId: users[1].id, listingId: listings[0].id },
      { userId: users[1].id, listingId: listings[4].id },
      { userId: users[2].id, listingId: listings[0].id },
    ]);

    // 4. Create sample conversation & messages
    const conv1 = await Conversation.create({
      listingId: listings[0].id,
      buyerId: users[1].id,
      sellerId: users[0].id,
      lastMessageText: 'Sounds good! See you at Green Library Rotunda at 3:30 PM.',
      lastMessageAt: new Date(),
    });

    await Message.bulkCreate([
      {
        conversationId: conv1.id,
        senderId: users[1].id,
        text: 'Hey Alex! Is the TI-84 Plus CE still available? Would you take $70 for it?',
        messageType: 'offer',
        metadata: { offerAmount: 70 },
        read: true,
      },
      {
        conversationId: conv1.id,
        senderId: users[0].id,
        text: 'Hey Maya! Yes, $70 works for me since we are both on campus. Can you meet today after 3 PM?',
        messageType: 'text',
        read: true,
      },
      {
        conversationId: conv1.id,
        senderId: users[0].id,
        text: 'I proposed meeting at the Green Library Rotunda (Official Campus Safe Zone).',
        messageType: 'meetup_proposal',
        metadata: { location: 'Green Library Rotunda', time: '3:30 PM Today' },
        read: true,
      },
      {
        conversationId: conv1.id,
        senderId: users[1].id,
        text: 'Sounds good! See you at Green Library Rotunda at 3:30 PM.',
        messageType: 'text',
        read: true,
      },
    ]);

    // 5. Create sample reviews
    await Review.bulkCreate([
      {
        reviewerId: users[1].id,
        targetUserId: users[0].id,
        listingId: listings[0].id,
        rating: 5,
        comment: 'Super easy meetup at Green Library! The item was in pristine condition as described. Great campus seller!',
        role: 'buyer',
      },
      {
        reviewerId: users[3].id,
        targetUserId: users[0].id,
        listingId: listings[7].id,
        rating: 5,
        comment: 'Prompt communication and very friendly. 10/10 student trading experience.',
        role: 'buyer',
      },
      {
        reviewerId: users[0].id,
        targetUserId: users[1].id,
        listingId: listings[1].id,
        rating: 5,
        comment: 'Smooth cash exchange and on time at Moffitt Library. Highly recommend trading with Maya!',
        role: 'buyer',
      },
    ]);

    // 6. Create sample notifications
    await Notification.bulkCreate([
      {
        userId: users[0].id,
        type: 'offer',
        title: 'New Offer Received',
        message: 'Maya Chen offered $70 for TI-84 Plus CE Graphing Calculator.',
        link: `/messages/${conv1.id}`,
        read: false,
      },
      {
        userId: users[0].id,
        type: 'price_drop',
        title: 'Price Drop Alert',
        message: 'Sony WH-1000XM4 headphones favorited by you is now $160!',
        link: `/listings/${listings[2].id}`,
        read: true,
      },
      {
        userId: users[1].id,
        type: 'message',
        title: 'New message from Alex Rivera',
        message: 'Alex proposed meeting at Green Library Rotunda.',
        link: `/messages/${conv1.id}`,
        read: false,
      },
    ]);

    console.log('CampusSwap seed database initialized successfully!');
  } catch (error) {
    console.error('Error seeding CampusSwap database:', error);
  }
};
