import { categoryService } from "../services/category";

export const resolvers = {
    Query:{
        getCategories: async () => {
            return await categoryService.getCategories();
        },

        getCategory: async (_: any, { id }: { id: string }) => {
            return await categoryService.getCategory(id);
        },
        
        searchCategory: async (_: any, { name }: { name: string }) => {
            return await categoryService.searchCategory(name);
        },
    },

    Mutation:{
        createCategory: async (_: any,args: { name: string; parentId?: string },
        ) => {
            return await categoryService.createCategory(args.name, args.parentId);
        },
        
        updateCategory: async (_: any,args: { id: string; name: string },
        ) => {
            return await categoryService.updateCategory(args.id, args.name);
        },
        
        deactivateCategory: async (_: any, { id }: { id: string }) => {
            return await categoryService.deactivateCategory(id);
        },
        
        deleteCategory: async (_: any, { id }: { id: string }) => {
            return await categoryService.deleteCategory(id);
        },
    }
};