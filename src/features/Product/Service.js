import prisma from "../../config/db.js";
import ResponseError from "../../error/response-error.js";
import {deleteFromCloudinary, uploadToCloudinary} from "../../utils/cloudinary-helper.js";

const create = async (request, file) => {
	const category = await prisma.category.findUnique({
		where: { id: request.categoryId }
	});
	
	if (!category) {
		throw new ResponseError(404, "Category not found");
	}
	
	let imageUrl = request.imageUrl || null;
	let imagePublicId = null;
	
	if (file) {
		const uploaded = await uploadToCloudinary(file.path, "products");
		imageUrl = uploaded.url;
		imagePublicId = uploaded.publicId;
	}
	
	return await prisma.product.create({
		data: {
			name: request.name,
			description: request.description || "",
			price: request.price,
			stock: request.stock ?? 0,
			categoryId: request.categoryId,
			isActive: request.isActive ?? true,
			imageUrl,
			imagePublicId
		},
		include: {
			category: {
				select: {
					id: true,
					name: true,
					slug: true
				}
			}
		}
	});
};

const getAll = async (query) => {
	const page = Math.max(1, parseInt(query.page) || 1);
	const limit = Math.max(1, parseInt(query.limit || query.size) || 10);
	const skip = (page - 1) * limit;
	
	const search = query.search || query.name;
	const where = {
		...(search && {
			OR: [
				{ name : { contains: search, mode: "insensitive"}},
				{ description: { contains: search, mode: "insensitive"}}
			]
		}),
		...(query.categoryId && { categoryId: query.categoryId }),
		...(query.isActive !== undefined && { isActive: query.isActive === "true" || query.isActive === true})
	};
	
	const sortBy = query.sortBy || "createdAt";
	const sortOrder = query.sortOrder || "desc";
	
	const [products, totalItems] = await Promise.all([
		prisma.product.findMany({
			where,
			skip,
			take: limit,
			orderBy: { [sortBy]: sortOrder },
			include: {
				category: {
					select: {
						id: true,
						name: true,
						slug: true
					}
				}
			}
		}),
		prisma.product.count({ where })
	]);
	
	const totalPages = Math.ceil(totalItems / limit);
	
	return {
		products,
		pagination: {
			totalItems,
			totalPages,
			currentPage: page,
			limit,
			hasNextPage: page < totalPages,
			hasPrevPage: page > 1
		}
	};
};

const getById = async (id) => {
	const product = await prisma.product.findUnique({
		where: { id },
		include: {
			category: {
				select: {
					id: true,
					name: true,
					slug: true,
				}
			},
			_count: {
				select: {
					reviews: true,
				}
			}
		}
	});
	
	if (!product) {
		throw new ResponseError(404, "Product not found");
	};
	
	return product;
};

const getRelated = async (productId, query) => {
	const product = await getById(productId);
	
	const limit = Math.max(1, parseInt(query.limit || query.size) || 4);
	
	return await prisma.product.findMany({
		where: {
			categoryId: product.categoryId,
			id: { not: productId },
			isActive: true
		},
		take: limit,
		orderBy: {
			createdAt: "desc"
		},
		include: {
			category: {
				select: {
					id: true,
					name: true,
					slug: true
				}
			}
		}
	});
};

const getReviews = async (productId) => {
	await getById(productId);
	
	const [reviews, stats] = await Promise.all([
		prisma.review.findMany({
			where: { productId },
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				rating: true,
				comment: true,
				createdAt: true,
				user: {
					select: {
						id: true,
						name: true,
						avatarUrl: true
					}
				}
			}
		}),
		prisma.review.aggregate({
			where: { productId },
			_avg: { rating: true },
			_count: { rating: true }
		})
	]);
	
	const averageRating = stats._avg.rating ? Number(stats._avg.rating.toFixed(1)) : 0;
	const totalReviews = stats._count.rating || 0;
	
	return {
		summary: {
			averageRating,
			totalReviews
		},
		reviews
	};
};

const update = async (id, request, file) => {
	const product = await getById(id);
	
	if (request.categoryId) {
		const category = await prisma.category.findUnique({
			where: { id: request.categoryId}
		});
		
		if (!category) {
			throw new ResponseError(404, "Category not found");
		}
	}
	
	const updates = {};
	
	if (request.name !== undefined) updates.name = request.name;
	if (request.description !== undefined) updates.description = request.description;
	if (request.price !== undefined) updates.price = request.price;
	if (request.stock !== undefined) updates.stock = request.stock;
	if (request.categoryId !== undefined) updates.categoryId = request.categoryId;
	if (request.isActive !== undefined) updates.isActive = request.isActive;
	
	if (file) {
		if (product.imagePublicId) {
			await deleteFromCloudinary(product.imagePublicId);
		}
		
		const uploaded = await uploadToCloudinary(file.path, "products");
		updates.imageUrl = uploaded.url;
		updates.imagePublicId = uploaded.publicId;
	} else if (request.imageUrl !== undefined) {
		updates.imageUrl = request.imageUrl;
		updates.imagePublicId = null;
	}
	
	return await prisma.product.update({
		where: { id },
		data: updates,
		include: {
			category: {
				select: {
					id: true,
					name: true,
					slug: true
				}
			}
		}
	});
};

const toggleStatus = async (id, request) => {
	await getById(id);
	
	return await prisma.product.update({
		where: { id },
		data: {
			isActive: request.isActive
		},
		select: {
			id: true,
			name: true,
			isActive: true,
			updatedAt: true,
		}
	});
};

const updateStock = async (productId, request) => {
	await getById(productId);
	
	return await prisma.product.update({
		where: { id: productId },
		data: {
			stock: request.stock
		},
		select: {
			id: true,
			name: true,
			stock: true,
			updatedAt: true
		}
	});
};

const remove = async (id) => {
	const product = await getById(id);
	
	const orderCount = await prisma.orderItem.count({
		where: { productId: id }
	});
	
	if (orderCount > 0) {
		throw new ResponseError(400, "Cannot delete product that has already been ordered.");
	}
	
	await prisma.$transaction([
		prisma.cartItem.deleteMany({
			where: { productId: id }
		}),
		prisma.wishlist.deleteMany({
			where: { productId: id }
		}),
		prisma.review.deleteMany({
			where: { productId: id }
		}),
		prisma.product.delete({
			where: { id }
		})
	]);
	
	if (product.imagePublicId) {
		await deleteFromCloudinary(product.imagePublicId);
	}
	
	return {
		message: "Product deleted successfully"
	};
};

export default {
	create,
	getAll,
	getById,
	getRelated,
	getReviews,
	update,
	toggleStatus,
	updateStock,
	remove
};