import prisma from "../../config/db.js";
import ResponseError from "../../error/response-error.js";

const getOrCreateCart = async (userId) => {
	let cart = await prisma.cart.findUnique({
		where: { userId }
	});
	
	if (!cart) {
		cart = await prisma.cart.create({
			data: {
				userId
			}
		});
	}
	
	return cart;
};

const getDetail = async (userId) => {
	const cart = await getOrCreateCart(userId);
	
	const cartWithItems = await prisma.cart.findUnique({
		where: { id: cart.id },
		include: {
			items: {
				include: {
					product: {
						select: {
							id: true,
							name: true,
							price: true,
							stock: true,
							imageUrl: true,
							isActive: true
						}
					}
				},
				orderBy: {
					product: {
						name: "asc"
					}
				}
			}
		}
	});
	
	let totalPrice = 0;
	let totalQuantity = 0;
	
	const formattedItems = cartWithItems.items.map((item) => {
		const price = Number(item.product.price);
		const subtotal = price * item.quantity;
		
		totalPrice += subtotal;
		totalQuantity += item.quantity;
		
		return {
			id: item.id,
			productId: item.productId,
			quantity: item.quantity,
			subtotal,
			isAvailable: item.product.isActive && item.product.stock > 0,
			isOutOfStock: item.product.stock < item.quantity,
			product: item.product
		}
	});
	
	return {
		id: cartWithItems.id,
		totalItems: formattedItems.length,
		totalQuantity,
		totalPrice,
		items: formattedItems
	};
};

const count = async (userId) => {
	const cart = await prisma.cart.findUnique({
		where: { userId }
	});
	
	if (!cart) {
		return { totalItems: 0, totalQuantity: 0 };
	}
	
	const result = await prisma.cartItem.aggregate({
		where: { cartId: cart.id },
		_count: { id: true },
		_sum: { quantity: true }
	});
	
	return {
		totalItems: result._count.id || 0,
		totalQuantity: result._sum.quantity || 0
	};
};

const addToCart = async (userId, request) => {
	const cart = await getOrCreateCart(userId);
	
	const product = await prisma.product.findUnique({
		where: { id: request.productId }
	});
	
	if (!product) {
		throw new ResponseError(400, "Product not found");
	}
	
	if (!product.isActive) {
		throw new ResponseError(400, "Product is no longer available");
	}
	
	const existingItem = await prisma.cartItem.findUnique({
		where: {
			cartId_productId: {
				cartId: cart.id,
				productId: request.productId
			}
		}
	});
	
	const newQuantity = existingItem ? existingItem.quantity + request.quantity : request.quantity;
	
	if (newQuantity > product.stock) {
		throw new ResponseError(400, `Insufficient stock. Available: ${product.stock}`);
	}
	
	await prisma.cartItem.upsert({
		where: {
			cartId_productId: {
				cartId: cart.id,
				productId: request.productId
			}
		},
		create: {
			cartId: cart.id,
			productId: request.productId,
			quantity: request.quantity
		},
		update: {
			quantity: newQuantity
		}
	});
	
	return await getDetail(userId);
};

const saveForLater = async (userId, productId) => {
	const cart = await getOrCreateCart(userId);
	
	const cartItem = await prisma.cartItem.findUnique({
		where: {
			cartId_productId: {
				cartId: cart.id,
				productId
			}
		}
	});
	
	if (!cartItem) {
		throw new ResponseError(404, "Product is not in your cart");
	}
	
	await prisma.$transaction([
		prisma.cartItem.delete({
			where: {
				cartId_productId: {
					cartId: cart.id,
					productId
				}
			}
		}),
		prisma.wishlist.upsert({
			where: {
				userId_productId: {
					userId,
					productId
				}
			},
			create: {
				userId,
				productId
			},
			update: {}
		})
	]);
	
	return {
		message: "Item moved to wishlist successfully"
	};
};

const updateQuantity = async (userId, productId, request) => {
	const cart = await getOrCreateCart(userId);
	
	const cartItem = await prisma.cartItem.findUnique({
		where: {
			cartId_productId: {
				cartId: cart.id,
				productId
			}
		},
		include: {
			product: true
		}
	});
	
	if (!cartItem) {
		throw new ResponseError(404, "Product is not in your cart");
	}
	
	if (!cartItem.product.isActive) {
		throw new ResponseError(400, "Product is no longer available");
	}
	
	if (request.quantity > cartItem.product.stock) {
		throw new ResponseError(400, `Insufficient stock. Available: ${cartItem.product.stock}`);
	}
	
	await prisma.cartItem.update({
		where: {
			cartId_productId: {
				cartId: cart.id,
				productId
			}
		},
		data: {
			quantity: request.quantity
		}
	});
	
	return await getDetail(userId);
};

const removeCartItem = async (userId, productId) => {
	const cart = await getOrCreateCart(userId);
	
	const cartItem = await prisma.cartItem.findUnique({
		where: {
			cartId_productId: {
				cartId: cart.id,
				productId
			}
		}
	});
	
	if (!cartItem) {
		throw new ResponseError(404, "Product is not in your cart");
	}
	
	await prisma.cartItem.delete({
		where: {
			cartId_productId: {
				cartId: cart.id,
				productId
			}
		}
	});
	
	return await getDetail(userId);
};

const removeAllItem = async (userId) => {
	const cart = await getOrCreateCart(userId);
	
	await prisma.cartItem.deleteMany({
		where: {
			cartId: cart.id
		}
	});
	
	return await getDetail(userId);
};

export default {
	getDetail,
	count,
	addToCart,
	saveForLater,
	updateQuantity,
	removeCartItem,
	removeAllItem
};