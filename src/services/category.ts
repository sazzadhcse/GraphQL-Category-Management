import { Types } from 'mongoose';
import { CategoryModel } from '../models/category';
import { AppError } from '../utils/errors';
import { getCache, setCache, deleteCacheKeys } from '../utils/cache';

const MAX_CATEGORY_LEVEL = Number(process.env.MAX_CATEGORY_LEVEL) || 4;

const CATEGORY_CACHE_KEYS = {
    all: 'categories:all',
    byId: (id: string) => `categories:id:${id}`,
    search: (name: string) => `categories:search:${normalizeName(name)}`,
};

function normalizeName(name: string) {
    return name.trim().toLowerCase();
}

class CategoryService {
    
    async createCategory(name: string, parentId?: string){
        
        const nameNormalized = normalizeName(name);
        
        const existingCategory = await CategoryModel.findOne({ nameNormalized });
        
        if (existingCategory) {
            throw new AppError('Category name already exists', 'CONFLICT', 409);
        }
        
        let parent = null;
        let ancestors: Types.ObjectId[] = [];
        
        if (parentId) {
            const parentCategory = await CategoryModel.findById(parentId);
            
            if (!parentCategory) {
                throw new AppError('Parent category not found', 'NOT_FOUND', 404);
            }
            
            const parentLevel = parentCategory.ancestors.length + 1;
            
            //commented for having unlimited depth
            // if (parentLevel >= MAX_CATEGORY_LEVEL) {
            //     throw new AppError(`Maximum category nesting level is ${MAX_CATEGORY_LEVEL}`, 'VALIDATION_ERROR', 400);
            // }
            
            parent = parentCategory._id;
            ancestors = [...parentCategory.ancestors, parentCategory._id];
        }
        
        const category = await CategoryModel.create({
            name,
            nameNormalized,
            parent,
            ancestors,
            isActive: true,
        });
        
        await deleteCacheKeys([CATEGORY_CACHE_KEYS.all]);
        
        return await category.populate(['parent', 'ancestors']);
    }
    
    
    async getCategory(id: string) {
        
        const cacheKey = CATEGORY_CACHE_KEYS.byId(id);
        const cachedCategory = await getCache(cacheKey);
        if (cachedCategory) {
            return cachedCategory;
        }
        
        const category = await CategoryModel.findOne({
            _id: id,
            isActive: true,
        })
        .populate('parent')
        .populate('ancestors')
        .lean();
        
        if (category) {
            await setCache(cacheKey, category);
        }
        return category;
    }
    
    async getCategories() {
        const cacheKey = CATEGORY_CACHE_KEYS.all;
        const cachedCategories = await getCache(cacheKey);
        if (cachedCategories) {
            return cachedCategories;
        }
        
        const categories = await CategoryModel.find({
            isActive: true,
        })
        .populate('parent')
        .populate('ancestors')
        .lean();
        
        await setCache(cacheKey, categories);
        return categories;
    }
    
    async searchCategory(name: string) {
        const cacheKey = CATEGORY_CACHE_KEYS.search(name);
        const cachedCategory = await getCache(cacheKey);
        if (cachedCategory) {
            return cachedCategory;
        }
        
        const category = await CategoryModel.findOne({
            nameNormalized: normalizeName(name),
            isActive: true,
        })
        .populate('parent')
        .populate('ancestors')
        .lean();
        
        if (category) {
            await setCache(cacheKey, category);
        }
        return category;
    }
    
    
    async updateCategory(id: string, name: string) {
        const nameNormalized = normalizeName(name);
        
        const existingCategory = await CategoryModel.findOne({
            nameNormalized,
            _id: { $ne: id },
        });
        
        if (existingCategory) {
            throw new AppError('Category name already exists', 'CONFLICT', 409);
        }
        
        
        const oldCategory = await CategoryModel.findById(id);
        
        if (!oldCategory) {
            throw new AppError('Category not found', 'NOT_FOUND', 404);
        }
        
        const category = await CategoryModel.findByIdAndUpdate(id,{name,nameNormalized,},{new: true,})
        .populate('parent')
        .populate('ancestors');
        
        await deleteCacheKeys([
            CATEGORY_CACHE_KEYS.all,
            CATEGORY_CACHE_KEYS.byId(id),
            CATEGORY_CACHE_KEYS.search(oldCategory.name),
            CATEGORY_CACHE_KEYS.search(name),
        ]);
        
        return category;
    }
    
    async deactivateCategory(id: string) {
        const category = await CategoryModel.findById(id);
        
        if (!category) {
            throw new AppError('Category not found', 'NOT_FOUND', 404);
        }
        
        const affectedCategories = await CategoryModel.find({
            $or: [{ _id: id }, { ancestors: id }],
        }).select('_id name');
        
        await CategoryModel.updateMany(
            {
                $or: [
                    { _id: id },
                    { ancestors: id },
                ],
            },
            {
                isActive: false,
            },
        );
        
        const cacheKeysToDelete = [
            CATEGORY_CACHE_KEYS.all,
            ...affectedCategories.map((category) =>
                CATEGORY_CACHE_KEYS.byId(category._id.toString())),
            ...affectedCategories.map((category) =>
                CATEGORY_CACHE_KEYS.search(category.name))
        ];
        
        await deleteCacheKeys(cacheKeysToDelete);
        return true;
    }
    
    async deleteCategory(id: string) {
        const category = await CategoryModel.findById(id);
        
        if (!category) {
            throw new AppError('Category not found', 'NOT_FOUND', 404);
        }
        
        const affectedCategories = await CategoryModel.find({
            $or: [{ _id: id }, { ancestors: id }],
        }).select('_id name');
        
        await CategoryModel.deleteMany({
            $or: [
                { _id: id },
                { ancestors: id },
            ],
        });
        
        const cacheKeysToDelete = [
            CATEGORY_CACHE_KEYS.all,
            ...affectedCategories.map((category) =>
                CATEGORY_CACHE_KEYS.byId(category._id.toString())),
            ...affectedCategories.map((category) =>
                CATEGORY_CACHE_KEYS.search(category.name))
        ];
        
        await deleteCacheKeys(cacheKeysToDelete);
        return true;
    }
    
}

export const categoryService = new CategoryService();