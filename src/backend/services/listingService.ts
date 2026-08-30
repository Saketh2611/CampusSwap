import { Op } from 'sequelize';
import { Listing, User, Favorite, Review } from '../models';
import { AppError } from '../middleware/errorHandler';

export interface ListingFilterQuery {
  search?: string;
  category?: string;
  campus?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  status?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  sellerId?: number;
  page?: number;
  limit?: number;
}

export class ListingService {
  static async getAll(query: ListingFilterQuery, currentUserId?: number) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 24));
    const offset = (page - 1) * limit;

    const where: any = {};

    // By default, show active items unless explicit status query
    if (query.status) {
      where.status = query.status;
    } else if (!query.sellerId) {
      where.status = 'active';
    }

    if (query.sellerId) {
      where.sellerId = query.sellerId;
    }

    if (query.category && query.category !== 'All') {
      where.category = query.category;
    }

    if (query.campus && query.campus !== 'All Campuses') {
      where.campus = { [Op.like]: `%${query.campus}%` };
    }

    if (query.condition && query.condition !== 'All') {
      where.condition = query.condition;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) {
        where.price[Op.gte] = Number(query.minPrice);
      }
      if (query.maxPrice !== undefined) {
        where.price[Op.lte] = Number(query.maxPrice);
      }
    }

    if (query.search && query.search.trim() !== '') {
      const searchTerms = query.search.trim();
      where[Op.or] = [
        { title: { [Op.like]: `%${searchTerms}%` } },
        { description: { [Op.like]: `%${searchTerms}%` } },
        { category: { [Op.like]: `%${searchTerms}%` } },
        { pickupLocation: { [Op.like]: `%${searchTerms}%` } },
      ];
    }

    let order: any[] = [['createdAt', 'DESC']];
    if (query.sortBy === 'price_asc') {
      order = [['price', 'ASC']];
    } else if (query.sortBy === 'price_desc') {
      order = [['price', 'DESC']];
    } else if (query.sortBy === 'popular') {
      order = [['favoritesCount', 'DESC'], ['views', 'DESC']];
    }

    const { count, rows } = await Listing.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'avatar', 'university', 'campus', 'dorm', 'rating', 'reviewCount', 'studentIdVerified'],
        },
      ],
    });

    // Check favorites for current user
    let userFavoriteIds: number[] = [];
    if (currentUserId) {
      const favs = await Favorite.findAll({
        where: { userId: currentUserId },
        attributes: ['listingId'],
      });
      userFavoriteIds = favs.map((f) => f.listingId);
    }

    const formattedListings = rows.map((item) => {
      const plain = item.toJSON() as any;
      return {
        ...plain,
        isFavorited: userFavoriteIds.includes(item.id),
      };
    });

    return {
      listings: formattedListings,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      hasMore: offset + rows.length < count,
    };
  }

  static async getById(id: number, currentUserId?: number) {
    const listing = await Listing.findByPk(id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: [
            'id',
            'name',
            'email',
            'avatar',
            'university',
            'campus',
            'dorm',
            'bio',
            'graduationYear',
            'rating',
            'reviewCount',
            'studentIdVerified',
            'createdAt',
          ],
        },
        {
          model: Review,
          as: 'reviews',
          include: [
            {
              model: User,
              as: 'reviewer',
              attributes: ['id', 'name', 'avatar', 'university', 'studentIdVerified'],
            },
          ],
          limit: 5,
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    // Increment views
    await listing.increment('views');

    let isFavorited = false;
    if (currentUserId) {
      const fav = await Favorite.findOne({
        where: { userId: currentUserId, listingId: id },
      });
      isFavorited = !!fav;
    }

    const plain = listing.toJSON() as any;
    return {
      ...plain,
      isFavorited,
    };
  }

  static async create(data: any, sellerId: number) {
    const user = await User.findByPk(sellerId);
    if (!user) {
      throw new AppError('Seller account not found', 404);
    }

    const newListing = await Listing.create({
      title: data.title,
      description: data.description,
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
      category: data.category,
      condition: data.condition || 'Good',
      status: 'active',
      images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'
      ],
      campus: data.campus || user.campus || 'Stanford Main Campus',
      pickupLocation: data.pickupLocation || user.dorm || 'Campus Library / Student Union',
      isNegotiable: data.isNegotiable !== undefined ? Boolean(data.isNegotiable) : true,
      views: 0,
      favoritesCount: 0,
      sellerId,
    });

    return this.getById(newListing.id, sellerId);
  }

  static async update(id: number, data: any, userId: number) {
    const listing = await Listing.findByPk(id);
    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    if (listing.sellerId !== userId) {
      throw new AppError('You are not authorized to edit this listing', 403);
    }

    await listing.update({
      title: data.title !== undefined ? data.title : listing.title,
      description: data.description !== undefined ? data.description : listing.description,
      price: data.price !== undefined ? Number(data.price) : listing.price,
      originalPrice: data.originalPrice !== undefined ? Number(data.originalPrice) : listing.originalPrice,
      category: data.category !== undefined ? data.category : listing.category,
      condition: data.condition !== undefined ? data.condition : listing.condition,
      status: data.status !== undefined ? data.status : listing.status,
      images: data.images !== undefined ? data.images : listing.images,
      campus: data.campus !== undefined ? data.campus : listing.campus,
      pickupLocation: data.pickupLocation !== undefined ? data.pickupLocation : listing.pickupLocation,
      isNegotiable: data.isNegotiable !== undefined ? Boolean(data.isNegotiable) : listing.isNegotiable,
    });

    return this.getById(listing.id, userId);
  }

  static async delete(id: number, userId: number) {
    const listing = await Listing.findByPk(id);
    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    if (listing.sellerId !== userId) {
      throw new AppError('You are not authorized to delete this listing', 403);
    }

    await Favorite.destroy({ where: { listingId: id } });
    await listing.destroy();

    return { success: true, message: 'Listing deleted successfully' };
  }

  static async toggleFavorite(listingId: number, userId: number) {
    const listing = await Listing.findByPk(listingId);
    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    const existing = await Favorite.findOne({
      where: { listingId, userId },
    });

    let favorited = false;
    if (existing) {
      await existing.destroy();
      await listing.decrement('favoritesCount');
      favorited = false;
    } else {
      await Favorite.create({ listingId, userId });
      await listing.increment('favoritesCount');
      favorited = true;
    }

    const updated = await Listing.findByPk(listingId);

    return {
      favorited,
      favoritesCount: updated?.favoritesCount || 0,
    };
  }

  static async getFavorites(userId: number) {
    const favorites = await Favorite.findAll({
      where: { userId },
      include: [
        {
          model: Listing,
          as: 'listing',
          include: [
            {
              model: User,
              as: 'seller',
              attributes: ['id', 'name', 'avatar', 'university', 'campus', 'studentIdVerified', 'rating'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return favorites
      .filter((f) => f.listing !== null)
      .map((f) => {
        const plain = f.listing.toJSON() as any;
        return {
          ...plain,
          isFavorited: true,
          favoritedAt: f.createdAt,
        };
      });
  }

  static async markStatus(id: number, status: 'active' | 'pending' | 'sold', userId: number, buyerId?: number) {
    const listing = await Listing.findByPk(id);
    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    if (listing.sellerId !== userId) {
      throw new AppError('Only the seller can update item status', 403);
    }

    await listing.update({
      status,
      buyerId: status === 'sold' && buyerId ? buyerId : listing.buyerId,
      soldAt: status === 'sold' ? new Date() : undefined,
    });

    return this.getById(id, userId);
  }
}
