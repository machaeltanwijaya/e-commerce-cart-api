import prisma from "../../config/db.js";
import ResponseError from "../../error/response-error.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../../utils/cloudinary-helper.js";

const generateSlug = (text) => {
	return text.toString().toLowerCase().trim().replace(/[\s\W-]+/g, "-").replace(/^-+|-+$/g, "");
}

const create = async (request, file) => {
	const slug = request.slug || generateSlug(request.name);
	const existingCategory = await prisma.category.findUnique({
		where: { slug }
	});
	
	if (existingCategory) {
		throw new ResponseError(400, "Category with this slug or name already exists");
	}
	
	let imageUrl = request.imageUrl || null;
	let imagePublicId = null;
	
	if (file) {
		const uploaded = await uploadToCloudinary(file.path, "categories");
		imageUrl = uploaded.url;
		imagePublicId = uploaded.publicId;
	}
	
	return await prisma.category.create({
		data: {
			name: request.name,
			slug,
			description: request.description || null,
			imageUrl,
			imagePublicId
		}
	});
}

const getAll = async () => {
	return await prisma.category.findMany({
		orderBy: { createdAt: "desc" },
		include: {
			_count: {
				select: { products: true}
			}
		}
	});
}

const getById = async (id) => {
	const category = await prisma.category.findUnique({
		where: { id },
		include: {
			_count: {
				select: { products: true }
			}
		}
	});
	
	if (!category) {
		throw new ResponseError(404, "Category not found");
	}
	
	return category;
};

const getBySlug = async (slug) => {
	const category = await prisma.category.findUnique({
		where: { slug },
		include: {
			_count: {
				select: { products: true }
			}
		}
	});
	
	if (!category) {
		throw new ResponseError(404, "Category not found");
	}
	
	return category;
};

const update = async (id, request, file) => {
	const category = await getById(id);
	
	const updates = {};
	
	if (request.name) {
		updates.name = request.name;
		const newSlug = request.slug || generateSlug(request.name);
		const slugTaken = await prisma.category.findFirst({
			where: {
				slug: newSlug,
				id: { not: id }
			}
		});
		
		if (slugTaken) {
			throw new ResponseError(400, "Category name/slug is already taken");
		}
		
		updates.slug = newSlug;
	}
	
	if (request.description !== undefined) {
		updates.description = request.description;
	}
	
	if (file) {
		if (category.imagePublicId) {
            await deleteFromCloudinary(category.imagePublicId);
        }
		const uploaded = await uploadToCloudinary(file.path, "categories");
		updates.imageUrl = uploaded.url;
		updates.imagePublicId = uploaded.publicId;
	} else if (request.imageUrl) {
		updates.imageUrl = request.imageUrl;
		updates.imagePublicId = null;
	}
	
	return await prisma.category.update({
		where: { id },
		data: updates
	});
};

const remove = async (id) => {
	const category = await getById(id);
	
	const productCount = await prisma.product.count({
		where: { categoryId: id }
	});
	
	if (productCount > 0) {
		throw new ResponseError(400, "Cannot delete category that still has associated products");
	}
	
	if (category.imagePublicId) {
        await deleteFromCloudinary(category.imagePublicId);
    }
	
	await prisma.category.delete({
		where: { id }
	});
	
	return {
		message: "Category deleted successfully"
	};
};

export default {
	create,
	getAll,
	getById,
	getBySlug,
	update,
	remove
}