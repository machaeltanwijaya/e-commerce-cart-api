import cartService from "./Service.js";

const getCartDetail = async (req, res, next) => {
	try {
		const result = await cartService.getDetail(req.user.id);
		res.status(200).json({
			data: result
		});
	} catch (e) {
		next(e);
	}
};

const getCartCount = async (req, res, next) => {
	try {
		const result = await cartService.count(req.user.id);
		res.status(200).json({
			data: result
		});
	} catch (e) {
		next(e);
	}
};

const addToCart = async (req, res, next) => {
	try {
		const result = await cartService.addToCart(req.user.id, req.body);
		res.status(200).json({
			data: result
		});
	} catch (e) {
		next(e);
	}
};

const saveForLater = async (req, res, next) => {
	try {
		const result = await cartService.saveForLater(req.user.id, req.params.productId);
		res.status(200).json({
			data: result
		});
	} catch (e) {
		next(e);
	}
};

const updateQuantity = async (req, res, next) => {
	try {
		const result = await cartService.updateQuantity(req.user.id, req.params.productId, req.body);
		res.status(200).json({
			data: result
		});
	} catch (e) {
		next(e);
	}
};

const removeCartItem = async (req, res, next) => {
	try {
		const result = await cartService.removeCartItem(req.user.id, req.params.productId);
		res.status(200).json({
			data: result
		});
	} catch (e) {
		next(e);
	}
}

const removeAllItem = async (req, res, next) => {
	try {
		const result = await cartService.removeAllItem(req.user.id);
		res.status(200).json({
			data: result
		});
	} catch (e) {
		next(e);
	}
}

export default {
	getCartDetail,
	getCartCount,
	addToCart,
	saveForLater,
	updateQuantity,
	removeCartItem,
	removeAllItem
};