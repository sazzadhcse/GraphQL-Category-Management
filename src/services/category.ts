import { Types } from 'mongoose';
import { CategoryModel } from '../models/category';
import { AppError } from '../utils/errors';

const MAX_CATEGORY_LEVEL = Number(process.env.MAX_CATEGORY_LEVEL) || 4;

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
            
            if (parentLevel >= MAX_CATEGORY_LEVEL) {
                throw new AppError(`Maximum category nesting level is ${MAX_CATEGORY_LEVEL}`, 'VALIDATION_ERROR', 400);
            }
            
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
        
        return await category.populate(['parent', 'ancestors']);
    }
    
    
    async getCategory(id: string) {
        return await CategoryModel.findById({
            _id: id,
            isActive: true,
        })
        .populate('parent')
        .populate('ancestors');
    }
    
    async getCategories() {
        return await CategoryModel.find({
            isActive: true,
        })
        .populate('parent')
        .populate('ancestors');
    }
    
    async searchCategory(name: string) {
        return await CategoryModel.findOne({
            nameNormalized: normalizeName(name),
            isActive: true,
        })
        .populate('parent')
        .populate('ancestors');
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
        
        const category = await CategoryModel.findByIdAndUpdate(id,{name,nameNormalized,},{new: true,})
        .populate('parent')
        .populate('ancestors');
        
        if (!category) {
            throw new AppError('Category not found', 'NOT_FOUND', 404);
        }
        
        return category;
    }
    
    async deactivateCategory(id: string) {
        const category = await CategoryModel.findById(id);
        
        if (!category) {
            throw new AppError('Category not found', 'NOT_FOUND', 404);
        }
        
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
        
        return true;
    }
    
    async deleteCategory(id: string) {
        const category = await CategoryModel.findById(id);
        
        if (!category) {
            throw new AppError('Category not found', 'NOT_FOUND', 404);
        }
        
        await CategoryModel.deleteMany({
            $or: [
                { _id: id },
                { ancestors: id },
            ],
        });
        
        return true;
    }
    
}

export const categoryService = new CategoryService();