import { Schema, model, Types } from "mongoose";

export interface ICategory{
    name: string;
    nameNormalized: string;
    parent: Types.ObjectId | null;
    ancestors: Types.ObjectId[];
    isActive: boolean;
}

const categorySchema = new Schema<ICategory>({
    name:{
        type: String,
        required: true,
        trim: true,
    },
    nameNormalized:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    ancestors: [{
        type: Schema.Types.ObjectId,
        ref: 'Category',
    }],
    isActive: {
        type: Boolean,
        default: true
    }
},{
    timestamps: true
});

export const CategoryModel = model<ICategory>('Category', categorySchema);